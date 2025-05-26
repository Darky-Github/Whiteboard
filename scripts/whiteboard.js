const canvas = document.getElementById('whiteboardCanvas');
const ctx = canvas.getContext('2d');

canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

let drawing = false;
let currentTool = 'pen';
let color = '#000000';
let lastX = 0;
let lastY = 0;

document.querySelectorAll('input[name="tool"]').forEach(radio => {
  radio.addEventListener('change', (e) => {
    currentTool = e.target.value;
  });
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

canvas.addEventListener('mousedown', (e) => {
  drawing = true;
  [lastX, lastY] = [e.offsetX, e.offsetY];
});

canvas.addEventListener('mousemove', (e) => {
  if (!drawing) return;
  const [x, y] = [e.offsetX, e.offsetY];
  if (['pen', 'marker', 'eraser'].includes(currentTool)) {
    drawLine(lastX, lastY, x, y);
    [lastX, lastY] = [x, y];
  }
});

canvas.addEventListener('mouseup', () => drawing = false);
canvas.addEventListener('mouseleave', () => drawing = false);

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  [lastX, lastY] = [touch.clientX - rect.left, touch.clientY - rect.top];
  drawing = true;
});

canvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!drawing) return;
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;
  if (['pen', 'marker', 'eraser'].includes(currentTool)) {
    drawLine(lastX, lastY, x, y);
    [lastX, lastY] = [x, y];
  }
});

canvas.addEventListener('touchend', () => drawing = false);
canvas.addEventListener('touchcancel', () => drawing = false);

window.addEventListener('resize', () => {
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.putImageData(imgData, 0, 0);
});

