// Set up Main canvas and magnifier

const canvas = document.getElementById("place");
const magnifier = document.getElementById("magnifier");
canvas.height = 500;
canvas.width = 500;
magnifier.width = 120;
magnifier.height = 120;
magnifier.hidden = true;
const ctx = canvas.getContext("2d", { willReadFrequently: true });
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 500, 500);
const magctx = magnifier.getContext("2d");

// Set up random important variables
// Select necessary DOM elements
var colorpreview = document.getElementById("colorpreview");
let authIndicator = document.getElementById("account");
let eventbox = document.getElementById("events");
// Initialize values
let colorvalue = 0;
let magOffset = [0, 0];
let magres = 8;
let drawcolor, x, y;
let animating = false;
let domain, username, did, jwt, refresh;
let altstream = false;
let magmode = "local";
let magMoveHandler;
let zoomRes = 25;
let touchUser = false;
let dragElement;

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
  "#FFCCAA",
];

let colorboxdiv = document.getElementById("controls");
let ctr = 1;
COLORLIST.forEach((col) => {
  let newbox = document.createElement("li");
  newbox.classList.add("colorbox");
  newbox.style.backgroundColor = col;
  newbox.id = `colorbox${ctr}`;
  newbox.value = ctr;
  ctr++;
  colorboxdiv.appendChild(newbox);
});

// Simple function to draw a pixel on a canvas
function drawPixel(context, x, y, color) {
  context.fillStyle = COLORLIST[color];
  context.fillRect(Math.floor(x), Math.floor(y), 1, 1);
}

function createDraggablePixel(e, color) {
  let dragPixel = document.createElement("div");
  dragPixel.style.top = e.clientX;
  dragPixel.style.left = e.clientY;
  dragPixel.id = "dragpixel";
  dragPixel.style.backgroundColor = COLORLIST[color - 1];
  dragPixel.value = color;
  dragPixel.style.position = "absolute";
  dragPixel.style.width = "10px";
  dragPixel.style.height = "10px";

  return dragPixel;
}

function placeZoomedPixel(e) {
  const box = canvas.getBoundingClientRect();
  let scaleFactor = box.width / (zoomRes * 2 + 1);
  ctx.fillStyle = e.target.style.backgroundColor;
  console.log(magOffset);
  console.log(
    parseInt(e.clientX - box.x),
    parseInt(e.clientY - box.y),
    scaleFactor
  );
  res = zoomRes;
  let target = [
    Math.floor(
      magOffset[0] - res + parseInt(e.clientX - box.left) / scaleFactor
    ),
    Math.floor(
      magOffset[1] - res + parseInt(e.clientY - box.top) / scaleFactor
    ),
  ];
  console.log(`placing pixel at ${target[0]} ${target[1]}`);
  // FOr testing
  // ctx.fillRect(target[0], target[1], 1, 1);
  return target;
}

function dropDragPixel(e) {
  let rect = canvas.getBoundingClientRect();
  let mouseOverCanvas =
    e.screenX > rect.left &&
    e.screenY > rect.top &&
    e.screenX < rect.left + canvas.clientWidth &&
    e.screenY < rect.top + canvas.clientHeight;

  // debugger??? YOU MEAN CONSOLE.LOG???????
  // console.log(e.clientX, e.clientY, rect.left, rect.top, canvas.clientWidth, canvas.clientHeight)
  if (mouseOverCanvas) {
    let target = placeZoomedPixel(e);
    publishPixel(
      target[0],
      target[1],
      e.target.value - 1, // lol, LMAO even
      document.getElementById("note").value
    );
  }
  dragElement.remove();
}

function draggableEventListener(e) {
  if (magmode == "global") {
    let dragPixel = createDraggablePixel(e, e.target.value);
    document.body.addEventListener("pointermove", (event) => {
      // if (event.target.id = "dragpixel") {
      dragPixel.style.left = `${event.clientX}px`;
      dragPixel.style.top = `${event.clientY + document.body.scrollTop}px`;
      //}
    });

    dragPixel.addEventListener("mouseup", dropDragPixel);
    dragPixel.addEventListener("touchend", dropDragPixel);
    dragElement = dragPixel;
    e.target.appendChild(dragPixel);
  }
}

// Assign the click event listeners to every color box
Array.from(document.getElementsByClassName("colorbox")).forEach((element) => {
  element.addEventListener("click", (e) => {
    colorvalue = e.target.value - 1;
    var fillcolor = e.target.style.backgroundColor;
    drawcolor = fillcolor;
    colorpreview.style.backgroundColor = fillcolor;
    // console.log(colorvalue)
  });

  element.addEventListener("mousedown", draggableEventListener);
});

function resizeMagnifier(size, time) {
  magnifier.animate(
    {
      clientHeight: `${Math.floor(size)}px`,
      clientWidth: `${Math.floor(size)}px`,
    },
    { duration: time, fill: "forwards" }
  );
  setTimeout((e) => {
    magnifier.height = Math.floor(size);
    magnifier.width = Math.floor(size);
    renderMagnifier(magOffset[0], magOffset[1], zoomRes);
  }, time / 2);
}

document.getElementById("zoomdepth").addEventListener("change", (e) => {
  zoomRes = parseInt(e.target.value);
});
