import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

document.addEventListener("DOMContentLoaded", function () {
    const finalState = [
        { time: 0, glucose: 80 }, { time: 1, glucose: 82 }, { time: 2, glucose: 120 }, 
        { time: 3, glucose: 140 }, { time: 4, glucose: 130 }, { time: 5, glucose: 110 }, 
        { time: 6, glucose: 90 }, { time: 7, glucose: 85 }
    ];

    const container = document.getElementById("explain_graph");
    const svgContainer = document.createElement("div");
    svgContainer.classList.add("svg-container");
    container.appendChild(svgContainer);

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = container.clientWidth - margin.left - margin.right;
    const height = container.clientHeight - margin.top - margin.bottom;

    const svg = d3.select(svgContainer).append("svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 7]).range([0, width]);
    const yScale = d3.scaleLinear().domain([70, 150]).range([height, 0]);

    const line = d3.line()
        .x(d => xScale(d.time))
        .y(d => yScale(d.glucose))
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(finalState)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(""));

    // Add x-axis label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height - 6)
        .text("Time");

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(""));

    // Add a dot at the point where glucose level starts increasing significantly
    const mealPoint = finalState[1]; // Assuming the meal point is at time = 2
    svg.append("circle")
        .attr("cx", xScale(mealPoint.time))
        .attr("cy", yScale(mealPoint.glucose))
        .attr("r", 5)
        .attr("fill", "red");

    // Calculate dynamic values for arrow thickness and text size
    const arrowThickness = Math.min(2, width / 100);
    const textSize = Math.min(18, width / 50);
    console.log("Arrow Thickness:", textSize);

    // Add an arrow with the text "After having meal"
    svg.append("line")
        .attr("x1", xScale(mealPoint.time))
        .attr("y1", yScale(mealPoint.glucose))
        .attr("x2", xScale(mealPoint.time))
        .attr("y2", yScale(mealPoint.glucose) - 200) // Make the arrow longer
        .attr("stroke", "black")
        .attr("stroke-width", arrowThickness) // Make the arrow thicker
        .attr("marker-end", "url(#arrow)");

    svg.append("text")
        .attr("x", xScale(mealPoint.time))
        .attr("y", yScale(mealPoint.glucose) - 220) // Move the text higher
        .attr("fill", "black")
        .attr("font-size", `${textSize}px`) // Make the text bigger
        .attr("text-anchor", "middle") // Center the text
        .text("After having meal");

    svg.append("defs").append("marker")
        .attr("id", "arrow")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 5)
        .attr("refY", 5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("fill", "black");
});