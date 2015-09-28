var CantusFirmus = require('counterpoint').CantusFirmus
var Key = require('nmusic').Key
var sortPitches = require('nmusic').sortPitches

var CantusFirmusMaker = function (key, firstNote, maxRange, maxLength) {
  key = key || 'C major'        // key of the cf
  var keyParts = key.split(' ')
  firstNote = firstNote || keyParts[0]
  maxRange = maxRange || 10     // max range of cf
  maxLength = maxLength || 16   // max length of cf

  var cf = new CantusFirmus(key, maxRange, maxLength)
  cf.addNote(firstNote)

  this.key = function () {
    return key
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
    var keyParts = key.split(' ')
    var cfKey = new Key(keyParts[0], keyParts[1])
    var usedNotes = sortPitches(this.construction())
    var lo = usedNotes[0]
    var hi = usedNotes[usedNotes.length - 1]
    var pitches = cfKey.range(cfKey.plusInterval(hi, -1 * maxRange),
                              cfKey.plusInterval(lo, maxRange))
    return pitches.map(function (pitch) {
      return pitch.sciPitch()
    })
  }
}

module.exports = CantusFirmusMaker
