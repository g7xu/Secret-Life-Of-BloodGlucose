import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Set up container dimensions and margins
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 960 - margin.left - margin.right;  // Wider visualization
const height = 400 - margin.top - margin.bottom; // Taller visualization

// Append the SVG object to the specific HTML element (.graph-wrapper4)
const svg = d3.select('.graph-wrapper-panel4')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);


// Dummy sample data; later update to use .json data from root
// const data1 = d3.range(100).map(() => Math.random() * 100);
// const data2 = d3.range(100).map(() => Math.random() * 100);

// Generate sample data (will be replaced with JSON data)
function generateData(n, offset) {
  return Array.from({length: n}, (_, i) => ({
    time: i,
    value: Math.exp(-Math.pow(i - offset, 2) / 1000) + Math.random() * 0.1
  }));
}

// Sample data for three distributions
const data1 = generateData(100, 30);
const data2 = generateData(100, 50);
const data3 = generateData(100, 70);

// Set up scales
const x = d3.scaleLinear()
  .domain([0, 100])
  .range([0, width]);

const y = d3.scaleLinear()
  .domain([0, 1])
  .range([height, 0]);

// Area generator
const area = d3.area()
  .x(d => x(d.time))
  .y0(height)
  .y1(d => y(d.value))
  .curve(d3.curveBasis); // Makes the curve smooth

// Add the areas with different colors and transparencies
svg.append("path")
  .datum(data1)
  .attr("fill", "steelblue")
  .attr("fill-opacity", 0.3)
  .attr("d", area);

svg.append("path")
  .datum(data2)
  .attr("fill", "tomato")
  .attr("fill-opacity", 0.3)
  .attr("d", area);

svg.append("path")
  .datum(data3)
  .attr("fill", "green")
  .attr("fill-opacity", 0.3)
  .attr("d", area);

// Add the x-axis
svg.append("g")
  .attr("transform", `translate(0,${height})`)
  .call(d3.axisBottom(x)
    .ticks(12) // this may be too many ticks
    .tickFormat(d => {
      const hour = d % 24;
      return `${hour}:00`;
    }));

svg.append("g")
  .call(d3.axisLeft(y));

// Function to update with real data
function updateChart(jsonData) {
  // This function will be called when JSON data is loaded
  // It will update the visualization with real data
  const distributions = jsonData.distributions;
  
  // Update scales based on actual data
  x.domain([0, d3.max(distributions[0], d => d.time)]);
  y.domain([0, d3.max(distributions.flat(), d => d.value)]);

  // Update each distribution
  svg.selectAll("path")
    .data(distributions)
    .transition()
    .duration(1000)
    .attr("d", area);
}

// Later, fetch and update with real data:
// fetch('path/to/your/data.json')
//   .then(response => response.json())
//   .then(data => updateChart(data));