// Tooltip setup
let tooltipDiv = document.createElement("div");
tooltipDiv.className = "tooltip";
tooltipDiv.style.position = "absolute";
tooltipDiv.style.backgroundColor = "white";
tooltipDiv.style.border = "1px solid black";
tooltipDiv.style.borderRadius = "5px";
tooltipDiv.style.padding = "10px";
tooltipDiv.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)";
tooltipDiv.style.zIndex = "1000";
tooltipDiv.style.display = "none";
document.body.appendChild(tooltipDiv);

// Load data function
async function loadData() {
    try {
        const [cgMacrosData, bioData] = await Promise.all([
            d3.json('assets/vis_data/CGMacros.json'),
            d3.json('assets/vis_data/bio.json')
        ]);

        const bioMap = new Map(bioData.map(d => [d.PID, d['diabetes level']]));

        function parseTimestamp(timestamp) {
            const match = timestamp.match(/(\d+) days (\d+):(\d+):(\d+)/);
            if (!match) return null;
            const [, days, hours, minutes, seconds] = match.map(Number);
            return days * 24 * 60 + hours * 60 + minutes + seconds / 60;
        }

        return [...new Set(cgMacrosData.map(d => d.PID))].map(pid => {
            const values = cgMacrosData
                .filter(d => d.PID === pid)
                .map(d => ({
                    time: parseTimestamp(d.Timestamp),
                    glucose: +d['Libre GL'],
                    pid: d.PID
                }))
                .filter(d => d.time !== null)
                .sort((a, b) => a.time - b.time);

            return { pid, values, diabetic_level: bioMap.get(pid) };
        });
    } catch (error) {
        console.error('Error loading data:', error);
        return [];
    }
}

//helper function to format the timestamp

// Get color for group
function getColorForGroup(group) {
    const colors = {
        "Non-diabetic": "#00bfae",  // Teal
        "Pre-diabetic": "#fac127",  // Yellow
        "Diabetic": "#fb6900"       // Orange
    };
    return colors[group] || "#000000"; // Default to black if no match
}

// // Create graph function
// function createGraph(group, graphId, title) {
//     const container = d3.select(`#${graphId}`);
//     const width = 700, height = 100;
//     const margin = { top: 30, right: 30, bottom: 50, left: 50 };

//     const svg = container.append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform", `translate(${margin.left},${margin.top})`);

//     container.append("button")
//         .text("Reset Zoom")
//         .on("click", () => {
//             svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
//         });

//     const xScale = d3.scaleTime()
//         .domain([d3.min(group, d => d.Timestamp), d3.max(group, d => d.Timestamp)])
//         .range([0, width]);

//     const simulation = d3.forceSimulation(group)
//         .force("x", d3.forceX(d => xScale(d.Timestamp)).strength(1))
//         .force("y", d3.forceY(height / 2))
//         .force("collide", d3.forceCollide(4))
//         .on("tick", () => {
//             svg.selectAll("circle")
//                 .attr("cx", d => d.x)
//                 .attr("cy", d => d.y);
//         });

//     for (let i = 0; i < 120; i++) simulation.tick();

//     svg.append("g")
//         .attr("transform", `translate(0,${height})`)
//         .attr("class", "x-axis")
//         .call(d3.axisBottom(xScale)
//             .ticks(d3.timeDay.every(1))
//             .tickFormat(d3.timeFormat("Day %d")));

//     const zoom = d3.zoom()
//         .scaleExtent([1, 10])
//         .on("zoom", function(event) {
//             const newX = event.transform.rescaleX(xScale);
//             const zoomLevel = event.transform.k;

//             svg.select(".x-axis").call(d3.axisBottom(newX)
//                 .ticks(zoomLevel > 3 ? d3.timeHour.every() : d3.timeDay.every(1))
//                 .tickFormat(zoomLevel > 3 ? d3.timeFormat("%H:%M") : d3.timeFormat("Day %d")));

