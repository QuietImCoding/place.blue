// Function to get the position of the cursor relative to a canvas
function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  let x, y;
  if (event.type.includes("touch")) {
    touchUser = true;
    document.getElementById("touchindicator").innerText="\n(touch edition)";
    // console.log(event);
    if (event.touches.length > 0) {
      x = parseInt(event.touches[0].clientX) - rect.left;
      y = parseInt(event.touches[0].clientY) - rect.top;
    }
  } else {
    x = Math.floor(event.clientX - rect.left);
    y = Math.floor(event.clientY - rect.top);
  }
  return [x, y];
}

// Function to magnify the detailed image
// Cursed object, do not open unless under EXTREME duress
function renderMagnifier(xval, yval, res, xtarget = res, ytarget = res) {
  // CLEAR MAGNIFIER
  magctx.fillStyle = "white";
  magctx.fillRect(0,0,magnifier.clientHeight, magnifier.clientWidth);

  // "division" is the full width of the magnifier
  // calculated as twice the resolution + 1
  let division = (res * 2) + 1;
  // The offset of each pixel is the width of the magnifier dividied by "division"
  let offset = magnifier.clientWidth / division ;

  // Madness, peer into the mind of a madman, 1 whole kilobyte of comments! 
  // console.log(
  //   magmode == "local"
  //     ? `Rendering magnifier at ${xval}, ${yval}, with resolution ${res} and division ${division}`
  //     : `Globaly magnifying origin at ${xval}, ${yval}, with resolution ${res} and division ${division}, mouse at ${xtarget},${ytarget}`
  // );
  // console.log(`resolution: ${res}, division: ${division}, offset: ${offset}`)
  // console.log(`getting region from (${xval-res}, ${yval-res}) to (${xval-res+division}, ${yval-res+division})`)

  // get underlying region of pixels from (x-res, y-res) to (x+res, y+res)
  // this is taken from CANVAS context not magctx
  let region = ctx.getImageData(xval - res, yval - res, division, division);
  const data = region.data;
  for (let x = 0; x < division; x++) {
    for (let y = 0; y < division; y++) {
      // index in data array is x*division(row value) + y(col value) * 4 bc rgba 
      let i = (x * division + y) * 4;
      // set color to first 3 bits from rgb data
      let rgbColor = `rgb(${data[i]} ${data[i + 1]} ${data[i + 2]})`;
      magctx.fillStyle =
        xval - res + y > 0 &&
        yval - res + x > 0 &&
        xval - res + y < 500 &&
        yval - res + x < 500
          ? rgbColor
          : "cadetblue";
          
      // Drawing the actual pixel
      // 
      magctx.fillRect(y * offset, x * offset, offset, offset);
//      console.log(`${xtarget / offset} ${ytarget /offset} ${xtarget} ${ytarget} ${offset}`)
    //  if (x == Math.floor(offset * xval) && y == Math.floor(offset * xval)) {
        if ( magmode == "global") {
//        console.log(`${x} ${y} ${xtarget} ${ytarget}`)
        magctx.strokeStyle = (x + y)%2 == 0? "black" : "white";
        magctx.lineWidth = 1;
        //magctx.strokeRect(y * offset, x * offset, offset, offset);
      }
    }
  }
}

function moveMagnifier(e) {
  // console.log(x, y)
  if (["local", "preview"].includes(magmode)) {
    magOffset = getCursorPosition(canvas, e);
    if (e.type == "mousemove") {
      magnifier.animate(
        {
          left: `${e.clientX}px`,
          top: `${e.clientY}px`,
        },
        { duration: 300, fill: "forwards" }
      );
    } else if (e.type == "touchmove") {
      let touch = e.touches[0];
      magnifier.animate(
        {
          left: `${touch.screenX - 50}px`,
          top: `${touch.screenY + 50}px`,
        },
        { duration: 300, fill: "forwards" }
      );
    }
  }
  if (magmode == "local") {
    renderMagnifier(
      magOffset[0],
      magOffset[1],
      parseInt(document.getElementById("resolution").value)
    );
  } else {
    renderMagnifier(
      magOffset[0],
      magOffset[1],
      zoomRes
    );
  }
}

// When mouse moved, render the magnifier and animate it
magMoveHandler = window.addEventListener("mousemove", (e) => {
  moveMagnifier(e);
});
window.addEventListener("touchmove", (e) => {
  moveMagnifier(e);
});

// Button to publish the pixels
document.getElementById("push").addEventListener("click", (e) => {
  publishPixel(
    document.getElementById("x").value,
    document.getElementById("y").value,
    document.getElementById("color").value,
    document.getElementById("note").value
  );
});

