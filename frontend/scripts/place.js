// Function to get the position of the cursor relative to a canvas
function getCursorPosition(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  // console.log("x: " + x + " y: " + y)
  return [x, y];
}

// Function to publish pixel when magnifier clicked
magnifier.addEventListener("click", function (e) {
  if (jwt) {
    [x, y] = getCursorPosition(canvas, e);
    // console.log(x, y);
    // ctx.fillStyle = drawcolor;
    // ctx.fillRect(x, y, 10, 10);
    publishPixel(
      Math.floor(x),
      Math.floor(y),
      colorvalue,
      document.getElementById("note").value
    );
  } else {
    alert("Please log in before drawing pixels");
  }
});

// Function to magnify the detailed image
function renderMagnifier(xval, yval) {
  let res = parseInt(document.getElementById("resolution").value);
  let division = res * 2 + 1;
  let offset = 90 / division;
  let region = ctx.getImageData(xval - res, yval - res, division, division);
  const data = region.data;
  for (let x = 0; x < division; x++) {
    for (let y = 0; y < division; y++) {
      let i = (x * division + y) * 4;
      let rgbColor = `rgb(${data[i]} ${data[i + 1]} ${data[i + 2]} / ${
        data[i + 3] / 255
      })`;
      magctx.fillStyle =
        xval - res + y > 0 &&
        yval - res + x > 0 &&
        xval - res + y < 500 &&
        yval - res + x < 500
          ? rgbColor
          : "cadetblue";
      magctx.fillRect(y * offset, x * offset, offset, offset);
    }
  }
}

// When mouse moved, render the magnifier and animate it
window.addEventListener("mousemove", (e) => {
  let [x, y] = getCursorPosition(canvas, e);
  renderMagnifier(x, y);
  magnifier.animate(
    {
      left: `${e.clientX}px`,
      top: `${e.clientY}px`,
    },
    { duration: 300, fill: "forwards" }
  );
  animating = true;
  setTimeout(() => (animating = false), 300);
  magnifier.style.left = `${e.clientX}px`;
  magnifier.style.top = `${e.clientY}px`;
});

// Events to hide and show the magnifier
Array.from(document.querySelectorAll(".nomagnify")).forEach((e) => {
  e.addEventListener("mouseenter", () => (magnifier.hidden = true));
});
Array.from(document.querySelectorAll(".nomagnify")).forEach((e) => {
  e.addEventListener("mouseleave", () => (magnifier.hidden = false));
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

// Load Image from the server and fill canvas
let testimg = new Image();
testimg.src = "base.png";
testimg.addEventListener("load", () => {
  ctx.drawImage(testimg, 0, 0);
});

// Color slider
document.getElementById("color").addEventListener("change", (e) => {
  document.getElementById("colorref").innerText = `Color #${e.target.value}, ${
    COLORLIST[e.target.value]
  }`;
});
