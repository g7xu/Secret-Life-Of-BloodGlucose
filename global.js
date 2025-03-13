import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';
import { mealDataPromise } from './index.js'; // adjust relative path if needed

let tooltipDiv = document.createElement("div");
tooltipDiv.className = "tooltip";
tooltipDiv.style.position = "absolute";
tooltipDiv.style.backgroundColor = "white";
tooltipDiv.style.border = "1px solid black";
tooltipDiv.style.borderRadius = "5px";
tooltipDiv.style.padding = "10px";
tooltipDiv.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
tooltipDiv.style.zIndex = "1000";
tooltipDiv.style.display = "none"; // Use display instead of visibility
document.body.appendChild(tooltipDiv);

const margin = { top: 40, right: 50, bottom: 50, left: 60 };
let activeParticipants = new Set();
let timeRange = [1440, 14385];
let data, processedData, xScale, yScale, colorScale;
let tooltip;
let mealData;
// const baseDate = new Date(1900, 0, 1); // Jan 1, 1900


mealDataPromise.then(data => {
  mealData = data.map(d => ({
    Timestamp: d.Timestamp,
    glucose: d['Libre GL'],  // Map 'Libre GL' to glucose for consistency
    diabetes_level: d['diabetes level'],  // Keep the diabetes level for coloring
    time: d.Timestamp.getTime() / 60000,  // Convert to minutes for x-scale
    image: d['Image path']
  }));

});



const diabetic = {
  breakfast: 'assets/pics/d_breakfast.png',
  lunch: 'assets/pics/d_lunch.png',
  dinner: 'assets/pics/d_dinner.png',
  snack: 'assets/pics/d_snack.png',
};

const prediabetic = {
  breakfast: 'assets/pics/pd_breakfast.png',
  lunch: 'assets/pics/pd_lunch.png',
  dinner: 'assets/pics/pd_dinner.png',
  snack: 'assets/pics/pd_snack.png'
};

const nondiabetic = {
  breakfast: 'assets/pics/nd_breakfast.png',
  lunch: 'assets/pics/nd_lunch.png',
  dinner: 'assets/pics/nd_dinner.png',
  snack: 'assets/pics/nd_snack.png'
};

