import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7/+esm';

let selectedChoices = [];
let possibleChoices = {"What is your age?": ["< 18", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
   "What did you eat yesterday?": ["Breakfast", "Lunch", "Dinner", "Snacks", "All of the above"],
   "what is your sex":["male","female","other"]};
// may need better questions :(


/* 
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



 */

d3.csv("/data/bio_mutated.csv").then(data => {
  console.log(data);
});



// blur the background but retain the reruning of a visualisation per choice

dots
  .selectAll('circle')
  .data(sortedCommits)
  .join('circle')
  .attr('cx', (d) => xScale(d.datetime))
  .attr('cy', (d) => yScale(d.hourFrac))
  .attr('r', (d) => rScale(d.totalLines))
  .attr('fill', 'steelblue')
      .style('fill-opacity', 0.7)



document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  if (form) {
    const inputs = form.querySelectorAll('input');
    // TODO figure what the next "input" would be in this case such i want the whole form and question to change
    if (inputs.length > 1) { //(inputs == possiblechoices[0])?
      inputs[1].addEventListener('input', (event) => {
        console.log('Next input value:', event.target.value);
      });
    }
  }
});


