// import data
import { works } from "../data/projects.js";
import { dict } from "../data/dictionary.js";
// import functionality
import { makeDraggable } from "./draggable.js";


// sidepannel sketched and entries
let currentSketch = null;
let currentEntries = [];
let currentIndex = 0;

// setup language NOTE
let lang = "en";

// setup flipping
const flipButton = document.querySelector('#flip-layout');

// restore preference on load
if (localStorage.getItem('layoutFlipped') === 'true') {
    document.body.classList.add('flipped');
}

flipButton.addEventListener('click', () => {
    document.body.classList.toggle('flipped');
    localStorage.setItem('layoutFlipped', document.body.classList.contains('flipped'));
});

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

    let aboutHtml = ''; // mobile only

    if (project.sidepanel) {
        aboutHtml = MobileSidepanelHtml(project.sidepanel);
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
            ${aboutHtml}
            ${awardsHtml}
            ${creditsHtml}
        </article>
    `;

    return projectHtml;
}

function ProjectListHtml(projects){
    let projectListHtml = '';

    projectListHtml += `<p class="mobileOnly">${dict.content.homepage[lang]}</p>`

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

function MobileSidepanelHtml(entries){
    let html = '';

    entries.forEach((entry) => {
        switch (entry.type) {
            case 'about':
                html += `<p class="mobileOnly">${entry.text[lang]}</p>`
                break;
            case 'p5':
                const message = entry.mobileMessage ? entry.mobileMessage[lang] :  dict.content["sketch-mobile-fallback"][lang];
                html += `<p class="mobileOnly sketch-mobile-note">${message}</p>`
                break;
        }
    })

    return html;
}

function makeSidepanelNav(entries, index){
    // pega o nav do painel
    const spNav = document.querySelector('.sidepanel-nav');
    // se nao tem multiplos entries (paginas em sidepanel), nao temos nav. return!
    if (entries.length <= 1) {
        spNav.innerHTML = '';
        return;
    }

    let dotsHtml = '';
    entries.map( (_, i) => {
        dotsHtml += `
            <span class="sp-dot ${i == index ? 'active' : ''}"></span>
        `;
    });

    spNav.innerHTML = `
        <button class="sp-prev" aria-label="Previous">&lt</button>
        <div class="sp-dots">${dotsHtml}</div>
        <button class="sp-next" aria-label="Next">&gt</button>
    `

    spNav.querySelector('.sp-prev').onclick = (e) => {
        currentIndex = (index - 1 + entries.length) % entries.length;
        makeSidepanelPage(entries, currentIndex);
        // e.stopPropagation();
    }

    spNav.querySelector('.sp-next').onclick = (e) => {
        currentIndex = (index + 1) % entries.length;
        makeSidepanelPage(entries, currentIndex);
        // e.stopPropagation();
    }
}

function makeSidepanelPage(entries, index){
    // se um sketch ja estiver carregado: limpamos
    if (currentSketch) {
        currentSketch.remove(); // unmount p5 sketch (p5 instance method)
        currentSketch = null; // limpar para proxima vez
    }


    // get the sidepannel viewport element and clean it
    const spViewport = document.querySelector('.sidepanel-viewport');
    spViewport.innerHTML = '';

    // current sidepannel entry --------
    const entry = entries[index];

    switch (entry.type) {
        case 'about':
            const p = document.createElement('p');
            p.innerHTML = entry.text[lang];
            spViewport.appendChild(p);
            p.scrollTop = 0;     // new — see note below
            break;
        case 'p5':
            const container = document.createElement('div');
            container.className = 'sketch-container';
            spViewport.appendChild(container);
            
            // carrega sketch
            import(entry.src).then(({ default: sketch }) => {
                currentSketch = new p5(sketch, container);
            });

            break;
    }

    makeSidepanelNav(entries, index);
}


function make(path){
    const maincontent = document.querySelector('#maincontent');
    const sidepanel = document.querySelector('#sidepanel');
    const sidepanelViewport = sidepanel.querySelector('.sidepanel-viewport');
    const sidepanelImage = sidepanel.querySelector('.sidepanel-hover-image');

    

    if (path === '/' || path === '/index.html'){
        // home (worklist) ------------------------------------------------------------------------------------------------

        // homepage sidepannel
        currentEntries = [{ type: 'about', text: dict.content.homepage }];
        currentIndex = 0;
        makeSidepanelPage(currentEntries, 0);

        // homepage maincontent
        maincontent.innerHTML = ProjectListHtml(works);

        maincontent.scrollTop = 0;   // new
        
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
                sidepanelViewport.classList.add('hidden');

            });

            // Pause video
            video.addEventListener('mouseleave', () => {
                video.pause();
                sidepanelImage.src = '';
                sidepanelImage.classList.add('hidden');
                sidepanelViewport.classList.remove('hidden');
                

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
        maincontent.innerHTML = ProjectlHtml(work);
        // UPDATE META

        if (work.sidepanel){
            currentEntries = work.sidepanel;
            currentIndex = 0;
            makeSidepanelPage(currentEntries, 0);
        }
        

        sidepanelImage.classList.add('hidden');
        sidepanelViewport.classList.remove('hidden');
        

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