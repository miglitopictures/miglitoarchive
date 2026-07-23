A few quick calls before the plan — I'll state the defaults I'm using so the plan below isn't blocked on your answers:

1. **Carousel input**: click arrows + dots only for v1, no swipe/keyboard yet (easy to add later, not core to shipping this). Tell me if you want swipe now instead.
2. **Mobile p5 fallback message**: I'm defaulting to your dictionary's bilingual pattern (`{en, pt}`) so it's localized like everything else, rather than a hardcoded string per project.
3. **Migration scope**: I'll migrate just `painting-matter` (your one programming/software project) as the working example, and leave everything else on the `about`-fallback path. You migrate others whenever you add sketches to them.

If any of those are wrong, say so and I'll adjust — otherwise here's the full plan.

---

## File structure changes

```
.
├── sketches/
│   ├── painting-matter.js      ← real sketch, instance-mode export
│   └── _test.html              ← standalone harness, not linked from site
├── data/
├── src/
├── styles/
```

---

## Step 1 — `index.html`: load p5 eagerly

```html
<script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js" defer></script>
<script type="module" src="./src/main.js"></script>
```

Keep `defer` on both so ordering/execution stays predictable, and update the sidepanel markup:

```html
<div id="sidepanel">
    <div class="sidepanel-viewport"></div>
    <div class="sidepanel-nav"></div>
    <img class="sidepanel-hover-image hidden">
</div>
```

(This replaces the old fixed `<p>` + `<img>`.)

---

## Step 2 — `dictionary.js`: add the fallback message

```js
content: {
    "homepage": { en: "...", pt: "..." },
    "sketch-mobile-fallback": {
        en: "This sketch is interactive — best experienced on desktop.",
        pt: "Este sketch é interativo — melhor experiência no computador."
    },
},
```

---

## Step 3 — `sketches/painting-matter.js`: your first real sketch

```js
export default (p) => {
    p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
    };
    p.draw = () => {
        p.background(220);
        p.ellipse(p.mouseX, p.mouseY, 40);
    };
    p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
    };
};
```

## Step 3b — `sketches/_test.html`: standalone test harness

```html
<!DOCTYPE html>
<html>
<head><script src="https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js"></script></head>
<body style="margin:0">
<script type="module">
  import sketch from './painting-matter.js';
  new p5(sketch);
</script>
</body>
</html>
```

Open through `dev-server.py` to iterate on a sketch with zero dependency on the router.

---

## Step 4 — `projects.js`: migrate one project

```js
"painting-matter": {
    // ...unchanged fields...
    sidepanel: [
        { type: "about", content: "Painting Matter ipsum dolor sit amet..." },
        { type: "p5", src: "../sketches/painting-matter.js" },
    ],
},
```

Everything else keeps its plain `about` string untouched — the fallback logic in `main.js` handles both.

---

## Step 5 — `main.js`: the core changes

**State (top of file):**
```js
let currentSketch = null;
let currentEntries = [];
let currentIndex = 0;
```

**Renderer for one sidepanel page:**
```js
function renderSidepanelPage(entries, index) {
    if (currentSketch) { currentSketch.remove(); currentSketch = null; }

    const viewport = document.querySelector('.sidepanel-viewport');
    viewport.innerHTML = '';

    const entry = entries[index];
    if (entry.type === 'about') {
        const p = document.createElement('p');
        p.innerHTML = entry.content;
        viewport.appendChild(p);
    } else if (entry.type === 'p5') {
        const container = document.createElement('div');
        container.className = 'sketch-container';
        viewport.appendChild(container);
        import(entry.src).then(({ default: sketchFn }) => {
            currentSketch = new p5(sketchFn, container);
        });
    }

    renderSidepanelNav(entries, index);
}

function renderSidepanelNav(entries, index) {
    const nav = document.querySelector('.sidepanel-nav');
    if (entries.length <= 1) { nav.innerHTML = ''; return; }

    nav.innerHTML = `
        <button class="sp-prev" aria-label="Previous">‹</button>
        <div class="sp-dots">
            ${entries.map((_, i) => `<span class="sp-dot ${i === index ? 'active' : ''}"></span>`).join('')}
        </div>
        <button class="sp-next" aria-label="Next">›</button>
    `;

    nav.querySelector('.sp-prev').onclick = () => {
        currentIndex = (index - 1 + entries.length) % entries.length;
        renderSidepanelPage(entries, currentIndex);
    };
    nav.querySelector('.sp-next').onclick = () => {
        currentIndex = (index + 1) % entries.length;
        renderSidepanelPage(entries, currentIndex);
    };
}
```

