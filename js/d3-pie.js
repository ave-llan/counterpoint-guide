var d3 = require('d3')

var w = 800;
var h = 800;
var dataset = [ 5, 10, 20, 45, 6, 25 ];
var outerRadius = w / 2;
var innerRadius = w / 3;
var arc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

var pie = d3.layout.pie();

//Easy colors accessible via a 10-step ordinal scale
var color = d3.scale.category10();
//Create SVG element
var svg = d3.select("body")
      .append("svg")
      .attr("width", w)
      .attr("height", h);

//Set up groups
var arcs = svg.selectAll("g.arc")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");

//Draw arc paths
arcs.append("path")
    .attr("fill", function(d, i) {
      return color(i);
    })
    .attr("d", arc);

//Labels
arcs.append("text")
    .attr("transform", function(d) {
      return "translate(" + arc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function(d) {
      return d.value;
    });