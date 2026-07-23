// This is a sketch inspired by the work of Brian Eno and Peter Schmidt in Oblique Strategies.
// by miglito 2024

export default (p) => {

    const obliqueStrategies = [
        "Honor thy error as a [hidden intention.](https://timrodenbroeker.de/)",
        "Let the glue show.",
        "[Always be knowling.](https://www.youtube.com/watch?v=s-CTkbHnpNQ)",
        "Do the [easy thing first.](https://www.youtube.com/watch?v=-Evrm03Y5hI&t=4s)",
        "Do the [hard thing first.](https://www.youtube.com/watch?v=-Evrm03Y5hI&t=35s)",
        "Know when to [quit.](https://www.youtube.com/watch?v=-Evrm03Y5hI&t=638s)",
        "Just try [a little bit harder!](https://www.youtube.com/watch?v=tYzMYcUty6s)",
        "[Work to code.](https://www.youtube.com/watch?v=49p1JVLHUos&t=128s)",
        "[Be thorough.](https://www.youtube.com/watch?v=49p1JVLHUos&t=471s)",
        "Sent does not mean [recieved.](https://www.youtube.com/watch?v=49p1JVLHUos&t=792s)",
        "Work at a different speed.",
        "What would your closest friend do?",
        "Abandon [normal instruments.](https://www.youtube.com/watch?v=mCRibm4kOaE)",
        "Ask your body.",
        "Don't be afraid of things because they're easy to do.",
        "Discard an axiom.",
        "State the problem in words as clearly as possible.",
        "Think inside the work.",
        "Use fewer elements.",
        "Leave evidence.",
        "Connect two unrelated things with a new part; bridge.",
        "Is the style right?",
        "Remember those quiet evenings.",
        "Change nothing and continue with immaculate consistency.",
        "Cascades.",
        "Twist the spine.",
        "A line has two sides.",
        "You can only make one dot at a time.",
        "What is the reality of the situation?",
        "What mistakes did you make last time?",
        "Give the game away.",
        "Make a sudden, destructive unpredictable action; incorporate.",
        "The inconsistency principle.",
        "Tape your mouth.",
        "Take a break.",
        "Don't stress one thing more than another.",
        "Emphasize repetitions.",
        "Don't avoid what is easy.",
        "Courage!",
        "Patience!",
        "Listen to the quiet voice.",
        "Do the washing up.",
        "Remove ambiguities and convert to specifics.",
        "Faced with a choice, do both.",
        "Look at the order in which you do things.",
        "Simple subtraction.",
        "Convert an aesthetics element into a structural element.",
        "Do nothing for as long as possible.",
        "Trust in the you of now.",
        "Don't be frightened to display your talents.",
        "Imagine the work as a set of disconnected events.",
        "Use filters.",
        "Go outside. Shut the door."
    ];

    // GLOBAL VARIABLES (scoped to this sketch instance)

    // First Worthwhile Dilemma
    let strategie =
        "[Oblique Strategies](https://en.wikipedia.org/wiki/Oblique_Strategies)";

    // Animation Variables
    let currentWave = 10;
    let targetWave = 1;
    let onHoverWave = 6;

    // Style Variables
    let bgColor, strategieColor, linkColor;

    // Interaction Variables
    let mouseColisionHeight = 50;

    // Unique RNG Variables
    let lastIndices = []; // Array to store previously selected indices
    let maxHistory = 5; // Define how many previous indices to remember

    // Cached space width — p5 2.x trims leading/trailing whitespace before
    // measuring, so textWidth(' ') alone returns 0. We measure a space
    // sandwiched between sentinel characters instead, once, and reuse it.
    let cachedSpaceWidth = null;


    // Once
    p.setup = () => {
        const container = document.querySelector('.sketch-container');
        // Create canvas
        p.createCanvas(container.clientWidth, container.clientHeight);
        // Set Text Alignment
        p.textAlign(p.LEFT, p.CENTER);

        // Set Colors
        strategieColor = 0;
        bgColor = 220;
        linkColor = 0; // Link color starts black for splash screen
    };


    // Every frame
    p.draw = () => {

        // Set BG Color
        p.background(bgColor);

        // Animate the wave with linear interpolation
        currentWave = p.lerp(currentWave, targetWave, 0.03);

        // Set text size
        p.textSize(20);


        // Split the text into clickable and non-clickable parts
        let parts = splitTextIntoParts(strategie);


        // Calculate the total width of the text
        let totalWidth = calculateTotalWidth(parts);

        // Center the text
        let x = (p.width - totalWidth) / 2; // Center the text horizontally
        let y = p.height / 2; // Center the text vertically


        // Calculate wave offsets for the entire phrase*
        // *Doing this keeps the wave uniform in partitioned strategies
        let waveOffsets = [];
        let totalLength = strategie.length;

        for (let i = 0; i < totalLength; i++) {
            waveOffsets.push(p.sin(p.frameCount / 10 + i / 10) * currentWave);
        }


        let cursorChanged = false; // To handle the cursor change correctly

        let offsetIndex = 0; // Index to track waveOffsets for each letter

        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            for (let j = 0; j < part.text.length; j++) {
                let currentChar = part.text[j];
                let charWidth = measureChar(currentChar);

                let xOffset = 0; // No animation on x-axis
                let yOffset = waveOffsets[offsetIndex]; // Apply the pre-calculated wave offset

                let textColor = part.isLink ? linkColor : strategieColor;
                p.fill(textColor);

                // Handle cursor change
                if (
                    part.isLink &&
                    p.mouseX > x &&
                    p.mouseX < x + charWidth &&
                    p.mouseY > y + yOffset - mouseColisionHeight / 2 &&
                    p.mouseY < y + yOffset + mouseColisionHeight / 2
                ) {
                    targetWave = onHoverWave; // animate the wave
                    p.cursor(p.HAND);          // change cursor shape
                    cursorChanged = true;      // set cursor changed to true!
                }

                // Draw text!!! (with animation offsets)
                p.text(currentChar, x + xOffset, y + yOffset);
                x += charWidth;
                offsetIndex++;
            }
        }
        // If not colliding
        if (!cursorChanged) {
            targetWave = 1;
            p.cursor(p.ARROW);
        }
    };


    p.mousePressed = () => {
        let parts = splitTextIntoParts(strategie);
        let totalWidth = calculateTotalWidth(parts);

        let x = (p.width - totalWidth) / 2;
        let y = p.height / 2;

        let waveOffsets = [];
        let totalLength = strategie.length;

        for (let i = 0; i < totalLength; i++) {
            waveOffsets.push(p.sin(p.frameCount / 10 + i / 10) * currentWave);
        }

        let offsetIndex = 0;

        for (let i = 0; i < parts.length; i++) {
            let part = parts[i];
            for (let j = 0; j < part.text.length; j++) {
                let charWidth = measureChar(part.text[j]);
                let yOffset = waveOffsets[offsetIndex];

                if (
                    part.isLink &&
                    p.mouseX > x &&
                    p.mouseX < x + charWidth &&
                    p.mouseY > y + yOffset - mouseColisionHeight / 2 &&
                    p.mouseY < y + yOffset + mouseColisionHeight / 2
                ) {
                    window.open(part.url, "_blank");
                    return;
                }
                x += charWidth;
                offsetIndex++;
            }
        }

        // If click is not on a link, proceed with default behavior
        linkColor = p.color(0, 0, 255);
        currentWave = 10;
        let uniqueIndex = getUnique(obliqueStrategies);
        strategie = obliqueStrategies[uniqueIndex];
    };


    p.windowResized = () => {
        const container = document.querySelector('.sketch-container');
        p.resizeCanvas(container.clientWidth, container.clientHeight);
    };


    // Get a unique item in an array (helper function)
    function getUnique(optionArray) {
        let totalOptions = optionArray.length;
        let randomIndex;

        do {
            randomIndex = p.int(p.random(totalOptions));
        } while (lastIndices.includes(randomIndex));

        lastIndices.push(randomIndex);
        if (lastIndices.length > maxHistory) {
            lastIndices.shift();
        }

        return randomIndex;
    }


    // Measure a single character, correctly handling the p5 2.x behavior
    // where an all-whitespace string gets trimmed to "" before measuring
    // (so textWidth(' ') alone would otherwise return 0).
    function measureChar(char) {
        if (char !== ' ') {
            return p.textWidth(char);
        }
        if (cachedSpaceWidth === null) {
            const sentinel = '|';
            cachedSpaceWidth = p.textWidth(sentinel + ' ' + sentinel) - 2 * p.textWidth(sentinel);
        }
        return cachedSpaceWidth;
    }


    // Helper function called on the draw loop to calculate total width of the text.
    function calculateTotalWidth(parts) {
        let totalWidth = 0;
        for (let part of parts) {
            let partWidth = p.textWidth(part.text);
            totalWidth += partWidth;
        }
        return totalWidth;
    }


    // Helper function to split text into clickable and non-clickable parts
    function splitTextIntoParts(strategie) {
        const linkRegex = /\[(.*?)\]\((.*?)\)/g;
        let parts = [];
        let lastIndex = 0;

        let match;
        while ((match = linkRegex.exec(strategie)) !== null) {
            if (match.index > lastIndex) {
                parts.push({
                    text: strategie.substring(lastIndex, match.index),
                    isLink: false,
                });
            }

            parts.push({
                text: match[1],
                url: match[2],
                isLink: true,
            });

            lastIndex = match.index + match[0].length;
        }

        if (lastIndex < strategie.length) {
            parts.push({
                text: strategie.substring(lastIndex),
                isLink: false
            });
        }

        return parts;
    }
};