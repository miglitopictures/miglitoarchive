import { works } from "./data/projects.js"; // portfolio data
import { dict } from "./data/dictionary.js";

let lang = "pt";



// filling the work container with work!! ---------------------------------------------------------------------------------------------------
const container = document.getElementById("work-container");

let worksHtml = '';

for (const key in works){

    const work = works[key];

    let categoriesHtlm = '';

    work.categories.forEach((categorie) => {
        categoriesHtlm += `<li><button>${dict.categories[categorie][lang]}</button></li>`
    })


    worksHtml += `
        <div class="fade-in-element">
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
                ${categoriesHtlm}
            </ul>
        </div>
    `
}

container.innerHTML = worksHtml;



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

// play on hover and apply observer ---------------------------------------------------------------------------------------------------------

const allWorkDivs = document.querySelectorAll('#work-container div');

allWorkDivs.forEach(el => {

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


// keyboard input ----------------------------------------------------------------------------------------------------------------------------
// document.addEventListener('keydown', (event) => {
//   console.log(`Key pressed: ${event.key}`);

//   if (event.key === 'Alt') {
//     console.log('User pressed the Alt key!');
//   }
// });