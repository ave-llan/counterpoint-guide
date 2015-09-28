var d3 = require('d3')
var CFguide = require('../model/cantus-firmus-maker.js')
var Pitch = require('nmusic').Pitch

var cf = new CFguide('D major', 'D4', 8)
'B4 A4 C#5 D5 F#4 G4 E4 D4'.split(' ').forEach(cf.addNote)
/*
var cf = new cfGuide('D minor', 6, 13)
cf.addNote('D4')
cf.addNote('E4')
cf.addNote('F4')
cf.addNote('C4')
cf.addNote('D4')
cf.addNote('F4')
cf.addNote('E4')
cf.addNote('G4')
cf.addNote('Bb3')
cf.addNote('C4')
cf.addNote('F4')
cf.addNote('E4')
cf.addNote('D4')
console.log(cf.choices())
*/

var margin = {top: 20, right: 10, bottom: 20, left: 10}
var width = 600 - margin.left - margin.right
var height = 300 - margin.top - margin.bottom
var yAxisWidth = 44

var yScale = d3.scale.ordinal()
               .domain(cf.domain())
               .rangeRoundBands([height, 0], 0.05)

var xScale = d3.scale.ordinal()
               .domain(d3.range(cf.maxLength()))
               .rangeRoundBands([yAxisWidth, width], 0.05)

var line = d3.svg.line()
    .x(function (d, i) {
      return xScale(i)
    })
    .y(function (d) {
      return yScale(d)
    })
    .interpolate('monotone')

// Create SVG element
var svg = d3.select('counterpoint').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

svg.selectAll('text')
  .data(cf.domain())
  .enter()
  .append('text')
  .text(function (d) {
    return Pitch(d).pitchClass()
  })
  .attr('text-anchor', 'start')
  .attr('dominant-baseline', 'central')
  .attr('x', 0)
  .attr('y', function (d) {
    return yScale(d)
  })
  .attr('font-family', 'sans-serif')
  .attr('font-size', '18px')

svg.append('path')
      .datum(cf.construction())
      .attr('class', 'line')
      .attr({
        'fill': 'none',
        'stroke': 'steelblue',
        'stroke-width': '4px',
        'stroke-linecap': 'round'
      })
      .attr('d', line)

svg.append('g')
  .attr('id', 'circles')
  .selectAll('circle')
  .data(cf.construction())
  .enter()
  .append('circle')
  .attr({
    'fill': 'steelblue',
    'fill-opacity': '0.9',
    'stroke': 'steelblue',
    'stroke-width': '1.5px'
  })
  .attr('cx', function (d, i) {
    return xScale(i)
  })
  .attr('cy', function (d) {
    return yScale(d)
  })
  .attr('r', 6)

