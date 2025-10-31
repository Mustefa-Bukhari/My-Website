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
  .attr('transform', `translate(${width / 2},${height / 2})`);

const pie = d3.pie()
  .value(d => d.value)
  .sort(null);

const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius - 10);

const arcHover = d3.arc()
  .innerRadius(0)
  .outerRadius(radius + 6);

svg.selectAll('path')
  .data(pie(pieData))
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', d => d.data.color)
  /* remove white outlines as requested */
  .attr('stroke', 'none')
  .attr('stroke-width', 0)
  .style('cursor', 'pointer')
  .on('mouseover', function(event, d) {
    // hue shift and expand slice
    try {
      const base = d3.hsl(d.data.color);
      const shifted = d3.hsl((base.h + 25) % 360, Math.min(1, base.s * 1.05), Math.max(0.2, base.l * 0.95));
      d3.select(this).transition().duration(200).attr('d', arcHover).attr('fill', shifted.toString());
    } catch (e) {
      d3.select(this).transition().duration(200).attr('d', arcHover);
    }
    // show a tooltip near the mouse with percentage + label
    tooltip.html(`<strong>${d.data.value}%</strong> — ${d.data.label}`);
    tooltip.classed('visible', true);
    // update position immediately
    const [mx, my] = [event.pageX, event.pageY];
    tooltip.style('left', (mx + 12) + 'px').style('top', (my + 12) + 'px');
  })
  .on('mousemove', function(event, d) {
    // keep tooltip near mouse
    const [mx, my] = [event.pageX, event.pageY];
    tooltip.style('left', (mx + 12) + 'px').style('top', (my + 12) + 'px');
  })
  .on('mouseout', function(event, d) {
    // revert and hide tooltip
    d3.select(this).transition().duration(200).attr('d', arc).attr('fill', d.data.color);
    tooltip.classed('visible', false);
  });

// Add legend
const legend = d3.select('.rounded-box')
  .append('div')
  .attr('class', 'pie-legend')
  .style('margin-top', '16px');

pieData.forEach(d => {
  const item = legend.append('div')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('margin-bottom', '6px')
    .style('color', '#fff')
    .style('font-weight', '600');
  item.append('span')
    .style('display', 'inline-block')
    .style('width', '18px')
    .style('height', '18px')
    .style('background', d.color)
    .style('border-radius', '4px')
    .style('margin-right', '10px');
  item.append('span').text(d.label + ' — ' + d.value + '%');
});

// Add center text group (empty by default)
// create tooltip element appended to body; will be positioned on mousemove
const tooltip = d3.select('body').append('div').attr('class', 'pie-tooltip');

})();
