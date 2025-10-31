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

  // Normalize country names
  const aliases = {
    'United States': ['United States', 'United States of America', 'USA', 'US'],
    'United Kingdom': ['United Kingdom', 'Great Britain', 'England', 'UK'],
    'Hong Kong': ['Hong Kong', 'Hong Kong S.A.R.', 'Hong Kong SAR'],
    'Germany': ['Germany', 'Federal Republic of Germany', 'Deutschland'],
    'Italy': ['Italy', 'Italia', 'Italian Republic'],
    'Iceland': ['Iceland', 'Republic of Iceland'],
    'Mexico': ['Mexico', 'United Mexican States', 'México'],
    'Pakistan': ['Pakistan', 'Islamic Republic of Pakistan']
  };

  function findName(propName) {
    if (!propName) return null;
    propName = propName.trim();
    
    // direct match
    if (counts[propName]) return propName;
    
    // check aliases
    for (const [country, altNames] of Object.entries(aliases)) {
      if (altNames.some(name => name.toLowerCase() === propName.toLowerCase())) {
        return country;
      }
    }
    return null;
  }

  // Set dimensions
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
    // Load GeoJSON data
    const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const world = await response.json();
    
    // Debug: Log features count
    console.log('Features loaded:', world.features.length);

    // Setup projection fitted to container
    const projection = d3.geoMercator()
      .scale(140)
      .center([0, 20])
      .translate([width / 2, height / 2]);
    
    const path = d3.geoPath().projection(projection);

    // Color scale for screenings (1-3)
    const colorScale = d3.scaleLinear()
      .domain([1, 3])
      .range(['#aeeaf6', '#00d8b3']);

    // Setup tooltip
    let tooltip = d3.select('.pie-tooltip');
    if (tooltip.empty()) {
      tooltip = d3.select('body').append('div')
        .attr('class', 'pie-tooltip')
        .style('position', 'absolute')
        .style('background', '#fff')
        .style('padding', '5px')
        .style('border-radius', '5px')
        .style('pointer-events', 'none')
        .style('opacity', 0);
    }

    // Draw base layer with all countries in light blue
    svg.append('g')
      .selectAll('path')
      .data(world.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', 'rgba(173,216,230,0.2)')
      .attr('stroke', '#062a25')
      .attr('stroke-width', 0.6);

    // Draw overlay with colored countries
    svg.append('g')
      .selectAll('path')
      .data(world.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        const name = findName(d.properties.name);
        return name ? colorScale(counts[name]) : 'transparent';
      })
      .attr('stroke', '#062a25')
      .attr('stroke-width', 0.6)
      .style('cursor', d => findName(d.properties.name) ? 'pointer' : 'default')
      .on('mouseover', function(event, d) {
        const name = findName(d.properties.name);
        if (!name) return;
        
        const count = counts[name];
        tooltip.html(`<strong>${d.properties.name}</strong><br>${count} screening${count === 1 ? '' : 's'}`)
          .style('opacity', 1)
          .style('left', (event.pageX + 12) + 'px')
          .style('top', (event.pageY - 28) + 'px');
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', d => {
            const base = d3.color(colorScale(counts[name]));
            return d3.hsl(base).brighter(0.2);
          });
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 12) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function(event, d) {
        const name = findName(d.properties.name);
        if (!name) return;
        
        tooltip.style('opacity', 0);
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('fill', colorScale(counts[name]));
      });

    // Create legend
    const legend = d3.select('#map-legend');
    legend.html('');
    
    const entries = Object.entries(counts)
      .map(([k,v]) => ({k,v}))
      .sort((a,b) => b.v - a.v);
    
    entries.forEach(entry => {
      const row = legend.append('div')
        .style('display', 'flex')
        .style('align-items', 'center')
        .style('gap', '8px')
        .style('margin-bottom', '6px');
        
      row.append('span')
        .style('display', 'inline-block')
        .style('width', '14px')
        .style('height', '14px')
        .style('border-radius', '4px')
        .style('background', colorScale(entry.v));
        
      row.append('span')
        .text(`${entry.k} — ${entry.v}`)
        .style('color', '#fff');
    });

  } catch (error) {
    console.error('Error creating map:', error);
    container.html(`
      <div style="color: #fff; text-align: center; padding: 20px;">
        Unable to load map data. Please try refreshing the page.
        <br>Error: ${error.message}
      </div>
    `);
  }
})();