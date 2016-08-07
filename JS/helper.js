// Would be best to have sparklines than a table..
function generateHeaders (input) {
  if (_.size(input) > 0) {
    return "<td>Year</td>"
      + "<td>Score</td>"
  }
  return ""
}

function generateColumn (yearData, sortedYears) {
  return _.reduce(sortedYears, (agg, year, i) => {
    prevYearData = i > 0 ? yearData[sortedYears[i-1]] : null;
    return agg + "<tr>"
        + "<td>" + (year) + "</td>"
        + "<td>" + (yearData[year]) + "</td>"
      + "</tr>"
  }, '');
}
