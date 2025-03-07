import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const svgWidth = 720;
const svgHeight = 400; // Increased height for better visibility
const margin = { top: 40, right: 50, bottom: 50, left: 60 }; // Adjusted margins
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

// State management
let activeParticipants = new Set();
let timeRange = 'all';
let data, processedData, xScale, yScale;

const container = d3.select('.col-6.d-flex.flex-column .graph-wrapper');
// container.html(''); // Remove existing text if needed

const svg = container.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

const g = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);




// const data = d3.csv('non_patient_1.csv').then(data => {

//   console.log(data);
//             // You can now use the filteredData variable to work with the subset of data
//   }).catch(error => {
//     console.error('Error loading the CSV file:', error);
//   // Filter the data to include only the first 100 rows
//   const trunData = data.slice(0, 100);
  
       
// });
// const pre = d3.csv('pre_dia_patient_8.csv').then(data => {
//   console.log(pre);
//             // You can now use the filteredData variable to work with the subset of data
//   }).catch(error => {
//     console.error('Error loading the CSV file:', error);


//   // Filter the data to include only the first 100 rows
//   const trunPre = data.slice(0, 100);
// });
// const dia = d3.csv('dia_patient_3.csv').then(data => {

//   console.log(dia);
//             // You can now use the filteredData variable to work with the subset of data
//   }).catch(error => {
//     console.error('Error loading the CSV file:', error);
//   // Filter the data to include only the first 100 rows
//   const trunDia = data.slice(0, 100);
// });


// // Combine all datasets to determine unified scales
// const allValues = trunData.concat(trunPre, trunDia);
// const maxX = d3.max(allValues, d => d.x);
// const maxY = d3.max(allValues, d => d.y);


// // Set up the scales based on inner width and height
// const xScale = d3.scaleLinear()
//   .domain([0, d3.max(data, d => d.x)])
//   .range([0, width]);

// const yScale = d3.scaleLinear()
//   .domain([0, d3.max(data, d => d.y)])
//   .range([height, 0]);

// // Append the x-axis at the bottom of the graph
// g.append("g")
//   .attr("class", "x-axis")
//   .attr("transform", `translate(0, ${height})`)
//   .call(d3.axisBottom(xScale));

// // Append the y-axis at the left of the graph
// g.append("g")
//   .attr("class", "y-axis")
//   .call(d3.axisLeft(yScale));

// // Define the line generator
// const line = d3.line()
//   .x(d => xScale(d.x))
//   .y(d => yScale(d.y));


// const datasets = [
//     { name: "Data", values: trunData, color: "steelblue" },
//     { name: "Pre", values: trunPie, color: "orange" },
//     { name: "Dia", values: trunDia, color: "green" }
// ];
// // Append the path for the line graph
// // g.append('path')
// //   .datum(dia)
// //   .attr('d', line)
// //   .attr('fill', 'none')
// //   .attr('stroke', 'steelblue')
// //   .attr('stroke-width', 2);

// // Append circles for each data point
// datasets.forEach(ds => {
//     // Append the line path
//     g.append('path')
//       .datum(ds.values)
//       .attr('d', line)
//       .attr('fill', 'none')
//       .attr('stroke', ds.color)
//       .attr('stroke-width', 2);
      
//     // Append circles for each data point
//     g.selectAll(`.dot-${ds.name}`)
//       .data(ds.values)
//       .enter()
//       .append('circle')
//       .attr('class', `dot dot-${ds.name}`)
//       .attr('cx', d => xScale(d.x))
//       .attr('cy', d => yScale(d.y))
//       .attr('r', 4)
//       .attr('fill', ds.color)
//       .on('mouseover', (event, d) => {
//         tooltip.transition()
//           .duration(200)
//           .style('opacity', 0.9);
//         tooltip.html(`x: ${d.x}<br>y: ${d.y}`)
//           .style('left', (event.pageX + 10) + 'px')
//           .style('top', (event.pageY - 20) + 'px');
//       })
//       .on('mousemove', (event, d) => {
//         tooltip.style('left', (event.pageX + 10) + 'px')
//                .style('top', (event.pageY - 20) + 'px');
//       })
//       .on('mouseout', (event, d) => {
//         tooltip.transition()
//           .duration(500)
//           .style('opacity', 0);
//       });
// });

// // Create a tooltip div that is hidden by default
// const tooltip = d3.select('body').append('div')
//   .attr('class', 'tooltip')
//   .style('position', 'absolute')
//   .style('background', '#fff')
//   .style('padding', '5px')
//   .style('border', '1px solid #ccc')
//   .style('border-radius', '4px')
//   .style('pointer-events', 'none')
//   .style('opacity', 0);

// // Create a simple legend in the top-right corner of the SVG
// const legend = svg.append("g")
//     .attr("class", "legend")
//     .attr("transform", `translate(${svgWidth - margin.right - 60}, ${margin.top - 10})`);

// datasets.forEach((ds, i) => {
//   const legendRow = legend.append("g")
//     .attr("transform", `translate(0, ${i * 25})`);
    
//   legendRow.append("rect")
//     .attr("width", 20)
//     .attr("height", 20)
//     .attr("fill", ds.color)
//     .attr("opacity", 0.7);
    
//   legendRow.append("text")
//     .attr("x", 25)
//     .attr("y", 15)
//     .text(ds.name);
// });

