// some wall drawing by sol lewitt, recreated by miglito.

export default (p) => {

    let pg;
    let margin = 40;

    p.setup = () => {
        p.createCanvas(600, 600);
        pg = p.createGraphics(p.width - margin * 2, p.height - margin * 2);
        pg.noFill();
        p.background(200);
        pg.background(220)
    };

    p.draw = () => {
        if (p.mouseIsPressed) {
            for (let i = 0; i < 10; i++) {
                pg.strokeWeight(p.random(3))
                //pg.stroke(0,random(100))
                pg.circle(p.random(p.width), p.random(p.height), p.random(p.height));
            }
        }

        p.image(pg, margin, margin);
    }
};