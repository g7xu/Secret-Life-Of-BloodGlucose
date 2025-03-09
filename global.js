import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { mealDataPromise } from './index.js'; // adjust relative path if needed


const svgWidth = 720;
const svgHeight = 400;
const margin = { top: 40, right: 50, bottom: 50, left: 60 };
const width = svgWidth - margin.left - margin.right;
const height = svgHeight - margin.top - margin.bottom;

let activeParticipants = new Set();
let timeRange = 'all';
let data, processedData, xScale, yScale, colorScale;
let tooltip;

mealDataPromise.then(data => {

  data.map(d => d.Timestamp)
  // console.log("Meal timestamps:", data.map(d => d.Timestamp));
  // Additional logic using the timestamps…
});
// console.log("Meal timestamps:",mealDataPromise);
// successfully resolved and available for use in global.js



const container = d3.select('.graph-wrapper');
const svg = container.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);

const g = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

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

function render_timeSlider() {
  d3.selectAll('.time-btn').on('click', function() {
    const btn = d3.select(this);
    d3.selectAll('.time-btn').classed('active', false);
    btn.classed('active', true);
    
    timeRange = btn.text().toLowerCase().replace(' ', '');
    updateVisualization();
  });
  
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
      return [fullTimeExtent[1] - 1440, fullTimeExtent[1]];
    case '3days':
      return [fullTimeExtent[1] - 4320, fullTimeExtent[1]];
    case '7days':
      return [fullTimeExtent[1] - 10080, fullTimeExtent[1]];
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
  
  xScale.domain(timeExtent);
  
  g.select(".x-axis")
    .transition()
    .duration(750)
    .call(d3.axisBottom(xScale)
      .ticks(5)
      .tickFormat(d => `${Math.floor(d)}`));
      
  g.select(".y-axis")
    .transition()
    .duration(750)
    .call(d3.axisLeft(yScale));
    
  g.select(".grid")
    .selectAll("line")
    .data(yScale.ticks(5))
    .join("line")
    .transition()
    .duration(750)
    .attr("x1", 0)
    .attr("x2", width)
    .attr("y1", d => yScale(d))
    .attr("y2", d => yScale(d))
    .attr("stroke", "#e0e0e0")
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "3,3");
  
  const lines = g.selectAll(".line")
    .data(processedData.filter(d => activeParticipants.has(d.pid)));
  
  lines.exit().remove();
  
  lines
    .transition()
    .duration(750)
    .attr("d", d => d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.glucose))
      .curve(d3.curveMonotoneX)(d.values));
  
  lines.enter()
    .append("path")
    .attr("class", "line")
    .style("stroke", d => colorScale(d.pid))
    .style("opacity", 0)
    .attr("d", d => d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.glucose))
      .curve(d3.curveMonotoneX)(d.values))
    .on('mouseover', function(event, d) {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      tooltip.html(`Participant: ${d.pid}<br>Glucose: ${d.values.map(v => v.glucose).join(', ')}`)
        .style('left', (event.pageX + 5) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mousemove', function(event) {
      tooltip.style('left', (event.pageX + 5) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseout', function() {
      tooltip.transition()
        .duration(500)
        .style('opacity', 0);
    })
    .transition()
    .duration(750)
    .style("opacity", 0.7);

    
  const legendData = processedData.filter(d => activeParticipants.has(d.pid));
  
  svg.select(".legend").remove();
  
  if (legendData.length > 0) {
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${svgWidth - margin.right - 100}, ${margin.top})`);
    
    legendData.forEach((d, i) => {
      const legendRow = legend.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      
      legendRow.append("rect")
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", colorScale(d.pid));
      
      legendRow.append("text")
        .attr("x", 20)
        .attr("y", 12)
        .attr("font-size", "12px")
        .text(`Participant ${d.pid}`);
    });
  }
    
  const noDataMessage = g.selectAll(".no-data-message")
    .data(activeParticipants.size === 0 ? [1] : []);
    
  noDataMessage.exit().remove();
  
  noDataMessage.enter()
    .append("text")
    .attr("class", "no-data-message")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height/2)
    .attr("font-size", "14px")
    .text("Select participants to view their glucose data");
}

async function loadDataAndPlot() {
  try {
    let data = await d3.json('assets/vis_data/CGMacros.json');

    const participants = [...new Set(data.map(d => d.PID))];
    

    colorScale = d3.scaleOrdinal()
      .domain(participants)
      .range(d3.schemeCategory10);

    function parseTimestamp(timestamp) {
      const [days, time] = timestamp.split(' days ');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return Number(days) * 24 * 60 + hours * 60 + minutes + seconds/60;
    }

    processedData = participants.map(pid => {
      const participantData = data
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

    console.log(processedData);

    const timeExtent = [
      d3.min(processedData, d => d3.min(d.values, v => v.time)),
      d3.max(processedData, d => d3.max(d.values, v => v.time))
    ];

    const glucoseExtent = [
      0,
      d3.max(processedData, d => d3.max(d.values, v => v.glucose))
    ];

    xScale = d3.scaleLinear()
      .domain(timeExtent)
      .range([0, width]);

    yScale = d3.scaleLinear()
      .domain(glucoseExtent)
      .range([height, 0]);

    g.append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => `${Math.floor(d)}`));

    g.append("g")
      .attr("class", "y-axis")
      .call(d3.axisLeft(yScale));
    
    g.append("g")
      .attr("class", "grid")
      .selectAll("line")
      .data(yScale.ticks(5))
      .enter()
      .append("line")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3,3");

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

    g.append("text")
      .attr("class", "title")
      .attr("text-anchor", "middle")
      .attr("x", width/2)
      .attr("y", -20)
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Pre-diabetic Glucose Levels");

    createParticipantButtons(participants);
    render_timeSlider();

    tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0);
      
    updateVisualization();

  } catch (error) {
    console.error('Error loading or processing the data:', error);
  }
}

loadDataAndPlot();

/*
  Comments:
  - Increased height for better visibility
  - Adjusted margins
  - State management
  - Remove existing text if needed
  - Create a tooltip div that is hidden by default
  - Create a simple legend in the top-right corner of the SVG
  - Filter the data to include only the first 100 rows
  - Combine all datasets to determine unified scales
  - Set up the scales based on inner width and height
  - Append the x-axis at the bottom of the graph
  - Append the y-axis at the left of the graph
  - Define the line generator
  - Append the path for the line graph
  - Append circles for each data point
  - Create participant buttons
  - Setup time controls
  - Get time domain across all participants
  - Get glucose domain across all participants
  - Add axes
  - Add grid lines
  - Add axis labels
  - Add title
  - Initialize the visualization
*/