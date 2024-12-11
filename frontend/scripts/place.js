// Function to get the position of the cursor relative to a canvas
function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  let x, y;
  if (event.type.includes("touch")) {
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
function renderMagnifier(xval, yval, res, xtarget = res, ytarget = res) {
  let division = res * 2 + 1;
  let offset = magnifier.width / division;
  let linGrad = magctx.createLinearGradient(offset / 2, 0, offset / 2, offset);
  linGrad.addColorStop(0, "white");
  linGrad.addColorStop(1, "black");
  // DEBUG STATMENT!! I HATE MOBILE!!
  // console.log(
  //   magmode == "local"
  //     ? `Rendering magnifier at ${xval}, ${yval}, with resolution ${res} and division ${division}`
  //     : `Globaly magnifying origin at ${xval}, ${yval}, with resolution ${res} and division ${division}, mouse at ${xtarget},${ytarget}`
  // );
  let region = ctx.getImageData(xval - res, yval - res, division, division);
  const data = region.data;
  for (let x = 0; x < division; x++) {
    for (let y = 0; y < division; y++) {
      let i = (x * division + y) * 4;
      let rgbColor = `rgb(${data[i]} ${data[i + 1]} ${data[i + 2]})`;
      magctx.fillStyle =
        xval - res + y > 0 &&
        yval - res + x > 0 &&
        xval - res + y < 500 &&
        yval - res + x < 500
          ? rgbColor
          : "cadetblue";
      // Drawing the actual pixel
      magctx.fillRect(y * offset, x * offset, offset, offset);
//      console.log(`${xtarget / offset} ${ytarget /offset} ${xtarget} ${ytarget} ${offset}`)
      if (x == Math.floor(offset * xval) && y == Math.floor(offset * xval)) {
//        console.log(`${x} ${y} ${xtarget} ${ytarget}`)
        magctx.strokeStyle = linGrad;
        magctx.lineWidth = 1;
        magctx.strokeRect(y * offset, x * offset, offset, offset);
      }
    }
  }
}

function scaleCanvas() {}

function moveMagnifier(e) {
  // console.log(x, y)
  if (magmode == "local") {
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
      parseInt(document.getElementById("resolution").value),
      e.clientX, e.clientY
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
  let [x, y] = getCursorPosition(canvas, e);
  if (x > 0 && y > 0 && x < 500 && y < 500) {
    if (jwt) {
      if (magmode == "local") {
        publishPixel(x, y, colorvalue, document.getElementById("note").value);
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
  sendPixel(e);
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

// ENHANCE BUTTON
let magzoom;
function enhance(e) {
  if (magmode == "local") magnifier.hidden = false;

  resizeMagnifier(120, 300);

  magnifier.animate(
    {
      left: `${e.clientX}px`,
      top: `${e.clientY}px`,
      borderRadius: "0px",
    },
    { duration: 300, fill: "forwards" }
  );

  // document.getElementById("resolution").value = 50;
  magzoom = magnifier.addEventListener("mousedown", (e) => {
    if (magmode == "local") {
      magmode = "global";
      document.getElementById("resolution").value = 50;
      // magOffset = [e.offsetX, e.offsetY]
      resizeMagnifier(500, 300);
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
        parseInt(document.getElementById("resolution").value),
        e.clientX, e.clientY
      );
    }
  });
}

function dehance(e) {
  magmode = "local";
  magnifier.animate(
    {
      left: e.clientX,
      top: e.clientY,
      borderRadius: "100%",
    },
    { duration: 300, fill: "forwards" }
  );
  if (magzoom) magnifier.removeEventListener(magzoom);
  document.getElementById("resolution").value = 8;
  setTimeout(() => (magnifier.hidden = true), 250);
}

document.getElementById("enhance").addEventListener("click", enhance);
document.getElementById("dehance").addEventListener("click", dehance);