**Mobile stack (for `ProjectlHtml`):**
```js
function MobileSidepanelHtml(entries) {
    let html = '';
    entries.forEach((entry) => {
        if (entry.type === 'about') {
            html += `<p class="mobileOnly">${entry.content}</p>`;
        } else if (entry.type === 'p5') {
            html += `<p class="mobileOnly sketch-mobile-note">${dict.content["sketch-mobile-fallback"][lang]}</p>`;
        }
    });
    return html;
}
```
Replace the old `aboutHtml` block in `ProjectlHtml` with a call to this, using the same fallback pattern shown below.

**In `make()`** — replace both the homepage and project-page sidepanel-setting lines:

```js
// homepage branch
currentEntries = [{ type: 'about', content: dict.content.homepage[lang] }];
currentIndex = 0;
renderSidepanelPage(currentEntries, 0);

// project branch
currentEntries = work.sidepanel || [{ type: 'about', content: work.about }];
currentIndex = 0;
renderSidepanelPage(currentEntries, 0);
```

And in `ProjectlHtml`:
```js
const sidepanelEntries = project.sidepanel || [{ type: 'about', content: project.about }];
const aboutHtml = MobileSidepanelHtml(sidepanelEntries);
```

**Homepage hover-preview**: the video hover handlers currently reference a fixed `sidepanelText`/`sidepanelImage`. Update them to query fresh each time (since the `<p>` now lives inside `.sidepanel-viewport` and is recreated by `renderSidepanelPage`):
```js
const sidepanelImage = document.querySelector('.sidepanel-hover-image');
// on mouseenter/mouseleave, toggle sidepanelImage as before, and toggle
// document.querySelector('.sidepanel-viewport') visibility instead of a stored sidepanelText reference
```

---

## Step 6 — `style.css`: new classes

```css
.sidepanel-viewport {
    width: 100%;
    height: 100%;
}

.sidepanel-nav {
    position: absolute;
    bottom: 20px;
    display: flex;
    align-items: center;
    gap: 12px;
    justify-content: center;
    width: 100%;
}

.sp-prev, .sp-next {
    background: none;
    border: none;
    font-size: 24pt;
    cursor: pointer;
}

.sp-dots { display: flex; gap: 6px; }

.sp-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(0,0,0,0.3);
}
.sp-dot.active { background: var(--main-color); }

.sketch-container { width: 100%; height: 100%; }
.sketch-container canvas { display: block; }
```

`#sidepanel` needs `position: relative` added so `.sidepanel-nav` can anchor to it.

---

## Todo list

- [ ] Add p5 `<script defer>` tag to `index.html`
- [ ] Replace sidepanel markup with `.sidepanel-viewport` / `.sidepanel-nav` / `.sidepanel-hover-image`
- [ ] Add `sketch-mobile-fallback` entry to `dictionary.js`
- [ ] Create `sketches/` folder, add `painting-matter.js` and `_test.html`
- [ ] Add `sidepanel` array to `painting-matter` in `projects.js`
- [ ] Add `renderSidepanelPage` + `renderSidepanelNav` to `main.js`
- [ ] Add `MobileSidepanelHtml`, wire into `ProjectlHtml`
- [ ] Update `make()` to call `renderSidepanelPage` on both homepage and project branches, with `about` fallback
- [ ] Update homepage hover-preview handlers to query the new `.sidepanel-hover-image` / `.sidepanel-viewport`
- [ ] Add carousel + sketch-container CSS, set `#sidepanel { position: relative }`
- [ ] Test `painting-matter` end to end: desktop carousel paging, mobile fallback message, navigating away mid-sketch (confirm no zombie canvas)
- [ ] Migrate remaining projects to `sidepanel` array as you build more sketches

Want me to go ahead and write these actual edits into your uploaded files now?