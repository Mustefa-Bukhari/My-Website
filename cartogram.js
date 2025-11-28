// Grid Cartogram showing screening locations by country
(function() {
  const locationData = {
    'Germany': {
      flag: '🇩🇪',
      locations: [
        { abbr: 'BE', full: 'Berlin' },
        { abbr: 'BE', full: 'Berlin' },
        { abbr: 'BE', full: 'Berlin' }
      ]
    },
    'United Kingdom': {
      flag: '🇬🇧',
      locations: [
        { abbr: 'LDN', full: 'London' },
        { abbr: 'LDN', full: 'London' },
        { abbr: 'LDN', full: 'London' }
      ]
    },
    'Hong Kong': {
      flag: '🇭🇰',
      locations: [
        { abbr: 'JCCAC', full: 'JCCAC Blok Party' },
        { abbr: 'CLK', full: 'Clockenflap' },
        { abbr: 'RRS', full: 'Runshaw Creative Media Centre' }
      ]
    },
    'United States': {
      flag: '🇺🇸',
      locations: [
        { abbr: 'DEN', full: 'Denver' },
        { abbr: 'NYC', full: 'New York' }
      ]
    },
    'Italy': {
      flag: '🇮🇹',
      locations: [
        { abbr: 'ROM', full: 'Rome' }
      ]
    },
    'Iceland': {
      flag: '🇮🇸',
      locations: [
        { abbr: 'HVE', full: 'Hveragerði' }
      ]
    },
    'Mexico': {
      flag: '🇲🇽',
      locations: [
        { abbr: 'PUE', full: 'Puebla' }
      ]
    },
    'Pakistan': {
      flag: '🇵🇰',
      locations: [
        { abbr: 'LHR', full: 'Lahore' }
      ]
    }
  };

  const container = document.getElementById('cartogram-container');
  if (!container) return;

  // Create tooltip
  let tooltip = document.querySelector('.cartogram-tooltip');
  if (!tooltip) {
    tooltip = document.createElement('div');
    tooltip.className = 'cartogram-tooltip';
    tooltip.style.cssText = `
      position: absolute;
      background: #333;
      color: #fff;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 14px;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.2s;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(tooltip);
  }

  // Sort countries by number of locations (descending)
  const sortedCountries = Object.entries(locationData)
    .sort((a, b) => b[1].locations.length - a[1].locations.length);

  // Create country groups
  sortedCountries.forEach(([country, data]) => {
    const group = document.createElement('div');
    group.className = 'country-group';

    // Flag circle
    const flagCircle = document.createElement('div');
    flagCircle.className = 'flag-circle';
    flagCircle.textContent = data.flag;
    flagCircle.style.cursor = 'pointer';
    
    // Flag tooltip handlers
    flagCircle.addEventListener('mouseenter', (e) => {
      tooltip.textContent = country;
      tooltip.style.opacity = '1';
    });

    flagCircle.addEventListener('mousemove', (e) => {
      tooltip.style.left = (e.pageX + 12) + 'px';
      tooltip.style.top = (e.pageY - 28) + 'px';
    });

    flagCircle.addEventListener('mouseleave', () => {
      tooltip.style.opacity = '0';
    });
    
    group.appendChild(flagCircle);

    // Location circles container
    const locationsContainer = document.createElement('div');
    locationsContainer.className = 'location-circles';

    // Create a circle for each location
    data.locations.forEach(location => {
      const circle = document.createElement('div');
      circle.className = 'location-circle';
      circle.textContent = location.abbr;

      // Tooltip handlers
      circle.addEventListener('mouseenter', (e) => {
        tooltip.textContent = location.full;
        tooltip.style.opacity = '1';
      });

      circle.addEventListener('mousemove', (e) => {
        tooltip.style.left = (e.pageX + 12) + 'px';
        tooltip.style.top = (e.pageY - 28) + 'px';
      });

      circle.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
      });

      locationsContainer.appendChild(circle);
    });

    group.appendChild(locationsContainer);
    container.appendChild(group);
  });
})();
