import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

document.addEventListener("DOMContentLoaded", function () {
    const finalState = [
        { time: 0, glucose: 80 }, { time: 0.5, glucose: 81 }, { time: 1, glucose: 82 }, 
        { time: 1.5, glucose: 100 }, { time: 2, glucose: 120 }, { time: 2.5, glucose: 130 }, 
        { time: 3, glucose: 140 }, { time: 3.5, glucose: 135 }, { time: 4, glucose: 130 }, 
        { time: 4.5, glucose: 120 }, { time: 5, glucose: 110 }, { time: 5.5, glucose: 82 }, 
        { time: 6, glucose: 76 }, { time: 6.5, glucose: 72 }
    ];

    const container = document.getElementById("explain_graph");
    const svgContainer = document.createElement("div");
    svgContainer.classList.add("svg-container");
    container.appendChild(svgContainer);

    const margin = { top: 40, right: 40, bottom: 50, left: 60 };
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

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -margin.top / 2)
        .attr("text-anchor", "middle")
        .attr("font-size", "24px")
        .attr("font-weight", "bold")
        .text("Blood Glucose Levels Over Time");

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale).tickFormat(""));

    // Add x-axis label
    svg.append("text")
        .attr("class", "x label")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + margin.bottom - 10)
        .text("Time");

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(yScale).tickFormat(""));

    // Add y-axis label
    svg.append("text")
        .attr("class", "y label")
        .attr("text-anchor", "end")
        .attr("y", -margin.left + 20)
        .attr("dy", "-2.5em")
        .attr("transform", "rotate(-90)")
        .text("Glucose Level");

    // Add a dot at the point where glucose level starts increasing significantly    
    const mealPoint = finalState[2]; // Assuming the meal point is at time = 2
    svg.append("circle")
        .attr("cx", xScale(mealPoint.time))
        .attr("cy", yScale(mealPoint.glucose))
        .attr("r", 5)
        .attr("fill", "red");

    // Calculate dynamic values for arrow thickness and text size
    const arrowThickness = Math.min(2, width / 100);
    const textSize = Math.min(18, width / 50);

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

    // Add a red vertical line at time = 3
    svg.append("line")
        .attr("x2", xScale(finalState[6].time))
        .attr("y2", yScale(finalState[6].glucose))
        .attr("x1", xScale(finalState[6].time))
        .attr("y1", yScale(finalState[2].glucose))
        .attr("stroke", "red")
        .attr("stroke-width", 2);

    // Add text on the right of the vertical line
    svg.append("text")
        .attr("x", xScale(finalState[6].time) + 10) // Adjust the position to the right of the line
        .attr("y", (yScale(finalState[6].glucose) + yScale(finalState[2].glucose)) / 2) // Center the text vertically
        .attr("fill", "black")
        .attr("font-size", `${textSize}px`) // Use the calculated text size
        .attr("text-anchor", "start") // Align the text to the start
        .text("Glucose Excursion");

    // Add a red vertical line at time = 3
    svg.append("line")
        .attr("x2", xScale(finalState[6].time))
        .attr("y2", yScale(finalState[2].glucose))
        .attr("x1", xScale(finalState[2].time))
        .attr("y1", yScale(finalState[2].glucose))
        .attr("stroke", "red")
        .attr("stroke-width", 2);

    // Add text at the bottom of the glucose_excursion_time line
    svg.append("text")
        .attr("x", (xScale(finalState[6].time) + xScale(finalState[2].time)) / 2) // Center the text horizontally
        .attr("y", yScale(finalState[2].glucose) + 20) // Position the text below the line
        .attr("fill", "black")
        .attr("font-size", `${textSize}px`) // Use the calculated text size
        .attr("text-anchor", "middle") // Center the text
        .text("Glucose Excursion Time");

    // Add a red vertical line at time = 3
    svg.append("line")
        .attr("x2", xScale(finalState[11].time))
        .attr("y2", yScale(finalState[2].glucose))
        .attr("x1", xScale(finalState[6].time))
        .attr("y1", yScale(finalState[2].glucose))
        .attr("stroke", "red")
        .attr("stroke-width", 2);

    // Add text at the bottom of the glucose_recover_time line
    svg.append("text")
        .attr("x", (xScale(finalState[11].time) + xScale(finalState[6].time)) / 2) // Center the text horizontally
        .attr("y", yScale(finalState[2].glucose) + 20) // Position the text below the line
        .attr("fill", "black")
        .attr("font-size", `${textSize}px`) // Use the calculated text size
        .attr("text-anchor", "middle") // Center the text
        .text("Glucose Recovery Time");
});
