var d3 = require('d3')
var CFguide = require('../model/cantus-firmus-maker.js')
var Pitch = require('nmusic').Pitch
var sortPitches = require('nmusic').sortPitches

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
'E4 F4 C4 D4 F4 E4 G4 Bb3 C4 F4 E4 D4'.split(' ').forEach(cf.addNote)

var margin = {top: 20, right: 10, bottom: 20, left: 10}
var width = 600 - margin.left - margin.right
var height = 450 - margin.top - margin.bottom
var yAxisWidth = 44
var nextChoiceDepth = 2
var constructionPointRadius = 15
var choicePointRadius = 12
var pathWidth = 1
var animationTime = 750
var choicePadding = 0.16

var xDomain = function () {
  var minAllowed = d3.max([8, cf.length() + 2])
  var range = minAllowed > cf.maxLength() ? cf.maxLength() : minAllowed
  return d3.range(range)
}

var y = d3.scale.ordinal()
    .domain(cf.domain())
    .rangeRoundBands([height, 0])

var x = d3.scale.ordinal()
    // min 8, at least cur + 2
    .domain(d3.range(d3.max([8, cf.length() + 1])))
    .rangeRoundBands([yAxisWidth, width])

var choiceBoxYPadding = function () {
  return y.rangeBand() * choicePadding
}

var constructionLine = d3.svg.line()
    .x(function (d, i) { return x(i) + x.rangeBand() / 2})
    .y(function (d) { return y(d) + y.rangeBand() / 2 })
    .interpolate('cardinal')
    .tension(0.7)

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
    .attr('y', function (d) { return y(d.val) + y.rangeBand() / 2 })


// add path of current cf construction
svg.append('path')
    .datum(cf.construction().concat(cf.lastNote()))
    .attr('id', 'construction-line')
    .attr('d', constructionLine)
    .attr('stroke-width', pathWidth)


// add points of current cf construction
svg.append('g')
    .attr('class', 'construction-notes')
  .selectAll('rect')
    .data(cf.construction())
  .enter().append('rect')
    .attr('x', function (d, i) { return x(i) })
    .attr('y', function (d) { return y(d) })
    .attr('width', x.rangeBand())
    .attr('height', y.rangeBand())
    .attr('rx', 7)
    .attr('rx', 7)


// add points of choices
svg.append('g')
    .attr('class', 'choice-notes')
  .selectAll('rect')
    .data(sortPitches(cf.choices()))
  .enter().append('rect')
    .attr('x', function (d) {
      var lastIndex = cf.construction().lastIndexOf(d)
      return (lastIndex === -1) ? yAxisWidth : x(lastIndex)
    })
    .attr('y', function (d) {
      return (cf.construction().lastIndexOf(d) === -1) ? y(d) + y.rangeBand() / 2
                                                       : y(d)
    })
    .attr('width', function (d) {
      return (cf.construction().lastIndexOf(d) === -1) ? 0 : x.rangeBand()
    })
    .attr('height', function (d) {
      return (cf.construction().lastIndexOf(d) === -1) ? 0 : y.rangeBand()
    })
    .attr('fill-opacity', 0)
    .attr('rx', 7)
    .attr('rx', 7)
    .attr('animating', 'yes') // set to 'no' when finished moving
    .transition()
    .delay(function (d, i) {
      return i * (animationTime / 10)
    })
    .duration(1000)
    .attr('fill-opacity', 0.25)
    /*
    .on('click', function (d, i) {
      // remove all choice-points 'on-click listeners'
      svg.select('.choice-points').selectAll('circle')
          .on('click', null)
      cf.addNote(d)
      redraw(svg)
    })
    */
    .transition()
    .duration(animationTime)
    .attr('x', x(cf.length()))
    .attr('y', function (d) { return y(d) + choiceBoxYPadding() / 2 })
    .attr('width', x.rangeBand())
    .attr('height', y.rangeBand() - choiceBoxYPadding())
    .each('end', function () {
      d3.select(this)
          .attr('animating', 'no')
          .on('mouseover', function (d) {
            var selectedNote = d
            // move construction line onto this choice
            d3.select('#construction-line')
                .datum(cf.construction().concat(selectedNote))
                .transition()
                .duration(300)
                .attr('d', constructionLine)
            d3.select('.choice-notes').selectAll('rect')
                .each(function () {
                  var selection = d3.select(this)
                  if (selection.attr('animating') == 'no') {
                    selection.transition()
                        .duration(300)
                        .attr('fill-opacity', function (d) {
                          return (d === selectedNote) ? 0.5 : 0.25
                    })
                  }
                })
          })
          .on('click', function (d) {
            console.log(d)
            // remove all event listeners
            d3.select('.choice-notes').selectAll('rect')
                .on('click', null)
          })
    })
