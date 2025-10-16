from flask import Flask, render_template, request, jsonify
from BSA import binary_search_steps

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
    try:
        arr = [float(x) for x in arr]
        # Keep original types if integers
        arr = [int(x) if float(x).is_integer() else x for x in arr]
        target = float(target)
        target = int(target) if float(target).is_integer() else target
    except Exception:
        return jsonify({'error': 'Invalid input. Ensure array and target are numeric.'}), 400

    # Ensure array is sorted for binary search. If not sorted, sort it and indicate this to the client.
    sorted_flag = arr == sorted(arr)
    if not sorted_flag:
        arr = sorted(arr)

    steps = []
    for step in binary_search_steps(arr, target):
        steps.append(step)

    return jsonify({'steps': steps, 'sorted': sorted_flag})


if __name__ == '__main__':
    app.run(debug=True)
