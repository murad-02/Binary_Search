from flask import Flask, render_template, request, jsonify
from BSA import binary_search_steps, binary_search

app = Flask(__name__)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/search', methods=['POST'])
def search():
    """Accepts JSON with 'array' (list of numbers) and 'target' (number).

    Returns JSON list of steps where each step is {low, mid, high, midValue, found}.
    """
    data = request.get_json() or {}
    arr = data.get('array', [])
    target = data.get('target')

    # Basic validation and normalization
    # Convert each array element to int if it is integral, otherwise float.
    try:
        normalized = []
        for x in arr:
            # Handle values that may already be numeric or strings
            val = float(x)
            if val.is_integer():
                normalized.append(int(val))
            else:
                normalized.append(val)
        arr = normalized

        t = float(target)
        target = int(t) if t.is_integer() else t
    except Exception:
        return jsonify({'error': 'Invalid input. Ensure array and target are numeric.'}), 400

    # Ensure array is sorted for binary search. If not sorted, sort it and indicate this to the client.
    sorted_flag = arr == sorted(arr)
    if not sorted_flag:
        arr = sorted(arr)

    steps = list(binary_search_steps(arr, target))

    # Compute the final result index (uses the same algorithm). Also compute
    # all indices where the target appears in the sorted array (handles duplicates).
    result_index = binary_search(arr, target)
    results = [i for i, v in enumerate(arr) if v == target]

    return jsonify({'steps': steps, 'sorted': sorted_flag, 'result': result_index, 'results': results})


if __name__ == '__main__':
    app.run(debug=True)
