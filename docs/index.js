const { brushlib } = window;
// Show brushes
async function viewAllBrushes() {
  const canvas = document.querySelector("#canvas1");
  const painter1 = await brushlib.create(canvas);
  const brushes = brushlib.brushes;
  const ctx = canvas.getContext("2d");

  let i = 0;
  const brushAreaHeight = 40;
  const brushAreaMarginX = 20;

  // const rect = document.body.getBoundingClientRect()
  canvas.width = 600; // window.innerWidth // rect.right - rect.left
  canvas.height = brushes.length * brushAreaHeight; // window.innerHeight // rect.bottom - rect.top

  // canvas.style.backgroundColor = 'rgb(39, 43, 54)'

  ctx.font = "16px sans-serif";
  ctx.fillStyle = "black";

  const maxX = canvas1.width;

  for (const brush of brushes) {
    painter1.setBrush(brush);

    painter1.setColor(
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
      Math.floor(Math.random() * 255),
    );

    const y = brushAreaHeight / 2 + i * brushAreaHeight;

    painter1.newStroke(brushAreaMarginX, y);
    painter1.stroke(brushAreaMarginX, y, 0, 1, 0, 0);
    painter1.stroke(maxX - brushAreaMarginX, y, 1, 1, 0, 0);

    // ctx.fillText(brush.name, 25, y)

    i++;
  }
}

// Painter
async function painterBrush() {
  const canvas = document.querySelector("#canvas2");
  const painter = await brushlib.create(canvas);
  const brushes = brushlib.brushes;

  const ctx = canvas.getContext("2d");

  canvas.width = 900; // window.innerWidth // rect.right - rect.left
  canvas.height = 900; // window.innerHeight // rect.bottom - rect.top

  ctx.font = "16px sans-serif";
  ctx.fillStyle = "black";

  let currentBrush = brushes[0];
  painter.setBrush(currentBrush);
  painter.setBrushSize(currentBrush.size);

  const boxControl = document.createElement("div");
  boxControl.className = "boxControl";

  const boxControlSize = document.createElement("div");
  boxControlSize.style = "display: flex; flex-direction: column; gap: 10px;";
  const sizeB = document.createElement("input");
  sizeB.type = "range";
  sizeB.min = 0;
  sizeB.max = 40;
  sizeB.step = 0.01;
  sizeB.value = currentBrush.size;

  const sizeBs = document.createElement("span");
  sizeBs.textContent = `Size: ${currentBrush.size}`;

  sizeB.addEventListener("input", (e) => {
    const v = +e.target.value;
    painter.setBrushSize(v);
    sizeBs.textContent = `Size: ${v}`;
  });
  boxControlSize.append(sizeB, sizeBs);

  const selectBrush = document.createElement("select");

  brushes.forEach((b) => {
    const opt = document.createElement("option");
    opt.value = b.name;
    opt.textContent = b.name;
    selectBrush.append(opt);
  });

  selectBrush.addEventListener("change", (e) => {
    currentBrush = brushes[e.target.selectedIndex];
    painter.setBrush(currentBrush);
    painter.setBrushSize(currentBrush.size);
    sizeBs.textContent = `Size: ${currentBrush.size}`;
    sizeB.value = currentBrush.size;
  });

  boxControl.append(selectBrush, boxControlSize);
  document.body.append(boxControl);

  let pointerMoveHandler = pointermove;
  canvas.addEventListener("pointerdown", pointerdown);
  canvas.addEventListener("pointerup", pointerup);

  function pointerdown(evt) {
    let curX = evt.clientX;
    let curY = evt.clientY;
    t1 = new Date().getTime();
    canvas.addEventListener("pointermove", pointerMoveHandler);
    painter.newStroke(curX, curY);
  }
  function pointerup(evt) {
    canvas.removeEventListener("pointermove", pointerMoveHandler);
  }
  function pointermove(evt) {
    let isEraser;
    let curX = 0;
    let curY = 0;
    let { pressure: pressurePointer, pointerType, button } = evt;
    let pressure = 0.75 / 100;
    if (!pressure) pressure = pressurePointer;
    curX = evt.clientX;
    curY = evt.clientY;

    painter.stroke(curX, curY, 1, 1, 0, 0);
  }
}

async function main() {
  await painterBrush();
  await viewAllBrushes();
}

main().catch(console.error);

/**
 * Line and Bezier curves
 * https://stackoverflow.com/questions/17083580/i-want-to-do-animation-of-an-object-along-a-particular-path/17096947#17096947
 */

function getPointsBetween(b, callback, numPoints = 20) {
  const points = [b[0]];
  let lastPoint = b[0];

  for (let t = 0; t <= numPoints; t++) {
    // calc another point along the curve
    const point = callback(b, t / numPoints);

    // Add the point if it's not already in the points[] array
    const dx = point.x - lastPoint.x;
    const dy = point.y - lastPoint.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    const dInt = parseInt(d);
    if (dInt > 0 || t === numPoints) {
      lastPoint = point;
      points.push(point);
    }
  }
  return points;
}

function getLinePoints(b, numPoints) {
  return getPointsBetween(b, getLineXYatPercent, numPoints);
}
function getQuadraticBezierPoints(b, numPoints) {
  return getPointsBetween(b, getQuadraticBezierXYatTime, numPoints);
}
function getCubicBezierPoints(b, numPoints) {
  return getPointsBetween(b, getCubicBezierXYatTime, numPoints);
}

// Given the 4 control points on a Bezier curve
// Get x,y at interval T along the curve (0<=t<=1)
// The curve starts when t==0 and ends when t==1
function getCubicBezierXYatTime(b, t) {
  const [startPoint, controlPoint1, controlPoint2, endPoint] = b;
  const x = CubicN(
    t,
    startPoint.x,
    controlPoint1.x,
    controlPoint2.x,
    endPoint.x,
  );
  const y = CubicN(
    t,
    startPoint.y,
    controlPoint1.y,
    controlPoint2.y,
    endPoint.y,
  );
  return { x, y };
}

// Cubic helper formula
function CubicN(t, a, b, c, d) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (
    a +
    (-a * 3 + t * (3 * a - a * t)) * t +
    (3 * b + t * (-6 * b + b * 3 * t)) * t +
    (c * 3 - c * 3 * t) * t2 +
    d * t3
  );
}

function getQuadraticBezierXYatTime(b, t) {
  const [startPoint, controlPoint, endPoint] = b;
  const x =
    Math.pow(1 - t, 2) * startPoint.x +
    2 * (1 - t) * t * controlPoint.x +
    Math.pow(t, 2) * endPoint.x;
  const y =
    Math.pow(1 - t, 2) * startPoint.y +
    2 * (1 - t) * t * controlPoint.y +
    Math.pow(t, 2) * endPoint.y;
  return { x, y };
}

function getLineXYatPercent(b, t) {
  const [startPoint, endPoint] = b;
  const dx = endPoint.x - startPoint.x;
  const dy = endPoint.y - startPoint.y;
  const x = startPoint.x + dx * t;
  const y = startPoint.y + dy * t;
  return { x, y };
}

function drawPoints(points) {
  ctx.fillStyle = "red";
  // don't draw the last dot b/ its radius will display past the curve
  for (let i = 0; i < points.length - 1; i++) {
    ctx.beginPath();
    ctx.arc(points[i].x, points[i].y, 1, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawBezier(b) {
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(b[0].x, b[0].y);
  ctx.bezierCurveTo(b[1].x, b[1].y, b[2].x, b[2].y, b[3].x, b[3].y);
  ctx.stroke();
}
