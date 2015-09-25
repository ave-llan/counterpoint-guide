var d3 = require('d3')
var CantusFirmus = require('counterpoint').CantusFirmus

var cf = new CantusFirmus()

var svgWidth = 600
var svgHeight = 250



var yScale = d3.scale.ordinal()
               .domain(['cat', 'dog', 'hat'])
               .rangeRoundBands([0, svgHeight], 0.05)
