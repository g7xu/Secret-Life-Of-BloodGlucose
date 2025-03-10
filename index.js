d3.json("./assets/vis_data/meal_data_photos.json").then(data => {
    const parseTime = d3.timeParse("%d days %H:%M:%S");

    data.forEach(d => {
        d.Timestamp = parseTime(d.Timestamp);
    });

    const minTime = d3.min(data, d => d.Timestamp);
    const maxTime = new Date(minTime.getTime() + 10 * 24 * 60 * 60 * 1000);

    const width = 700, height = 100;
    const margin = {top: 30, right: 30, bottom: 50, left: 50};

    function createGraph(group, graphId, title) {
        const container = d3.select(`#${graphId}`);
        
        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        container.append("button")
            .text("Reset Zoom")
            .on("click", () => {
                svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
            });

        const xScale = d3.scaleTime()
            .domain([minTime, maxTime])
            .range([0, width]);

        const simulation = d3.forceSimulation(group)
            .force("x", d3.forceX(d => xScale(d.Timestamp)).strength(1))
            .force("y", d3.forceY(height / 2))
            .force("collide", d3.forceCollide(4))
            .on("tick", () => {
                svg.selectAll("circle")
                    .attr("cx", d => d.x)
                    .attr("cy", d => d.y);
            });

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

        const tooltip = d3.select("body").append("dl")
            .attr("id", "meal-tooltip")
            .attr("class", "info tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(255, 255, 255, 0.8)")
            .style("padding", "10px")
            .style("border-radius", "5px")
            .style("box-shadow", "0 0 10px rgba(0, 0, 0, 0.3)")
            .style("font-size", "14px")
            .style("pointer-events", "none");

        svg.selectAll("circle")
            .data(group)
            .enter()
            .append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 3)
            .attr("fill", "red")
            .style('fill-opacity', .7)
            .on("mouseenter", (event, d) => {
                d3.select(event.currentTarget).style('fill-opacity', 1)
                    .style("r", 7);
                updateTooltipVisibility(true);
                updateTooltipContent(d);
                updateTooltipPosition(event);
                d3.select(event.currentTarget).classed('selected', true);
            })
            .on("mouseleave", (event) => {
                d3.select(event.currentTarget).style('fill-opacity', 0.7)
                .style("r", 3);
                updateTooltipVisibility(false);
                d3.select(event.currentTarget).classed('selected', false);
            });

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text(title);
    }

    function updateTooltipContent(d) {
        const tooltip = document.getElementById('meal-tooltip');
        
        document.getElementById("meal-meal-type").textContent = d["Meal Type"] || "N/A";
        document.getElementById("meal-calories").textContent = d["Calories (Activity)"] || "N/A";
        document.getElementById("meal-protein").textContent = d["Protein"] || "N/A";
        document.getElementById("meal-fat").textContent = d["Fat"] || "N/A";
        document.getElementById("meal-fiber").textContent = d["Fiber"] || "N/A";
        document.getElementById("meal-image").innerHTML = `<img src="${getImagePath(d)}" alt="Meal Image" width="100" />`;
    }

    function getImagePath(d) {
        return d["Participant_ID"] < 10
            ? `./data/CGMacros/CGMacros-00${d["Participant_ID"]}/${d["Image path"]}`
            : `./data/CGMacros/CGMacros-0${d["Participant_ID"]}/${d["Image path"]}`;
    }

    function updateTooltipVisibility(isVisible) {
        const tooltip = document.getElementById('meal-tooltip');
        tooltip.hidden = !isVisible;
    }
    
    function updateTooltipPosition(event) {
        const tooltip = document.getElementById('meal-tooltip');
        tooltip.style.left = `${event.clientX}px`;
        tooltip.style.top = `${event.clientY}px`;
    }
    

    createGraph(data.filter(d => d['diabetes level'] === 'Non-diabetic'), "graph-nondiabetic", "Non-Diabetic Group");
    createGraph(data.filter(d => d['diabetes level'] === 'Pre-diabetic'), "graph-prediabetic", "Pre-Diabetic Group");
    createGraph(data.filter(d => d['diabetes level'] === 'Diabetic'), "graph-diabetic", "Diabetic Group");

}).catch(error => console.error("Error loading the JSON data:", error));

export const mealDataPromise = d3.json("./assets/vis_data/meal_data.json").then(data => {
    const parseTime = d3.timeParse("%d days %H:%M:%S");
    data.forEach(d => {
        d.Timestamp = parseTime(d.Timestamp);
    });
    return data;
}).catch(error => {
    console.error("Error loading the JSON data:", error);
});
