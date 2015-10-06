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
//'E4 C4'.split(' ').forEach(cf.addNote)

var margin = {top: 20, right: 10, bottom: 20, left: 10}
var width = 800 - margin.left - margin.right
var height = 600 - margin.top - margin.bottom
var yAxisWidth = 44
var nextChoiceDepth = 2
var constructionPointRadius = 15
var choicePointRadius = 12
var pathWidth = 3
var animationTime = 500

var letterGridData = []
for (var i = 0; i < cf.maxLength(); i++) {
  cf.domain().forEach(function (note) {
    letterGridData.push({y: note, x: i, display: Pitch(note).pitchClass()})
  })
}
console.log(letterGridData)

var xDomain = function () {
  var minAllowed = d3.max([8, cf.length() + 2])
  var range = minAllowed > cf.maxLength() ? cf.maxLength() : minAllowed
  return d3.range(range)
}

var y = d3.scale.ordinal()
    .domain(cf.domain())
    .rangeRoundBands([height, 0], 0.05)

var x = d3.scale.ordinal()
    // min 8, at least cur + 2
    .domain(d3.range(cf.maxLength()))
    .rangeRoundBands([yAxisWidth, width], 0.05)

var constructionLine = d3.svg.line()
    .x(function (d, i) { return x(i) })
    .y(function (d) { return y(d) })
    .interpolate('linear')

// Create SVG element
var svg = d3.select('counterpoint')
  .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

// add note names to y axis
svg.append('g')
    .attr('class', 'grid-text')
  .selectAll('text')
    .data(letterGridData)
  .enter().append('text')
    .text(function (d) { return d.display })
    .attr('sciPitch', function (d) { return d.val })
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'central')
    .attr('x', function (d) { return x(d.x)})
    .attr('y', function (d) { return y(d.y) })
    .attr('font-family', 'Georgia')
    .attr('font-size', '0.3em')

