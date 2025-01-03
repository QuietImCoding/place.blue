// Set up Main canvas and magnifier

const canvas = document.getElementById("place");
const magnifier = document.getElementById("magnifier");
canvas.height = 500;
canvas.width = 500;
magnifier.width=90;
magnifier.height=90;
magnifier.hidden=true;
const ctx = canvas.getContext("2d", { willReadFrequently: true });
ctx.fillStyle = "white";
ctx.fillRect(0,0, 500, 500)
const magctx = magnifier.getContext("2d")

// Set up random important variables
// Select necessary DOM elements
var colorpreview = document.getElementById("colorpreview");
let authIndicator = document.getElementById("account");
let eventbox = document.getElementById("events");
// Initialize values
let colorvalue = 0;
let drawcolor, x, y;
let animating = false;
let domain, username, did, jwt, refresh;
let altstream = false;



const COLORLIST = [
    "#000000",
    "#1D2B53",
    "#7E2553",
    "#008751",
    "#AB5236",
    "#5F574F",
    "#C2C3C7",
    "#FFF1E8",
    "#FF004D",
    "#FFA300",
    "#FFEC27",
    "#00E436",
    "#29ADFF",
    "#83769C",
    "#FF77A8",
    "#FFCCAA"
];


let colorboxdiv = document.getElementById("controls");
let ctr = 1;
COLORLIST.forEach( col  => {
    let newbox = document.createElement('li');
    newbox.classList.add("colorbox");
    newbox.style.backgroundColor = col;
    newbox.id = `colorbox${ctr}`;
    newbox.value = ctr;
    ctr++;
    colorboxdiv.appendChild(newbox);
})

// Simple function to draw a pixel on a canvas
function drawPixel(context, x, y, color) {
    context.fillStyle = COLORLIST[color];
    context.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

// Assign the click event listeners to every color box
Array.from(document.getElementsByClassName("colorbox")).forEach(element => {
    element.addEventListener("click", e => {
        colorvalue = e.target.value - 1;
        var fillcolor = e.target.style.backgroundColor;
        drawcolor = fillcolor;
        colorpreview.style.backgroundColor = fillcolor;
        // console.log(colorvalue)
    })
});

