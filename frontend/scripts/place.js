const canvas = document.getElementById("place");
const magnifier = document.getElementById("magnifier");
canvas.height = 500;
canvas.width = 500;
magnifier.width=90;
magnifier.height=90;
const ctx = canvas.getContext("2d", { willReadFrequently: true });
ctx.fillStyle = "white";
ctx.fillRect(0,0, 500, 500)
const magctx = magnifier.getContext("2d")
var colorpreview = document.getElementById("colorpreview");
let colorvalue = 0;
let drawcolor, x, y;
let animating = false;
let previoushover = false;

// Assign the click event listeners to every color box
Array.from(document.getElementsByClassName("colorbox")).forEach(element => {
    element.addEventListener("click", e => {
        colorvalue = e.target.value;
        var fillcolor = window.getComputedStyle(e.target).backgroundColor;
        drawcolor = fillcolor;
        colorpreview.style.backgroundColor = fillcolor;
        // console.log(colorvalue)
    })
});

// Function to get the position of the cursor relative to a canvas
function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    // console.log("x: " + x + " y: " + y)
    return([x, y])
}

// Simple function to draw a pixel on a canvas
function drawPixel(context, x, y, color) {
    context.fillStyle = COLORLIST[color];
    context.fillRect(x, y, 1, 1);
}

// Function to publish pixel when magnifier clicked
magnifier.addEventListener('click', function(e) {
    [x, y] = getCursorPosition(canvas, e);
    // console.log(x, y);
    // ctx.fillStyle = drawcolor;
    // ctx.fillRect(x, y, 10, 10);
    publishPixel(x, y, colorvalue);
})

// Function to magnify the detailed image
function renderMagnifier(xval, yval) {
    let res = parseInt(document.getElementById("resolution").value);
    let division = (res * 2) + 1
    let offset = 90 / division
    let region = ctx.getImageData(xval-res, yval-res, division, division);
    const data = region.data
    for (let x = 0; x < division; x++) {
        for (let y = 0; y < division; y++) {
            let i = ((x * division) + y) * 4;
            let rgbColor = `rgb(${data[i]} ${data[i+1]} ${data[i+2]} / ${data[i+3] / 255})`;
            magctx.fillStyle = ( xval-res+y > 0 && yval-res+x > 0 && 
                xval-res+y < 500 && yval-res+x < 500 ) ? rgbColor : "cadetblue";
            magctx.fillRect((y)*offset, (x)*offset, offset, offset)
        }
    }
}

// When mouse moved, render the magnifier and animate it
window.addEventListener("mousemove", e => {
    let [x, y] = getCursorPosition(canvas, e);
    renderMagnifier(x, y);
    magnifier.animate({
        left : `${e.clientX}px`,
        top : `${e.clientY}px`
    },{duration: 300, fill: "forwards"})
    animating = true; 
    setTimeout(() => animating = false, 300)
    magnifier.style.left = `${e.clientX}px`
    magnifier.style.top = `${e.clientY}px`
})

// Events to hide and show the magnifier
Array.from(document.querySelectorAll('.nomagnify')).forEach( e => {
    e.addEventListener("mouseenter", () => magnifier.hidden = true)
})
Array.from(document.querySelectorAll('.nomagnify')).forEach( e => {
    e.addEventListener("mouseleave", () => magnifier.hidden = false)
})

// Button to publish the pixels
document.getElementById('push').addEventListener('click', e => {
    publishPixel(
        document.getElementById('x').value,
        document.getElementById('y').value,
        document.getElementById('color').value
    );
})

// Load Image from the server and fill canvas
let testimg = new Image()
testimg.src = "base.png"
testimg.addEventListener("load", () => {
    ctx.drawImage(testimg, 0, 0);
  });

// Color slider
document.getElementById('color').addEventListener("change", e => {
    document.getElementById("colorref").innerText = `Color #${e.target.value}, ${COLORLIST[e.target.value]}`;
})