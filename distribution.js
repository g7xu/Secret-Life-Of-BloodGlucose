import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Data structure to hold our statistics
const metrics = {
  'glucose-excursion': {
    label: 'Glucose Excursion',
    diabetic: { mean: 96.09, std: 46.62 },
    prediabetic: { mean: 47.99, std: 31.13 },
    nondiabetic: { mean: 36.57, std: 30.28 }
  },
  'excursion-time': {
    label: 'Glucose Excursion Time',
    diabetic: { mean: 146.90, std: 38.48 },
    prediabetic: { mean: 130.27, std: 47.85 },
    nondiabetic: { mean: 118.06, std: 48.91 }
  },
  'recovery-time': {
    label: 'Glucose Recovery Time',
    diabetic: { mean: 131.78, std: 67.78 },
    prediabetic: { mean: 145.73, std: 57.99 },
    nondiabetic: { mean: 135.49, std: 58.98 }
  }
};

// Function to calculate normal distribution points
function normalDistribution(mean, std, x) {
  return (1 / (std * Math.sqrt(2 * Math.PI))) * 
         Math.exp(-0.5 * Math.pow((x - mean) / std, 2));
}

// Function to generate points for the distribution curve
function generateDistributionPoints(mean, std) {
  const points = [];
  const range = std * 4;
  const step = range / 100;
  
  for (let x = mean - range; x <= mean + range; x += step) {
    points.push({
      x: x,
      y: normalDistribution(mean, std, x)
    });
  }
  
  return points;
}

// Set up the visualization
function setupDistributionPlot() {
  const container = d3.select('#distribution-plot');
  const width = container.node().clientWidth;
  const height = container.node().clientHeight || 400;
  const margin = { top: 20, right: 30, bottom: 40, left: 50 };
  
  // Clear any existing SVG
  container.selectAll('svg').remove();
  
  // Create new SVG
  const svg = container.append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);
    
  return {
    svg,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom
  };
}

// Update the visualization
function updateVisualization() {
  const { svg, width, height } = setupDistributionPlot();
  const selectedMetric = d3.select('#metric-select').property('value');
  const metricData = metrics[selectedMetric];
  
  // Get active groups
  const activeGroups = {
    diabetic: d3.select('#diabetic-toggle').property('checked'),
    prediabetic: d3.select('#prediabetic-toggle').property('checked'),
    nondiabetic: d3.select('#nondiabetic-toggle').property('checked')
  };
  
  // Generate points for each active group
  const allPoints = [];
  Object.entries(activeGroups).forEach(([group, isActive]) => {
    if (isActive && metricData[group]) {
      const points = generateDistributionPoints(
        metricData[group].mean,
        metricData[group].std
      );
      allPoints.push(...points.map(p => ({ ...p, group })));
    }
  });
  
  // Set up scales
  const xScale = d3.scaleLinear()
    .domain([
      d3.min(allPoints, d => d.x),
      d3.max(allPoints, d => d.x)
    ])
    .range([0, width]);
    
  const yScale = d3.scaleLinear()
    .domain([0, d3.max(allPoints, d => d.y)])
    .range([height, 0]);
    
  // Add axes
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(xScale));
    
  svg.append('g')
    .call(d3.axisLeft(yScale));
    
  // Add X axis label
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + 35)
    .style('text-anchor', 'middle')
    .text(metricData.label);
    
  // Add Y axis label
  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height / 2)
    .attr('y', -40)
    .style('text-anchor', 'middle')
    .text('Probability Density');
  
  // Create line generator
  const line = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveBasis);
  
  // Draw distribution curves for each group
  Object.entries(activeGroups).forEach(([group, isActive]) => {
    if (isActive && metricData[group]) {
      const points = generateDistributionPoints(
        metricData[group].mean,
        metricData[group].std
      );
      
      svg.append('path')
        .datum(points)
        .attr('class', `distribution-path ${group}`)
        .attr('d', line);
    }
  });
  
  // Add legend
  const legend = svg.append('g')
    .attr('class', 'legend')
    .attr('transform', `translate(${width - 150}, 20)`);
    
  const legendData = Object.entries(activeGroups)
    .filter(([_, isActive]) => isActive)
    .map(([group]) => group);
    
  const legendItems = legend.selectAll('.legend-item')
    .data(legendData)
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', (d, i) => `translate(0, ${i * 20})`);
    
  legendItems.append('rect')
    .attr('width', 15)
    .attr('height', 15)
    .attr('class', d => d)
    .attr('fill-opacity', 0.3);
    
  legendItems.append('text')
    .attr('x', 20)
    .attr('y', 12)
    .text(d => d.charAt(0).toUpperCase() + d.slice(1));
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initial visualization
  updateVisualization();
  
  // Add event listeners for controls
  d3.select('#metric-select').on('change', updateVisualization);
  d3.selectAll('#panel-4 input[type="checkbox"]').on('change', updateVisualization);
  
  // Add window resize listener
  window.addEventListener('resize', updateVisualization);
}); 