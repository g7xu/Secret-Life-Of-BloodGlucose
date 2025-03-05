import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

const width = 800, height = 200;
const svg = d3.select("#graph-1").append("svg")
    .attr("width", width)
    .attr("height", height);

const xScale = d3.scaleTime()
    .domain([new Date(0), new Date(10 * 24 * 60 * 60 * 1000)])
    .range([0, width]);


const yScale = d3.scaleLinear()
    .domain([0, 600])
    .range([height, 0]);

d3.json("./eda/meal_data.json").then(data => {
    console.log(data);

    data.forEach(d => {
        const timeStr = d.Timestamp.split(' ')[2];
        const [hours, minutes, seconds] = timeStr.split(':');

        const time = new Date();
        time.setHours(hours, minutes, seconds);

        d.Timestamp = time;
    });

    console.log(data); 

    const minTime = d3.min(data, d => d.Timestamp);
    const maxTime = d3.max(data, d => d.Timestamp);

    console.log("Time Range:", minTime, maxTime);

    const width = 800, height = 200;
    const svg = d3.select("#graph-1").append("svg")
        .attr("width", width)
        .attr("height", height);

    const xScale = d3.scaleTime()
        .domain([minTime, maxTime])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, 600])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .call(d3.axisLeft(yScale).ticks(5));

    svg.selectAll("line")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", d => xScale(d.Timestamp))
        .attr("x2", d => xScale(d.Timestamp))
        .attr("y1", 0)
        .attr("y2", height)
        .attr("stroke", "red")
        .attr("stroke-width", 1);

}).catch(error => {
    console.error("Error loading the JSON data:", error);
});