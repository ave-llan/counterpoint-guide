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
var animationTime = 300              // animation time to re-scale
var choiceAnimationTime = 500        // animatino time for choices to appear
var choicePadding = 0.16             // reserve 16% of vertical space for padding
var unfinishedNoteColor = '#c6dbef'  // light blue
var finishedNoteColor = '#2ca02c'    // green

var constructionOpacity = 0.5        // opacity of construction notes
var onClickNoteOpacity  = 1          // on click opacity
var onClickSize = 1.2                // increase size to 120%
var sizeBeforePop = 1.6              // increase size to 160%

var fontSize = '1.3em'               // default font size
var highlightedFontSize = '2.2em'      // font size when note is selected

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
    .attr('font-size', fontSize)
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
    .call(constructionNotes)
    .attr('animating', 'no')
    .on('mousedown', constructionMouseDown)
    .on('touchstart', constructionMouseDown)
    .on('mouseup', constructionMouseUp)
    .on('touchend', constructionMouseUp)

// clear delete timeout and reset note size and opacity
function constructionMouseUp (d, i) {
  if (d3.select(this).attr('selected') === 'true') {
    var index = i      // capture index for using in x scales below
    resetYTextSize(d)  // un-highlight y-axis note name
    d3.select(this)
        .transition()
        .duration(250)
        .attr('fill-opacity', constructionOpacity)
        .attr('x', x(index))
        .attr('y', function (d) { return y(d) })
        .attr('width', x.rangeBand())
        .attr('height', y.rangeBand())
        .each('end', function () {
          d3.select(this)
              .attr('animating', 'no')
        })
  }
}

// this function will play the note
function playNote (note) {
  console.log('Played:', note)
}

function highlightYtext(note) {
  d3.select('.y-axis-text').selectAll('text')
      .filter(function (d) { return d.val === note })
      .transition()
      .duration(50)
      .attr('font-size', highlightedFontSize)
      // 2. delay for a moment
      .transition()
      .delay(200)
      // 3. rapidly grow in preparation for delete
      .transition()
      .duration(200)
      .attr('font-size', '4em')
}

function resetYTextSize(note) {
  d3.select('.y-axis-text').selectAll('text')
      .filter(function (d) { return d.val === note })
      .transition()
      .duration(250)
      .attr('font-size', fontSize)
}

// play note, highlight note, and set delete timeout
function constructionMouseDown (d, i) {
  d3.event.preventDefault()   // prevent default selection
  var index = i               // capture index for using in x scales below

  playNote(d)                 // play the note
  highlightYtext(d)           // highlight y axis text
  if (d3.select(this).attr('animating') === 'no') {
    d3.select(this)
        // 1. highlight and grow
        .attr('selected', 'true')
        .transition()
        .duration(50)
        .attr('fill-opacity', onClickNoteOpacity)
        .attr('x', function () {
          return x(index) - (x.rangeBand() * onClickSize - x.rangeBand()) / 2
        })
        .attr('y', function (d) {
          return y(d) - (y.rangeBand() * onClickSize - y.rangeBand()) / 2
        })
        .attr('width', x.rangeBand() * onClickSize)
        .attr('height', y.rangeBand() * onClickSize)
        // 2. delay for a moment
        .transition()
        .delay(200)
        // 3. rapidly grow in preparation for delete
        .transition()
        .duration(200)
        .attr('x', function (d, i) {
          return x(index) - (x.rangeBand() * sizeBeforePop - x.rangeBand()) / 2
        })
        .attr('y', function (d) {
          return y(d) - (y.rangeBand() * sizeBeforePop - y.rangeBand()) / 2
        })
        .attr('width', x.rangeBand() * sizeBeforePop)
        .attr('height', y.rangeBand() * sizeBeforePop)
        // 4. delete up to this point and redraw
        .each('end', function () {
          d3.select(this)
              .attr('selected', 'false')
          // prevent calling delete multiple times at once on multi-touch
          if (d3.select(this).attr('animating') === 'no') {
            deleteToHere (index)
          }
        })
  }
}

// delete all construction notes up to this index point (not inclusive)
function deleteToHere (index) {
  // set construction points to animating
  d3.select('.construction-notes').selectAll('rect')
      .attr('animating', 'yes')
      .attr('selected', 'false')
  // disable choice mouse events
  d3.select('.choice-notes').selectAll('rect')
      .on('click', null)
      .on('mouseover', null)
  // pop until
  d3.range(cf.length() - 1 - index).forEach(function () {
    cf.pop()
  })
  redraw(svg)
}

function constructionNotes (transition) {
  transition
      .attr('x', function (d, i) { return x(i) })
      .attr('y', function (d) { return y(d) })
      .attr('width', x.rangeBand())
      .attr('height', y.rangeBand())
      .attr('rx', 7)
      .attr('rx', 7)
      .attr('fill-opacity', constructionOpacity)
      .attr('fill', function () { return cf.isValid() ? finishedNoteColor : unfinishedNoteColor })
}

// collapse choices into chosen note which is now cf.lastNote()
function choiceCollapse (transition) {
  transition
      .attr('x', x(cf.length() - 1))
      .attr('y', y(cf.lastNote()))
      .attr('width', x.rangeBand())
      .attr('height', y.rangeBand())
      .attr('fill-opacity', 0)
}

