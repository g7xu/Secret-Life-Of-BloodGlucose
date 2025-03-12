import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

// Set up container dimensions and margins
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 960 - margin.left - margin.right;  // Wider visualization
const height = 400 - margin.top - margin.bottom; // Taller visualization

// Append the SVG object to the specific HTML element (.graph-wrapper4)
const svg = d3.select('.graph-wrapper-panel4')
  .append('svg')
  .attr('width', width + margin.left + margin.right)
  .attr('height', height + margin.top + margin.bottom)
  .append('g')
  .attr('transform', `translate(${margin.left},${margin.top})`);

// First, fetch the bio.json data to identify participants from each group
fetch('assets/vis_data/bio.json')
  .then(response => response.json())
  .then(bioData => {
    // Debug: Log all participants by diabetes group
    console.log("All participants:", bioData.length);
    
    const diabeticParticipants = bioData.filter(p => p["diabetes level"] === "Diabetic");
    const preDiabeticParticipants = bioData.filter(p => p["diabetes level"] === "Pre-diabetic");
    const nonDiabeticParticipants = bioData.filter(p => p["diabetes level"] === "Non-diabetic");
    
    console.log("Diabetic participants:", diabeticParticipants.length);
    console.log("Pre-diabetic participants:", preDiabeticParticipants.length);
    console.log("Non-diabetic participants:", nonDiabeticParticipants.length);
    
    if (diabeticParticipants.length > 0) {
      console.log("Diabetic PIDs:", diabeticParticipants.map(p => p.PID));
    }
    if (preDiabeticParticipants.length > 0) {
      console.log("Pre-diabetic PIDs:", preDiabeticParticipants.map(p => p.PID));
    }
    if (nonDiabeticParticipants.length > 0) {
      console.log("Non-diabetic PIDs:", nonDiabeticParticipants.map(p => p.PID));
    }
    
    // FIXED VALUES FOR TESTING: select specific participants we know have data
    // Let's use specific PIDs that we know exist in the CGM data
  
    // First, get all biodata participants
    const allParticipantIds = bioData.map(p => p.PID);
    // const firstDiabetic = diabeticParticipants.find(p => p.PID === 3) || diabeticParticipants[0];
    // const firstPreDiabetic = preDiabeticParticipants.find(p => p.PID === 7) || preDiabeticParticipants[0];
    // const firstNonDiabetic = nonDiabeticParticipants.find(p => p.PID === 1) || nonDiabeticParticipants[0];



    
    // Now fetch the CGM data to get glucose values and find participants with data
    return fetch('assets/vis_data/CGMacros.json')
      .then(response => response.json())
      .then(cgmData => {
        // Count data points by PID to see what we have
        const pidCounts = {};
        cgmData.forEach(d => {
          if (!pidCounts[d.PID]) pidCounts[d.PID] = 0;
          pidCounts[d.PID]++;
        });
        console.log("Data points by PID:", pidCounts);
        
        // Find PIDs that actually have data in the CGM dataset
        const pidsWithData = Object.keys(pidCounts).map(Number);
        console.log("PIDs with data:", pidsWithData);
        
        // Match PIDs with data to their diabetes level
        const diabeticPidsWithData = diabeticParticipants
          .filter(p => pidsWithData.includes(p.PID))
          .map(p => p.PID);
        
        const preDiabeticPidsWithData = preDiabeticParticipants
          .filter(p => pidsWithData.includes(p.PID))
          .map(p => p.PID);
        
        const nonDiabeticPidsWithData = nonDiabeticParticipants
          .filter(p => pidsWithData.includes(p.PID))
          .map(p => p.PID);
        
        console.log("Diabetic PIDs with data:", diabeticPidsWithData);
        console.log("Pre-diabetic PIDs with data:", preDiabeticPidsWithData);
        console.log("Non-diabetic PIDs with data:", nonDiabeticPidsWithData);
        
        // Pick the first PID from each group that has data
        const selectedDiabeticPID = diabeticPidsWithData.length > 0 ? diabeticPidsWithData[0] : null;
        const selectedPreDiabeticPID = preDiabeticPidsWithData.length > 0 ? preDiabeticPidsWithData[0] : null;
        const selectedNonDiabeticPID = nonDiabeticPidsWithData.length > 0 ? nonDiabeticPidsWithData[0] : 1; // Use 1 as fallback since we know it has data
        
        console.log("Selected Diabetic PID:", selectedDiabeticPID);
        console.log("Selected Pre-Diabetic PID:", selectedPreDiabeticPID);
        console.log("Selected Non-Diabetic PID:", selectedNonDiabeticPID);
        
        // Get the full participant data for the selected PIDs
        const firstDiabetic = diabeticParticipants.find(p => p.PID === selectedDiabeticPID) || null;
        const firstPreDiabetic = preDiabeticParticipants.find(p => p.PID === selectedPreDiabeticPID) || null;
        const firstNonDiabetic = nonDiabeticParticipants.find(p => p.PID === selectedNonDiabeticPID) || nonDiabeticParticipants[0];
        
        // Convert PIDs to strings for consistent comparison
        const diabeticPID = firstDiabetic ? String(firstDiabetic.PID) : null;
        const preDiabeticPID = firstPreDiabetic ? String(firstPreDiabetic.PID) : null;
        const nonDiabeticPID = String(firstNonDiabetic.PID);
        
        console.log(`Selected Diabetic participant:`, firstDiabetic ? firstDiabetic.PID : "None available");
        console.log(`Selected Pre-Diabetic participant:`, firstPreDiabetic ? firstPreDiabetic.PID : "None available");
        console.log(`Selected Non-Diabetic participant:`, firstNonDiabetic.PID);
        
        // Filter CGM data for each participant - trying different day formats
        const diabeticData = diabeticPID ? cgmData.filter(d => 
          String(d.PID) === diabeticPID && 
          (d.Timestamp.startsWith("1 days") || d.Timestamp.startsWith("1 day") || d.Timestamp.includes("Day 1"))
        ) : [];
        
        const preDiabeticData = preDiabeticPID ? cgmData.filter(d => 
          String(d.PID) === preDiabeticPID && 
          (d.Timestamp.startsWith("1 days") || d.Timestamp.startsWith("1 day") || d.Timestamp.includes("Day 1"))
        ) : [];
        
        const nonDiabeticData = cgmData.filter(d => 
          String(d.PID) === nonDiabeticPID && 
          (d.Timestamp.startsWith("1 days") || d.Timestamp.startsWith("1 day") || d.Timestamp.includes("Day 1"))
        );
        
        // Debug: log the data counts to see if we're getting data for all participants
        console.log(`Diabetic data points:`, diabeticData.length);
        console.log(`Pre-Diabetic data points:`, preDiabeticData.length);
        console.log(`Non-Diabetic data points:`, nonDiabeticData.length);
        
        // If no data is found for a participant, log a warning
        if (diabeticPID && diabeticData.length === 0) console.warn(`No data found for Diabetic participant (PID ${diabeticPID})`);
        if (preDiabeticPID && preDiabeticData.length === 0) console.warn(`No data found for Pre-Diabetic participant (PID ${preDiabeticPID})`);
        if (nonDiabeticData.length === 0) console.warn(`No data found for Non-Diabetic participant (PID ${nonDiabeticPID})`);
        
        // Process the timestamp to extract hours and minutes
        const parseTime = (timestamp) => {
          try {
            console.log("Parsing timestamp:", timestamp);
            // Handle different timestamp formats
            let timeParts;
            if (timestamp.includes(":")) {
              // If it has a colon, extract the time part
              if (timestamp.split(" ").length >= 3) {
                // Format like "1 days 00:00:00"
                timeParts = timestamp.split(" ")[2].split(":");
              } else {
                // Format might be different
                timeParts = timestamp.split(" ").find(part => part.includes(":")).split(":");
              }
              
              const hours = parseInt(timeParts[0]);
              const minutes = parseInt(timeParts[1]);
              return hours + minutes/60; // Convert to decimal hours
            } else {
              // If no time format found, return 0
              console.warn("No time format found in timestamp:", timestamp);
              return 0;
            }
          } catch (error) {
            console.error("Error parsing timestamp:", timestamp, error);
            return 0;
          }
        };
        
        // Process data for visualization
        const processedDiabeticData = diabeticData.map(d => ({
          time: parseTime(d.Timestamp),
          value: d["Libre GL"] || 0 // Handle potential null values
        })).filter(d => d.value > 0); // Filter out any zero values
        
        const processedPreDiabeticData = preDiabeticData.map(d => ({
          time: parseTime(d.Timestamp),
          value: d["Libre GL"] || 0
        })).filter(d => d.value > 0);
        
        const processedNonDiabeticData = nonDiabeticData.map(d => ({
          time: parseTime(d.Timestamp),
          value: d["Libre GL"] || 0
        })).filter(d => d.value > 0);
        
        // Debug the processed data
        console.log("Processed Diabetic Data:", processedDiabeticData.length);
        console.log("Processed Pre-Diabetic Data:", processedPreDiabeticData.length);
        console.log("Processed Non-Diabetic Data:", processedNonDiabeticData.length);
        
        // Log sample values from each dataset
        if (processedDiabeticData.length > 0) console.log("Sample Diabetic Data:", processedDiabeticData[0]);
        if (processedPreDiabeticData.length > 0) console.log("Sample Pre-Diabetic Data:", processedPreDiabeticData[0]);
        if (processedNonDiabeticData.length > 0) console.log("Sample Non-Diabetic Data:", processedNonDiabeticData[0]);
        
        // Set up scales
        const x = d3.scaleLinear()
          .domain([0, 24]) // 24 hours in a day
          .range([0, width]);
        
        // Find the min and max glucose values across all three datasets
        const allValues = [
          ...processedDiabeticData.map(d => d.value),
          ...processedPreDiabeticData.map(d => d.value),
          ...processedNonDiabeticData.map(d => d.value)
        ];
        
        const y = d3.scaleLinear()
          .domain([0, d3.max(allValues) * 1.1]) // Add 10% padding at the top
          .range([height, 0]);
        
        // Line generator
        const line = d3.line()
          .x(d => x(d.time))
          .y(d => y(d.value))
          .curve(d3.curveBasis); // Makes the curve smooth
        
        // Area generators
        const area = d3.area()
          .x(d => x(d.time))
          .y0(height)
          .y1(d => y(d.value))
          .curve(d3.curveBasis);
        
        // Add the areas with different colors and transparencies
        if (processedNonDiabeticData.length > 0) {
          svg.append("path")
            .datum(processedNonDiabeticData)
            .attr("fill", "steelblue")
            .attr("fill-opacity", 0.3)
            .attr("d", area);
        }
          
        if (processedPreDiabeticData.length > 0) {
          svg.append("path")
            .datum(processedPreDiabeticData)
            .attr("fill", "gold")
            .attr("fill-opacity", 0.3)
            .attr("d", area);
        }
        
        if (processedDiabeticData.length > 0) {
          svg.append("path")
            .datum(processedDiabeticData)
            .attr("fill", "tomato")
            .attr("fill-opacity", 0.3)
            .attr("d", area);
        }
        
        // Add the lines on top of the areas in the same order
        if (processedNonDiabeticData.length > 0) {
          svg.append("path")
            .datum(processedNonDiabeticData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 2)
            .attr("d", line);
        }
          
        if (processedPreDiabeticData.length > 0) {
          svg.append("path")
            .datum(processedPreDiabeticData)
            .attr("fill", "none")
            .attr("stroke", "gold")
            .attr("stroke-width", 2)
            .attr("d", line);
        }
        
        if (processedDiabeticData.length > 0) {
          svg.append("path")
            .datum(processedDiabeticData)
            .attr("fill", "none")
            .attr("stroke", "tomato")
            .attr("stroke-width", 2)
            .attr("d", line);
        }
        
        // Add the x-axis
        svg.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x)
            .ticks(12)
            .tickFormat(d => {
              const hours = Math.floor(d);
              const minutes = Math.round((d % 1) * 60);
              return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
            }));
        
        // Add the y-axis
        svg.append("g")
          .call(d3.axisLeft(y));
        
        // Add a legend with only the participants that have data
        const legendData = [];
        if (firstDiabetic && processedDiabeticData.length > 0) {
          legendData.push({name: `Diabetic (PID: ${firstDiabetic.PID})`, color: "tomato"});
        }
        if (firstPreDiabetic && processedPreDiabeticData.length > 0) {
          legendData.push({name: `Pre-Diabetic (PID: ${firstPreDiabetic.PID})`, color: "gold"});
        }
        if (processedNonDiabeticData.length > 0) {
          legendData.push({name: `Non-Diabetic (PID: ${firstNonDiabetic.PID})`, color: "steelblue"});
        }
        
        // Only add legend if we have data
        if (legendData.length > 0) {
          const legend = svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(legendData)
            .enter().append("g")
            .attr("transform", (d, i) => `translate(0,${i * 20})`);
          
          legend.append("rect")
            .attr("x", width - 19)
            .attr("width", 19)
            .attr("height", 19)
            .attr("fill", d => d.color);
          
          legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9.5)
            .attr("dy", "0.32em")
            .text(d => d.name);
        }
        
        // Add axis labels
        svg.append("text")
          .attr("transform", `translate(${width/2}, ${height + margin.top + 10})`)
          .style("text-anchor", "middle")
          .text("Time (hours)");
        
        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0 - (height / 2))
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .text("Glucose Level");
        
        // Add title
        svg.append("text")
          .attr("x", width / 2)
          .attr("y", 0 - (margin.top / 2))
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .text("Day 1 Glucose Levels by Diabetes Group");
        
        // Add subtitle if we're missing some groups
        if (!firstDiabetic || !firstPreDiabetic || processedDiabeticData.length === 0 || processedPreDiabeticData.length === 0) {
          svg.append("text")
            .attr("x", width / 2)
            .attr("y", margin.top / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-style", "italic")
            .text("Note: Some participant groups have no data available");
        }
        
        // Add reference lines for normal glucose range
        // Normal range is typically 70-140 mg/dL
        svg.append("line")
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", y(70))
          .attr("y2", y(70))
          .attr("stroke", "gray")
          .attr("stroke-dasharray", "4")
          .attr("stroke-width", 1);
          
        svg.append("line")
          .attr("x1", 0)
          .attr("x2", width)
          .attr("y1", y(140))
          .attr("y2", y(140))
          .attr("stroke", "gray")
          .attr("stroke-dasharray", "4")
          .attr("stroke-width", 1);
          
        // Add text labels for the reference lines
        svg.append("text")
          .attr("x", 5)
          .attr("y", y(70) - 5)
          .attr("fill", "gray")
          .attr("font-size", "10px")
          .text("Lower normal limit (70 mg/dL)");
          
        svg.append("text")
          .attr("x", 5)
          .attr("y", y(140) - 5)
          .attr("fill", "gray")
          .attr("font-size", "10px")
          .text("Upper normal limit (140 mg/dL)");
      });
  })
  .catch(error => console.error('Error loading data:', error));