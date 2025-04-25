// import the required functions that will allow us to fetch and display the projects on your projects page.
import { fetchJSON, renderProjects } from '../global.js';
//Use the fetchJSON function to load the project data from a JSON file. 
//This code assumes your projects.json file is located in a lib folder relative to the current file.
const projects = await fetchJSON('../lib/projects.json');
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


  