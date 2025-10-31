// d3pie.js - Pie chart using D3.js

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
  .append('g')
  .attr('transform', `translate(${width / 2},${height / 2})`);

const pie = d3.pie()
  .value(d => d.value)
  .sort(null);

const arc = d3.arc()
  .innerRadius(0)
  .outerRadius(radius - 10);

svg.selectAll('path')
  .data(pie(pieData))
  .enter()
  .append('path')
  .attr('d', arc)
  .attr('fill', d => d.data.color)
  .attr('stroke', '#fff')
  .attr('stroke-width', 2);

// Add legend
const legend = d3.select('.rounded-box')
  .append('div')
  .attr('class', 'pie-legend')
  .style('margin-top', '16px');

pieData.forEach(d => {
  legend.append('div')
    .style('display', 'flex')
    .style('align-items', 'center')
    .style('margin-bottom', '4px')
    .html(`<span style='display:inline-block;width:16px;height:16px;background:${d.color};border-radius:3px;margin-right:8px;'></span>${d.label}`);
});
