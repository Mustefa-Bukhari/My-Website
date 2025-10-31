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

  // Set explicit dimensions
  const width = 1000;
  const height = 520;

  // Clear and setup container
  const container = d3.select('#map-container');
  container.html('');

  // Create SVG with responsive sizing
  const svg = container.append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('display', 'block')
    .style('background', 'transparent');

  try {
    // Load our GeoJSON
    const world = await d3.json('world_detailed.geojson');
    
    // Use Natural Earth projection for better world map view
    const projection = d3.geoNaturalEarth1()
      .scale(width / 6.5)
      .translate([width / 2, height / 2])
      .rotate([-10, 0]); // Slight rotation to better center the view
    
    const path = d3.geoPath().projection(projection);

    // Color scale for countries with screenings (1-3)
    const colorScale = d3.scaleLinear()
      .domain([1, 3])
      .range(['#aeeaf6', '#00d8b3']);

  // tooltip (reuse pie tooltip if it exists)
  let tooltip = d3.select('.pie-tooltip');
  if (tooltip.empty()) {
    tooltip = d3.select('body').append('div')
      .attr('class','pie-tooltip');
  }

    // Create the base map layer with all countries in light blue
    const countries = svg.append('g')
      .attr('class', 'countries')
      .selectAll('path')
      .data(world.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        // If country has screenings, use the color scale
        const screenings = counts[d.properties.name];
        if (screenings) {
          return colorScale(screenings);
        }
        // Otherwise use very light blue
        return 'rgba(173,216,230,0.05)';
      })
      .attr('stroke', '#062a25')
      .attr('stroke-width', 0.6)
      .attr('vector-effect', 'non-scaling-stroke');

    // Add hover interactions only for countries with screenings
    countries
      .filter(d => counts[d.properties.name])
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d) {
        // Highlight the country
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', d => {
            const base = d3.color(colorScale(counts[d.properties.name]));
            return d3.hsl(base).brighter(0.2);
          });
        
        // Show tooltip
        const count = counts[d.properties.name];
        tooltip
          .html(`<strong>${d.properties.name}</strong><br>${count} screening${count === 1 ? '' : 's'}`)
          .classed('visible', true)
          .style('left', (event.pageX + 12) + 'px')
          .style('top', (event.pageY + 12) + 'px');
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 12) + 'px')
          .style('top', (event.pageY + 12) + 'px');
      })
      .on('mouseout', function(event, d) {
        // Reset the highlight
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', d => colorScale(counts[d.properties.name]));
        
        // Hide tooltip
        tooltip.classed('visible', false);
      });

    // Create the legend
    const legend = d3.select('#map-legend');
    legend.html('');
    
    // Sort countries by number of screenings
    const entries = Object.entries(counts)
      .map(([k,v]) => ({k,v}))
      .sort((a,b) => b.v - a.v);
    
    entries.forEach(entry => {
      const row = legend.append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('gap', '8px')
        .style('margin-bottom', '6px');
        
      // Color swatch
      row.append('span')
        .style('display', 'inline-block')
        .style('width', '14px')
        .style('height', '14px')
        .style('border-radius', '4px')
        .style('background', colorScale(entry.v));
        
      // Country name and count
      row.append('span')
        .text(`${entry.k} — ${entry.v}`)
        .style('color', '#fff');
    });
  } catch (error) {
    console.error('Error creating map:', error);
    // Show error message in map container
    container.html(`
      <div style="color: #fff; text-align: center; padding: 20px;">
        Unable to load map data. Please try refreshing the page.
      </div>
    `);
  }
})();