function createParticipantButtons(participants) {
  const selector = d3.select('#participant-selector');
  
  participants.forEach(pid => {
    selector.append('button')
      .attr('class', 'participant-btn')
      .attr('data-pid', pid)
      .text(`Participant ${pid}`)
      .on('click', function() {
        const btn = d3.select(this);
        const isActive = btn.classed('active');
        
        if (isActive) {
          activeParticipants.delete(pid);
          btn.classed('active', false);
        } else {
          activeParticipants.add(pid);
          btn.classed('active', true);
        }
        
        updateVisualization();
      });
  });
}

function setupTimeControls() {
  // Time preset buttons
  d3.selectAll('.time-btn').on('click', function() {
    const btn = d3.select(this);
    d3.selectAll('.time-btn').classed('active', false);
    btn.classed('active', true);
    
    timeRange = btn.text().toLowerCase().replace(' ', '');
    updateVisualization();
  });
  
  // Time slider
  d3.select('#time-slider').on('input', function() {
    const value = this.value;
    timeRange = `custom-${value}`;
    updateVisualization();
  });
}

function getTimeRangeExtent(range) {
  const fullTimeExtent = [
    d3.min(processedData, d => d3.min(d.values, v => v.time)),
    d3.max(processedData, d => d3.max(d.values, v => v.time))
  ];
  
  switch(range) {
    case '24hours':
      return [fullTimeExtent[1] - 1440, fullTimeExtent[1]]; // 24 hours in minutes
    case '3days':
      return [fullTimeExtent[1] - 4320, fullTimeExtent[1]]; // 3 days in minutes
    case '7days':
      return [fullTimeExtent[1] - 10080, fullTimeExtent[1]]; // 7 days in minutes
    default:
      if (range.startsWith('custom-')) {
        const percentage = parseInt(range.split('-')[1]) / 100;
        const timeSpan = fullTimeExtent[1] - fullTimeExtent[0];
        return [
          fullTimeExtent[1] - timeSpan * percentage,
          fullTimeExtent[1]
        ];
      }
      return fullTimeExtent;
  }
}

function updateVisualization() {
  const timeExtent = getTimeRangeExtent(timeRange);
  
  // Update scales
  xScale.domain(timeExtent);
  
  // Update axes
  g.select(".x-axis")
    .transition()
    .duration(750)
    .call(d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => `${Math.floor(d)}`));
  
  // Update lines
  const lines = g.selectAll(".line")
    .data(processedData.filter(d => activeParticipants.has(d.pid)));
  
  // Remove lines for non-selected participants
  lines.exit().remove();
  
  // Update existing lines
  lines
    .transition()
    .duration(750)
    .attr("d", d => d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.glucose))
      .curve(d3.curveMonotoneX)(d.values));
  
  // Add new lines
  lines.enter()
    .append("path")
    .attr("class", "line")
    .style("stroke", d => colorScale(d.pid))
    .style("opacity", 0)
    .attr("d", d => d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.glucose))
      .curve(d3.curveMonotoneX)(d.values))
    .transition()
    .duration(750)
    .style("opacity", 0.7);
}

async function loadDataAndPlot() {
  try {
    // Load the JSON data
    data = await d3.json('assets/vis_data/meal_data.json');
    
    // Filter for pre-diabetic data
    const preDiabeticData = data.filter(d => d['diabetes level'] === 'Pre-diabetic');
    
    // Get unique participants
    const participants = [...new Set(preDiabeticData.map(d => d.PID))];
    
    // Generate colors for each participant
    const colorScale = d3.scaleOrdinal()
      .domain(participants)
      .range(d3.schemeCategory10);

    // Convert timestamp to minutes since start
    function parseTimestamp(timestamp) {
      const [days, time] = timestamp.split(' days ');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return Number(days) * 24 * 60 + hours * 60 + minutes + seconds/60;
    }

    // Process all pre-diabetic data
    processedData = participants.map(pid => {
      const participantData = preDiabeticData
        .filter(d => d.PID === pid)
        .map(d => ({
          time: parseTimestamp(d.Timestamp),
          glucose: d['Libre GL'],
          pid: d.PID
        }))
        .sort((a, b) => a.time - b.time);
      return {
        pid,
        values: participantData
      };
    });

    // Get time domain across all participants
    const timeExtent = [
      d3.min(processedData, d => d3.min(d.values, v => v.time)),
      d3.max(processedData, d => d3.max(d.values, v => v.time))
    ];

    // Get glucose domain across all participants
    const glucoseExtent = [
      0,
      d3.max(processedData, d => d3.max(d.values, v => v.glucose))
    ];

    // Set up scales
    xScale = d3.scaleLinear()
      .domain(timeExtent)
      .range([0, width]);

    yScale = d3.scaleLinear()
      .domain(glucoseExtent)
      .range([height, 0]);

    // Add axes
    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => `${Math.floor(d)}`));

    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));

    // Add axis labels
    g.append("text")
      .attr("class", "x-label")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", height + 40)
      .text("Time (minutes)");

    g.append("text")
      .attr("class", "y-label")
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .attr("x", -height/2)
      .attr("y", -45)
      .text("Libre GL");

    // Add title
    g.append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", -20)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Pre-diabetic Glucose Levels");

    // Create participant buttons
    createParticipantButtons(participants);
    
    // Setup time controls
    setupTimeControls();

    // Create tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);

  } catch (error) {
    console.error('Error loading or processing the data:', error);
  }
}

loadDataAndPlot();