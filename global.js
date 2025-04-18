console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// var navLinks = $$("nav a")

// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname,
//   );

// if (currentLink) {
// // or if (currentLink !== undefined)
// currentLink.classList.add('current');
// }
// // This is more flexible, as we can run any amount of code inside the if block, and we could even add an else block to run code when no link is found, if needed.
// // However, if all we need is to prevent errors, we can use the optional chaining operator, i.e. ?. instead of .:
// // currentLink?.classList.add('current');

// As we saw in the slides, there are many ways to design a data structure to hold the association of URLs (relative or absolute) and page titles. Let’s go with an array of objects
let pages = [
    { url: '', title: 'Home' },
    { url: './projects/', title: 'Projects' },
    { url: './resume/', title: 'Resume' },
    { url: './contact/', title: 'Contact' },
    { url: 'https://github.com/mlyang1', title: 'GitHub' }
    // add the rest of your pages here
  ];
// Then, create a new <nav> element (via document.createElement()) and add it inside <body> at the beginning (via element.prepend()).:
let nav = document.createElement('nav');
document.body.prepend(nav);
// Then we will use a for .. of loop to iterate over the pages on our site and add <a> elements in the <nav> for each of them. It will look like this:
for (let p of pages) {
    let url = p.url;
    let title = p.title;
    // next step: Create link and add it to nav
    // let’s detect whether we are running the site locally (on localhost) or on GitHub Pages,
    // and use that to adjust the base URL for all links.
    // We can do this by checking the current hostname and defining a constant BASE_PATH accordingly:
    // // The location.hostname property gives us the domain of the current page.
    // // If we’re working locally, it will be "localhost" or "127.0.0.1".
    // // If we’re on GitHub Pages, it will be something like "yourusername.github.io".
    const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
        ? "/"                  // Local server
        : "/website/";         // GitHub Pages repo name
    // // Then, when creating the links, we’ll check if the URL is relative (i.e. does not start with "http"),
    // // and if so, we’ll prefix it with the BASE_PATH. This ensures that all internal links work properly both locally and when deployed.
    // if (!url.startsWith('http')) {
    //     url = BASE_PATH + url;
    //   }
    // Alternatively, we can do it more concisely using a ternary operator:
    url = !url.startsWith('http') ? BASE_PATH + url : url;

    // Our automatically added navigation menu works, but is missing all the bells and whistles of our original one:
    // The current page is not highlighted anymore
    // The link to your GitHub profile does not have target="_blank" to make it open in a new tab.
    // How can we add those back?
    // Let’s switch to a different method of creating these links, that is more verbose, but gives us more flexibility. Instead of appending HTML strings, we will create element objects in JS and set their attributes in JS, via properties (or setAttribute() calls.
    // So, this line of JS:
    // nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
    // now becomes four lines:
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    nav.append(a);
    // We can just add a conditional to check if the link is to the current page using exactly the same check as Step 2.2 and add the class if so.
    // All we need is to compare a.host and a.pathname to location.host and location.pathname and then use a.classList.add() to add the class.
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }
    // You can even use a.className.toggle() to do the checking and the class adding in one (very long) line!
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname,
      );
    // Similarly, we can add target="_blank" to external links (such as the GitHub link) by setting a.target = "_blank" to those links for which a.host is not the same as location.host.
    // Just like class names, you can either use conditionals or do the checking and the attribute setting in one step, by using element.toggleAttribute().
    if (a.host !== location.host) {
        a.target = "_blank";
    }
};

document.body.insertAdjacentHTML(
    'afterbegin',
    `
        <label class="color-scheme">
            Theme:
            <select>
                <option value="light dark">Auto</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
            </select>
        </label>
    `,
);

const select = document.querySelector('select');

function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);

  }

select.addEventListener('input', function (event) {
    console.log('color scheme changed to', event.target.value);
    // Store the user's preference in localStorage
    localStorage.colorScheme = event.target.value;
    setColorScheme(localStorage.colorScheme);
});

// Check if the user has a stored preference
if ("colorScheme" in localStorage) {
    // Update the <select> element to match the stored preference
    setColorScheme(localStorage.colorScheme);
    select.value = localStorage.colorScheme
}



  
  
