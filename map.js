// Vector map showing screening locations
(async function(){
  // Exact screening counts
  const counts = {
    'Germany': 3,
    'United Kingdom': 3,
    'United States': 2,
    'Hong Kong': 2,
    'Italy': 1,
    'Iceland': 1,
    'Mexico': 1,
    'Pakistan': 1
  };

  const container = d3.select('#map-container');
  container.html('');
  const width = container.node().clientWidth || 1000;
  const height = container.node().clientHeight || 520;

  const svg = container.append('svg')
    .attr('width','100%')
    .attr('height','100%')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('display','block');

  // Use our local GeoJSON that has exactly the countries we need
  const world = await d3.json('world_detailed.geojson');
  
  const projection = d3.geoNaturalEarth1()
    .fitSize([width, height], world);
  
  const path = d3.geoPath().projection(projection);

  // color scale for countries with screenings
  const max = Math.max(...Object.values(counts));
  const colorScale = d3.scaleLinear()
    .domain([1, max])
    .range(['#aeeaf6','#00d8b3']);

  // tooltip (reuse pie tooltip if it exists)
  let tooltip = d3.select('.pie-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select('body').append('div')
      .attr('class','pie-tooltip');
  }

  // First draw ALL countries in light blue (5% opacity)
  svg.append('g').selectAll('path')
    .data(world.features)
    .enter().append('path')
    .attr('d', path)
    .attr('fill', 'rgba(173,216,230,0.05)') // 5% light blue for ALL countries
    .attr('stroke', '#062a25')
    .attr('stroke-width', 0.6)
    .attr('pointer-events', 'none');

  // Then draw colored overlays just for countries with screenings
  svg.append('g').selectAll('path')
    .data(world.features.filter(d => counts[d.properties.name]))
    .enter().append('path')
    .attr('d', path)
    .attr('fill', d => colorScale(counts[d.properties.name]))
    .attr('fill-opacity', 0.9)
    .attr('stroke', '#062a25')
    .attr('stroke-width', 0.6)
    .on('mouseover', function(event,d) {
      const count = counts[d.properties.name];
      tooltip.html(`<strong>${d.properties.name}</strong><br>${count} screening${count===1?'':'s'}`)
        .classed('visible', true)
        .style('left', (event.pageX + 12) + 'px')
        .style('top', (event.pageY + 12) + 'px');
    })
    .on('mousemove', function(event) {
      tooltip.style('left', (event.pageX + 12) + 'px')
        .style('top', (event.pageY + 12) + 'px');
    })
    .on('mouseout', function() {
      tooltip.classed('visible', false);
    });

  // legend
  const legend = d3.select('#map-legend');
  legend.html('');
  const entries = Object.entries(counts)
    .map(([k,v]) => ({k,v}))
    .sort((a,b) => b.v - a.v);
  
  entries.forEach(entry => {
    const row = legend.append('div')
      .style('display','flex')
      .style('align-items','center')
      .style('gap','8px')
      .style('margin-bottom','6px');
    row.append('span')
      .style('display','inline-block')
      .style('width','14px')
      .style('height','14px')
      .style('border-radius','4px')
      .style('background', colorScale(entry.v));
    row.append('span')
      .text(`${entry.k} — ${entry.v}`)
      .style('color','#fff');
  });

})();