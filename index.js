// Place this at the beginning of your script, outside any functions
let tooltipDiv = null;

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

