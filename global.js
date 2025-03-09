import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

const margin = { top: 40, right: 50, bottom: 50, left: 60 };
let activeParticipants = new Set();
let timeRange = [1440, 14385];
let data, processedData, xScale, yScale, colorScale;

const mealIcons = {
  breakfast: d3.symbolCircle,
  lunch: d3.symbolSquare,
  dinner: d3.symbolTriangle,
  snack: d3.symbolDiamond
};

// Select the container for the visualization
const container = d3.select('.visualization-wrapper');
const svg = container.append('svg')
  .attr('width', '100%')
  .attr('height', '100%')
  .attr('viewBox', `0 0 ${container.node().clientWidth} ${container.node().clientHeight}`)
  .attr('preserveAspectRatio', 'xMidYMid meet');
const g = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Function to create participant buttons
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

// Function to render the time slider
function rendering_timeSlider(startDay, endDay) {
  const container = d3.select("#time-range-selector");
  container.selectAll("*").remove(); // Clear existing slider elements

  const style = window.getComputedStyle(container.node());
  const paddingLeft = parseFloat(style.paddingLeft);
  const paddingRight = parseFloat(style.paddingRight);

  const width = container.node().clientWidth - paddingLeft - paddingRight;
  const height = 100;
  const margin = { left: 8, right: 8 };
  const sliderWidth = width - margin.left - margin.right;

  const fullTimeExtent = [1440, 14385]; // Full time extent in minutes
  const daysExtent = [1, Math.ceil(fullTimeExtent[1] / 1440)]; // Convert minutes to days, starting from day 1

  const xScale = d3.scaleLinear()
    .domain(daysExtent) // Adjust range to match the actual time range in days
    .range([margin.left, sliderWidth + margin.left])
    .clamp(true);

  const svg = container.append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr('class', 'range-slider');

  const track = svg.append('line')
    .attr('class', 'track')
    .attr('x1', margin.left)
    .attr('x2', sliderWidth + margin.left)
    .attr('y1', height / 2)
    .attr('y2', height / 2)
    .attr('stroke', '#d2d2d7')
    .attr('stroke-width', 4);

  const trackFill = svg.append('line')
    .attr('class', 'track-fill')
    .attr('x1', xScale(startDay))
    .attr('x2', xScale(endDay))
    .attr('y1', height / 2)
    .attr('y2', height / 2)
    .attr('stroke', '#0071e3')
    .attr('stroke-width', 4);

  const circle_size = 7;

  const handleStart = svg.append('circle')
    .attr('class', 'handle')
    .attr('cx', xScale(startDay)) // Use the provided startDay
    .attr('cy', height / 2)
    .attr('r', circle_size)
    .attr('fill', '#0071e3')
    .call(d3.drag()
      .on('start drag', function(event) {
        const day = Math.round(xScale.invert(event.x - margin.left)); // Snap to nearest day
        const endDay = Math.round(xScale.invert(handleEnd.attr('cx') - margin.left));
        if (day < endDay) {
          handleStart.attr('cx', xScale(day));
          trackFill.attr('x1', xScale(day));
          updateTimeRange(day, endDay);
        }
      }));

  const handleEnd = svg.append('circle')
    .attr('class', 'handle')
    .attr('cx', xScale(endDay)) // Use the provided endDay
    .attr('cy', height / 2)
    .attr('r', circle_size)
    .attr('fill', '#0071e3')
    .call(d3.drag()
      .on('start drag', function(event) {
        const day = Math.round(xScale.invert(event.x - margin.left)); // Snap to nearest day
        const startDay = Math.round(xScale.invert(handleStart.attr('cx') - margin.left));
        if (day > startDay) {
          handleEnd.attr('cx', xScale(day));
          trackFill.attr('x2', xScale(day));
          updateTimeRange(startDay, day);
        }
      }));

  // Add x-axis scale without the axis line
  const xAxis = d3.axisBottom(xScale)
    .ticks(daysExtent[1])
    .tickFormat(d => `${d}d`)
    .tickSize(0); // Remove the axis line

  const xAxisGroup = svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height / 2 + circle_size + 5})`) // Position the x-axis scale below the slider
    .call(xAxis);

  xAxisGroup.select(".domain").remove(); // Remove the axis line

  function updateTimeRange(startDay, endDay) {
    timeRange = [startDay * 1440, endDay * 1440]; // Convert days to minutes, adjusting for day 1 start
    updateVisualization();
  }
}

// Function to get the time range extent
function getTimeRangeExtent(range) {
  if (Array.isArray(range)) {
    if (range[0] > range[1]) {
      throw new Error("Invalid time range: start time is greater than end time.");
    } 
    return range;
  }
}

// Function to update the visualization
function updateVisualization() {
  const containerWidth = container.node().clientWidth;
  const containerHeight = container.node().clientHeight;

  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  svg.attr('viewBox', `0 0 ${containerWidth} ${containerHeight}`);
  g.attr("transform", `translate(${margin.left}, ${margin.top})`);

  const timeExtent = getTimeRangeExtent(timeRange);

  // Filter data within the selected time range
  const filteredData = processedData.map(d => ({
    pid: d.pid,
    values: d.values.filter(v => v.time >= timeExtent[0] && v.time <= timeExtent[1])
  })).filter(d => d.values.length > 0);

  // Update xScale domain based on filtered data
  const filteredTimeExtent = [
    d3.min(filteredData, d => d3.min(d.values, v => v.time)),
    d3.max(filteredData, d => d3.max(d.values, v => v.time))
  ];

  xScale.domain(filteredTimeExtent).range([0, width]);
  yScale.range([height, 0]);

  // Determine the tick format based on the filtered time extent
  let tickFormat;
  let tickValues = [];
  const timeRangeInMinutes = filteredTimeExtent[1] - filteredTimeExtent[0];
  const startTime = filteredTimeExtent[0];

  if (timeRangeInMinutes <= 1440) { // Less than or equal to 1 day
    tickFormat = d => {
      const hour = Math.floor((d - startTime) / 60);
      return hour === 12 ? 'noon' : `${hour}h`; // Format as HH or "noon"
    };
    for (let i = filteredTimeExtent[0]; i <= filteredTimeExtent[1]; i += 60) { // 1-hour intervals
      tickValues.push(i);
    }
  } else { // More than 3 days
    tickFormat = d => `${Math.floor(d / 1440)}d`; // Format as days
    for (let i = filteredTimeExtent[0]; i <= filteredTimeExtent[1]; i += 1440) { // 1-day intervals
      tickValues.push(i);
    }
  } 
  
  g.select(".x-axis")
    .transition()
    .duration(750)
    .call(d3.axisBottom(xScale)
      .tickValues(tickValues)
      .tickFormat(tickFormat));

  // Make "noon" bold
  g.selectAll(".x-axis .tick text")
    .filter(function(d) { return Math.floor((d - startTime) / 60) === 12; })
    .style("font-weight", "bold");

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
    .data(filteredData.filter(d => activeParticipants.has(d.pid)));

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
    .transition()
    .duration(750)
    .style("opacity", 0.7);

  // Remove existing meal dots
  g.selectAll('.meal-dot').remove();

  // Add meal dots for each participant if they are active
  filteredData.forEach(participant => {
    if (activeParticipants.has(participant.pid)) {
      participant.values.forEach(d => {
        if (d.mealType) {
          console.log(d.mealType);
          g.append('path')
            .attr('class', 'meal-dot')
            .attr('d', d3.symbol().type(mealIcons[d.mealType]))
            .attr('transform', `translate(${xScale(d.time)}, ${yScale(d.glucose)})`)
            .style('fill', colorScale(participant.pid))
            .style('opacity', 0)
            .transition()
            .duration(750)
            .style('opacity', 1);
        }
      });
    }
  });

  const legendData = filteredData.filter(d => activeParticipants.has(d.pid));

  svg.select(".legend").remove();

  if (legendData.length > 0) {
    const legend = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${containerWidth - margin.right - 100}, ${margin.top})`);

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
    .attr("x", width / 2)
    .attr("y", height / 2)
    .attr("font-size", "14px")
    .text("Select participants to view their glucose data");
}

