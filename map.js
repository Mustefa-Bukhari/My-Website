// Vector map showing screening locations
(async function(){
  // Exact screening counts
  const counts = {
    'Germany': 3,
    'United Kingdom': 3,
    'Hong Kong': 3,
    'United States': 2,
    'Italy': 1,
    'Iceland': 1,
    'Mexico': 1,
    'Pakistan': 1
  };

  // Normalize country names
  const aliases = {
    'United States': ['United States', 'United States of America', 'USA', 'US', 'United States of America'],
    'United Kingdom': ['United Kingdom', 'Great Britain', 'England', 'UK', 'Britain'],
    'Hong Kong': ['Hong Kong', 'Hong Kong S.A.R.', 'Hong Kong SAR', 'China'],
    'Germany': ['Germany', 'Federal Republic of Germany', 'Deutschland'],
    'Italy': ['Italy', 'Italia', 'Italian Republic'],
    'Iceland': ['Iceland', 'Republic of Iceland'],
    'Mexico': ['Mexico', 'United Mexican States', 'México'],
    'Pakistan': ['Pakistan', 'Islamic Republic of Pakistan']
  };

  function findName(propName) {
    if (!propName) return null;
    propName = propName.trim();
    
    // direct match first
    if (counts[propName]) return propName;
    
    // check aliases
    for (const [country, altNames] of Object.entries(aliases)) {
      if (altNames.some(name => name.toLowerCase() === propName.toLowerCase())) {
        return country;
      }
    }
    
    // Don't map China to Hong Kong - they are separate
    return null;
  }

  // Set dimensions with space for legend
  const containerWidth = 1200;
  const containerHeight = 600;
  const margin = { top: 10, right: 10, bottom: 10, left: 200 };
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  // Clear and setup container
  const container = d3.select('#map-container');
  container.html('');

  // Create SVG with responsive sizing
  const svg = container.append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .style('display', 'block');

  try {
    // Load GeoJSON data from remote source (more accurate)
    console.log('Loading world map data...');
    const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
    if (!response.ok) {
      throw new Error('Failed to load map data');
    }
    const world = await response.json();
    
    console.log('Features loaded:', world.features.length);
    
    // Filter out Antarctica and focus on main continents
    world.features = world.features.filter(d => 
      d.properties.name !== 'Antarctica' && 
      d.properties.name !== 'Fr. S. Antarctic Lands'
    );
    
    console.log('Features after filtering:', world.features.length);
    
    // Create main group for map with margin
    const mapGroup = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Setup projection with better aspect ratio (less squishing)
    const projection = d3.geoNaturalEarth1()
      .fitSize([width, height], world)
      .translate([width / 2, height / 2]);
    
    const path = d3.geoPath().projection(projection);

    // Color scale for screenings (1-3)
    const colorScale = d3.scaleLinear()
      .domain([1, 3])
      .range(['#aeeaf6', '#00d8b3']);

    // Setup tooltip
    let tooltip = d3.select('.map-tooltip');
    if (tooltip.empty()) {
      tooltip = d3.select('body').append('div')
        .attr('class', 'map-tooltip')
        .style('position', 'absolute')
        .style('background', '#333')
        .style('color', '#fff')
        .style('padding', '8px 12px')
        .style('border-radius', '4px')
        .style('font-size', '14px')
        .style('pointer-events', 'none')
        .style('opacity', 0)
        .style('box-shadow', '0 2px 4px rgba(0,0,0,0.2)')
        .style('z-index', 1000);
    }

    // Draw single layer with all countries
    mapGroup.append('g')
      .selectAll('path')
      .data(world.features)
      .enter()
      .append('path')
      .attr('d', path)
      .attr('fill', d => {
        const name = findName(d.properties.name);
        return name ? colorScale(counts[name]) : 'rgba(173,216,230,0.2)';
      })
      .attr('stroke', '#1a3a52')
      .attr('stroke-width', 0.5)
      .style('cursor', d => findName(d.properties.name) ? 'pointer' : 'default')
      .style('transform-box', 'fill-box')
      .each(function(d) {
        // Set transform origin on initialization to prevent jump
        const centroid = path.centroid(d);
        d3.select(this).style('transform-origin', `${centroid[0]}px ${centroid[1]}px`);
      })
      .on('mouseover', function(event, d) {
        const name = findName(d.properties.name);
        if (!name) return;
        
        const count = counts[name];
        tooltip.html(`<strong>${name}</strong><br>${count} screening${count === 1 ? '' : 's'}`)
          .style('opacity', 1)
          .style('left', (event.pageX + 12) + 'px')
          .style('top', (event.pageY - 28) + 'px');
        
        d3.select(this)
          .classed('country-hovered', true)
          .transition()
          .duration(200)
          .style('transform', 'scale(1.05)')
          .attr('fill', () => {
            const base = d3.color(colorScale(count));
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
          .classed('country-hovered', false)
          .transition()
          .duration(200)
          .style('transform', 'scale(1)')
          .attr('fill', colorScale(counts[name]));
      });

    // Draw point for Hong Kong
    const hkCoords = [114.1095, 22.3964];
    
    mapGroup.append('circle')
      .attr('cx', projection(hkCoords)[0])
      .attr('cy', projection(hkCoords)[1])
      .attr('r', 6)
      .attr('fill', colorScale(counts['Hong Kong']))
      .attr('stroke', '#062a25')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event) {
        tooltip.html(`<strong>Hong Kong</strong><br>${counts['Hong Kong']} screenings`)
          .style('opacity', 1)
          .style('left', (event.pageX + 12) + 'px')
          .style('top', (event.pageY - 28) + 'px');
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 9)
          .attr('fill', () => {
            const base = d3.color(colorScale(counts['Hong Kong']));
            return d3.hsl(base).brighter(0.2);
          });
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', (event.pageX + 12) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        tooltip.style('opacity', 0);
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', 6)
          .attr('fill', colorScale(counts['Hong Kong']));
      });

    // Create vertical legend on the left
    const legendGroup = svg.append('g')
      .attr('transform', `translate(20,${margin.top})`);
    
    const entries = Object.entries(counts)
      .map(([k,v]) => ({k,v}))
      .sort((a,b) => b.v - a.v);
    
    const legendSpacing = 30;
    
    entries.forEach((entry, i) => {
      const group = legendGroup.append('g')
        .attr('transform', `translate(0, ${i * legendSpacing})`);
      
      group.append('rect')
        .attr('width', 16)
        .attr('height', 16)
        .attr('rx', 4)
        .attr('fill', colorScale(entry.v));
      
      group.append('text')
        .attr('x', 24)
        .attr('y', 12)
        .style('fill', '#fff')
        .style('font-size', '12px')
        .text(`${entry.k} — ${entry.v}`);
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