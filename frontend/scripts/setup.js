// Instantiate a list of colors where each index represents
// the color of the box
// const COLORLIST = Array.from(
//     document.querySelectorAll('li.colorbox'))
//     .map( e => window.getComputedStyle(e).backgroundColor)

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
    console.log(col);
    newbox.id = `colorbox${ctr}`;
    ctr++;
    colorboxdiv.appendChild(newbox);
})