const mealIcons = {
  "Diabetic": diabetic,        // Lowercase keys
  "Pre-diabetic": prediabetic, // Lowercase keys
  "Non-diabetic": nondiabetic  // Lowercase keys
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


document.addEventListener("DOMContentLoaded", function() {
  // Call the function to create participant buttons
  loadDataAndPlot();
});

// Function to create participant buttons
function createParticipantButtons(participants) {
  // Clear existing buttons
  d3.selectAll('.participant-buttons').selectAll('*').remove();

  participants.forEach(pid => {
    const participant = processedData.find(d => d.pid === pid);
    if (participant) {
      const button = document.createElement('button');
      button.textContent = `${pid}`;
      button.classList.add('participant-btn');
      button.dataset.pid = pid;

      const categoryDiv = document.getElementById(participant.diabetic_level);

      if (categoryDiv) {
        const buttonsDiv = categoryDiv.querySelector('.participant-buttons');
        if (buttonsDiv) {
          buttonsDiv.appendChild(button);

          button.addEventListener('click', function() {
            const isActive = button.classList.contains('active');
            
            if (isActive) {
              activeParticipants.delete(pid);
              button.classList.remove('active');
            } else {
              activeParticipants.add(pid);
              button.classList.add('active');
            }
            
            updateVisualization();
          });
        } else {
          console.error(`.participant-buttons element not found in ${participant.diabetic_level} categoryDiv`);
        }
      } else {
        console.error(`categoryDiv with id ${participant.diabetic_level} not found`);
      }
    }
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
    diabetic_level: d.diabetic_level,
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

  // Define a color scale for diabetic levels
  const diabeticLevelColorScale = d3.scaleOrdinal()
    .domain(['Non-diabetic', 'Pre-diabetic', 'Diabetic'])
    .range(['#2ecc71', '#f1c40f', '#4059ad']); // Green, Yellow, Red

  const lines = g.selectAll(".line")
    .data(filteredData.filter(d => activeParticipants.has(d.pid)));

  lines.exit().remove();

  lines
    .transition()
    .duration(750)
    .attr("d", d => d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.glucose))
      .curve(d3.curveMonotoneX)(d.values))
    .style("stroke-width", 3)
    .style("stroke", d => diabeticLevelColorScale(d.diabetic_level)); // Ensure color is set here as well

  lines.enter()
    .append("path")
    .attr("class", "line")
    .style("stroke", d => diabeticLevelColorScale(d.diabetic_level)) // Use diabetic level color scale
    .style("opacity", 0)
    .attr("d", d => d3.line()
      .x(d => xScale(d.time))
      .y(d => yScale(d.glucose))
      .curve(d3.curveMonotoneX)(d.values))
    .on('mouseover', function(event, d) {
      tooltip.transition()
        .duration(200)
        .style('opacity', .9);
      
      // Get mouse x position in data coordinates
      const [mouseX] = d3.pointer(event, this);
      const hoveredTime = xScale.invert(mouseX);
      
      // Find the closest data point to the mouse position
      const bisect = d3.bisector(d => d.time).left;
      const index = bisect(d.values, hoveredTime);
      const dataPoint = index > 0 ? d.values[index - 1] : d.values[0];
      
      // Display the specific glucose value at this position
      tooltip.html(`Participant: ${d.pid}<br>Time: ${Math.round(dataPoint.time)} min<br>Glucose: ${dataPoint.glucose}`)
        .style('left', (event.pageX + 5) + 'px')
        .style('top', (event.pageY - 28) + 'px');
    })
    .on('mousemove', function(event, d) {
      // Get mouse x position in data coordinates
      const [mouseX] = d3.pointer(event, this);
      const hoveredTime = xScale.invert(mouseX);
      
      // Find the closest data point to the mouse position
      const bisect = d3.bisector(d => d.time).left;
      const index = bisect(d.values, hoveredTime);
      const dataPoint = index > 0 && index < d.values.length ? 
                        (hoveredTime - d.values[index-1].time < d.values[index].time - hoveredTime ? 
                         d.values[index-1] : d.values[index]) : 
                        (index > 0 ? d.values[index-1] : d.values[0]);
      
      // Display the specific glucose value at this position
      tooltip.html(`Participant: ${d.pid}<br>Time: ${Math.round(dataPoint.time)} min<br>Glucose: ${dataPoint.glucose}`)
        .style('left', (event.pageX + 5) + 'px')
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

  // Remove existing meal dots and dashed lines
  g.selectAll('.meal-group').remove();
  g.selectAll('.meal-time-line').remove();
  g.selectAll('.meal-time-dot').remove();
  g.selectAll('.meal-dot').remove();

  // Add meal dots for each participant if they are active
  filteredData.forEach(participant => {
    if (activeParticipants.has(participant.pid)) {
      participant.values.forEach(d => {
        if (d.mealType) {

          const group = g.append('g') // Group to hold both image and interactive rect
            .attr('class', 'meal-group')
            .attr('transform', `translate(${xScale(d.time)}, ${yScale(d.glucose) * 0.7 - 30})`); // Move up by 30%

          // Vertical dashed line for meal time
          const line = g.append('line')
            .attr('class', 'meal-time-line')
            .attr('x1', xScale(d.time))
            .attr('x2', xScale(d.time))
            .attr('y1', yScale(d.glucose)) // Start at the top of the rectangle
            .attr('y2', yScale(d.glucose) * 0.7) // Stop at the glucose level
            .attr('stroke', 'gray')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4');

          // Meal image
          const image = group.append('image')
            .attr('class', 'meal-dot')
            .attr('xlink:href', mealIcons[participant.diabetic_level][d.mealType])
            .attr('width', 20)
            .attr('height', 20)
            // .attr('fillrule', 'nonzero')
            // .attr('fill', diabeticLevelColorScale(d.diabetic_level))
            .attr('x', -10) // Center the image horizontally
            .attr('y', -10) // Center the image vertically
            .style('opacity', 0)
            .transition()
            .duration(750)
            .style('opacity', 1);

          // Add a small dot on the y-axis at the meal time
          const dot = g.append('circle')
            .attr('class', 'meal-time-dot')
            .attr('cx', xScale(d.time))
            .attr('cy', yScale(d.glucose)) // Position the dot at the glucose level
            .attr('r', 3) // Radius of the dot
            .attr('fill', diabeticLevelColorScale(d.diabetic_level)); // Color the dot based on diabetic level

          // Transparent square for better event detection
          group.append('rect')
            .attr('width', 20)
            .attr('height', yScale(d.glucose) - (yScale(d.glucose) * 0.7 - 30)) // Height to span the area between the line plot and the icon
            .attr('x', -10) // Center the rectangle horizontally
            .attr('y', -10) // Position the rectangle at the top middle
            .attr('fill', 'transparent') // Invisible but captures events
            .style('pointer-events', 'all') // Ensure the rect captures all events
            .on('mouseover', function (event) {
              const [x, y] = d3.pointer(event, this);
              // d3.select('#tooltip')
              //   .style('display', 'block')
              //   .html(`Calories: ${d.calories}`)
              //   .style('left', `${x + 10}px`)
              //   .style('top', `${y - 10}px`);

              const imagePath = d.PID < 10
                    ? `./data/CGMacros/CGMacros-00${d.pid}/${mealData.image}`
                    : `./data/CGMacros/CGMacros-0${d.pid}/${mealData.image}`;

              tooltipDiv.innerHTML = `
                  <strong>Meal Type:</strong> ${d.mealType}<br>
                  <strong>Carbs:</strong> ${d.carbs} g<br>
                  <strong>Protein:</strong> ${d.protein} g<br>
                  <strong>Fat:</strong> ${d.fat} g<br>
                  <strong>Fiber:</strong> ${d.fiber} g<br>
                  <img src="${imagePath}" alt="Meal Image" width="100" onerror="this.style.display='none'" />
              `;
                
                tooltipDiv.style.left = (event.pageX + 10) + "px";
                tooltipDiv.style.top = (event.pageY + 10) + "px";
                tooltipDiv.style.display = "block";

              // Make line and dot bold
              line.attr('stroke-width', 3);
              dot.attr('r', 5);

              // Replace image with bold version
              // image.attr('xlink:href', mealIcons[d.mealType + 'bold']);
            })
            .on('mouseout', function () {
              d3.select('#tooltip').style('display', 'none');

              // Revert line and dot to original
              line.attr('stroke-width', 1);
              dot.attr('r', 3);

              // Revert image to original version
              // image.attr('xlink:href', mealIcons[d.mealType]);
            });
        }
      });
    }
  });

  // adding a legend on the top right corner of the line plot 

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


    const mealColorScale = d3.scaleOrdinal()
    .domain(['Non-diabetic', 'Pre-diabetic', 'Diabetic'])
    .range(['#2ecc71', '#f1c40f', '#4059ad']); // Green, Yellow, Red

    const mealCircles = g.selectAll(".meal-circle")
        .data(mealData.filter(d => d.time >= timeExtent[0] && d.time <= timeExtent[1]));

    mealCircles.exit().remove();

    mealCircles.enter()
        .append("circle")
        .attr("class", "meal-circle")
        .attr("cx", d => xScale(d.time))  // Use the converted time
        .attr("cy", d => yScale(d.glucose))  // Use the mapped glucose value
        .attr("r", 5)
        .style("fill", d => mealColorScale(d.diabetes_level))  // Use diabetes level for color
        .style("opacity", 0.7)
        .style("stroke", "white")
        .style("stroke-width", 1)
        .on('mouseover', function(event, d) {
          tooltip.transition()
            .duration(200)
            .style('opacity', .9);
          tooltip.html(`
            Time: ${d.Timestamp.toLocaleTimeString()}<br>
            Glucose: ${d.glucose}<br>
            Type: ${d.diabetes_level}
          `)
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
        });

  mealCircles
      .transition()
      .duration(750)
      .attr("cx", d => xScale(d.time))
      .attr("cy", d => yScale(d.glucose))
      .style("fill", d => mealColorScale(d.diabetes_level));
}

// Function to load data from a JSON file
async function loadData() {
  try {
    let [cgMacrosData, bioData] = await Promise.all([
      d3.json('assets/vis_data/CGMacros.json'),
      d3.json('assets/vis_data/bio.json')
    ]);
    
    const bioMap = new Map(bioData.map(d => [d.PID, d['diabetes level']]));
    const participants = [...new Set(cgMacrosData.map(d => d.PID))];

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
      const participantData = cgMacrosData
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
          pid: d.PID,
          image: d['Image path']
        }))
        .sort((a, b) => a.time - b.time);

      const glucoseMap = {};
      participantData.forEach(d => {
        glucoseMap[d.time] = d.glucose;
      });

      return {
        pid,
        values: participantData,
        glucoseMap: glucoseMap,
        diabetic_level: bioMap.get(pid) // Add diabetic_level to the return object
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
  
  g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`);

  g.append("g")
    .attr("class", "y-axis");

  g.append("g")
    .attr("class", "grid");


  tooltip = d3.select('body').append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

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
