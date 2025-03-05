import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const svgWidth = 720;
const svgHeight = 200;
const margin = { top: 20, right: 50, bottom: 30, left: 50 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

const container = d3.select('.col-6.d-flex.flex-column .graph-wrapper');
// container.html(''); // Remove existing text if needed

const svg = container.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

const g = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Sample data for the line graph
// const non_dia = [
//   { x: 0, y: 50 },
//   { x: 50, y: 80 },
//   { x: 100, y: 20 },
//   { x: 150, y: 100 },
//   { x: 200, y: 50 }
// ];



// const pre_dia = [
//     { x: 0, y: 50 },
//     { x: 50, y: 80 },
//     { x: 30, y: 100 },
//     { x: 40, y: 100 },
//     { x: 200, y: 50 }
// ];

// const dia = [
//     { x: 0, y: 69 },
//     { x: 50, y: 69 },
//     { x: 100, y: 69 },
//     { x: 69, y: 69 },
//     { x: 200, y: 50 }
// ];

const data = d3.csv('non_patient_1.csv')
const pre = d3.csv('pre_dia_patient_8.csv')
const dia = d3.csv('dia_patient_3.csv')


// Combine all datasets to determine unified scales
const allValues = data.concat(pre, dia);
const maxX = d3.max(allValues, d => d.x);
const maxY = d3.max(allValues, d => d.y);


// Set up the scales based on inner width and height
const xScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.x)])
  .range([0, width]);

const yScale = d3.scaleLinear()
  .domain([0, d3.max(data, d => d.y)])
  .range([height, 0]);

// Append the x-axis at the bottom of the graph
g.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height})`)
  .call(d3.axisBottom(xScale));

// Append the y-axis at the left of the graph
g.append("g")
  .attr("class", "y-axis")
  .call(d3.axisLeft(yScale));

// Define the line generator
const line = d3.line()
  .x(d => xScale(d.x))
  .y(d => yScale(d.y));


const datasets = [
    { name: "Data", values: data, color: "steelblue" },
    { name: "Pre", values: pre, color: "orange" },
    { name: "Dia", values: dia, color: "green" }
];
// Append the path for the line graph
// g.append('path')
//   .datum(dia)
//   .attr('d', line)
//   .attr('fill', 'none')
//   .attr('stroke', 'steelblue')
//   .attr('stroke-width', 2);

// Append circles for each data point
datasets.forEach(ds => {
    // Append the line path
    g.append('path')
      .datum(ds.values)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', ds.color)
      .attr('stroke-width', 2);
      
    // Append circles for each data point
    g.selectAll(`.dot-${ds.name}`)
      .data(ds.values)
      .enter()
      .append('circle')
      .attr('class', `dot dot-${ds.name}`)
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 4)
      .attr('fill', ds.color)
      .on('mouseover', (event, d) => {
        tooltip.transition()
          .duration(200)
          .style('opacity', 0.9);
        tooltip.html(`x: ${d.x}<br>y: ${d.y}`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 20) + 'px');
      })
      .on('mousemove', (event, d) => {
        tooltip.style('left', (event.pageX + 10) + 'px')
               .style('top', (event.pageY - 20) + 'px');
      })
      .on('mouseout', (event, d) => {
        tooltip.transition()
          .duration(500)
          .style('opacity', 0);
      });
});

// Create a tooltip div that is hidden by default
const tooltip = d3.select('body').append('div')
  .attr('class', 'tooltip')
  .style('position', 'absolute')
  .style('background', '#fff')
  .style('padding', '5px')
  .style('border', '1px solid #ccc')
  .style('border-radius', '4px')
  .style('pointer-events', 'none')
  .style('opacity', 0);

// Create a simple legend in the top-right corner of the SVG
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(${svgWidth - margin.right - 60}, ${margin.top - 10})`);

datasets.forEach((ds, i) => {
  const legendRow = legend.append("g")
    .attr("transform", `translate(0, ${i * 25})`);
    
  legendRow.append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", ds.color)
    .attr("opacity", 0.7);
    
  legendRow.append("text")
    .attr("x", 25)
    .attr("y", 15)
    .text(ds.name);
});