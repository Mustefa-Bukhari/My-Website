// chart.js - Pie chart implementation for areas worked in

const ctx = document.getElementById('workPieChart').getContext('2d');
new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Motion Graphics', 'Animation', 'Editing', 'Directing', 'Sound Design', 'Visual Effects'],
    datasets: [{
      data: [30, 25, 10, 10, 5, 20],
      backgroundColor: ['#007bff', '#1de9b6', '#ffcc00', '#ff5733', '#c70039', '#900c3f'],
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  }
});