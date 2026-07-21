/* makes the selected element draggable (needs 'position: absolute;').
if element has a child with the ".dragArea" class, it will use it.
Else whole element is draggable.*/
export function makeDraggable(element){
    let deltaX = 0, deltaY = 0, prevMouseX = 0, prevMouseY = 0;

    // ensure it can actually be moved with left/top
    // const computedPosition = getComputedStyle(element).position;
    // if (computedPosition === "static") {
    //     element.style.position = "relative";
    // }
    
    // check if has a dragArea
    const dragArea = element.querySelector(".dragArea");

    if (dragArea) {
        dragArea.onmousedown = dragMouseDown;
    } else { 
        element.onmousedown = dragMouseDown;
    }

    function dragMouseDown(event){
        event.preventDefault();

        // element.parentElement.appendChild(element);

        // get position of the mouse when it first clicks the div
        prevMouseX = event.clientX;
        prevMouseY = event.clientY;

        // if mouse is up lets reset (unset events)
        document.onmouseup = closeDragElement;
        // if mouse is down and i move, lets drag
        document.onmousemove = dragElement;
    }

    function dragElement(event){
        event.preventDefault();

        // see how much the mouse moved
        deltaX = event.clientX - prevMouseX;
        deltaY = event.clientY - prevMouseY;

        // get mouse position for the next check
        prevMouseX = event.clientX;
        prevMouseY = event.clientY;

        // calculate new position adding mouseOffset to current left and top position
        const newX = element.offsetLeft + deltaX;
        const newY = element.offsetTop + deltaY;

        // apply movement
        element.style.left = newX + "px";
        element.style.top = newY + "px";
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }

}

// reference www.w3schools.com/howto/howto_js_draggable.asp