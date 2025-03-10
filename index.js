d3.json("./assets/vis_data/meal_data.json").then(data => {
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
        
        container.append("button")
            .text("Reset Zoom")
            .on("click", () => {
                svg.transition().duration(750).call(zoom.transform, d3.zoomIdentity);
            });

        const svg = container.append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleTime()
            .domain([minTime, maxTime])
            .range([0, width]);

        const simulation = d3.forceSimulation(group)
            .force("x", d3.forceX(d => xScale(d.Timestamp)).strength(1))
            .force("y", d3.forceY(height / 2))
            .force("collide", d3.forceCollide(4))
            .stop();

        for (let i = 0; i < 120; i++) simulation.tick();

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("class", "x-axis")
            .call(d3.axisBottom(xScale)
                .ticks(d3.timeDay.every(1))
                .tickFormat((d, i) => `Day ${i}`));

        svg.selectAll("circle")
            .data(group)
            .enter()
            .append("circle")
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .attr("r", 3)
            .attr("fill", "red");

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text(title);

        const zoom = d3.zoom()
            .scaleExtent([1, 10])
            .on("zoom", function(event) {
                const newX = event.transform.rescaleX(xScale);
                svg.select(".x-axis")
                    .call(d3.axisBottom(newX)
                        .ticks(d3.timeDay.every(1))
                        .tickFormat(d3.timeFormat("Day %d")));
                
                svg.selectAll("circle")
                    .attr("cx", d => newX(d.Timestamp));
            });
        
        svg.call(zoom);
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