// Function to load data from a JSON file
async function loadData() {
  try {
    let data = await d3.json('assets/vis_data/CGMacros.json');

    const participants = [...new Set(data.map(d => d.PID))];

    colorScale = d3.scaleOrdinal()
      .domain(participants)
      .range(d3.schemeCategory10);

    function parseTimestamp(timestamp) {
      const [days, time] = timestamp.split(' days ');
      const [hours, minutes, seconds] = time.split(':').map(Number);
      return Number(days) * 24 * 60 + hours * 60 + minutes + seconds / 60;
    }
      
    // converting the time and include the relevant nutrients data
    processedData = participants.map(pid => {
      const participantData = data
        .filter(d => d.PID === pid)
        .map(d => ({
          time: parseTimestamp(d.Timestamp),
          glucose: d['Libre GL'],
          mealType: d['Meal Type'],
          calories: d['Calories'],
          carbs: d['Carbs'],
          protein: d['Protein'],
          fat: d['Fat'],
          fiber: d['Fiber'],
          pid: d.PID
        }))
        .sort((a, b) => a.time - b.time);
      return {
        pid,
        values: participantData
      };
    });

    return participants;
  } catch (error) {
    console.error('Error loading or processing the data:', error);
    return [];
  }
}

// Function to plot the data
function plotData(participants) {
  const containerWidth = container.node().clientWidth;
  const containerHeight = container.node().clientHeight;
  const width = containerWidth - margin.left - margin.right;
  const height = containerHeight - margin.top - margin.bottom;

  const timeExtent = [
    d3.min(processedData, d => d3.min(d.values, v => v.time)),
    d3.max(processedData, d => d3.max(d.values, v => v.time))
  ];

  const glucoseExtent = [
    0,
    d3.max(processedData, d => d3.max(d.values, v => v.glucose))
  ];

  xScale = d3.scaleLinear()
    .domain(timeExtent);

  yScale = d3.scaleLinear()
    .domain(glucoseExtent);

  console.log('Time extent:', timeExtent);
  console.log('Glucose extent:', glucoseExtent);

  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

  g.append("g")
    .attr("class", "y-axis");

  g.append("g")
    .attr("class", "grid");

  createParticipantButtons(participants);
  rendering_timeSlider(1, Math.ceil(timeExtent[1] / 1440)); // Initial rendering of the slider

  updateVisualization();
}

// Function to load data and plot it
async function loadDataAndPlot() {
  const participants = await loadData();
  plotData(participants);
}

// Event listener for window resize to update the visualization and slider
window.addEventListener('resize', () => {
  const startDay = Math.round(timeRange[0] / 1440);
  const endDay = Math.round(timeRange[1] / 1440);
  updateVisualization();
  rendering_timeSlider(startDay, endDay); // Re-render the slider with the current positions
});

// Initial call to load data and plot it
loadDataAndPlot();

