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
//'E4 F4 C4 D4 F4 E4 G4 Bb3 C4 F4 E4 D4'.split(' ').forEach(cf.addNote)

var margin = {top: 20, right: 10, bottom: 20, left: 10}
var width = 800 - margin.left - margin.right
var height = 450 - margin.top - margin.bottom
var yAxisWidth = 44                  // space reserved for note names on y axis
var pathWidth = 1                    // width of construction line
var animationTime = 3000              // animation time to re-scale
var choiceAnimationTime = 4000        // animatino time for choices to appear
var choicePadding = 0.16             //  reserve 16% of vertical space for padding
var unfinishedNoteColor = '#c6dbef'  // light blue
var finishedNoteColor = '#2ca02c'    // green

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
    .datum(cf.construction())
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
    .attr('fill', function () { return cf.isValid() ? finishedNoteColor : unfinishedNoteColor })
    .attr('animating', 'no')
    .on('click', deleteToHere)

function deleteToHere (d, i) {
  // do not execute if currently executing or if this is the current last note
  if (d3.select(this).attr('animating') === 'no' && i !== cf.length() - 1) {
    // set construction points to animating
    d3.select('.construction-notes').selectAll('rect')
        .attr('animating', 'yes')
    // disable choice mouse events
    d3.select('.choice-notes').selectAll('rect')
        .on('click', null)
        .on('mouseover', null)
    // pop until
    d3.range(cf.length() - 1 - i).forEach(function () {
      cf.pop()
    })
    redraw(svg)
  }
}

function appendChoices (svg) {
// add points of choices
  svg.append('g')
      .attr('class', 'choice-notes')
    .selectAll('rect')
      .data(cf.choices())
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
      //.duration(250)            // 250 is the default, just noting it here
      .delay(function (d) {
        return Pitch(d).intervalSize(cf.lastNote()) * choiceAnimationTime / 6
      })
      .attr('fill-opacity', 0.25)
      .transition()
      .duration(choiceAnimationTime)
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
              // remove both event listeners
              d3.select('.choice-notes').selectAll('rect')
                  .on('click', null)
                  .on('mouseover', null)

              cf.addNote(d)
              redraw(svg)
            })
      })
}

function pathTransition(path) {
  path.transition()
      .duration(choiceAnimationTime)
      .attrTween('stroke-dasharray', tweenDash)
      .each('end', function() { d3.select(this).call(transition) })
}

function tweenDash() {
  var oldLength
}

appendChoices(svg)


function redraw (svg) {
  // before updating scales, use old scale to new point and extend path
  // create note in choice position for animation
  var constructionPoints = svg.select('.construction-notes').selectAll('rect')
      .data(cf.construction())

  var chosenLine = svg.select('#construction-line')
      .datum(cf.construction())
      .attr('d', constructionLine)

  // add new note disguised as choice note, transition to construction note
  constructionPoints.enter().append('rect')
      .attr('x', function (d, i) { return x(i) })
      .attr('y', function (d) { return y(d) + choiceBoxYPadding() / 2 })
      .attr('width', x.rangeBand())
      .attr('height', y.rangeBand() - choiceBoxYPadding())
      .attr('rx', 7)
      .attr('rx', 7)
      .attr('fill', '#c6dbef')
      .attr('animating', 'yes')
      .on('click', deleteToHere)


  // update scale domains
  y.domain(cf.domain())
  x.domain(d3.range(d3.max([8, cf.length() + 1])))

  // remove old choices after animating into pickedNote
  var oldChoicePoints = svg.select('.choice-notes')
  oldChoicePoints.selectAll('rect')
      .transition()
      .duration(animationTime)
      .attr('x', x(cf.length() - 1))
      .attr('y', y(cf.lastNote()))
      .attr('width', x.rangeBand())
      .attr('height', y.rangeBand())
      .attr('fill-opacity', 0)
  oldChoicePoints.transition()
      .delay(animationTime)
      .remove()

  constructionPoints.exit()
      .transition()
      .duration(animationTime)
      .attr('x', x(cf.length() - 1))
      .attr('y', y(cf.lastNote()))
      .attr('width', x.rangeBand())
      .attr('height', y.rangeBand())
      .attr('fill', function () { return cf.isValid() ? finishedNoteColor : unfinishedNoteColor })
      .remove()

  // move construction to new position using updated scales
  constructionPoints.transition()
      .duration(animationTime)
      .attr('x', function (d, i) { return x(i) })
      .attr('y', function (d) { return y(d)})
      .attr('width', x.rangeBand())
      .attr('height', y.rangeBand())
      .attr('fill', function () { return cf.isValid() ? finishedNoteColor : unfinishedNoteColor })
      .each('end', function () {
        d3.select(this)
            .attr('animating', 'no')
      })

  // update construction line with new scales
  chosenLine.transition()
      .duration(animationTime)
      .attr('d', constructionLine)

  // recalculate y axis text
  var yText = svg.select('.y-axis-text').selectAll('text')
      .data(cf.domain().map(function (sciPitch) {
        return { val: sciPitch }
      }), function (d) { return d.val })
  // remove unused notes in domain
  yText.exit()
      .transition()
      .delay(function (d) {
        var thisNote = Pitch(d.val)
        // notes closer to current range exit first to get out of the way
        return (Math.min(thisNote.intervalSize(cf.highNote()),
                        thisNote.intervalSize(cf.lowNote())) - 2) * animationTime / 10
      })
      .duration(animationTime/3)
      .attr('x', -50)
      .remove()
  // update remaining
  yText.transition()
      .duration(animationTime)
      .text(function (d) { return Pitch(d.val).pitchClass() })
      .attr('sciPitch', function (d) { return d.val })
      .attr('y', function (d) { return y(d.val) + y.rangeBand() / 2 })
  yText.enter()
      .append('text')
      .text(function (d) { return Pitch(d.val).pitchClass() })
      .attr('sciPitch', function (d) { return d.val })
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'central')
      .attr('x', -50)
      .attr('y', function (d) { return y(d.val) + y.rangeBand() / 2 })
      .transition()
      .delay(function (d) { // try to match incoming choice notes
        return 350 + (Pitch(d.val).intervalSize(cf.lastNote()) * choiceAnimationTime / 6)
      })
      .duration(animationTime)
      .attr('x', 0)

  appendChoices(svg)
}
