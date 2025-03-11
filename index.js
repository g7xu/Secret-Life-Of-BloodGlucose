// Place this at the beginning of your script, outside any functions
let tooltipDiv = null;

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

d3.json("./assets/vis_data/meal_data_photos.json").then(data => {
    const parseTime = d3.timeParse("%d days %H:%M:%S");

    data.forEach(d => {
        d.Timestamp = parseTime(d.Timestamp);
    });

    const minTime = d3.min(data, d => d.Timestamp);
    const maxTime = new Date(minTime.getTime() + 10 * 24 * 60 * 60 * 1000);

    const width = 700, height = 100;
    const margin = {top: 30, right: 30, bottom: 50, left: 50};

    // Create the tooltip only once, outside any functions
    tooltipDiv = document.createElement("div");
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

    function createGraph(group, graphId, title) {
        const container = d3.select(`#${graphId}`);
        
        // Create the SVG container
        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Add a Reset Zoom button
        container.append("button")
            .text("Reset Zoom")
            .on("click", () => {
                svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
            });

        const xScale = d3.scaleTime()
            .domain([minTime, maxTime])
            .range([0, width]);

        // Create the force simulation
        const simulation = d3.forceSimulation(group)
            .force("x", d3.forceX(d => xScale(d.Timestamp)).strength(1))
            .force("y", d3.forceY(height / 2))
            .force("collide", d3.forceCollide(4))
            .on("tick", () => {
                svg.selectAll("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });

        // Run the simulation
        for (let i = 0; i < 120; i++) simulation.tick();

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("class", "x-axis")
            .call(d3.axisBottom(xScale)
                .ticks(d3.timeDay.every(1))
                .tickFormat(d3.timeFormat("Day %d")));

        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .on("zoom", function(event) {
                const newX = event.transform.rescaleX(xScale);
                const zoomLevel = event.transform.k;
                
                svg.select(".x-axis").call(d3.axisBottom(newX)
                    .ticks(zoomLevel > 3 ? d3.timeHour.every() : d3.timeDay.every(1))
                    .tickFormat(zoomLevel > 3 ? d3.timeFormat("%H:%M") : d3.timeFormat("Day %d")));
                
                svg.selectAll("circle")
                    .attr("cx", d => newX(d.Timestamp));
            });

        svg.append("rect")
            .attr("width", width)
            .attr("height", height)
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(zoom);

        // Create the circles and add mouse event listeners
        const circles = svg.selectAll("circle")
            .data(group)
            .enter()
            .append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 3)
            .attr("fill", "red")
            .on("mouseover", function(event, d) {
                // Change color and size of the dot on hover (highlight)
                d3.select(this)
                    .attr("r", 8)
                    .attr("stroke", "blue");

                // Use plain JavaScript for tooltip display
                const imagePath = d["Participant_ID"] < 10
                    ? `./data/CGMacros/CGMacros-00${d["Participant_ID"]}/${d["Image path"]}`
                    : `./data/CGMacros/CGMacros-0${d["Participant_ID"]}/${d["Image path"]}`;

                tooltipDiv.innerHTML = `
                    <strong>Meal Type:</strong> ${d["Meal Type"] || "N/A"}<br>
                    <strong>Calories:</strong> ${d["Calories (Activity)"]}<br>
                    <strong>Protein:</strong> ${d["Protein"] || "N/A"} g<br>
                    <strong>Fat:</strong> ${d["Fat"] || "N/A"} g<br>
                    <strong>Fiber:</strong> ${d["Fiber"] || "N/A"} g<br>
                    <img src="${imagePath}" alt="Meal Image" width="100" onerror="this.style.display='none'" />
                `;
                
                tooltipDiv.style.left = (event.pageX + 10) + "px";
                tooltipDiv.style.top = (event.pageY + 10) + "px";
                tooltipDiv.style.display = "block";

                tooltipDiv.style.cssText = `
                position: absolute !important;
                left: ${event.pageX + 10}px !important;
                top: ${event.pageY + 10}px !important;
                z-index: 9999 !important;
                background-color: white !important;
                border: 1px solid black !important;
                border-radius: 5px !important;
                padding: 10px !important;
                box-shadow: 0 0 10px rgba(0,0,0,0.3) !important;
                display: block !important;
                `;

                const debugTooltip = document.createElement("div");
                debugTooltip.id = "debug-tooltip";
                debugTooltip.style.cssText = `
                position: fixed !important;
                top: 100px !important;
                left: 100px !important;
                width: 200px !important;
                height: auto !important;
                background-color: red !important;
                color: white !important;
                padding: 15px !important;
                border: 3px solid black !important;
                font-size: 16px !important;
                z-index: 9999 !important;
                pointer-events: none !important;
                `;
                debugTooltip.innerHTML = "<strong>TEST TOOLTIP</strong>";
                document.body.appendChild(debugTooltip);

                debugTooltip.style.left = (event.pageX + 10) + "px";
                debugTooltip.style.top = (event.pageY + 10) + "px";
                debugTooltip.style.display = "block";
                
                console.log("Tooltip should be visible now", tooltipDiv);
            })
            .on("mousemove", function(event) {
                // Update tooltip position as mouse moves
                tooltipDiv.style.left = (event.pageX + 10) + "px";
                tooltipDiv.style.top = (event.pageY + 10) + "px";
            })
            .on("mouseout", function() {
                // Revert the circle to its original size and color
                d3.select(this)
                    .attr("r", 3)
                    .attr("fill", "red")
                    .attr("stroke", "none");

                // Hide the tooltip
                tooltipDiv.style.display = "none";
            })
            .on("click", function(event, d) {
                // Reuse the mouseover code for click events too
                const imagePath = d["Participant_ID"] < 10
                    ? `./data/CGMacros/CGMacros-00${d["Participant_ID"]}/${d["Image path"]}`
                    : `./data/CGMacros/CGMacros-0${d["Participant_ID"]}/${d["Image path"]}`;

                tooltipDiv.innerHTML = `
                    <strong>Meal Type:</strong> ${d["Meal Type"] || "N/A"}<br>
                    <strong>Calories:</strong> ${d["Calories (Activity)"]}<br>
                    <strong>Protein:</strong> ${d["Protein"] || "N/A"} g<br>
                    <strong>Fat:</strong> ${d["Fat"] || "N/A"} g<br>
                    <strong>Fiber:</strong> ${d["Fiber"] || "N/A"} g<br>
                    <img src="${imagePath}" alt="Meal Image" width="100" onerror="this.style.display='none'" />
                `;
                
                tooltipDiv.style.left = (event.pageX + 10) + "px";
                tooltipDiv.style.top = (event.pageY + 10) + "px";
                tooltipDiv.style.display = "block";
            });

        // Add title to the graph
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text(title);
    }

    createGraph(data.filter(d => d['diabetes level'] === 'Non-diabetic'), "graph-nondiabetic", "Non-Diabetic Group");
    createGraph(data.filter(d => d['diabetes level'] === 'Pre-diabetic'), "graph-prediabetic", "Pre-Diabetic Group");
    createGraph(data.filter(d => d['diabetes level'] === 'Diabetic'), "graph-diabetic", "Diabetic Group");

}).catch(error => console.error("Error loading the JSON data:", error));




// animated dot graph
document.addEventListener("DOMContentLoaded", async function () {
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

    const groupContainer = d3.select("#group-labels");
    Object.keys(groups).forEach(group => {
        groupContainer.append("h2").text(group);
    });

});

async function loadDataAndCreateCharts() {
    const data = await loadData();
    if (!data || data.length === 0) {
        console.error("No glucose data loaded!");
        return;
    }

    // Initialize groups
    const groups = {
        "Non-diabetic": {},
        "Pre-diabetic": {},
        "Diabetic": {}
    };

    // Populate groups
    data.forEach(({ pid, values, diabetic_level }) => {
        if (!groups[diabetic_level][pid]) {
            groups[diabetic_level][pid] = [];
        }
        groups[diabetic_level][pid] = values;
    });

    // Find the global min and max glucose values for y-axis scaling
    let globalMin = Infinity;
    let globalMax = -Infinity;

    data.forEach(({ values }) => {
        values.forEach(({ glucose }) => {
            globalMin = Math.min(globalMin, glucose);
            globalMax = Math.max(globalMax, glucose);
        });
    });

    // Define a global yScale based on the global min and max values
    const globalYScale = d3.scaleLinear()
        .domain([globalMin, globalMax])
        .range([100 - 5, 5]); // Set the range according to your graph size

    // Create the graphs for each group
    Object.entries(groups).forEach(([group, participants]) => {
        const container = d3.select(`#${group.replace(" ", "-").toLowerCase()}-container`);
        if (container.empty()) {
            console.error(`Container #${group.replace(" ", "-").toLowerCase()}-container not found!`);
            return;
        }

        const groupRow = container.append("div").attr("class", "group-row");

        Object.entries(participants).forEach(([pid, entries]) => {
            const participantDiv = groupRow.append("div")
                .attr("class", "participant-section");

            // Only append the label once per participant
            participantDiv.append("h4").text(`P${pid}`);
            const color = getColorForGroup(group);

            createGlucoseLineChart(participantDiv, entries, color, globalYScale); // Pass globalYScale
        });
    });
}

function createGlucoseLineChart(container, data, groupColor, yScale) {
    const width = 100, height = 175, margin = { top: 20, right: 20, bottom: 20, left: 80 };
    const dotX = width / 2;

    const svg = container.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, 100]) // Ensuring correct domain based on the data length
        .range([0, width]);

    const line = d3.line()
        .x((d, i) => xScale(i))
        .y(d => yScale(d.glucose));

    // Create the graph path
    const path = svg.append("path")
        .datum(data.slice(0, 100))
        .attr("class", "glucose-line")
        .attr("d", line)
        .attr("stroke", groupColor)
        .attr("fill", "none")
        .attr("stroke-width", 2);

    const dot = svg.append("circle")
        .attr("r", 5)
        .attr("fill", "red")
        .attr("cx", xScale(0)) // Start at the first x value
        .attr("cy", yScale(data[0].glucose));

    let index = 0;
    function animate() {
        if (index + 100 >= data.length) index = 0;

        const subData = data.slice(index, index + 100);
        path.datum(subData).attr("d", line);

        const midPoint = Math.floor(subData.length / 2);
        dot.transition()
            .duration(1)
            .ease(d3.easeLinear)
            .attr("cx", xScale(midPoint)) // Move the dot along the x-axis
            .attr("cy", yScale(subData[midPoint].glucose)); // Move the dot vertically based on glucose

        index += 1;
        setTimeout(animate, 50);
    }

    animate();

    // Create the x-axis with time/index labels
    const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => `${d}`); // Time or index label

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height/2 + margin.bottom/2.7})`)
        .call(xAxis);

    // Create the y-axis with glucose labels
    const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => `${d} mg/dL`); // Glucose values in mg/dL

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height/2 + margin.bottom*2)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .text("Time (minutes)"); // x-axis unit

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height / 2 + margin.bottom*2)
        .attr("y", -margin.left + 15)
        .attr("text-anchor", "middle")
        .attr("font-size", 12)
        .text("Glucose (mg/dL)"); // y-axis unit
}

loadDataAndCreateCharts();






function getColorForGroup(group) {
    const colors = {
        "Non-diabetic": "#00bfae",  // Teal
        "Pre-diabetic": "#fac127",  // Yellow
        "Diabetic": "#ff9800"       // Orange
    };
    return colors[group] || "#000000"; // Default to black if no match
}
