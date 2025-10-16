# ======================================
# Binary Search Algorithm (Robust Version)
# ======================================

def binary_search(arr, target, visualize=False):
    """
    Perform binary search on a sorted list 'arr' to find 'target'.

    Args:
        arr (list[int | float]): A sorted list of elements.
        target (int | float): The value to search for.
        visualize (bool): If True, prints each search step (for debugging/animation).

    Returns:
        int: Index of target if found, else -1.
    """
    # Reuse the step generator to keep logic in one place.
    index = -1
    step_num = 1
    for step in binary_search_steps(arr, target):
        if visualize:
            print(f"[Step {step_num}] Low={step['low']}, Mid={step['mid']}, High={step['high']}, Checking={step['midValue']}")
        step_num += 1
        if step.get("found"):
            if visualize:
                print(f"✅ Element {target} found at index {step['mid']}")
            index = step["mid"]
            break

    if index == -1 and visualize:
        print(f"❌ Element {target} not found in the array.")

    return index


def binary_search_steps(arr, target):
    """
    Generator that yields each step of binary search as a dict with low, mid, high and midValue.

    Yields:
        dict: { 'low': int, 'mid': int, 'high': int, 'midValue': number, 'found': bool }

    This keeps the core algorithm in one place so other code (like a visualizer) can
    iterate the steps without duplicating logic.
    """
    low, high = 0, len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        mid_val = arr[mid]
        # Yield the current step state
        yield {"low": low, "mid": mid, "high": high, "midValue": mid_val, "found": (mid_val == target)}

        if mid_val == target:
            return
        elif mid_val < target:
            low = mid + 1
        else:
            high = mid - 1

    # If we exit the loop, nothing more to yield: caller will interpret as not found.


def get_user_input():
    """
    Safely get user input for array and target element.
    Ensures proper error handling and sorting.
    """
    try:
        arr_input = input("Enter sorted numbers separated by space: ").strip()
        arr = [float(x) for x in arr_input.split()]
        if arr != sorted(arr):
            print("⚠️ The array is not sorted. Sorting automatically...")
            arr.sort()

        target = float(input("Enter the element to search for: "))
        return arr, target
    except ValueError:
        print("❌ Invalid input. Please enter numeric values only.")
        return None, None


def main():
    """
    Entry point for Binary Search demo.
    """
    print("\n=== Binary Search Algorithm Demo ===")
    arr, target = get_user_input()
    if arr is None or target is None:
        return

    print(f"\n🔍 Searching for {target} in {arr}")
    result = binary_search(arr, target, visualize=True)

    if result != -1:
        print(f"\n✅ Result: Element {target} found at index {result}")
    else:
        print(f"\n❌ Result: Element {target} not found.")


if __name__ == "__main__":
    main()
