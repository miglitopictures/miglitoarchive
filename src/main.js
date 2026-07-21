// import data
import { works } from "../data/projects.js";
import { dict } from "../data/dictionary.js";
// import functionality
import { makeDraggable } from "./draggable.js";

// setup language NOTE
let lang = "en";

//setup title randomization
const titleElement = document.getElementById("site-title");
const titleIndex = Math.floor(Math.random() * dict.titles.length);
const titleText = dict.titles[titleIndex][lang] ? dict.titles[titleIndex][lang] : dict.titles[titleIndex]["en"];

titleElement.textContent = titleText;
titleElement.addEventListener('mouseenter', () => {
    titleElement.textContent = 'miglito archive'
});
titleElement.addEventListener('mouseleave', () => {
    titleElement.textContent = titleText;
});

// setup draggable elements


// setup observer for fade in
const observerOptions = {
  root: null, // use the viewport
  threshold: 0.2 // 20% of the element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    } else {
        entry.target.classList.remove('is-visible');
    }
  });
}, observerOptions);


// HTML generators
function ProjectlHtml(project){
    
    //  make categories

    let categoriesHtml = '';

    project.categories.forEach((categorie) => {
        categoriesHtml += `<li><button>${dict.categories[categorie][lang]}</button></li>`
    });

    // make credits 

    let creditsHtml = '';

    if (project.credits) {
        creditsHtml += '<dl><section aria-label="Credits">';


        for (const role in project.credits) {
            let contributorsHtml = '';

            project.credits[role].forEach((contributor) => {
                contributorsHtml += `
                <dd>${contributor}</dd>`;
            });

            creditsHtml += `
                <dt>${dict.roles[role] ? dict.roles[role][lang] : role}</dt>
                ${contributorsHtml}
                
                `;

        }

        creditsHtml += `</dl></section>`;
    }

     // make content 

    let contentHtml = '';

    if (project.content){

        for (const content of project.content){
            switch (content.type){
                case "image":
                    contentHtml += `<img src="${content.url}"/>`;
                    break;
                default:
                    break;
            }
        }
    }

     // make awards

    let awardsHtml = '';

    if (project.awards){
        awardsHtml += '<section aria-label="Awards"><ul>'
        for (const award of project.awards){
            awardsHtml += `
                <li>${award.name}</li>
            `
        }
        awardsHtml += '</ul></section>'
    }




    const projectHtml = `
        <article id="project-content">
            <h2>${project.title}${project.awards ? '*' : ''}</h2>
            <time datetime="${project.year}">${project.year}</time>
            <video
                ${project.preview_video ? `src="${project.preview_video}"` : ''}
                poster="${project.preview_thumb}"
                muted
                loop
                playsinline
                preload="metadata">
            </video>
            <ul>
                ${categoriesHtml}
            </ul>
            ${contentHtml}
            ${awardsHtml}
            ${creditsHtml}
        </article>
    `;

    return projectHtml;
}

function ProjectListHtml(projects){
    let projectListHtml = '';
    for (const key in projects){

            const work = projects[key];

            // make categories

            let categoriesHtml = '';

            work.categories.forEach((categorie) => {
                categoriesHtml += `<li><button>${dict.categories[categorie][lang]}</button></li>`
            })

            //  make work preview div

            projectListHtml += `
                <article class="project-preview fade-in-element ${work.awards ? 'awarded' : ''}">
                    <h2>${work.title}${work.awards ? '*' : ''}</h2>
                    <time datetime="${work.year}">${work.year}</time>
                    <ul aria-label="Categories">
                        ${categoriesHtml}
                    </ul>
                    <a href="/${key}" aria-label="View project: ${work.title}">
                        <video
                            ${work.preview_video ? `src="${work.preview_video}"` : ''}
                            aria-label="${work.preview_alt}"
                            poster="${work.preview_thumb}"
                            muted
                            loop
                            playsinline
                            preload="metadata">
                        </video>
                    </a>
                </article>
            `
        }
    return projectListHtml;
}

function make(path){
    const app = document.querySelector('#maincontent');
    const sidepanel = document.querySelector('#sidepanel');
    const sidepanelImage = sidepanel.querySelector('img');
    const sidepanelText = sidepanel.querySelector('p');

    

    if (path === '/' || path === '/index.html'){
        // home (worklist) ------------------------------------------------------------------------------------------------

        // UPDATE DOM
        sidepanelText.innerHTML = dict.content.homepage[lang]
        app.innerHTML = ProjectListHtml(works);
        
        // PLAY ON HOVER
        const workPreviewDivs = document.querySelectorAll('.project-preview');

        // ---------------- observe and play on over ----------------
        workPreviewDivs.forEach(el => {

            observer.observe(el);
            let video = el.querySelector("video");

            // Play video
            video.addEventListener('mouseenter', () => {
                video.play().catch(err => {
                    console.log("Playback interrupted");
                    console.log(err);
                });
                sidepanelImage.src = video.poster;
                sidepanelImage.classList.remove('hidden');
                sidepanelText.classList.add('hidden');

            });

            // Pause video
            video.addEventListener('mouseleave', () => {
                video.pause();
                sidepanelImage.src = '';
                sidepanelImage.classList.add('hidden');
                sidepanelText.classList.remove('hidden');
                

                // video.currentTime = 0;
            });
        });        

        // UPDATE META
        document.title = titleText;

    } else {



        // project page ----------------------------------------------------------------------------------------------------

        const key = path.slice(1); // extract key from path '/my-project' -> 'my-project'
        const work = works[key];   // get work from works object using key
        
        // UPDATE DOM
        app.innerHTML = ProjectlHtml(work);
        // UPDATE META
        sidepanelImage.classList.add('hidden');
        sidepanelText.classList.remove('hidden');
        if (work.about){
            sidepanelText.innerHTML = work.about;
        }
        

        document.title = `${work.title} | ${titleText}`;

    }
    
    window.scrollTo(0, 0);

}

// handle back/forward buttons
window.addEventListener('popstate', () => make(location.pathname));

// intercept link clicks so they don't do full page reloads
document.addEventListener('click', (e) => {

  const link = e.target.closest('a[href]');

  if (!link) return;

  const href = link.getAttribute('href');
  if (href.startsWith('/')) {
    e.preventDefault();

    {   // navigate: separate in function navigate(path), if necessary.
        history.pushState({}, '', href);
        make(href);
    }
  }
});

make(location.pathname);