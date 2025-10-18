// Binary Search Visualizer client script (sequential await-based animation)
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const arrayInput = document.getElementById('arrayInput');
const targetInput = document.getElementById('targetInput');
const arrayContainer = document.getElementById('arrayContainer');
const messageDiv = document.getElementById('message');

let currentBoxes = [];
let abortAnimation = false;

function reset() {
  abortAnimation = true;
  currentBoxes = [];
  arrayContainer.innerHTML = '';
  messageDiv.innerHTML = '';
}

function renderArray(arr) {
  arrayContainer.innerHTML = '';
  currentBoxes = arr.map((v, i) => {
    const div = document.createElement('div');
    div.className = 'array-box fade-in';
    div.textContent = v;
    div.dataset.index = i;
    arrayContainer.appendChild(div);
    return div;
  });
}

function clearHighlights() {
  currentBoxes.forEach(b => {
    b.classList.remove('low', 'mid', 'high', 'found', 'fade-out');
    b.classList.add('fade-in');
  });
}

function setHighlight(index, cls) {
  if (index == null || !currentBoxes[index]) return;
  currentBoxes[index].classList.add(cls);
  currentBoxes[index].classList.remove('fade-out');
}

function removeHighlight(index, cls) {
  if (index == null || !currentBoxes[index]) return;
  currentBoxes[index].classList.remove(cls);
  currentBoxes[index].classList.add('fade-out');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function animateSteps(steps, stepDelay = 1200) {
  // stepDelay controls the total time per logical step group (low->mid->high)
  // We'll show low, wait, then mid, wait, then high, wait, then move to next step.
  abortAnimation = false;
  clearHighlights();

  for (let i = 0; i < steps.length; i++) {
    if (abortAnimation) return;
    const s = steps[i];

    // Show LOW
    clearHighlights();
    setHighlight(s.low, 'low');
    await sleep( Math.max(1000, Math.min(1500, stepDelay)) );
    if (abortAnimation) return;

    // Show MID
    removeHighlight(s.low, 'low');
    setHighlight(s.mid, 'mid');
    await sleep( Math.max(1000, Math.min(1500, stepDelay)) );
    if (abortAnimation) return;

    // Show HIGH
    removeHighlight(s.mid, 'mid');
    setHighlight(s.high, 'high');
    await sleep( Math.max(1000, Math.min(1500, stepDelay)) );
    if (abortAnimation) return;

    // Clear high highlight before next step (but keep fade)
    removeHighlight(s.high, 'high');

    // If found, highlight green and stop
    if (s.found) {
      clearHighlights();
      setHighlight(s.mid, 'found');
      messageDiv.innerHTML = `<div class="text-success">Element found at index ${s.mid}.</div>`;
      return;
    }

    // If last step and not found
    if (i === steps.length - 1 && !s.found) {
      messageDiv.innerHTML = '<div class="text-danger">Element not found.</div>';
      return;
    }
  }
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
    messageDiv.innerHTML = '<div class="text-danger">Element not found.</div>';
    return;
  }

  messageDiv.innerHTML = '<div class="text-info">Animating...</div>';
  // Animate sequentially; default 1200ms per sub-step (shows low/mid/high each ~1.2s)
  await animateSteps(steps, 1200);
}

startBtn.addEventListener('click', startSearch);
resetBtn.addEventListener('click', reset);
