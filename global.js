import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';





// <div class="col-6 d-flex flex-column"> // where i need to place graph in html
// <h2> // where to place the graph 
// < p class="step-description"> // where to place 




// D3 boilerplate for a line graph (200 x 200)
// This code appends an SVG to the first element that matches the selector.
// Update the selector if you need to target a more specific element.



const svgWidth = 720;
const svgHeight = 200;


const container = d3.select('.col-6.d-flex.flex-column .graph-wrapper');
// container.html(''); // Remove existing text

const svg = container.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);





// Sample data for the line graph
const data = [
  { x: 0, y: 50 },
  { x: 50, y: 80 },
  { x: 100, y: 20 },
  { x: 150, y: 100 },
  { x: 200, y: 50 }
];

// Set up the scales based on data
const xScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.x)])
  .range([0, svgWidth]);

const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.y)])
  .range([svgHeight, 0]);

// Define the line generator
const line = d3.line()
  .x(d => xScale(d.x))
  .y(d => yScale(d.y));

// Append the path for the line graph
svg.append('path')
  .datum(data)
  .attr('d', line)
  .attr('fill', 'none')
  .attr('stroke', 'steelblue')
  .attr('stroke-width', 2);


