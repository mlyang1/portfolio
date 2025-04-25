// import the fetchJSON and renderProjects functions from your global.js file:
import { fetchJSON, renderProjects, fetchGitHubData} from './global.js';
//Use the fetchJSON function to load all project data, then filter the first three projects for display:
// (This code assumes your projects.json file is located in a lib folder relative to the index.js file.)
const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 3);
// Identify the container where the latest projects will be displayed. Use the following code:
const projectsContainer = document.querySelector('.projects');
// Use the renderProjects function to dynamically display the filtered projects:
renderProjects(latestProjects, projectsContainer, 'h3');


const githubData = await fetchGitHubData('mlyang1');
const profileStats = document.querySelector('#profile-stats');
if (profileStats) {
    profileStats.innerHTML = `
          <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
          </dl>
      `;
  }
  
