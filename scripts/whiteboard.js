const canvas = document.getElementById('whiteboardCanvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let drawing = false;
let currentTool = 'pen';
let color = '#000000';
let lastX = 0;
let lastY = 0;
let shapeStartX = 0;
let shapeStartY = 0;
let fillShape = false;

const history = [];
let redoStack = [];

function saveState() {
  history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  redoStack = [];
}

function undo() {
  if (history.length > 0) {
    redoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const imgData = history.pop();
    ctx.putImageData(imgData, 0, 0);
  }
}

function redo() {
  if (redoStack.length > 0) {
    history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    const imgData = redoStack.pop();
    ctx.putImageData(imgData, 0, 0);
  }
}

document.getElementById('undoBtn').addEventListener('click', undo);
document.getElementById('redoBtn').addEventListener('click', redo);
document.getElementById('saveBtn').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'whiteboard.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

document.querySelectorAll('input[name="tool"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentTool = e.target.value;
  });
});

document.getElementById('fillToggle').addEventListener('change', (e) => {
  fillShape = e.target.checked;
});

const colorPicker = document.getElementById('colorPicker');
const hexInput = document.getElementById('hexInput');
const rgbInput = document.getElementById('rgbInput');

function setColor(newColor) {
  color = newColor;
  colorPicker.value = newColor;
  hexInput.value = newColor;
  const r = parseInt(newColor.slice(1, 3), 16);
  const g = parseInt(newColor.slice(3, 5), 16);
  const b = parseInt(newColor.slice(5, 7), 16);
  rgbInput.value = `${r},${g},${b}`;
}

colorPicker.addEventListener('input', (e) => setColor(e.target.value));
hexInput.addEventListener('change', () => {
  const value = hexInput.value;
  if (/^#[0-9A-Fa-f]{6}$/.test(value)) setColor(value);
});
rgbInput.addEventListener('change', () => {
  const parts = rgbInput.value.split(',').map(Number);
  if (parts.length === 3 && parts.every(n => n >= 0 && n <= 255)) {
    const hex = `#${parts.map(n => n.toString(16).padStart(2, '0')).join('')}`;
    setColor(hex);
  }
});

function drawLine(x1, y1, x2, y2) {
  ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : color;
  ctx.lineWidth = currentTool === 'marker' ? 10 : 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawRectangle(x, y, width, height) {
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  if (fillShape) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawCircle(cx, cy, radius) {
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
  if (fillShape) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawTriangle(x1, y1, x2, y2) {
  const midX = (x1 + x2) / 2;
  ctx.beginPath();
  ctx.moveTo(midX, y1);
  ctx.lineTo(x1, y2);
  ctx.lineTo(x2, y2);
  ctx.closePath();
  if (fillShape) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawQuadrilateral(x1, y1, x2, y2) {
  const offset = Math.abs(x2 - x1) / 4;
  ctx.beginPath();
  ctx.moveTo(x1 + offset, y1);
  ctx.lineTo(x2 - offset, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x1, y2);
  ctx.closePath();
  if (fillShape) {
    ctx.fillStyle = color;
    ctx.fill();
  } else {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
  [shapeStartX, shapeStartY] = [e.offsetX, e.offsetY];
  if (['pen', 'marker', 'eraser'].includes(currentTool)) saveState();
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const [x, y] = [e.offsetX, e.offsetY];
  if (['pen', 'marker', 'eraser'].includes(currentTool)) {
    drawLine(lastX, lastY, x, y);
    [lastX, lastY] = [x, y];
  }
});

canvas.addEventListener('mouseup', (e) => {
  if (!drawing) return;
  drawing = false;
  const [x, y] = [e.offsetX, e.offsetY];
  if (!['pen', 'marker', 'eraser'].includes(currentTool)) saveState();

  if (currentTool === 'ruler' || currentTool === 'divider') {
    drawLine(shapeStartX, shapeStartY, x, y);
  } else if (currentTool === 'rectangle') {
    drawRectangle(shapeStartX, shapeStartY, x - shapeStartX, y - shapeStartY);
  } else if (currentTool === 'square') {
    const side = Math.min(Math.abs(x - shapeStartX), Math.abs(y - shapeStartY));
    drawRectangle(shapeStartX, shapeStartY, side * Math.sign(x - shapeStartX), side * Math.sign(y - shapeStartY));
  } else if (currentTool === 'circle') {
    const radius = Math.hypot(x - shapeStartX, y - shapeStartY) / 2;
    drawCircle((x + shapeStartX) / 2, (y + shapeStartY) / 2, radius);
  } else if (currentTool === 'triangle') {
    drawTriangle(shapeStartX, shapeStartY, x, y);
  } else if (currentTool === 'quadrilateral') {
    drawQuadrilateral(shapeStartX, shapeStartY, x, y);
  }
});

canvas.addEventListener('mouseleave', () => drawing = false);
canvas.addEventListener('touchstart', () => drawing = false);
canvas.addEventListener('touchend', () => drawing = false);

window.addEventListener('resize', () => {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.putImageData(imgData, 0, 0);
});
