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


Array.from(document.getElementsByClassName("colorbox")).forEach(element => {
    element.addEventListener("click", e => {
        colorvalue = e.target.value;
        var fillcolor = window.getComputedStyle(e.target).backgroundColor;
        drawcolor = fillcolor;
        colorpreview.style.backgroundColor = fillcolor;
        // console.log(colorvalue)
    })
});

function getCursorPosition(canvas, event) {
    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    // console.log("x: " + x + " y: " + y)
    return([x, y])
}

const COLORLIST = Array.from(
    document.querySelectorAll('li.colorbox'))
    .map( e => window.getComputedStyle(e).backgroundColor)

function drawPixel(context, x, y, color) {
    context.fillStyle = COLORLIST[color];
    context.fillRect(x, y, 1, 1);
}

magnifier.addEventListener('click', function(e) {
    [x, y] = getCursorPosition(canvas, e);
    // console.log(x, y);
    // ctx.fillStyle = drawcolor;
    // ctx.fillRect(x, y, 10, 10);
    publishPixel(x, y, colorvalue);
})

function renderMagnifier(xval, yval) {
    let region = ctx.getImageData(xval-4, yval-4, 9, 9);
    const data = region.data
    for (let x = 0; x < 9; x++) {
        for (let y = 0; y < 9; y++) {
            let i = ((x * 9) + y) * 4;
            // console.log(data[i])
            let rgbColor = `rgb(${data[i]} ${data[i+1]} ${data[i+2]} / ${data[i+3] / 255})`;
            magctx.fillStyle = rgbColor;
            magctx.fillRect((y)*10, (x)*10, 10, 10)
        }
    }
}

function elementsOverlap(el1, el2) {
    const domRect1 = el1.getBoundingClientRect();
    const domRect2 = el2.getBoundingClientRect();
  
    return !(
      domRect1.top > domRect2.bottom ||
      domRect1.right < domRect2.left ||
      domRect1.bottom < domRect2.top ||
      domRect1.left > domRect2.right
    );
  }
  
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

Array.from(document.querySelectorAll('.nomagnify')).forEach( e => {
    e.addEventListener("mouseenter", () => magnifier.hidden = true)
})
Array.from(document.querySelectorAll('.nomagnify')).forEach( e => {
    e.addEventListener("mouseleave", () => magnifier.hidden = false)
})

document.getElementById('push').addEventListener('click', e => {
    publishPixel(
        document.getElementById('x').value,
        document.getElementById('y').value,
        document.getElementById('color').value
    );
})

let testimg = new Image()
testimg.src = "base.png"
testimg.addEventListener("load", () => {
    ctx.drawImage(testimg, 0, 0);
  });

  document.getElementById('color').addEventListener("change", e => {
    document.getElementById("colorref").innerText = `Color #${e.target.value}, ${COLORLIST[e.target.value]}`;
  })