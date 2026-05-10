export function parseRoute() {
    const path = window.location.pathname;

    const segments = path.split('/')
        .filter(seg => seg !== "" && seg !== "index.html");

    if (segments.length === 0) return { type: 'home' };

    if (segments[0] === 'work') {
        return segments[1] 
            ? { type: 'project', slug: segments[1], collection: 'works' }
            : { type: 'work-list' };
    }

    if (segments[0] === 'about') {
        return { type: 'about' }
    };

    return { type: '404' };
}

export function handleRouting() {
    const route = parseRoute();
    
    console.log("Routing to:", route);

    switch (route.type) {
        case 'home':

            break;
        case 'about':

            break;
        case 'project':
            // 1. Identify which list to look in
            // const projectData = works[route.slug];

            if (projectData) {

            } else {
                // If the slug doesn't exist in our JS, show 404
                appContainer.innerHTML = `<h1>Project Not Found</h1>`;
            }
            break;
        default:
            break
    }
}

/**
 * Navigate to a new path without a page refresh
 */
export function navigate(path) {
    window.history.pushState({}, "", path);
}

// Listen for browser back/forward buttons
window.addEventListener('popstate', handleRouting);