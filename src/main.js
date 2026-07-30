// Import Data
import { works } from "../data/projects.js";
import { dict } from "../data/dictionary.js";
// Import Functionality
//import { makeDraggable } from "./draggable.js"; // i probably wont need that

//* Filter Buffer :O
let currentFilter = '';

//* Sidepanel Sketch and Entries
let currentSketch = null;
let currentEntries = [];
let currentIndex = 0;

//* Setup Language Functionality
let lang = localStorage.getItem('lang') || "en"; // set to last selected

function setLang(selectedLang){
    if (lang != selectedLang) {
        lang = selectedLang;
        localStorage.setItem('lang', selectedLang);
        make(location.pathname);
    }
}

//* Setup Flipping
const flipButton = document.getElementById('flip-layout');
// restore preference on load
// if (localStorage.getItem('layoutFlipped') === 'true') {
//     document.body.classList.add('flipped');
// }
flipButton.addEventListener('click', () => {
    document.body.classList.toggle('flipped');
    // localStorage.setItem('layoutFlipped', document.body.classList.contains('flipped'));
});

//* Setup Title Randomization and Hover Effect
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

//* Setup Hamburguer Menu
const hambMenuButton = document.getElementById('hamb-menu-bt')

hambMenuButton.addEventListener('click',() => {
    let hambMenu = document.getElementById('hamb-menu')
    if (hambMenu) {
        hambMenu.classList.toggle('hamb-open')
        hambMenuButton.classList.toggle('hamb-open')
    }
})




window.setLang = setLang;


//* HTML generators //
// Here i use Pascal casing for HTML generators, with the 'l' prefix for local generators.
// e.g.
// global generators: HomepageHtml(), ReusableNavHtml().
// local generators: lCreditsHtml(), l

/** Returns the hamburguer menu HTML, used in every path.*/
function HamburguerMenuHtml() {
    return `
        <ul id="hamb-menu" class="mobileOnly">
            <li class='bt-curriculum'>
                <a href="./assets/miguelduarte-resume.pdf">${dict.content["cv-download"][lang]}</a>
            </li>
            <li>
                <a href="./assets/miguelduarte-resume.pdf">${dict.content["cv-download"][lang]}</a>
            </li>
            <li class="bt-lang">
                <button data-lang="pt" class="${lang == 'pt' ? 'active' : ''}" onclick="setLang('pt')">PT</button><button data-lang="en" class="${lang == 'en' ? 'active' : ''}" onclick="setLang('en')">EN</button>
            </li>
        </ul>
    `
}

/** Returns the categorie list HTML, used in ProjectHeaderHtml. 
 * @param {*} project - a single project from the works object (projects.js)
*/
function CategoriesHtml(project){
    let categoriesHtml = '<ul class="categories-list" aria-label="Categories">';

    project.categories.forEach((categorie) => {
        categoriesHtml += `<li><button data-cat="${categorie}" class="filter-button ${categorie == currentFilter ? 'active': ''}">${dict.categories[categorie][lang]}</button></li>`
    });

    categoriesHtml += '</ul>';

    return categoriesHtml;
}

/** Returns the header HTML for the project, used in home (Project List) and project page. 
 * @param project - a single project from the works object (projects.js)
*/
function ProjectHeaderHtml(project){

    let headerHtml = `
            <hgroup class="project-heading">
                <h2>${project.title}</h2>
                <time datetime="${project.year}">${project.year}</time>
            </hgroup>
            ${CategoriesHtml(project)}`;

    return headerHtml;
}

