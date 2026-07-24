// some wall drawing by sol lewitt, recreated by miglito.

export default (p) => {
    p.setup = () => {
        const container = document.querySelector('.sketch-container');
        p.createCanvas(container.clientWidth, container.clientHeight);
        p.background('red');
    };

    p.draw = () => {
        p.fill('green');
        p.noStroke();
        p.circle(p.mouseX, p.mouseY, 60);
    };

    p.windowResized = () => {
        const container = document.querySelector('.sketch-container');
        p.resizeCanvas(container.clientWidth, container.clientHeight);
    };
};