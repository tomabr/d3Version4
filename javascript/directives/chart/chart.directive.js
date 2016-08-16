'use strict';

angular.module('app').directive('chart', ['d3Service', function(d3Service) {
  return {
    restrict: 'E',
    scope: {
      item: '<?ngModel'
    },
    link: link
  };


 function link(scope, element) {
      function getDate(date) {
        return new Date(date);
      }
      d3Service.d3().then(function(d3) {

        scope.$watch('item', function(nVal) {
          if (!!nVal) {
            var svg;
            d3.select("#ID").remove();

            var data = angular.copy(nVal).reverse();

            var margin = { top: 20, right: 20, bottom: 410, left: 50 },
              margin2 = { top: 430, right: 20, bottom: 330, left: 50 },
              margin3 = { top: 500, right: 20, bottom: 40, left: 50 },
              width = 1200 - margin.left - margin.right,
              height = 800 - margin.top - margin.bottom,
              height2 = 800 - margin2.top - margin2.bottom,
              height3 = 800 - margin3.top - margin3.bottom;

            var x = d3.scaleTime().range([0, width]),
              x2 = d3.scaleTime().range([0, width]),
              x3 = d3.scaleBand().rangeRound([0, width]).padding(0.1).align(0.1),
              y = d3.scaleLinear().range([height, 0]),
              y2 = d3.scaleLinear().range([height2, 0]),
              y3 = d3.scaleLinear().range([height3, 0]);

            var xAxis = d3.axisBottom(x),
              xAxis2 = d3.axisBottom(x2),
              xAxis3 = d3.axisBottom(x3).tickFormat(d3.timeFormat("%m-%d")),
              yAxis = d3.axisLeft(y),
              yAxis3 = d3.axisLeft(y3);

            var brush = d3.brushX()
              .extent([
                [0, 0],
                [width, height2]
              ])
              .on("brush", brushed);

            svg = d3.select(element[0]).append("svg")
              .attr("id", "ID")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom);

            svg.append("defs").append("clipPath")
              .attr("id", "clip")
              .append("rect")
              .attr("width", width)
              .attr("height", height);

            var focus = svg.append("g")
              .attr("class", "focus")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var context = svg.append("g")
              .attr("class", "context")
              .attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");

            var freg = svg.append("g")
              .attr("class", "freg")
              .attr("transform", "translate(" + margin3.left + "," + margin3.top + ")");




            x.domain(d3.extent(data, function(d) {
              return d.Date;
            }));
            y.domain([d3.min(data, function(d) {
              return d.Low;
            }), d3.max(data, function(d) {
              return d.High;
            })]);
            x2.domain(x.domain());
            y2.domain(y.domain());
            //x3.domain(x.domain());
            x3.domain(data.map(function(d) {
              return d.Date;
            }));

            y3.domain(y.domain());


            var area = d3.area()
              .curve(d3.curveMonotoneX)
              .x(function(d) {
                return x(d.Date);
              })
              .y0(height)
              .y1(function(d) {
                return y(d.Close);
              });

            focus.append("path")
              .data([data])
              .attr("class", "area")
              .attr("d", area);


            // append scatter plot to main chart area
            var dots = focus.append("g");
            dots.attr("clip-path", "url(#clip)");
            dots.selectAll("dot")
              .data(data)
              .enter().append("circle")
              .attr('class', 'dot')
              .attr("r", 3)
              .style("opacity", .5)
              .attr("cx", function(d) {
                return x(d.Date);
              })
              .attr("cy", function(d) {
                return y(d.Close);
              })
              .on('mouseover', function(d) {
                d3.select(this).attr('r', 7);

                var formatTime = d3.timeFormat("%e %B")


                div.html(
                    '<table>' + '<tr>' +
                    '<td>' + 'Date' + '</td>' +
                    '<td>' + formatTime(d.Date) + '</td>' + '</tr>' + '<tr>' +
                    '<td>' + 'Open' + '</td>' +
                    '<td>' + d.Open + '</td>' + '</tr>' + '<tr>' +
                    '<td>' + 'Close' + '</td>' +
                    '<td>' + d.Close + '</td>' + '</tr>' + '<tr>' +
                    '<td>' + 'High' + '</td>' +
                    '<td>' + d.High + '</td>' + '</tr>' + '<tr>' +
                    '<td>' + 'Low' + '</td>' +
                    '<td>' + d.Low + '</td>' + '</tr>' + '<tr>' +
                    '<td>' + 'Volume' + '</td>' +
                    '<td>' + d.Volume + '</td>' + '</tr>' + '</table>'
                  )
                  .style("left", (d3.event.pageX) + "px")
                  .style("top", (d3.event.pageY - parseInt(div.style('height'), 10)) + "px")
                  .transition()
                  .duration(200)
                  .style("opacity", .9)
              })
              .on('mouseout', function(d) {
                d3.select(this).attr('r', 3);
                div.transition()
                  .duration(500)
                  .style("opacity", 0);
              });

            focus.append("g")
              .attr("class", "axis axis--x")
              .attr("fill", "none")
              .attr("transform", "translate(0," + height + ")")
              .call(xAxis);

            focus.append("g")
              .attr("class", "axis axis--y")
              .call(yAxis);

            focus.append("text")
              .attr("transform", "rotate(-90)")
              .attr("y", 0 - margin.left)
              .attr("x", 0 - (height / 2))
              .attr("dy", "1em")
              .style("text-anchor", "middle")
              .text("Price");

            svg.append("text")
              .attr("transform",
                "translate(" + ((width + margin.right + margin.left) / 2) + " ," +
                margin3.top + ")")
              .style("text-anchor", "middle")
              .text("Date");

            // Define the div for the tooltip
            var div = d3.select(element[0]).append("div")
              .attr("class", "tooltip")
              .style("opacity", 0);



            // append scatter plot to brush chart area
            context.append("g")
              .attr("class", "axis axis--x")
              .attr("transform", "translate(0," + height2 + ")")
              .call(xAxis2);

            context.append("g")
              .attr("class", "brush")
              .call(brush)
              .call(brush.move, x.range());

            var area2 = d3.area()
              .curve(d3.curveMonotoneX)
              .x(function(d) {
                return x2(d.Date);
              })
              .y0(height2)
              .y1(function(d) {
                return y2(d.Close);
              });

            context.append("path")
              .datum(data)
              .attr("class", "area")
              .attr("d", area2);


            freg.append("g")
              .attr("class", "axis axis--x")
              .attr("transform", "translate(0," + height3 + ")")
              .call(xAxis3)
              .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", "-.55em")
              .attr("transform", "rotate(-90)");

            freg.append("g")
              .attr("class", "axis axis--y")
              .call(yAxis3);

            // Add a rect for each date.
            var rect = freg.selectAll("rect")
              .data(data)
              .enter().append("rect")
              .attr("class", "bar")
              .attr("x", function(d) {
                return x3(d.Date);
              })
              .attr("y", function(d) {
                return y3(d.High);
              })
              .attr("height", function(d) {
                y3(d.High);
                y3(d.Low);

                return y3(d.Low) - y3(d.High);
              })
              .attr("width", x3.bandwidth());



            //create brush function redraw scatterplot with selection
            function brushed() {

              if (d3.event.sourceEvent && d3.event.sourceEvent.type === "zoom") return; // ignore brush-by-zoom


              var selection = d3.event.selection;
              x.domain(selection.map(x2.invert, x2));
              focus.select(".area").attr("d", area);
              focus.selectAll(".dot")
                .attr("cx", function(d) {
                  return x(d.Date);
                })
                .attr("cy", function(d) {
                  return y(d.Close);
                });
              focus.select(".axis--x").call(xAxis);

              x3.domain();


              var range = selection.map(x2.invert, x2);

              x3.domain(data.map(function(d) {
                if (range[0] <= d.Date && d.Date <= range[1])
                  return d.Date;
              }));


              freg.selectAll("rect")
                .attr("x", function(d) {

                  if (range[0] <= d.Date && d.Date <= range[1])
                    return x3(d.Date);
                })
                .attr("y", function(d) {
                  if (range[0] <= d.Date && d.Date <= range[1])
                    return y3(d.High);
                })
                .attr('date', function(d) {
                  if (range[0] <= d.Date && d.Date <= range[1])
                  return d.Date;
                })
                .attr("height", function(d) {

                  y3(d.High);
                  y3(d.Low);

                  if (range[0] <= d.Date && d.Date <= range[1])
                  return y3(d.Low) - y3(d.High);
                })
                .attr("width", x3.bandwidth());

              freg.select(".axis--x").call(xAxis3)
                .selectAll("text")
                .text(function(d) {

                  if(!!d){
                   var formatTime = d3.timeFormat("%m-%d");
                   return formatTime(d);
                  }})
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", "-.55em")
                .attr("transform", "rotate(-90)");

            }
          }
        });

      });
    }












}]);
