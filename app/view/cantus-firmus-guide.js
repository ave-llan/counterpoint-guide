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
'A4 G4 C4 E4'.split(' ').forEach(cf.addNote)

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
    .domain(d3.range(d3.max([8, cf.construction().length + 2]))) // min 8, at least cur + 2
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

// add note names to y axis
svg.append('g')
    .attr('class', 'y-axis-text')
  .selectAll('text')
    .data(cf.domain())
  .enter().append('text')
    .text(function (d) { return Pitch(d).pitchClass() })
    .attr('sciPitch', function (d) { return d })
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'central')
    .attr('x', 0)
    .attr('y', function (d) { return yScale(d) })

// add path of current cf construction
svg.append('path')
    .datum(cf.construction())
    .attr('id', 'construction-line')
    .attr('d', constructionLine)

// add points of current cf construction
svg.append('g')
    .attr('class', 'construction-points')
  .selectAll('circle')
    .data(cf.construction())
  .enter().append('circle')
    .attr('cx', function (d, i) { return xScale(i) })
    .attr('cy', function (d) { return yScale(d) })

var lastNote = cf.construction()[cf.construction().length - 1]
var choicePaths = cf.choices().map(function (nextChoice) {
  return [lastNote, nextChoice]
})

// add paths to next note choices
svg.append('g')
    .attr('class', 'choice-paths')
  .selectAll('path')
    .data(choicePaths)
  .enter().append('path')
    .attr('d', choicesLine)

// add points of choices
svg.append('g')
    .attr('class', 'choice-points')
  .selectAll('circle')
    .data(cf.choices())
  .enter().append('circle')
    .attr('cx', xScale(cf.construction().length))
    .attr('cy', function (d) { return yScale(d) })
