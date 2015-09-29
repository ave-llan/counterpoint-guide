var CantusFirmus = require('counterpoint').CantusFirmus
var Key = require('nmusic').Key
var sortPitches = require('nmusic').sortPitches
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

  this.construction = function () {
    return cf.cf()
  }

  this.length = function () {
    return cf.cf().length
  }

  this.choices = function (nDeep) {
    return cf.choices(nDeep || 1)
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

  /**
   * returns an array of pitch strings representing the domain
   * of choices given the current construction and maxRange
   * @returns {string[]}
   */
  this.domain = function () {
    var usedNotes = sortPitches(this.construction())
    var lo = usedNotes[0]
    var hi = usedNotes[usedNotes.length - 1]
    var pitches = key.range(key.plusInterval(hi, -1 * maxRange),
                              key.plusInterval(lo, maxRange))
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
