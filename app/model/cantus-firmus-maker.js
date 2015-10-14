var CantusFirmus = require('counterpoint').CantusFirmus
var Key = require('nmusic').Key
var sortPitches = require('nmusic').sortPitches
var plusInterval = require('nmusic').plusInterval
var deepcopy = require('deepcopy')

/**
 * helps to build a new cantus firmus
 *
 * @constructor
 *
 * @param {PitchString} [firstNote='C4'] - the tonic and first note
 * @param {string} [mode='major'] - the mode (ie, 'major', 'minor', 'dorian') of this cf
 * @param {number} [maxRange=10] - the max allowed range of this cf
 * @param {number} [maxLength=16] - the max allowed length of this cf
 */
var CantusFirmusMaker = function (firstNote, mode, maxRange, maxLength) {
  firstNote = firstNote || 'C4'
  mode = mode || 'major'
  maxRange = maxRange || 10     // max range of cf
  maxLength = maxLength || 16   // max length of cf
  var key = new Key(firstNote, mode)

  var cf = new CantusFirmus(key.toString(), maxRange, maxLength)
  // add the first note
  cf.addNote(firstNote)

  this.key = function () {
    return key.toString()
  }

  this.maxRange = function () {
    return maxRange
  }

  this.maxLength = function () {
    return maxLength
  }

  this.mode = function () {
    return mode
  }

  this.construction = function () {
    return cf.cf()
  }

  this.length = function () {
    return cf.cf().length
  }

  this.lastNote = function () {
    return this.construction()[this.length() - 1]
  }

  this.firstNote = function () {
    return this.construction()[0]
  }

  this.choices = function () {
    return cf.choices()
  }

  this.addNote = function (note) {
    cf.addNote(note)
  }

  this.pop = function () {
    if (this.construction().length <= 1) {  // maintain a length of 1
      throw new Error('No notes to pop.')
    }
    return cf.pop()
  }

  this.isValid = function () {
    return cf.isValid()
  }

  this.highNote = function () {
    return sortPitches(this.construction())[this.length() - 1]
  }

  this.lowNote = function () {
    return sortPitches(this.construction())[0]
  }

  /**
   * looks at current choices and current construction and returns an array
   * of all pitch strings in the key from lowest to highest
   * @returns {string[]}
   */
  this.domain = function () {
    var usedNotes = sortPitches(this.construction().concat(this.choices()))
    var lo = usedNotes[0]
    var hi = usedNotes[usedNotes.length - 1]
    var pitches = key.range(lo, hi)
    return pitches.map(function (pitch) {
      return pitch.sciPitch()
    })
  }

  /**
   * returns an array of choices
   *
   */
  this.choicePaths = function (nDeep) {
    return cf.choices(nDeep).map(pathsFromNode).reduce(mergeArrays)
  }

  /**
   *
   * @returns {CantusFirmusMaker} - a new cantus firmus maker transposed by given interval
   */
  this.transpose = function (interval) {
    var transposedConstruction = this.construction().map(function (oldNote) {
      return plusInterval(oldNote, interval)
    })
    var newGuide = new CantusFirmusMaker(transposedConstruction.shift(), mode, maxRange, maxLength)
    transposedConstruction.forEach(newGuide.addNote)
    return newGuide
  }
}

var mergeArrays = function (array1, array2) {
  var merged = deepcopy(array1)
  Array.prototype.push.apply(merged, array2)
  return merged
}

var pathsFromNode = function (treeNode) {
  if (treeNode.next.length === 0) {
    return [[treeNode.val]]
  } else {
    var paths = []
    treeNode.next.forEach(function (nextTreeNode) {
      pathsFromNode(nextTreeNode).forEach(function (path) {
        path.unshift(treeNode.val) // this val to front of path
        paths.push(path)
      })
    })
    return paths
  }
}

module.exports = CantusFirmusMaker
