import { works } from "./data/projects.js"; // portfolio data
import { dict } from "./data/dictionary.js";

let lang = "pt";

// setup observer for fade in ----------------------------------------------------------------------------------------------------------------

const observerOptions = {
  root: null, // use the viewport
  threshold: 0.2 // 20% of the element is visible
};

const observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible'); // Fade in
    //   observer.unobserve(entry.target);
    } else {
        entry.target.classList.remove('is-visible');
    }
  });
}, observerOptions);



function make(path){
    const app = document.querySelector('main');

    if (path === '/' || path === '/index.html'){
        // home (worklist) -------------------------------------------------------------------------------------------------

        let worksHtml = '';

        for (const key in works){

            const work = works[key];

            // ------------ make categories --------------

            let categoriesHtml = '';

            work.categories.forEach((categorie) => {
                categoriesHtml += `<li><button>${dict.categories[categorie][lang]}</button></li>`
            })

            // ------------ make work preview div--------------

            worksHtml += `
                <article class="project-preview fade-in-element">
                    <h2>${work.title}</h2>
                    <time datetime="${work.year}">${work.year}</time>
                    <a href="/${key}" aria-label="View project: ${work.title}">
                        <video
                            ${work.preview_video ? `src="${work.preview_video}"` : ''}
                            poster="${work.preview_thumb}"
                            muted
                            loop
                            playsinline
                            preload="metadata">
                        </video>
                    </a>
                    <ul aria-label="Categories">
                        ${categoriesHtml}
                    </ul>
                </article>
            `
        }



        // UPDATE DOM
        app.innerHTML = worksHtml;
        
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
            });

            // Pause video
            video.addEventListener('mouseleave', () => {
                video.pause(); 
                // video.currentTime = 0; Optional: Resets video to start
            });
        });

        // UPDATE META
        document.title = 'miglito archive';

    } else {

        // project page ----------------------------------------------------------------------------------------------------

        const key = path.slice(1); // extract key from path '/my-project' -> 'my-project'
        const work = works[key];   // get work from works object using key

        // ------------ make categories --------------

        let categoriesHtml = '';

        work.categories.forEach((categorie) => {
            categoriesHtml += `<li><button>${dict.categories[categorie][lang]}</button></li>`
        })

        // -------------- make credits ------------

        let creditsHtml = '<dl><section aria-label="Credits">';

        if (work.credits) {
            for (const role in work.credits) {
                let contributorsHtml = '';

                work.credits[role].forEach((contributor) => {
                    contributorsHtml += `
                    <dd>${contributor}</dd>`;
                })

                creditsHtml += `
                    <dt>${dict.roles[role][lang]}</dt>
                    ${contributorsHtml}
                    
                    `;

            }

            creditsHtml += `</dl></section>`
        }
        
        // UPDATE DOM
        app.innerHTML = `
            <article id="project-content">
                <h2>${work.title}</h2>
                <time datetime="${work.year}">${work.year}</time>
                <video
                    ${work.preview_video ? `src="${work.preview_video}"` : ''}
                    poster="${work.preview_thumb}"
                    muted
                    loop
                    playsinline
                    preload="metadata">
                </video>
                <ul>
                    ${categoriesHtml}
                </ul>
                ${creditsHtml}
            </article>
        `;

        document.title = `${work.title} | miglito archive`;

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