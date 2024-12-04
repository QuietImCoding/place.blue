const canvas = document.getElementById("place");
canvas.height = 500;
canvas.width = 500;
const ctx = canvas.getContext("2d");
var colorpreview = document.getElementById("colorpreview");
let drawcolor, x, y; 


Array.from(document.getElementsByClassName("colorbox")).forEach(element => {
    element.addEventListener("click", e => {
        var fillcolor = window.getComputedStyle(e.target).backgroundColor;
        drawcolor = fillcolor;
        colorpreview.style.backgroundColor = fillcolor;
    })
});

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log("x: " + x + " y: " + y)
    return([x, y])
}

canvas.addEventListener('click', function(e) {
    [x, y] = getCursorPosition(canvas, e);
    console.log(x, y);
    ctx.fillStyle = drawcolor;
    ctx.fillRect(x, y, 10, 10);
})