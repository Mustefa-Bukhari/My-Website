// choropleth.js - Draws a world choropleth showing where work has screened

// Data (counts)
const screeningCounts = {
  'United States': 2,
  'Italy': 1,
  'Iceland': 1,
  'Hong Kong': 2,
  'Germany': 3,
  'United Kingdom': 3,
  'Mexico': 1,
  'Pakistan': 1
};

// helper alias map to handle GeoJSON country name variants
const alias = {
  'United States of America': 'United States',
  'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
  'United Kingdom': 'United Kingdom',
  'Hong Kong SAR': 'Hong Kong',
  'Hong Kong SAR China': 'Hong Kong',
  'Hong Kong': 'Hong Kong'
};

// color scale: 0 -> very light (we'll treat 0 specially as 5% light blue), max->turquoise
const maxCount = d3.max(Object.values(screeningCounts));
const colorScale = d3.scaleLinear()
  .domain([0.0001, maxCount]) // tiny positive to avoid 0 exact
  .range(["#e6f7fb", "#00d8b3"]);

const mapContainer = d3.select('#map-container');
const width = Math.min(1100, Math.max(600, Math.floor(window.innerWidth * 0.9)));
const height = 520;

const svg = mapContainer.append('svg')
  .attr('width', '100%')
  .attr('viewBox', `0 0 ${width} ${height}`)
  .style('display', 'block');

const projection = d3.geoNaturalEarth1()
  .scale(width / 6.5)
  .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);

// tooltip
const mapTooltip = d3.select('body').append('div')
  .attr('class', 'pie-tooltip')
  .style('position', 'absolute')
  .style('pointer-events', 'none')
  .style('z-index', 10000);

// try to load the more detailed local geojson first, fallback to the simple one
d3.json('world_detailed.geojson').then(world => {
  return world;
}).catch(() => {
  return d3.json('world.geojson');
}).then(world => {
  const countries = world.features;

  svg.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'transparent');

  svg.append('g')
    .selectAll('path')
    .data(countries)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', d => {
      const name = d.properties.name;
      const key = (screeningCounts[name] !== undefined) ? name : (alias[name] !== undefined ? alias[name] : null);
      const count = key ? screeningCounts[key] || 0 : 0;
      if (!count) return 'rgba(173,216,230,0.05)'; // 5% light blue for none
      return colorScale(count);
    })
    .attr('stroke', '#0b2')
    .attr('stroke-opacity', 0.06)
    .on('mouseover', function(event, d) {
      const name = d.properties.name;
      const key = (screeningCounts[name] !== undefined) ? name : (alias[name] !== undefined ? alias[name] : null);
      const count = key ? screeningCounts[key] || 0 : 0;
      mapTooltip.html(`<strong>${name}</strong><br>${count} screening${count === 1 ? '' : 's'}`);
      mapTooltip.classed('visible', true).style('left', (event.pageX + 12) + 'px').style('top', (event.pageY + 12) + 'px');
      d3.select(this).attr('opacity', 0.9);
    })
    .on('mousemove', function(event) {
      mapTooltip.style('left', (event.pageX + 12) + 'px').style('top', (event.pageY + 12) + 'px');
    })
    .on('mouseout', function() {
      mapTooltip.classed('visible', false);
      d3.select(this).attr('opacity', 1);
    });

  // legend
  const legend = d3.select('#map-legend');
  legend.html('');
  const legendSvg = legend.append('svg').attr('width', 420).attr('height', 40);

  const grad = legendSvg.append('defs').append('linearGradient').attr('id', 'legend-grad');
  grad.attr('x1', '0%').attr('x2', '100%').attr('y1', '0%').attr('y2', '0%');
  grad.append('stop').attr('offset', '0%').attr('stop-color', '#e6f7fb');
  grad.append('stop').attr('offset', '100%').attr('stop-color', '#00d8b3');

  legendSvg.append('rect').attr('x', 10).attr('y', 6).attr('width', 300).attr('height', 12).style('fill', 'url(#legend-grad)');
  legendSvg.append('text').attr('x', 10).attr('y', 34).attr('fill', '#fff').style('font-size', '12px').text('Less');
  legendSvg.append('text').attr('x', 300).attr('y', 34).attr('fill', '#fff').style('font-size', '12px').text('More');

}).catch(err => {
  console.error('Failed to load world geojson', err);
  d3.select('#map-container').append('div').text('Map failed to load.');
});
