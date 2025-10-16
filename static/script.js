// Binary Search Visualizer client script
// Sends AJAX POST to /search with array and target, then animates each step.

const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const arrayInput = document.getElementById('arrayInput');
const targetInput = document.getElementById('targetInput');
const arrayContainer = document.getElementById('arrayContainer');
const messageDiv = document.getElementById('message');

let currentBoxes = [];
let animationTimeouts = [];

function clearAnimation() {
  animationTimeouts.forEach(t => clearTimeout(t));
  animationTimeouts = [];
}

function reset() {
  clearAnimation();
  currentBoxes = [];
  arrayContainer.innerHTML = '';
  messageDiv.innerHTML = '';
}

function renderArray(arr) {
  arrayContainer.innerHTML = '';
  currentBoxes = arr.map((v, i) => {
    const div = document.createElement('div');
    div.className = 'array-box';
    div.textContent = v;
    div.dataset.index = i;
    arrayContainer.appendChild(div);
    return div;
  });
}

function colorBoxes(state) {
  // clear all highlights
  currentBoxes.forEach(b => {
    b.classList.remove('low');
    b.classList.remove('mid');
    b.classList.remove('high');
    b.classList.remove('found');
  });

  const { low, mid, high, found } = state;
  if (low != null && currentBoxes[low]) currentBoxes[low].classList.add('low');
  if (mid != null && currentBoxes[mid]) currentBoxes[mid].classList.add('mid');
  if (high != null && currentBoxes[high]) currentBoxes[high].classList.add('high');
  if (found && currentBoxes[mid]) currentBoxes[mid].classList.add('found');
}

async function startSearch() {
  reset();
  const arrText = arrayInput.value.trim();
  if (!arrText) {
    messageDiv.innerHTML = '<div class="text-danger">Please enter an array.</div>';
    return;
  }
  const arr = arrText.split(/\s+/).map(x => isNaN(x) ? x : (x.includes('.') ? parseFloat(x) : parseInt(x)));
  const targetRaw = targetInput.value.trim();
  if (!targetRaw) {
    messageDiv.innerHTML = '<div class="text-danger">Please enter a target value.</div>';
    return;
  }
  const target = isNaN(targetRaw) ? targetRaw : (targetRaw.includes('.') ? parseFloat(targetRaw) : parseInt(targetRaw));

  renderArray(arr);

  // POST to backend
  messageDiv.innerHTML = '<div class="text-muted">Computing steps...</div>';
  let resp;
  try {
    resp = await fetch('/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ array: arr, target: target })
    });
  } catch (err) {
    messageDiv.innerHTML = `<div class="text-danger">Network error: ${err}</div>`;
    return;
  }

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    messageDiv.innerHTML = `<div class="text-danger">Error: ${err.error || resp.statusText}</div>`;
    return;
  }

  const data = await resp.json();
  const steps = data.steps || [];

  if (!steps.length) {
    // No steps -> not found
    messageDiv.innerHTML = '<div class="text-danger">Element not found.</div>';
    return;
  }

  // Animate steps with a small delay between them
  messageDiv.innerHTML = '<div class="text-info">Animating...</div>';
  let delay = 0;
  const stepDelay = 900; // ms

  steps.forEach((s, idx) => {
    const t = setTimeout(() => {
      colorBoxes(s);
      if (s.found) {
        messageDiv.innerHTML = `<div class="text-success">Element found at index ${s.mid}.</div>`;
      } else if (idx === steps.length - 1 && !s.found) {
        // final step, not found
        messageDiv.innerHTML = '<div class="text-danger">Element not found.</div>';
      }
    }, delay);
    animationTimeouts.push(t);
    delay += stepDelay;
  });
}

startBtn.addEventListener('click', startSearch);
resetBtn.addEventListener('click', reset);
