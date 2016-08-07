function generateLegend() {
  const svg = d3.select("#legendArea").append('svg')
      .attr("width", 1000)
      .attr("height", 120)
      .style({display: 'block', margin: 'auto'});

  var linear = d3.scale.linear()
  .domain([-2.5,2.5])
  .range(["red", "lime"]);

  svg.append("g")
    .attr("class", "legendLinear")
    .attr("transform", "translate(20,20)");

  var legendLinear = d3.legend.color()
    .shapeWidth(30)
    .cells(10)
    .orient('horizontal')
    .scale(linear);

  svg.select(".legendLinear")
    .call(legendLinear);
}
