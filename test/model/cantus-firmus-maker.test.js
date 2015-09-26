var test = require('tape')
var CantusFirmusMaker = require('../../app/model/cantus-firmus-maker.js')

test('CantusFirmusMaker', function (t) {
  var cf = new CantusFirmusMaker()
  t.equal(cf.key(), 'C major')
  t.equal(cf.maxRange(), 10)
  t.equal(cf.maxLength(), 16)

  t.end()
})
