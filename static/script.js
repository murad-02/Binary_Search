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
  // Clear notes panel
  const notes = document.getElementById('notes');
  if (notes) notes.innerHTML = '';
  // Reset inputs
  arrayInput.value = '';
  targetInput.value = '';
}

function renderArray(arr) {
  arrayContainer.innerHTML = '';
  currentBoxes = arr.map((v, i) => {
    const div = document.createElement('div');
    div.className = 'array-box fade-in';
    div.textContent = v;
    div.dataset.index = i;
    // Add index tooltip
    div.title = `Index: ${i}`;
    // Add small index label below
    const indexLabel = document.createElement('small');
    indexLabel.className = 'index-label';
    indexLabel.textContent = i;
    div.appendChild(indexLabel);
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

function appendNote(text, kind = 'normal') {
  const notes = document.getElementById('notes');
  if (!notes) return;
  const div = document.createElement('div');
  div.className = `note-entry ${kind}`;
  
  // Add appropriate emoji based on note type
  let emoji = '🔍'; // default search emoji
  if (kind === 'success') emoji = '✅';
  else if (kind === 'fail') emoji = '❌';
  else if (text.includes('move right')) emoji = '➡️';
  else if (text.includes('move left')) emoji = '⬅️';
  
  div.textContent = `${emoji} ${text}`;
  notes.appendChild(div);
  
  // Smooth scroll to new note
  div.scrollIntoView({ behavior: 'smooth', block: 'end' });
  
  // Trigger entrance animation
  requestAnimationFrame(() => div.classList.add('show'));
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
  // Append the descriptive message for this step (first time we display it)
  if (s.message) appendNote(s.message, 'normal');
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
      appendNote(`Found: ${s.message}`, 'success');
      return;
    }

    // If last step and not found
    if (i === steps.length - 1 && !s.found) {
      messageDiv.innerHTML = '<div class="text-danger">Element not found.</div>';
      appendNote('Element not found.', 'fail');
      return;
    }
  }
}

async function animateSorting(originalArr, sortedArr) {
  // Create a mapping of sorted values to a queue of target indices (handles duplicates)
  const newIndices = {};
  sortedArr.forEach((val, idx) => {
    const key = String(val);
    if (!newIndices[key]) newIndices[key] = [];
    newIndices[key].push(idx);
  });

  // First, mark all elements that need to move
  currentBoxes.forEach((box, idx) => {
    const value = originalArr[idx];
    const key = String(value);
    const queue = newIndices[key] || [];
    const newIdx = queue.length ? queue[0] : idx;
    if (newIdx !== idx) {
      box.classList.add('will-move');
    }
  });

  await sleep(500); // Pause to show which will move

  // Animate each element to its new position. We consume the queue so duplicates map correctly.
  const promises = currentBoxes.map((box, idx) => {
    const value = originalArr[idx];
    const key = String(value);
    const queue = newIndices[key] || [];
    const newIdx = queue.length ? queue.shift() : idx;
    if (newIdx !== idx) {
      const translateX = (newIdx - idx) * (64 + 12); // box width + gap
      box.style.transform = `translateX(${translateX}px)`;
      return sleep(800); // Duration of move animation
    }
    return Promise.resolve();
  });

  await Promise.all(promises);
  await sleep(300); // Small pause before rendering final sorted array

  // Render the sorted array
  renderArray(sortedArr);
  appendNote('🔄 Array was automatically sorted for binary search.', 'info');
}

async function startSearch() {
  // Prepare for a new search without clearing user inputs.
  abortAnimation = true;
  await sleep(50);
  abortAnimation = false;
  clearHighlights();
  const notesEl = document.getElementById('notes');
  if (notesEl) notesEl.innerHTML = '';
  messageDiv.innerHTML = '';

  const arrText = arrayInput.value.trim();
  if (!arrText) {
    messageDiv.innerHTML = '<div class="text-danger">Please enter an array.</div>';
    return;
  }
  
  // Parse input array and validate
  let arr;
  try {
    arr = arrText.split(/\s+/).map(x => {
      if (isNaN(x)) throw new Error('Invalid number');
      return x.includes('.') ? parseFloat(x) : parseInt(x);
    });
    if (arr.length === 0) throw new Error('Empty array');
  } catch (err) {
    messageDiv.innerHTML = '<div class="text-danger">Invalid array input. Please enter valid numbers.</div>';
    return;
  }

  const targetRaw = targetInput.value.trim();
  if (!targetRaw) {
    messageDiv.innerHTML = '<div class="text-danger">Please enter a target value.</div>';
    return;
  }

  let target;
  try {
    target = targetRaw.includes('.') ? parseFloat(targetRaw) : parseInt(targetRaw);
    if (isNaN(target)) throw new Error('Invalid target');
  } catch (err) {
    messageDiv.innerHTML = '<div class="text-danger">Invalid target value. Please enter a valid number.</div>';
    return;
  }

  // First render the original array
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

  // If server indicated the array was not sorted, animate sorting first and
  // then run the binary search steps on the sorted array. The server returns
  // steps computed on the sorted array, so we must display that sorted array.
  if (!data.sorted) {
    const sortedArr = [...arr].sort((a, b) => a - b);
    await animateSorting(arr, sortedArr);
    // Update the local array and currentBoxes now that we've rendered the sorted array
    arr = sortedArr;
  }

  messageDiv.innerHTML = '<div class="text-info">Animating...</div>';
  // Animate sequentially; default 1200ms per sub-step (shows low/mid/high each ~1.2s)
  await animateSteps(steps, 1200);

  // After animation, if the server returned all matching indices (duplicates), highlight them
  const results = Array.isArray(data.results) && data.results.length ? data.results : (data.result !== undefined ? [data.result] : []);
  if (results.length) {
    // Clear any previous highlights and mark all matched indices
    clearHighlights();
    results.forEach(idx => {
      if (currentBoxes[idx]) currentBoxes[idx].classList.add('found');
    });

    if (results.length === 1) {
      appendNote(`Found target ${target} at index ${results[0]}.`, 'success');
      messageDiv.innerHTML = `<div class="text-success">Target ${target} found at index ${results[0]}.</div>`;
    } else {
      appendNote(`Found target ${target} at indices ${results.join(', ')}.`, 'success');
      messageDiv.innerHTML = `<div class="text-success">Target ${target} found at indices ${results.join(', ')}.</div>`;
    }
  }
}

startBtn.addEventListener('click', startSearch);
resetBtn.addEventListener('click', reset);