/** Returns the detailed project HTML for the project page. 
 * @param {*} project - a single project from the works object (projects.js)
*/
function ProjectlHtml(project){

    function lContentHtml(project){
        if (!project.content) return '';

        let contentHtml = '';

        for (const content of project.content){
            switch (content.type){
                case "image":
                    contentHtml += `<img src="${content.url}"/>`;
                    break;
                case "video":
                    contentHtml += `<video src="${content.url}" loop
                playsinline autoplay></video>`;
                    break;
            }
        }

        return contentHtml;
    }

    function lCreditsHtml(project){
        if (!project.credits) return '';
        let creditsHtml = '<dl>';
        for (const role in project.credits) {
            let contributorsHtml = '';
            project.credits[role].forEach((contributor) => {
                contributorsHtml += `<dd>${contributor}</dd>`;
            });
            creditsHtml += `
                <div>
                    <dt>${dict.roles[role] ? dict.roles[role][lang] : role}</dt>
                    ${contributorsHtml}
                </div>`;

        }
        creditsHtml += `</dl>`;
        return creditsHtml;
    }

    function lAwardsHtml(project){
        if (!project.awards) return '';
        let awardsHtml = '<ul class="awards" aria-label="Awards">';
        for (const award of project.awards){
            awardsHtml += `
                <li>
                    <hgroup>
                        <h3>${award.name}</h3>
                        <time datetime="${award.year}">${award.year}</time>
                    </hgroup>
                    <p>prize: ${award.prize}</p>
                    <p>${award.categorie ? 'categorie: ' + award.categorie : ''}</p>
                </li>
            `
        }
        awardsHtml += '</ul>'
        return awardsHtml;
    }

    function lMobileSidepanelFallbackHtml(project){
        if (!project.sidepanel) return '';
        let sidepanelFallbackHtml = '';

        project.sidepanel.forEach((entry) => {
            switch (entry.type) {
                case 'about':
                    sidepanelFallbackHtml += `<p class="mobileOnly mobile-note">${entry.text[lang]}</p>`
                    break;
                case 'p5':
                    const message = entry.mobileMessage ? entry.mobileMessage[lang] :  dict.content["sketch-mobile-fallback"][lang];
                    sidepanelFallbackHtml += `<p class="mobileOnly sketch-mobile-note">${message} 🖳</p>`
                    break;
            }
        })
        return sidepanelFallbackHtml;
    }


    const projectHtml = `
        ${HamburguerMenuHtml()}
        <article id="project-content">
            ${ProjectHeaderHtml(project)}
            <video
                ${project.preview_video ? `src="${project.preview_video}"` : ''}
                poster="${project.preview_thumb}"
                muted
                loop
                playsinline
                preload="metadata">
            </video>
            ${lContentHtml(project)}
            ${lMobileSidepanelFallbackHtml(project)}
            ${lAwardsHtml(project)}
            ${lCreditsHtml(project)}
        </article>
    `;

    return projectHtml;
}

