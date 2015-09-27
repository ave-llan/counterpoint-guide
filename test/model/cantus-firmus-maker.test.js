var test = require('tape')
var CantusFirmusMaker = require('../../app/model/cantus-firmus-maker.js')

test('CantusFirmusMaker', function (t) {
  var cf = new CantusFirmusMaker()
  t.equal(cf.key(), 'C major')
  t.equal(cf.maxRange(), 10)
  t.equal(cf.maxLength(), 16)
  cf.addNote('C4')
  t.deepEqual(cf.domain(),
    [ 'A2', 'B2', 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
      'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5' ])
  cf.addNote('C5')
  t.deepEqual(cf.domain(),
    [ 'A3', 'B3',
      'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5' ])
  t.end()
})
