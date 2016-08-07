const margin = {top: 20, right: 20, bottom: 20, left: 20};
const h = 900 - margin.top - margin.bottom;
const w = 1800 - margin.left - margin.right;
const sidePadding = 200;

let tip;
let formatData;
let usStates;
let currentSelectedState = null;
let visYear = 2014

// Is there data on number of votes recieved rather than percentage per state...?
const q = d3_queue.queue()
  .defer(d3.csv, 'data/political_stability.csv')
  .defer(d3.json, 'data/world.json')
  .awaitAll(function(error, data) {
    if (error) console.log(error);

    [polStability, usStates] = data;

    const allNations = _.uniqBy(polStability, (d) => d["code"])
      .map((d) => {
        return {
          code: d["code"],
          data: {}
        }
      });

    formatData = _.keyBy(allNations, (d) => d["code"]);

    _.forEach(polStability, (line) => {
      const nation = line["code"];
      const year = line["year"];
      const politicalStabilityScore = line["Political stability"];
      formatData[nation].data[year] = parseFloat(politicalStabilityScore) || null;
    });

    loadState(0)
    generateLegend()
  });

function loadState(change) {

  d3.select("#year").html(visYear + change);
  visYear = visYear + change

  // Removing chart if it exists
  if (d3.select('#chartArea svg').node()) {
    d3.select('#chartArea svg').remove();
    tip.hide();
  }
  const svg = d3.select("#chartArea").append('svg')
      .attr("width", w)
      .attr("height", h)
      .style({display: 'block', margin: 'auto'});
  const projection = d3.geo.mercator()
      .translate([w/2, h/2 + 175])
      .scale(200);
  const path = d3.geo.path()
      .projection(projection);
  const svgState = svg.append('g')
    .attr('class', classNames('state'))

  const color = d3.scale.linear()
    .domain([-2.5, 2.5]) //these numbers because looking @ change [2.5, 2.5]
    .range(["maroon", "lime"]);

  // base layer
  svgState.selectAll("path.base")
      .data(usStates.features)
    .enter()
      .append('path')
      .attr('class', (d) => classNames('base', d.properties.sov_a3))
      .attr("d", path)
      .style("fill", (d) => {
        const yearData = getCountryYearData(d.properties.iso_a2);
        const sortedYears = _.sortBy(_.keys(_.pickBy(yearData)));

        if (sortedYears.length < 2) {
          return "gray"
        }

        currentYear = _.nth(sortedYears, -1);
        lastYear = _.nth(sortedYears, -2);

        change = yearData[currentYear] - yearData[lastYear];

        return color(yearData[visYear]);
      })
      .on('click', (d) => toggleStateClick(d.properties))
      .each((d) => {
        const [x, y] = path.centroid(d);
        d.properties.centroid = {x, y};
      })
  svg.call(tip)
}

// toolTips get fucked up when zoomed in, should make custom tooltips rather than use library....
tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset((d) => {
    const BBox = d3.select('.base.' + d.sov_a3).node().getBBox();
    tipOrigin = {x: BBox.x + BBox.width/2, y: BBox.y};
    topOfStack = 0 //d[delegates] / peoplePerCircle * 4;
    tipDesired = {x: d.centroid.x, y: d.centroid.y - topOfStack}

    // Issue when do not click on the state is that the original bbox is different...

    return [tipDesired.y - tipOrigin.y, tipDesired.x - tipOrigin.x]
  })
  .html((d) => {
    const yearData = getCountryYearData(d.iso_a2);
    const sortedYears = _.sortBy(_.keys(_.pickBy(yearData)));

    return '<strong id="info-title">' + d.brk_name + '</strong> <br>'
      + "<table id='info-table'>"
      + generateHeaders(sortedYears)
      + generateColumn(yearData, _.take(_.reverse(sortedYears), 5))
      + "</table> <br>"
  });

function getCountryYearData(iso_a2) {
  return (formatData[iso_a2] || {}).data;
}

function onStateClick(d) {
  // Show more state information + highlight all paths leaving state
  d3.selectAll('.base.' + d.sov_a3).style('stroke', 'orange')

  console.log(d)

  tip.show(d)
}

function onStateUnclick(sov_a3) {
  // Show more state information + highlight all paths leaving state
  d3.selectAll('.base.' + sov_a3).style('stroke', '#F7F0E4')

  tip.hide()
}

function toggleStateClick(d) {
  if (d.sov_a3 !== currentSelectedState ) {
    onStateUnclick(currentSelectedState)
    onStateClick(d);
    currentSelectedState = d.sov_a3;
  }
  else {
    onStateUnclick(currentSelectedState);
    currentSelectedState = null;
  }
}