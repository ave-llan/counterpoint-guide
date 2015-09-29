var d3 = require('d3')
var CFguide = require('../model/cantus-firmus-maker.js')
var Pitch = require('nmusic').Pitch

/**
 * Find a counterpoint element in the DOM, and read its attributes.
 * @returns {CFguide} a new cf guide configured with dom attributes
 */
var createCFfromDOM = function () {
  var c = d3.select('counterpoint')
  return new CFguide(c.attr('first-note'),
                     c.attr('mode'),
                     c.attr('max-range'),
                     c.attr('max-length'))
}

var cf = createCFfromDOM()

var margin = {top: 20, right: 10, bottom: 20, left: 10}
var width = 600 - margin.left - margin.right
var height = 500 - margin.top - margin.bottom
var yAxisWidth = 44
var nextChoiceDepth = 2

var yScale = d3.scale.ordinal()
    .domain(cf.domain())
    .rangeRoundBands([height, 0], 0.05)
console.log(yScale('G4'))

var xScale = d3.scale.ordinal()
    .domain(d3.range(cf.maxLength()))
    .rangeRoundBands([yAxisWidth, width], 0.05)

var constructionLine = d3.svg.line()
    .x(function (d, i) { return xScale(i) })
    .y(function (d) { return yScale(d) })
    .interpolate('monotone')

var choicesLine = d3.svg.line()
    .x(function (d, i) { return xScale(cf.construction().length - 1 + i) })
    .y(function (d) { return yScale(d) })
    .interpolate('monotone')

// Create SVG element
var svg = d3.select('counterpoint')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

svg.selectAll('text')
    .data(cf.domain())
  .enter().append('text')
    .text(function (d) { return Pitch(d).pitchClass() })
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'central')
    .attr('x', 0)
    .attr('y', function (d) { return yScale(d) })
    .attr('font-family', 'sans-serif')
    .attr('font-size', '18px')

// add path of current cf construction
svg.append('path')
    .datum(cf.construction())
    .attr('class', 'construction-line')
    .attr({
      'fill': 'none',
      'stroke': 'steelblue',
      'stroke-width': '4px',
      'stroke-linecap': 'round'
    })
    .attr('d', constructionLine)

// add points of current cf construction
svg.append('g')
    .attr('id', 'construction-points')
  .selectAll('circle')
    .data(cf.construction())
  .enter().append('circle')
    .attr({
      'fill': 'steelblue',
      'fill-opacity': '0.9',
      'stroke': 'steelblue',
      'stroke-width': '1.5px'
    })
    .attr('cx', function (d, i) { return xScale(i) })
    .attr('cy', function (d) { return yScale(d) })
    .attr('r', 6)

var lastNote = cf.construction()[cf.construction().length - 1]
var choicePaths = cf.choices().map(function (nextChoice) {
  return [lastNote, nextChoice]
})

// add paths to next note choices
svg.append('g')
    .attr('id', 'choice-path')
  .selectAll('path')
    .data(choicePaths)
  .enter().append('path')
    .attr({
      'fill': 'none',
      'stroke': 'steelblue',
      'stroke-width': '1.5px',
      'stroke-linecap': 'round',
      'stroke-opacity': '0.3'
    })
    .attr('d', choicesLine)

// add points of choices
svg.append('g')
    .attr('id', 'choices-points')
  .selectAll('circle')
    .data(cf.choices())
  .enter().append('circle')
    .attr({
      'fill': 'steelblue',
      'fill-opacity': '0.3',
      'stroke-opacity': '0.3',
      'stroke': 'steelblue',
      'stroke-width': '1.5px'
    })
    .attr('cx', xScale(cf.construction().length))
    .attr('cy', function (d) { return yScale(d) })
    .attr('r',6)
