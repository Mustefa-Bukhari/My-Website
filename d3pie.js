// d3pie.js - Pie chart using D3.js

(function(){
// Data for areas worked in
const pieData = [
  {label: 'Motion Graphics', value: 30, color: '#007bff'},
  {label: 'Animation', value: 25, color: '#1de9b6'},
  {label: 'Editing', value: 10, color: '#ffcc00'},
  {label: 'Directing', value: 10, color: '#ff5733'},
  {label: 'Sound Design', value: 5, color: '#c70039'},
  {label: 'Visual Effects', value: 20, color: '#900c3f'}
];

const width = 400, height = 400, radius = Math.min(width, height) / 2;

const svg = d3.select('.rounded-box')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .style('overflow', 'visible')
  .append('g')
  .attr('transform', `translate(${width/2},${height/2})`);

// Setup tooltip
let tooltip = d3.select('.pie-tooltip');
if (tooltip.empty()) {
  tooltip = d3.select('body').append('div')
    .attr('class', 'pie-tooltip')
    .style('position', 'absolute')
    .style('background', '#333')
    .style('color', '#fff')
    .style('padding', '8px 12px')
    .style('border-radius', '4px')
    .style('font-size', '14px')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .style('box-shadow', '0 2px 4px rgba(0,0,0,0.1)')
    .style('z-index', 1000);
}

const pie = d3.pie()
  .value(d => d.value)
  .sort(null);

const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius - 10);

const arcHover = d3.arc()
  .innerRadius(0)
  .outerRadius(radius + 6);

// Draw pie slices
svg.selectAll('path')
  .data(pie(pieData))
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', d => d.data.color)
  .attr('stroke', 'none')
  .attr('stroke-width', 0)
  .style('cursor', 'pointer')
  .on('mouseover', function(event, d) {
    try {
      const base = d3.hsl(d.data.color);
      const shifted = d3.hsl((base.h + 25) % 360, Math.min(1, base.s * 1.05), Math.max(0.2, base.l * 0.95));
      
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', arcHover)
        .attr('fill', shifted.toString());
        
      tooltip.html(`<strong>${d.data.label}</strong><br>${d.data.value}%`)
        .style('opacity', 1)
        .style('left', (event.pageX + 12) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    } catch (e) {
      console.error('Error in mouseover:', e);
    }
  })
  .on('mousemove', function(event) {
    tooltip
      .style('left', (event.pageX + 12) + 'px')
      .style('top', (event.pageY - 28) + 'px');
  })
  .on('mouseout', function(event, d) {
    d3.select(this)
      .transition()
      .duration(200)
      .attr('d', arc)
      .attr('fill', d.data.color);
      
    tooltip.style('opacity', 0);
  });

// Add percentage labels
svg.selectAll('text')
  .data(pie(pieData))
  .enter()
  .append('text')
  .attr('transform', d => {
    const centroid = arc.centroid(d);
    const x = centroid[0] * 1.4;
    const y = centroid[1] * 1.4;
    return `translate(${x},${y})`;
  })
  .attr('text-anchor', 'middle')
  .attr('dy', '.35em')
  .style('font-size', '12px')
  .style('fill', '#fff')
  .text(d => `${d.data.value}%`);

// Add legend
const legendSpacing = 20;
const legendRectSize = 14;

const legend = d3.select('.rounded-box')
  .append('div')
  .style('margin-top', '20px')
  .style('display', 'flex')
  .style('flex-wrap', 'wrap')
  .style('justify-content', 'center')
  .style('gap', '20px');

pieData.forEach(data => {
  const legendItem = legend.append('div')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('gap', '8px');

  legendItem.append('span')
    .style('width', `${legendRectSize}px`)
    .style('height', `${legendRectSize}px`)
    .style('background-color', data.color)
    .style('border-radius', '4px')
    .style('display', 'inline-block');

  legendItem.append('span')
    .style('color', '#fff')
    .style('font-size', '14px')
    .text(`${data.label} (${data.value}%)`);
});

})();