const canvas = document.getElementById("place");
canvas.height = 500;
canvas.width = 500;
const ctx = canvas.getContext("2d");
var colorpreview = document.getElementById("colorpreview");
let colorvalue = 0;
let drawcolor, x, y; 


Array.from(document.getElementsByClassName("colorbox")).forEach(element => {
    element.addEventListener("click", e => {
        colorvalue = e.target.value;
        var fillcolor = window.getComputedStyle(e.target).backgroundColor;
        drawcolor = fillcolor;
        colorpreview.style.backgroundColor = fillcolor;
        console.log(colorvalue)
    })
});

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log("x: " + x + " y: " + y)
    return([x, y])
}

const COLORLIST = Array.from(
    document.querySelectorAll('li.colorbox'))
    .map( e => window.getComputedStyle(e).backgroundColor)

function drawPixel(context, x, y, color) {

}

canvas.addEventListener('click', function(e) {
    [x, y] = getCursorPosition(canvas, e);
    console.log(x, y);
    ctx.fillStyle = drawcolor;
    ctx.fillRect(x, y, 10, 10);
    publishPixel(x, y, colorvalue);
})