//             svg.selectAll("circle")
//                 .attr("cx", d => newX(d.Timestamp));
//         });

//     svg.append("rect")
//         .attr("width", width)
//         .attr("height", height)
//         .style("fill", "none")
//         .style("pointer-events", "all")
//         .call(zoom);

//     svg.selectAll("circle")
//         .data(group)
//         .enter()
//         .append("circle")
//         .attr("cx", d => d.x)
//         .attr("cy", d => d.y)
//         .attr("r", 3)
//         .attr("fill", "red")
//         .on("mouseover", function(event, d) {
//             d3.select(this)
//                 .attr("r", 8)
//                 .attr("stroke", "blue");

//             const imagePath = d["Participant_ID"] < 10
//                 ? `./data/CGMacros/CGMacros-00${d["Participant_ID"]}/${d["Image path"]}`
//                 : `./data/CGMacros/CGMacros-0${d["Participant_ID"]}/${d["Image path"]}`;

//             tooltipDiv.innerHTML = `
//                 <strong>Meal Type:</strong> ${d["Meal Type"] || "No data"}<br>
//                 <strong>Carbs:</strong> ${d["Carbs"] + ' g' || "No data"}<br>
//                 <strong>Protein:</strong> ${d["Protein"] + ' g' || "No data"}<br>
//                 <strong>Fat:</strong> ${d["Fat"] + ' g'|| "No data"}<br>
//                 <strong>Fiber:</strong> ${d["Fiber"] + ' g' || "No data"}<br>
//                 <img src="${imagePath}" alt="Meal Image" width="100" onerror="this.style.display='none'" />
//             `;

//             tooltipDiv.style.left = (event.pageX + 10) + "px";
//             tooltipDiv.style.top = (event.pageY + 10) + "px";
//             tooltipDiv.style.display = "block";
//         })
//         .on("mousemove", function(event) {
//             tooltipDiv.style.left = (event.pageX + 10) + "px";
//             tooltipDiv.style.top = (event.pageY + 10) + "px";
//         })
//         .on("mouseout", function() {
//             d3.select(this)
//                 .attr("r", 3)
//                 .attr("fill", "red")
//                 .attr("stroke", "none");

//             tooltipDiv.style.display = "none";
//         })
//         .on("click", function(event, d) {
//             const imagePath = d["Participant_ID"] < 10
//                 ? `./data/CGMacros/CGMacros-00${d["Participant_ID"]}/${d["Image path"]}`
//                 : `./data/CGMacros/CGMacros-0${d["Participant_ID"]}/${d["Image path"]}`;

//             tooltipDiv.innerHTML = `
//                 <strong>Meal Type:</strong> ${d["Meal Type"] || "N/A"}<br>
//                 <strong>Carbs:</strong> ${d["Carbs"]} g<br>
//                 <strong>Protein:</strong> ${d["Protein"] || "N/A"} g<br>
//                 <strong>Fat:</strong> ${d["Fat"] || "N/A"} g<br>
//                 <strong>Fiber:</strong> ${d["Fiber"] || "N/A"} g<br>
//                 <img src="${imagePath}" alt="Meal Image" width="100" onerror="this.style.display='none'" />
//             `;

//             tooltipDiv.style.left = (event.pageX + 10) + "px";
//             tooltipDiv.style.top = (event.pageY + 10) + "px";
//             tooltipDiv.style.display = "block";
//         });

//     svg.append("text")
//         .attr("x", width / 2)
//         .attr("y", -10)
//         .attr("text-anchor", "middle")
//         .attr("font-size", "16px")
//         .attr("font-weight", "bold")
//         .text(title);
// }

