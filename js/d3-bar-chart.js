var d3 = require('d3')

//Width and height
var w = 600
var h = 250
var maxValue = 100

var dataset = [ 5, 10, 13, 19, 21, 25, 22, 18, 15, 13,
        11, 12, 15, 20, 18, 17, 16, 18, 23, 25 ]

var xScale = d3.scale.ordinal()
               .domain(d3.range(dataset.length))
               .rangeRoundBands([0, w], 0.05)

var yScale = d3.scale.linear()
               .domain([0, d3.max(dataset)])
               .range([0, h])

//Create SVG element
var svg = d3.select("body")
            .append("svg")
            .attr("width", w)
            .attr("height", h)

//Create bars
svg.selectAll("rect")
   .data(dataset)
   .enter()
   .append("rect")
   .attr("x", function(d, i) {
      return xScale(i)
   })
   .attr("y", function(d) {
      return h - yScale(d)
   })
   .attr("width", xScale.rangeBand())
   .attr("height", function(d) {
      return yScale(d)
   })
   .attr("fill", function(d) {
    return "rgb(0, 0, " + (d * 10) + ")"
   })
//Create labels
svg.selectAll("text")
   .data(dataset)
   .enter()
   .append("text")
   .text(function(d) {
      return d;
   })
   .attr("text-anchor", "middle")
   .attr("x", function(d, i) {
      return xScale(i) + xScale.rangeBand() / 2;
   })
   .attr("y", function(d) {
      return h - yScale(d) + 14;
   })
   .attr("font-family", "sans-serif")
   .attr("font-size", "11px")
   .attr("fill", "white");

d3.select("p")
  .on("click", function() {
    //New values for dataset
    var numValues = dataset.length;               //Count original length of dataset
    dataset = [];                                       //Initialize empty array
    for (var i = 0; i < numValues; i++) {               //Loop numValues times
        var newNumber = Math.floor(Math.random() * maxValue); //New random integer (0-24)
        dataset.push(newNumber);                        //Add new number to array
    }
    yScale.domain([0, d3.max(dataset)])
    svg.selectAll("rect")
       .data(dataset)
       .transition()
       .delay(function(d, i) {
        return i / dataset.length * 1000
       })
       .duration(2500)
       .attr("y", function(d) {
               return h - yScale(d);
       })
       .attr("height", function(d) {
               return yScale(d);
       })
       .attr("fill", function(d) {
        return "rgb(0, 0, " + (d * 10) + ")"
       })

    svg.selectAll("text")
       .data(dataset)
       .transition()
       .delay(function(d, i) {
        return i / dataset.length * 1000
       })
       .duration(2500)
       .text(function(d) {
          return d
       })
       .attr("x", function(d, i) {
          return xScale(i) + xScale.rangeBand() / 2
       })
       .attr("y", function(d) {
          return h - yScale(d) + 14
       })
    console.log('new data bound!')
  })

d3.select('body')
  .append("p")
  .text('Click this paragraph to add a new data point.')
  .on('click', function () {
    dataset.push(Math.floor(Math.random() * maxValue))
    xScale.domain(d3.range(dataset.length))

    var bars = svg.selectAll('rect')
                  .data(dataset)
    // enter
    bars.enter()
        .append('rect')
        .attr('x', w)
        .attr('y', function (d) {
          return h - yScale(d)
        })
        .attr('width', xScale.rangeBand())
        .attr('height', function (d) {
          return yScale(d)
        })
        .attr('fill', function (d) {
          return 'rgb(0, 0, ' + (d * 10) + ')'
        })
    // update
    bars.transition()
        .duration(500)
        .attr('x', function(d, i) {
          return xScale(i)
        })
        .attr('y', function (d) {
          return h - yScale(d)
        })
        .attr('width', xScale.rangeBand())
        .attr('height', function (d) {
          return yScale(d)
        })
  })

d3.select('body')
  .append('p')
  .text('Click to remove a data point')
  .on('click', function () {
    dataset.shift()
    xScale.domain(d3.range(dataset.length))
    yScale.domain([0, d3.max(dataset)])

    var bars = svg.selectAll('rect')
                  .data(dataset)

    //Update…
    bars.transition()             //Initiate a transition on all elements in the update selection (all rects)
      .duration(500)
      .attr("x", function(d, i) {       //Set new x position, based on the updated xScale
        return xScale(i);
      })
      .attr("y", function(d) {        //Set new y position, based on the updated yScale
        return h - yScale(d);
      })
      .attr("width", xScale.rangeBand())    //Set new width value, based on the updated xScale
      .attr("height", function(d) {     //Set new height value, based on the updated yScale
        return yScale(d);
      });

    bars.exit()
        .transition()
        .duration(500)
        .attr('x', w)
        .remove()
  })
