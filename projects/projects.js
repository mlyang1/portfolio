// import the required functions that will allow us to fetch and display the projects on your projects page.
import { fetchJSON, renderProjects } from '../global.js';
//Use the fetchJSON function to load the project data from a JSON file. 
//This code assumes your projects.json file is located in a lib folder relative to the current file.
let projects = await fetchJSON('../lib/projects.json');
//Select the container where you want to render the project articles. Use the following snippet:
//Ensure your HTML includes a container with the class projects.
const projectsContainer = document.querySelector('.projects');
//Call the renderProjects function to dynamically display the fetched projects:
//This code will render each project with an <h2> heading level.
renderProjects(projects, projectsContainer, 'h3');

// CHECK YOUR UNDERSTANDING
// Identify a URL pointing to your projects.json file (ie: ../lib/projects.json) and make sure the file exists in your project structure.
// What happens if the projects.json file is missing or incorrectly formatted?
// How does the renderProjects function handle an empty array of projects? Can you enhance it to display a placeholder message in this case?

import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';


// let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// let arc = arcGenerator({
//     startAngle: 0,
//     endAngle: 2 * Math.PI,
// });
// d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

// // let data = [1, 2];
// // let total = 0;
// // for (let d of data) {
// // total += d;
// // }
// // let angle = 0;
// // let arcData = [];
// // for (let d of data) {
// // let endAngle = angle + (d / total) * 2 * Math.PI;
// // arcData.push({ startAngle: angle, endAngle });
// // angle = endAngle;
// // }
// // let arcs = arcData.map((d) => arcGenerator(d));

// // let data = [1, 2, 3, 4, 5, 5];
// // let sliceGenerator = d3.pie();
// // let data = [
// //     { value: 1, label: 'apples' },
// //     { value: 2, label: 'oranges' },
// //     { value: 3, label: 'mangos' },
// //     { value: 4, label: 'pears' },
// //     { value: 5, label: 'limes' },
// //     { value: 5, label: 'cherries' },
// //   ];
// // let sliceGenerator = d3.pie().value((d) => d.value);
// // let arcData = sliceGenerator(data);
// // let arcs = arcData.map((d) => arcGenerator(d));

// let rolledData = d3.rollups(
//   projects,
//   (v) => v.length,
//   (d) => d.year,
// );

// console.log(rolledData);

// let data = rolledData.map(([year, count]) => {
//     return { value: count, label: year };
// });
// console.log(data);

// // let colors = ['gold', 'purple'];
// let colors = d3.scaleOrdinal(d3.schemeTableau10);


// let sliceGenerator = d3.pie().value((d) => d.value);
// let arcData = sliceGenerator(data);
// let arcs = arcData.map((d) => arcGenerator(d));


// arcs.forEach((arc, idx) => {
//     d3.select('svg')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill', colors(idx)) // Fill in the attribute for fill color via indexing the colors variable
// });

// let legend = d3.select('.legend');
// data.forEach((d, idx) => {
//   legend
//     .append('li')
//     .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
//     .attr('class', 'legend-item')
//     .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`); // set the inner html of <li>
    
// });

// let query = '';
// let searchInput = document.querySelector('.searchBar');
// searchInput.addEventListener('change', (event) => {
//   // update query value
//   query = event.target.value;
//   // filter the projects
//   let filteredProjects = projects.filter((project) => {
//     let values = Object.values(project).join('\n').toLowerCase();
//     return values.includes(query.toLowerCase());
//   });
//   // render updated projects!
//   renderProjects(filteredProjects, projectsContainer, 'h2');
// });

///////
///////
///////

let colors = d3.scaleOrdinal(d3.schemeTableau10);

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let arc = arcGenerator({
    startAngle: 0,
    endAngle: 2 * Math.PI,
});
d3.select('svg').append('path').attr('d', arc).attr('fill', 'red');

let selectedIndex = -1;

// Refactor all plotting into one function
function renderPieChart(projectsGiven) {

    // clear up paths and legends
    // Clear the SVG and legend
    d3.select('svg')
        .selectAll('path').remove();

    d3.select('.legend')
        .selectAll('li').remove();


    // re-calculate rolled data
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year,
    );
    // re-calculate data
    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });
    // re-calculate slice generator, arc data, arc, etc.
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));
    
    // update paths and legends, refer to steps 1.4 and 2.2
    newArcs.forEach((arc, i) => {
        d3.select('svg')
        .append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .on('click', () => {
           selectedIndex = selectedIndex === i? -1 : i;
    
           d3.select('svg')
           .selectAll('path')
           .attr('class', (_, idx) => (
              idx === selectedIndex?'selected' : null
            ));
    
           d3.select('.legend')
           .selectAll('legend-item')
           .attr('class', (_, idx) => (
              idx === selectedIndex?'selected' : null
            ));
    
           if (selectedIndex === -1) {
             renderProjects(projects, projectsContainer, 'h2');
           } else {
             let selectedYear = newData[selectedIndex].label;
             let filteredProjects = projects.filter((project) => project.year === selectedYear);
             renderProjects(filteredProjects, projectsContainer, 'h2');
           }
         });
      });
    
      newData.forEach((d, i) => {
        d3.select('.legend')
            .append('li')
            .attr('style', `--color:${colors(i)}`)
            .attr('class', 'legend-item')
            .html(() => {
                return `<span class="swatch"></span>${d.label}`;
            });
      });

}
  
// Call this function on page load
renderPieChart(projects);
  
let query = '';
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('change', (event) => {
    // update query value
    query = event.target.value;
    // filter the projects
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });
    // re-render legends and pie chart when event triggers
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
  });
  
// let query = '';
// let searchInput = document.querySelector('.searchBar');
// searchInput.addEventListener('change', (event) => {
//   // update query value
//   query = event.target.value;
//   // filter the projects
//   let filteredProjects = projects.filter((project) => {
//     let values = Object.values(project).join('\n').toLowerCase();
//     return values.includes(query.toLowerCase());
//   });
//   // render updated projects!
//   renderProjects(filteredProjects, projectsContainer, 'h2');
// });

