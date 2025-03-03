import * as d3 from 'd3';


const fileId = "1HpFlzT2b4JpRLRzVRZzU9KugOKzMZz5J";
const corsProxy = "https://cors-anywhere.herokuapp.com/";
const csvUrl = `${corsProxy}https://drive.google.com/uc?export=download&id=${fileId}`;

fetch(csvUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.text();
  })
  .then(csvData => {
    console.log(csvData);
  })
  .catch(error => {
    console.error('Error fetching the CSV file:', error);
  });


  // csv = //some csv data



  var data = d3.csvParse(csv);