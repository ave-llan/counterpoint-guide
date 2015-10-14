var test = require('tape')
var CantusFirmusMaker = require('../../app/model/cantus-firmus-maker.js')

test('CantusFirmusMaker', function (t) {
  var cf = new CantusFirmusMaker()
  t.equal(cf.key(), 'C major', 'C4')
  t.equal(cf.maxRange(), 10)
  t.equal(cf.maxLength(), 16)
  t.deepEqual(cf.domain().sort(),
    [ 'C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3',
      'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'].sort())
  cf.addNote('C5')
  t.deepEqual(cf.domain(),
    [ 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5' ])

  t.deepEqual(cf.construction(),
    [ 'C4', 'C5' ])

  var cf_transposed_up = cf.transpose('P5')
  var cf_transposed_down = cf.transpose('-M2')


  t.deepEqual(cf.construction(),
    [ 'C4', 'C5' ])

  t.deepEqual(cf_transposed_up.construction(),
    [ 'G4', 'G5' ])

  t.deepEqual(cf_transposed_down.construction(),
    [ 'Bb3', 'Bb4' ])

  cf_transposed_up.addNote('F#5')

  t.deepEqual(cf.construction(),
    [ 'C4', 'C5' ])

  t.deepEqual(cf_transposed_up.construction(),
    [ 'G4', 'G5', 'F#5' ])

  t.deepEqual(cf_transposed_down.construction(),
    [ 'Bb3', 'Bb4' ])

  t.end()
})
