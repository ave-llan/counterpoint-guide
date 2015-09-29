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
'E4 F4 E4 D4 E4 F4'.split(' ').forEach(cf.addNote)

var margin = {top: 20, right: 10, bottom: 20, left: 10}
var width = 600 - margin.left - margin.right
var height = 500 - margin.top - margin.bottom
var yAxisWidth = 44
var nextChoiceDepth = 2
var constructionPointRadius = 15
var choicePointRadius = 8
var pathWidth = 3

var y = d3.scale.ordinal()
    .domain(cf.domain())
    .rangeRoundBands([height, 0], 0.05)

var x = d3.scale.ordinal()
    // min 8, at least cur + 2
    .domain(d3.range(d3.max([8, cf.length() + 2])))
    .rangeRoundBands([yAxisWidth, width], 0.05)

var constructionLine = d3.svg.line()
    .x(function (d, i) { return x(i) })
    .y(function (d) { return y(d) })
    .interpolate('linear')

var choicesLine = d3.svg.line()
    .x(function (d, i) { return x(cf.length() - 1 + i) })
    .y(function (d) { return y(d) })
    .interpolate('linear')

// for use in animation after choosing a path (what is the path between last two notes)
var chosenPathLine = d3.svg.line()
    .x(function (d, i) { return x(cf.length() - 2 + i)})
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
    .attr('class', 'y-axis-text')
  .selectAll('text')
    .data(cf.domain().map(function (sciPitch) {
      return {val: sciPitch}
    }), function (d) { return d.val })
  .enter().append('text')
    .text(function (d) { return Pitch(d.val).pitchClass() })
    .attr('sciPitch', function (d) { return d.val })
    .attr('text-anchor', 'start')
    .attr('dominant-baseline', 'central')
    .attr('x', 0)
    .attr('y', function (d) { return y(d.val) })

// add path of current cf construction
svg.append('path')
    .datum(cf.construction())
    .attr('id', 'construction-line')
    .attr('d', constructionLine)
    .attr('stroke-width', pathWidth)

// add points of current cf construction
svg.append('g')
    .attr('class', 'construction-points')
  .selectAll('circle')
    .data(cf.construction())
  .enter().append('circle')
    .attr('cx', function (d, i) { return x(i) })
    .attr('cy', function (d) { return y(d) })
    .attr('r', constructionPointRadius)

var lastNote = cf.construction()[cf.length() - 1]
var choicePaths = cf.choices().map(function (nextChoice) {
  return [lastNote, nextChoice]
})
var chosenPath

// add paths to next note choices
svg.append('g')
    .attr('class', 'choice-paths')
  .selectAll('path')
    .data(choicePaths)
  .enter().append('path')
    .attr('d', choicesLine)
    .attr('stroke-width', pathWidth)
    .attr('stroke-opacity', 0.3)

// add points of choices
svg.append('g')
    .attr('class', 'choice-points')
  .selectAll('circle')
    .data(cf.choices())
  .enter().append('circle')
    .attr('cx', x(cf.length()))
    .attr('cy', function (d) { return y(d) })
    .attr('r', choicePointRadius)
    .on('click', function (d, i) {
      chosenPath = choicePaths.map(function () {
        return choicePaths[i]
      })
      cf.addNote(d)
      redraw(svg)
    })

function redraw (svg) {
  // before updating scales, use old scale to new point and extend path

  // create note in choice position for animation
  var constructionPoints = svg.select('.construction-points').selectAll('circle')
      .data(cf.construction())

  // add new note disguised as choice note, transition to construction note
  constructionPoints.enter().append('circle')
      .attr('cx', function (d, i) { return x(i) })
      .attr('cy', function (d) { return y(d) })
      .attr('r', choicePointRadius)

  // extend construction to choice before
  var constructionPath = svg.select('#construction-line')
      .datum(cf.construction())
      .attr('d', constructionLine)

  // update scales
  y = d3.scale.ordinal()
    .domain(cf.domain())
    .rangeRoundBands([height, 0], 0.05)

  x = d3.scale.ordinal()
    .domain(d3.range(d3.max([8, cf.length() + 2])))
    .rangeRoundBands([yAxisWidth, width], 0.05)


  // recalculate y axis text
  var yText = svg.select('.y-axis-text').selectAll('text')
      .data(cf.domain().map(function (sciPitch) {
        return { val: sciPitch }
      }), function (d) { return d.val })
  // remove unused notes in domain
  yText.exit()
      .transition()
      .duration(250)
      .attr('x', -50)
      .remove()
  // update remaining
  yText.transition()
      .duration(1000)
      .text(function (d) { return Pitch(d.val).pitchClass() })
      .attr('sciPitch', function (d) { return d.val })
      .attr('y', function (d) { return y(d.val) })


  // update all construction points with new scales
  constructionPoints.transition()
      .duration(1000)
      .attr('cx', function (d, i) { return x(i) })
      .attr('cy', function (d) { return y(d) })
      .attr('r', constructionPointRadius) // will grow the new point


  // update construction line with new scales
  constructionPath
      .datum(cf.construction())
      .transition()
      .duration(1000)
      .attr('d', constructionLine)

  // remove old choices after animating into pickedNote
  var pickedNote = cf.construction()[cf.length()-1]
  svg.select('.choice-points').selectAll('circle')
      .transition()
      .duration(1000)
      .attr('cx', x(cf.length() - 1))
      .attr('cy', y(pickedNote))
      .attr('r', choicePointRadius / 2)
      .remove()

  // remove old choice paths
  svg.select('.choice-paths').selectAll('path')
      .data(chosenPath)
      .transition()
      .duration(1000)
      .attr('d', chosenPathLine)
      .attr('stroke-opacity', 0)
      .remove()
}