// Load and create charts
async function loadDataAndCreateCharts() {
    // load in the data
    const data = await loadData();
    if (!data || data.length === 0) {
        console.error("No glucose data loaded!");
        return;
    }

    const groups = {
        "Non-diabetic": {},
        "Pre-diabetic": {},
        "Diabetic": {}
    };

    data.forEach(({ pid, values, diabetic_level }) => {
        if (!groups[diabetic_level][pid]) {
            groups[diabetic_level][pid] = [];
        }
        groups[diabetic_level][pid] = values;
    });

    const charts = [];

    let globalMin = Infinity;
    let globalMax = -Infinity;

    data.forEach(({ values }) => {
        values.forEach(({ glucose }) => {
            globalMin = Math.min(globalMin, glucose);
            globalMax = Math.max(globalMax, glucose);
        });
    });

    const globalYScale = d3.scaleLinear()
        .domain([globalMin, globalMax])
        .range([100 - 5, 5]);

    Object.entries(groups).forEach(([group, participants]) => {
        const container = d3.select(`#${group.replace(" ", "-").toLowerCase()}-vis`);

        

        Object.entries(participants).forEach(([pid, entries]) => {
            const participantDiv = container.append("div")
                .attr("class", "participant-section");

            participantDiv.append("h4").text(`P${pid}`);
            const color = getColorForGroup(group);

            const chart = createGlucoseLineChart(participantDiv, entries, color, globalYScale);
            // charts.push(chart);
        });
    });

    // setTimeout(function() {
    //     charts.forEach(chart => chart.update());
    // }, 300);
}