/*

*/
/*
    // add paths to next note choices

    svg.append('g')
        .attr('class', 'choice-paths')
      .selectAll('line')
        .data(cf.choices())
      .enter().append('line')
        .attr('x1', x(cf.length() - 1))
        .attr('y1', y(cf.lastNote()))
        .attr('x2', x(cf.length() - 1))
        .attr('y2', y(cf.lastNote()))
        .attr('stroke-width', pathWidth)
        .attr('stroke-opacity', 0.15)
        .transition()
        .duration(animationTime)
        .attr('x2', x(cf.length()))
        .attr('y2', function (d) { return y(d) })
*/
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

  /*
  // add new paths at point of this choice
  var newChoicePaths = svg.append('g')
      .attr('class', 'choice-paths')
    .selectAll('line')
      .data(cf.choices())
    .enter().append('line')
      .attr('x1', x(cf.length() - 1))
      .attr('y1', y(cf.lastNote()))
      .attr('x2', x(cf.length() - 1))
      .attr('y2', y(cf.lastNote()))
      .attr('stroke-width', pathWidth)
      .attr('stroke-opacity', 0.3)
  */


  // add new choices at point of this choice
  var newCircles = svg.append('g')
      .attr('class', 'choice-points')
    .selectAll('circle')
      .data(cf.choices())
    .enter().append('circle')
      .attr('cx', x(cf.length() - 1))
      .attr('cy', y(cf.lastNote()))
      .attr('r', choicePointRadius / 2)
      .on('click', function (d, i) {
        cf.addNote(d)
        redraw(svg)
      })

  // update scales
  y = d3.scale.ordinal()
    .domain(cf.domain())
    .rangeRoundBands([height, 0], 0.05)

  x = d3.scale.ordinal()
    .domain(d3.range(d3.max([8, cf.length() + 2])))
    .rangeRoundBands([yAxisWidth, width], 0.05)


  // update all construction points with new scales
  constructionPoints.transition()
      .duration(animationTime)
      .attr('cx', function (d, i) { return x(i) })
      .attr('cy', function (d) { return y(d) })
      .attr('r', constructionPointRadius) // will grow the new point


  // update construction line with new scales
  constructionPath
      .datum(cf.construction())
      .transition()
      .duration(animationTime)
      .attr('d', constructionLine)

  // remove old choices after animating into pickedNote
  var pickedNote = cf.construction()[cf.length()-1]
  var oldChoicePoints = svg.select('.choice-points')
  oldChoicePoints.selectAll('circle')
      .transition()
      .duration(animationTime)
      .attr('cx', x(cf.length() - 1))
      .attr('cy', y(pickedNote))
      .attr('r', choicePointRadius / 2)
  oldChoicePoints.transition()
      .delay(animationTime)
      .remove()

  /*
  // remove old choice paths
  var penultimateNote = cf.construction()[cf.length() - 2]
  var oldChoicePaths = svg.select('.choice-paths')
  oldChoicePaths.selectAll('line')
      .transition()
      .duration(animationTime)
      .attr('x1', x(cf.length() - 2))
      .attr('y1', y(penultimateNote))
      .attr('x2', x(cf.length() - 1))
      .attr('y2', y(cf.lastNote()))
      .attr('stroke-opacity', 0)
  oldChoicePaths.transition()      // remove the whole group
      .delay(animationTime)
      .remove()

  // move choice paths to choices using new scales
  newChoicePaths.transition()
    .duration(animationTime)
    .attr('x1', x(cf.length() - 1))
    .attr('y1', y(cf.lastNote()))
    .attr('x2', x(cf.length()))
    .attr('y2', function (d) { return y(d) })
  */
  // move choice notes out using new scales
  newCircles.transition()
      // .delay(300)
      .duration(animationTime)
      .attr('cx', x(cf.length()))
      .attr('cy', function (d) { return y(d) })
      .attr('r', choicePointRadius)


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
      .duration(animationTime)
      .text(function (d) { return Pitch(d.val).pitchClass() })
      .attr('sciPitch', function (d) { return d.val })
      .attr('y', function (d) { return y(d.val) })
}
