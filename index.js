d3.json("./eda/meal_data.json").then(data => {
    const parseTime = d3.timeParse("%d days %H:%M:%S");

    data.forEach(d => {
        d.Timestamp = parseTime(d.Timestamp);
    });

    const minTime = d3.min(data, d => d.Timestamp);
    const maxTime = new Date(minTime.getTime() + 10 * 24 * 60 * 60 * 1000);

    const width = 700, height = 100;
    const margin = {top: 30, right: 30, bottom: 50, left: 50};

    function createGraph(group, graphId, title) {
        const svg = d3.select(`#${graphId}`).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        const xScale = d3.scaleTime()
            .domain([minTime, maxTime])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, 600])
            .range([height, 0]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .attr("class", "x-axis")
            .call(d3.axisBottom(xScale)
                .ticks(d3.timeDay.every(1))
                .tickFormat((d, i) => `Day ${i}`));

        svg.append("g")
            .attr("class", "y-axis")
            .text("Meals")
            //.call(d3.axisLeft(yScale).ticks(5));

        svg.selectAll("line")
            .data(group)
            .enter()
            .append("line")
            .attr("x1", d => xScale(d.Timestamp))
            .attr("x2", d => xScale(d.Timestamp))
            .attr("y1", 0)
            .attr("y2", height)
            .attr("stroke", "red")
            .attr("stroke-width", 1);

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
        
                svg.selectAll("line")
                    .attr("x1", d => newX(d.Timestamp))
                    .attr("x2", d => newX(d.Timestamp));
            });
        
        svg.call(zoom);
        
    }

    createGraph(data.filter(d => d['diabetes level'] === 'Normal'), "graph-normal", "Normal Group");
    createGraph(data.filter(d => d['diabetes level'] === 'Prediabetes'), "graph-prediabetes", "Prediabetes Group");
    createGraph(data.filter(d => d['diabetes level'] === 'Diabetes'), "graph-diabetes", "Diabetes Group");

}).catch(error => console.error("Error loading the JSON data:", error));