// Create glucose line chart
function createGlucoseLineChart(container, data, groupColor, yScale) {
    console.log(container);

    let width = 100;
    let height = 100;
    const margin = { top: 20, right: 20, bottom: 70, left: 80 };

    const svg = container.append("svg")
        .attr("width", "100%")
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // console.log('fuck')
    // console.log(container)

    const clipPath = svg.append("defs").append("clipPath")
        .attr("id", "clip-" + container.attr("id"))
        .append("rect")
        .attr("height", height);

    // const chartGroup = svg.append("g")
    //     .attr("clip-path", `url(#clip-${container.attr("id")})`);

    // let startTime = 0;
    // const windowSize = 100;
    // const minutesPerReading = 15;

    // const xScale = d3.scaleLinear()
    //     .range([0, width]);

    // const yGrid = svg.append("g")
    //     .attr("class", "y-grid");

    // const xGrid = chartGroup.append("g")
    //     .attr("class", "x-grid");

    // const line = d3.line()
    //     .x((d, i) => xScale(startTime + i))
    //     .y(d => yScale(d.glucose));

    // const path = chartGroup.append("path")
    //     .attr("class", "glucose-line")
    //     .attr("stroke", groupColor)
    //     .attr("fill", "none")
    //     .attr("stroke-width", 2);

    // const dot = chartGroup.append("circle")
    //     .attr("r", 5)
    //     .attr("fill", "red");

    // const xAxisGroup = svg.append("g")
    //     .attr("class", "x-axis");

    // const yAxis = d3.axisLeft(yScale)
    //     .ticks(5)
    //     .tickFormat(d => `${d}`);

    // const yAxisGroup = svg.append("g")
    //     .attr("class", "y-axis");

    // const xLabel = svg.append("text")
    //     .attr("text-anchor", "middle")
    //     .attr("font-size", 10)
    //     .text("Time (hours)");

    // const yLabel = svg.append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("text-anchor", "middle")
    //     .attr("font-size", 10)
    //     .text("Glucose (mg/dL)");

    // function formatTime(index) {
    //     const totalMinutes = index * minutesPerReading;
    //     const hours = Math.floor((totalMinutes % 1440) / 60);
    //     const mins = totalMinutes % 60;
    //     const day = Math.floor(totalMinutes / 1440);

    //     return `Day ${day} ${hours}:${mins.toString().padStart(2, '0')}`;
    // }

    // function getTickCount(width) {
    //     if (width < 100) return 3;
    //     if (width < 200) return 4;
    //     if (width < 300) return 5;
    //     return 5;
    // }

    // let animationRunning = false;

//     function updateChart() {
//         width = container.node().getBoundingClientRect().width - 100;
//         width = Math.max(width, 150);

//         clipPath.attr("width", width);

//         xScale.range([0, width])
//             .domain([startTime, startTime + windowSize]);

//         const tickCount = getTickCount(width);

//         xAxisGroup.attr("transform", `translate(0, ${height})`)
//             .call(d3.axisBottom(xScale)
//                 .ticks(tickCount)
//                 .tickFormat(d => formatTime(d)));

//         xAxisGroup.selectAll("text")
//             .attr("dy", "1em")
//             .attr("transform", "rotate(-25)")
//             .style("text-anchor", "end");

//         yAxisGroup.call(yAxis);

//         yGrid.selectAll("line").remove();
//         yGrid.selectAll("line")
//             .data(yScale.ticks(5))
//             .enter()
//             .append("line")
//             .attr("x1", 0)
//             .attr("x2", width)
//             .attr("y1", d => yScale(d))
//             .attr("y2", d => yScale(d))
//             .attr("stroke", "#ccc")
//             .attr("stroke-dasharray", "2,2");

//         updateXGrid(tickCount);

//         xLabel.attr("x", width / 2)
//             .attr("y", height + 50);

//         yLabel.attr("x", -height / 2)
//             .attr("y", -margin.left + 15);

//         const visibleData = data.slice(startTime, startTime + windowSize);
//         path.datum(visibleData).attr("d", line);

//         const midIndex = Math.floor(windowSize / 2);
//         if (midIndex < visibleData.length) {
//             dot.attr("cx", xScale(startTime + midIndex))
//                 .attr("cy", yScale(visibleData[midIndex].glucose));
//         }
//     }

//     function updateXGrid(tickCount) {
//         xGrid.selectAll("line").remove();

//         xGrid.selectAll("line")
//             .data(xScale.ticks(tickCount))
//             .enter()
//             .append("line")
//             .attr("x1", d => xScale(d))
//             .attr("x2", d => xScale(d))
//             .attr("y1", 0)
//             .attr("y2", height)
//             .attr("stroke", "#ccc")
//             .attr("stroke-dasharray", "2,2");
//     }

//     function animate() {
//         if (!animationRunning) return;

//         startTime += 1;
//         if (startTime + windowSize >= data.length) {
//             startTime = 0;
//         }

//         xScale.domain([startTime, startTime + windowSize]);

//         const tickCount = getTickCount(width);

//         const xAxis = d3.axisBottom(xScale)
//             .ticks(tickCount)
//             .tickFormat(d => formatTime(d));

//         xAxisGroup.call(xAxis);

//         xAxisGroup.selectAll("text")
//             .attr("dy", "1em")
//             .attr("transform", "rotate(-25)")
//             .style("text-anchor", "end");

//         updateXGrid(tickCount);

//         const visibleData = data.slice(startTime, startTime + windowSize);

//         path.datum(visibleData).attr("d", line);

//         const midIndex = Math.floor(windowSize / 2);
//         if (midIndex < visibleData.length) {
//             dot.attr("cx", xScale(startTime + midIndex))
//                 .attr("cy", yScale(visibleData[midIndex].glucose));
//         }

//         setTimeout(animate, 20);
//     }

//     requestAnimationFrame(function() {
//         setTimeout(function() {
//             updateChart();

//             animationRunning = true;
//             animate();
//         }, 100);
//     });

//     const resizeHandler = function() {
//         updateChart();
//     };

//     window.addEventListener('resize', resizeHandler);

//     return {
//         update: updateChart,
//         cleanup: function() {
//             window.removeEventListener('resize', resizeHandler);
//             animationRunning = false;
//         }
//     };
}



// Load data and create charts on DOMContentLoaded
document.addEventListener("DOMContentLoaded", loadDataAndCreateCharts);
