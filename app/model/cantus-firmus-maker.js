var CantusFirmus = require('counterpoint').CantusFirmus

var CantusFirmusMaker = function (key, maxRange, maxLength) {
  key = key || 'C major'        // key of the cf
  maxRange = maxRange || 10     // max range of cf
  maxLength = maxLength || 16   // max length of cf

  var cf = new CantusFirmus(key, maxRange, maxLength)

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

  this.pop = function () {
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

  }
}

module.exports = CantusFirmusMaker