function sendPixel(e) {
  console.log(`current magmode is ${magmode}`)
  let [x, y] = getCursorPosition(canvas, e);
  if (x > 0 && y > 0 && x < 500 && y < 500) {
    if (jwt) {
      if (magmode == "local") {
        publishPixel(x, y, colorvalue, document.getElementById("note").value);
      } else if (magmode == "global") {
        let target=placeZoomedPixel(e);
        publishPixel(target[0], target[1], colorvalue,document.getElementById("note").value);
      }
    } else {
      alert("Please log in before drawing pixels");
    }
  }
}

canvas.addEventListener("mousedown", (e) => {
  if (magmode == "local") {
    magnifier.hidden = false;
  }
});

canvas.addEventListener("mouseup", (e) => {
  if (magmode == "local") {
    magnifier.hidden = true;
  }
});

magnifier.addEventListener("mouseup", (e) => {
  if (magmode != "preview") sendPixel(e);
  if (magmode == "local") {
    magnifier.hidden = true;
  }
});

canvas.addEventListener("touchstart", (e) => {
  magnifier.hidden = false;
});

magnifier.addEventListener("touchend", (e) => {
  sendPixel(e);
  if (e.touches.length == 0 && magmode == "local") {
    magnifier.hidden = true;
  }
});
// send pixel from canvas this time bc of offset
canvas.addEventListener("touchend", (e) => {
  sendPixel(e);
  if (e.touches.length == 0 && magmode == "local") {
    magnifier.hidden = true;
  }
});
window.addEventListener("touchend", (e) => {
  if (magmode == "local") {
    magnifier.hidden = true;
  }
});

// Load Image from the server and fill canvas
// Use image load as an excuse to attempt to parse cookie
let testimg = new Image();
testimg.src = `base.png?nocache=${new Date().getTime()}`;
testimg.addEventListener("load", () => {
  ctx.drawImage(testimg, 0, 0);
  if (document.cookie.length > 0) {
    loginFromCookie();
  }
});

// Color slider
document.getElementById("color").addEventListener("change", (e) => {
  document.getElementById("colorref").innerText = `Color #${e.target.value}, ${
    COLORLIST[e.target.value]
  }`;
});

// Listen for magnifier resizes
document.getElementById("magsize").addEventListener("change", (e) => {
  resizeMagnifier(e.target.value, 300);
});

function morphMagnifier(e) {
  console.log("its mighty m orphin time");
    if (magmode == "preview") {
      magmode = "global";
      
      resizeMagnifier(490, 300);

      magnifier.animate(
        {
          left: `${canvas.offsetLeft + canvas.offsetWidth / 2}px`,
          top: `${canvas.offsetTop + canvas.offsetWidth / 2}px`,
        },
        { duration: 300, fill: "forwards" }
      );

      renderMagnifier(
        magOffset[0],
        magOffset[1],
        zoomRes,
        e.clientX, e.clientY
      );
      
      magnifier.style.position = "absolute";
    }
}

document.onkeydown = e => {
  console.log(e);
  if (e.key === "Escape") {
    if (dragElement) {
      dragElement.remove();
    }
    magnifier.hidden = true;
    magmode = "local";
  } 
}

// ENHANCE BUTTON
let magzoom;
function enhance(e) {
  if (magmode == "local") {
    magnifier.hidden = false;
    magmode = "preview";
  }

  resizeMagnifier(120, 300);
  magnifier.animate(
    {
      left: `${e.clientX}px`,
      top: `${e.clientY}px`,
      borderRadius: "0px",
    },
    { duration: 300, fill: "forwards" }
  );

  document.getElementById("resolution").value = zoomRes;
  magzoom = touchUser ? 
    canvas.addEventListener("touchend", morphMagnifier) :
    magnifier.addEventListener("click", morphMagnifier);
}

function dehance(e) {
  magnifier.style.position = "fixed";

  magmode = "local";
  // magnifier.width=120;
  // magnifier.height=120;
  resizeMagnifier(120, 200);
  magnifier.animate(
    {
      left: `${e.clientX}px`,
      top: `${e.clientY}px`,
      borderRadius: "100%",
    },
    { duration: 300, fill: "forwards" }
  );
  if (magzoom) magnifier.removeEventListener(magzoom);
  // document.getElementById("resolution").value = 8;
 
  setTimeout(() => (magnifier.hidden = true), 350);
}

document.getElementById("enhance").addEventListener("click", enhance);
document.getElementById("dehance").addEventListener("click", dehance);
