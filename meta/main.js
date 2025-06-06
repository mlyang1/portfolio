import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let xScale;
let yScale;

async function loadData() {
    const data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));
    // // Log to console for Debugging!
    // console.log(data);
    return data;
};

function processCommits(data) {
    // Outputs a commits array where each object contains:
    // * Basic commit information (id, author, timestamps)
    // * Derived information (URL, hour fraction, total lines)
    // * Hidden access to the original line data

    return d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        // Each 'lines' array contains all lines modified in this commit
        // All lines in a commit have the same author, date, etc.
        // Get this info from the first line
        let first = lines[0];
         // Use object destructuring to get these properties
        let { author, date, time, timezone, datetime } = first;

        let ret = {// Return what info about this commit?
            id: commit,
            url: 'https://github.com/mlyang1/portfolio/commit/' + commit,
            author,
            date,
            time,
            timezone,
            datetime,
            // Calculate hour as a decimal for time analysis (e.g., 2:30 PM = 14.5)
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            // How many lines were modified?
            totalLines: lines.length,
          };

        Object.defineProperty(ret, 'lines', {
            value: lines,
            // What other options do we need to set?
            // Hint: look up configurable, writable, and enumerable
            configurable: false,
            enumerable: false,
            writable: false,
        });

        return ret;
      });
};

let data = await loadData();
let commits = processCommits(data);
// // Print out to see what it looks like!
// console.log(commits);



const fileLengths = d3.rollups(
    data,
    (v) => d3.max(v, (v) => v.line),
    (d) => d.file,
  );
const averageFileLength = d3.mean(fileLengths, (d) => d[1]);
const workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' }),
  );
const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];

function renderScatterPlot(commits) {
    const width = 1000;
    const height = 600;

    xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([0, width])
        .nice();
      
    yScale = d3
        .scaleLinear()
        .domain([0, 24]) // [0, 24]
        .range([height, 0])
        .nice();

    const svg = d3
        .select('#chart')
        .append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('overflow', 'visible');

    createBrushSelector(svg);

    // Adding axes

    const margin = { top: 10, right: 10, bottom: 30, left: 20 };

    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
      };
      
    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);

    // Add gridlines BEFORE the axes
    const gridlines = svg
        .append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`);
    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3
        .axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
        // What is this function doing? Let’s break it down:
        // * d % 24 uses the remainder operator to get 0 instead of 24 for midnight
        // * String(d % 24) converts the number to a string
        // * string.padStart() formats it as a two digit number 
        // * Finally, we append ":00" to make it look like a time.

    // Add X axis
    svg
    .append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

    // Add Y axis
    svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

    // Calculate the range of edited lines across all commits. 
    // This needs to be done before adding the r attribute to dots:
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3
        // // The linear scale has a problem: 
        // // since circle area grows with the square of radius, the visual difference between commits is exaggerated. 
        // // A commit with twice the edits appears four times larger!
        // // Replace the linear scale with a square root scale to correct this:
        // .scaleLinear()
        .scaleSqrt()
        .domain([minLines, maxLines])
        .range([2, 30]); 
    // adjust these values based on your experimentation

    // Sort commits by size (total lines) in descending order before rendering
    // Because when dots overlap, smaller ones can be hard to interact with if they’re underneath larger ones
    // The negative sign in the sort function (-d.totalLines) creates descending order, ensuring larger dots are rendered first and smaller dots are drawn on top.
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    
    // Drawing the dots
    const dots = svg.append('g').attr('class', 'dots');
    dots
        .selectAll('circle')
        .data(sortedCommits) // Use sortedCommits in your selection instead of commits
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('fill', 'steelblue')
        .attr('r', (d) => rScale(d.totalLines))
        .style('fill-opacity', 0.7) // Add transparency for overlapping dots
        .on('mouseenter', (event, commit) => {
            renderTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);
        })
        .on('mouseleave', () => {
            // Hide the tooltip
            updateTooltipVisibility(false);
        });
};

function renderTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
  };

function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  };
  
function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  };


// Brushing
  
function createBrushSelector(svg) {
    // Create brush
    svg.call(d3.brush().on('start brush end', brushed));

    // Raise dots and everything after overlay
    svg.selectAll('.dots, .overlay ~ *').raise(); 
    // That’s a funny looking selector, isn’t it? 
    // The ~ is the CSS subsequent sibling combinator
    // it selects elements that come after the selector that precedes it (and share the same parent).

};

// So far we can draw a selection, but it neither does anything, nor does it look like it does anything.
// d3.brush() returns a brush object that fires events when the brush is moved. 
function brushed(event) {
    const selection = event.selection;
    d3.selectAll('circle').classed('selected', (d) =>
        isCommitSelected(selection, d),
    );
    renderSelectionCount(selection); // Update the selection count
    renderLanguageBreakdown(selection); // Update the language breakdown
};

function isCommitSelected(selection, commit) {
    if (!selection) {
        return false;
    }
    // return true if commit is within brushSelection
    // and false if not
    const [x0, x1] = selection.map((d) => d[0]);
    const [y0, y1] = selection.map((d) => d[1]);
    const x = xScale(commit.datetime);
    const y = yScale(commit.hourFrac);
    return x >= x0 && x <= x1 && y >= y0 && y <= y1;
};

function renderSelectionCount(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
  
    const countElement = document.querySelector('#selection-count');
    countElement.textContent = `${
      selectedCommits.length || 'No'
    } commits selected`;
  
    return selectedCommits;
  };
  
// Display stats about languages in the selected commits:
function renderLanguageBreakdown(selection) {
    const selectedCommits = selection
      ? commits.filter((d) => isCommitSelected(selection, d))
      : [];
    const container = document.getElementById('language-breakdown');
  
    if (selectedCommits.length === 0) {
      container.innerHTML = '';
      return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);
  
    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
      lines,
      (v) => v.length,
      (d) => d.type,
    );
  
    // Update DOM with breakdown
    container.innerHTML = '';
  
    for (const [language, count] of breakdown) {
      const proportion = count / lines.length;
      const formatted = d3.format('.1~%')(proportion);
  
      container.innerHTML += `
              <dt>${language}</dt>
              <dd>${count} lines (${formatted})</dd>
          `;
    }
};
  
renderScatterPlot(commits);