/** Returns the detailed project list HTML for the homepage. 
 * @param {*} project - a single project from the works object (projects.js)
*/
function ProjectListHtml(projects){

    function lMobileAboutFallbackHtml(){
        
        const fullParagraph = dict.content.homepage[lang];
        let firstParagraph, restParagraph;

        { //splitFirstParagraph
            const separator = '<br><br>';
            const idx = fullParagraph.indexOf(separator);
            if (idx === -1) {
                firstParagraph = fullParagraph;
                restParagraph = '';
            } else {
                firstParagraph = fullParagraph.slice(0, idx);
                restParagraph = fullParagraph.slice(idx + separator.length/2);
            }
            
        }

        let aboutHtml = `
            <section class="mobileOnly mobile-about">
                <p class="mobile-about-first">${firstParagraph}</p>
                ${restParagraph ? `<p class="mobile-about-rest hidden">${restParagraph}</p>` : ''}
                ${restParagraph ? `<button class="mobile-about-toggle" aria-expanded="false">+ ${dict.content["read-more"][lang]}</button>` : ''}
            </section>
        `;

        return aboutHtml;

    }

    function lAppliedFilterHtml(){
        if (!currentFilter || currentFilter == '') return '';
        let filtersHtml = `
            <section class="filters">
                <p>${dict.content.filter[lang]}: ${dict.categories[currentFilter][lang].toUpperCase()}</p>
                <button>x</button>
            </section>
        `;
        return filtersHtml;
    }

    let projectListHtml = `
        ${HamburguerMenuHtml()}
        ${lMobileAboutFallbackHtml()}
        ${lAppliedFilterHtml()}
    `;

    for (const id in projects){

            const work = projects[id];

            // se a categoria nao bater, nao renderizar projeto
            if (currentFilter && !work.categories.includes(currentFilter)) {
                continue;
            }
            //  make work preview div

            projectListHtml += `
                <article class="project-preview fade-in-element ${work.awards ? 'awarded' : ''}">
                    ${ProjectHeaderHtml(work)}
                    <a href="/${id}" aria-label="View project: ${work.title}">
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

//* Make Functions // void

function makeSidepanelNav(entries, index){
    // pega o nav do painel
    const spNav = document.querySelector('.sidepanel-nav');
    const spViewportNav = document.querySelector('.sidepanel-viewport-nav');
    // se nao tem multiplos entries (paginas em sidepanel), nao temos nav. return!

    let nextPreviousHtml = '';
    // const hasNextPrevArrow = entries.length > 1;
    const hasNext = ((currentIndex + 1) != entries.length);
    const hasPrev = (currentIndex != 0);
    
    nextPreviousHtml = `
        <button class="sp-prev ${!hasPrev? 'hidden' : ''}" aria-label="Previous">&lt</button>
        <button class="sp-next ${!hasNext? 'hidden' : ''}" aria-label="Next">&gt</button>
    `

    let downloadCVHtml = `
        <div class='bt-curriculum'>
            <button>${dict.content["cv-download"][lang].toUpperCase()}</button>
        </div>
    `

    let changeLangHtml = `
        <div class="bt-lang">
            <button data-lang="pt" onclick="setLang('pt')">PT</button>/<button data-lang="en" onclick="setLang('en')">EN</button>
        </div>
    `


    spNav.innerHTML = `
        ${changeLangHtml}
        ${downloadCVHtml}
    `

    spViewportNav.innerHTML = `
        ${nextPreviousHtml}
    `

    spNav.querySelector('.bt-curriculum').addEventListener('click', () => {
        window.print();
    });

    spNav.querySelectorAll('.bt-lang button').forEach((bt)=>{
        bt.classList.toggle('active', bt.dataset.lang == lang);
    })

    if (hasPrev) {
        spViewportNav.querySelector('.sp-prev').onclick = (e) => {
            // currentIndex = (index - 1 + entries.length) % entries.length;
            currentIndex = Math.max(0,index - 1 );
            makeSidepanelPage(entries, currentIndex);
            // e.stopPropagation();
        }
    }
    
    if (hasNext) {
        spViewportNav.querySelector('.sp-next').onclick = (e) => {
            // currentIndex = (index + 1) % entries.length;
            currentIndex = Math.min(entries.length, index + 1);
            makeSidepanelPage(entries, currentIndex);
            // e.stopPropagation();
        }
    }
}

function makeSidepanelPage(entries, index){
    // se um sketch ja estiver carregado: limpamos
    if (currentSketch) {
        currentSketch.remove(); // unmount p5 sketch (p5 instance method)
        currentSketch = null; // limpar para proxima vez
    }


    // get the sidepanel viewport element and clean it
    const spViewport = document.querySelector('.sidepanel-viewport');
    spViewport.innerHTML = '';

    // current sidepanel entry --------
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

        // homepage sidepanel
        currentEntries = [{ type: 'about', text: dict.content.homepage }];
        currentIndex = 0;
        makeSidepanelPage(currentEntries, 0);

        
        // homepage maincontent
        maincontent.innerHTML = ProjectListHtml(works);
        maincontent.scrollTop = 0;

        
        
        const categorieButtons = maincontent.querySelectorAll('.filter-button')
        categorieButtons.forEach((catBt) => {
            catBt.addEventListener('click', () => {
                if (currentFilter != catBt.dataset.cat){
                    currentFilter = catBt.dataset.cat;
                    make(path)
                } else {
                    currentFilter = '';
                    make(path)
                }
                console.log(currentFilter);
            })
        })
        
        const filterClearBtn = maincontent.querySelector('.filters button');
        if (filterClearBtn) {
            filterClearBtn.addEventListener('click', () => {
                currentFilter = '';
                make(path);
            });
        }

        // hamb menu button
        // setup hamburguer menu

        // mobile about expand/collapse
        const aboutToggle = document.querySelector('.mobile-about button');
        const aboutRest = document.querySelector('.mobile-about-rest');

        if (aboutToggle) {
            aboutToggle.addEventListener('click', () => {
                const isExpanded = aboutRest.classList.toggle('hidden');
                aboutToggle.textContent = isExpanded ? `+ ${dict.content["read-more"][lang]}` : `− ${dict.content["read-less"][lang]}`;
                aboutToggle.setAttribute('aria-expanded', !isExpanded);
            });
        }
        
        // PLAY ON HOVER
        const workPreviewDivs = document.querySelectorAll('.project-preview');

        // ---------------- observe and play on over ----------------
        workPreviewDivs.forEach(el => {

            // observer.observe(el);
            let video = el.querySelector("video");

            // Play video
            video.addEventListener('mouseenter', () => {
                video.play().catch(err => {
                    console.log("Playback interrupted");
                    console.log(err);
                });
                sidepanelImage.src = video.poster;
                sidepanelImage.classList.remove('hidden'); // TODO: maybe use toggle() instead??
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

        // clean selected filter
        currentFilter = '';

        // project page ----------------------------------------------------------------------------------------------------

        const id = path.slice(1); // extract id from path '/my-project' -> 'my-project'
        const work = works[id];   // get work from works object using id
        
        // UPDATE DOM
        maincontent.innerHTML = ProjectlHtml(work);
        maincontent.scrollTop = 0;
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
    
    hambMenuButton.classList.remove('hamb-open');
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