// choices enter behind last note of the same pitch
// if the pitch has not been used before, grow from size 0 and slide in from x=0
function choiceEnterPosition (selection) {
  selection
      .attr('x', function (d) {
        var lastIndex = cf.construction().lastIndexOf(d.val)
        return (lastIndex === -1) ? yAxisWidth : x(lastIndex)
      })
      .attr('y', function (d) {
        return (cf.construction().lastIndexOf(d.val) === -1) ? y(d.val) + y.rangeBand() / 2
                                                             : y(d.val)
      })
      .attr('width', function (d) {
        return (cf.construction().lastIndexOf(d.val) === -1) ? 0 : x.rangeBand()
      })
      .attr('height', function (d) {
        return (cf.construction().lastIndexOf(d.val) === -1) ? 0 : y.rangeBand()
      })
      .attr('fill-opacity', 0)
      .attr('rx', 7)
      .attr('rx', 7)
      .attr('animating', 'yes') // set to 'no' when finished moving
}

function choiceActivePosition (selection) {
  selection
      .attr('x', x(cf.length()))
      .attr('y', function (d) { return y(d.val) + choiceBoxYPadding() / 2 })
      .attr('width', x.rangeBand())
      .attr('height', y.rangeBand() - choiceBoxYPadding())
      .attr('fill-opacity', 0.25)
      .attr('animating', 'yes')
}

// apply listeners to choice notes after animation has finished
function applyChoiceListeners (selection) {
  selection
      .attr('animating', 'no')
      .on('mouseover', function (d) {
        var selectedNote = d.val
        // move construction line onto this choice
        d3.select('#construction-line')
            .datum(cf.construction().concat(selectedNote))
            .transition()
            .duration(300)
            .attr('d', constructionLine)
      })
      .on('click', function (d) {
        // remove both event listeners
        d3.select('.choice-notes').selectAll('rect')
            .on('click', null)
            .on('mouseover', null)

        cf.addNote(d.val)
        redraw(svg)
      })
}

// takes a reference to the choiceNotes group
function appendChoices (choiceNotesGroup) {
// add points of choices
  var choices = choiceNotesGroup.selectAll('rect')
      .data(cf.choices().map(function (sciPitch) {
            return {val: sciPitch}
          }), function (d) { return d.val })

  // 1. exit
  choices.exit()
      .attr('animating', 'yes')
      .transition()
      .duration(animationTime)
      .call(choiceCollapse)            // a. collapse into chosen note
      .remove()                        // b. remove

  // 2. update
  choices
      .attr('animating', 'yes')
      .transition()
      .duration(animationTime)
      .call(choiceCollapse)            // a. collapse into chosen note with exit notes
      .each('end', function () {       // b. switch position to left
        d3.select(this)
            .call(choiceEnterPosition)
      })

  choices.transition()                  // c. move to active position
      .delay(function (d) {
        return animationTime + Pitch(d.val).intervalSize(cf.lastNote()) * choiceAnimationTime / 6
      })
      .duration(choiceAnimationTime)
      .call(choiceActivePosition)
      .each('end', function () {
        d3.select(this)
            .call(applyChoiceListeners) // d. activate listeners
      })

  // 3. enter
  choices.enter()
    .append('rect')
      .call(choiceEnterPosition)        // a. create rect at initial position
      .transition()
      .delay(function (d) {
        return animationTime + Pitch(d.val).intervalSize(cf.lastNote()) * choiceAnimationTime / 6
      })
      .duration(choiceAnimationTime)
      .call(choiceActivePosition)       // b. switch to active position
      .each('end', function () {
        d3.select(this)
            .call(applyChoiceListeners) // c. activate listeners
      })
}

// create choice notes group
var choiceNotesGroup = svg.append('g')
      .attr('class', 'choice-notes')
// add choices to group
appendChoices(choiceNotesGroup)


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
      .on('mousedown', constructionMouseDown)
      .on('touchstart', constructionMouseDown)
      .on('mouseup', constructionMouseUp)
      .on('touchend', constructionMouseUp)


  // update scale domains
  y.domain(cf.domain())
  x.domain(d3.range(d3.max([8, cf.length() + 1])))

  // remove unused construction points
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
      .call(constructionNotes)
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
      .attr('x', 0)
      .attr('y', function (d) { return y(d.val) + y.rangeBand() / 2 })
      .attr('font-size', fontSize)
  yText.enter()
      .append('text')
      .text(function (d) { return Pitch(d.val).pitchClass() })
      .attr('font-size', fontSize)
      .attr('text-anchor', 'start')
      .attr('dominant-baseline', 'central')
      .attr('x', -50)
      .attr('y', function (d) { return y(d.val) + y.rangeBand() / 2 })
      .transition()
      .delay(function (d) { // try to match incoming choice notes
        return animationTime + (Pitch(d.val).intervalSize(cf.lastNote()) * choiceAnimationTime / 6)
      })
      .duration(choiceAnimationTime)
      .attr('x', 0)

  appendChoices(d3.select('.choice-notes'))
}
