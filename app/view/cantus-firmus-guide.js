var d3 = require('d3')
var cfGuide = require('../model/cantus-firmus-maker.js')
var Pitch = require('nmusic').Pitch

var cf = new cfGuide('D minor', 8)
cf.addNote('D4')
console.log(cf.choices())

var margin = {top: 20, right: 10, bottom: 20, left: 10}
//Width and height
var width = 600 - margin.left - margin.right
var height = 500 - margin.top - margin.bottom
var padding = 30


var yScale = d3.scale.ordinal()
               .domain(cf.domain())
               .rangeRoundBands([0, height], 0.05)

// Create SVG element
var svg = d3.select('counterpoint').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


svg.selectAll("text")
   .data(cf.domain())
   .enter()
   .append("text")
   .text(function(d) {
      return Pitch(d).pitchClass();
   })
   .attr("text-anchor", "start")
   .attr("x", 0)
   .attr("y", function(d) {
      return height - yScale(d) + 14;
   })
   .attr("font-family", "sans-serif")
   .attr("font-size", "14px")