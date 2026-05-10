import { works } from "./data/projects.js"; // portfolio data
import { dict } from "./data/dictionary.js";

let lang = "pt";


// setup observer for fade in ----------------------------------------------------------------------------------------------------------------

// const observerOptions = {
//   root: null, // use the viewport
//   threshold: 0.2 // 20% of the element is visible
// };

// const observer = new IntersectionObserver((entries, observer) => {
//   entries.forEach(entry => {
//     if (entry.isIntersecting) {
//       entry.target.classList.add('is-visible'); // Fade in
//     //   observer.unobserve(entry.target);
//     } else {
//         entry.target.classList.remove('is-visible');
//     }
//   });
// }, observerOptions);

// play on hover and apply observer ---------------------------------------------------------------------------------------------------------

// const allWorkDivs = document.querySelectorAll('#work-container div');

// allWorkDivs.forEach(el => {

//     observer.observe(el);
//     let video = el.querySelector("video");

//     // Play video
//     video.addEventListener('mouseenter', () => {
//         video.play().catch(err => {
//             console.log("Playback interrupted");
//             console.log(err);
//         });
//     });

//     // Pause video
//     video.addEventListener('mouseleave', () => {
//         video.pause(); 
//         // video.currentTime = 0; Optional: Resets video to start
//     });
// });


// keyboard input ----------------------------------------------------------------------------------------------------------------------------
// document.addEventListener('keydown', (event) => {
//   console.log(`Key pressed: ${event.key}`);

//   if (event.key === 'Alt') {
//     console.log('User pressed the Alt key!');
//   }
// });



function navigate(path){
    history.pushState({}, '', path);
    make(path);
}



function make(path){
    const app = document.querySelector('main');

    if (path === '/' || path === '/index.html'){
        // filling the app container with work!! ---------------------------------------------------------------------------------------------------

        let worksHtml = '';

        for (const key in works){

            const work = works[key];

            let categoriesHtml = '';

            work.categories.forEach((categorie) => {
                categoriesHtml += `<li><button>${dict.categories[categorie][lang]}</button></li>`
            })


            worksHtml += `
                <div class="work-preview">
                    <h2>${work.title}</h2>
                    <time datetime="${work.year}">${work.year}</time>
                    <a href="/${key}">
                        <video
                            ${work.preview_video ? `src="${work.preview_video}"` : ''}
                            poster="${work.preview_thumb}"
                            muted
                            loop
                            playsinline
                            preload="metadata">
                        </video>
                    </a>
                    <ul>
                        ${categoriesHtml}
                    </ul>
                </div>
            `
        }

        app.innerHTML = worksHtml;
    } else {

        // crate project page ---------------------------------------------------------------------------------------------

        const key = path.slice(1); // extract key from path '/my-project' -> 'my-project'
        const work = works[key];   // get work from works object using key

        // ------------ make categories --------------

        let categoriesHtml = '';

        work.categories.forEach((categorie) => {
            categoriesHtml += `<li><button>${dict.categories[categorie][lang]}</button></li>`
        })

        // -------------- make credits ------------

        let creditsHtml = '';

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

        app.innerHTML = `
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
            <dl>
                ${creditsHtml}
            </dl>
        `; // or renderProject(key)
    }
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
    navigate(href);
  }
});

// on first load
make(location.pathname);