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
    low, high = 0, len(arr) - 1
    step = 1

    while low <= high:
        mid = (low + high) // 2
        if visualize:
            print(f"[Step {step}] Low={low}, Mid={mid}, High={high}, Checking={arr[mid]}")
        step += 1

        if arr[mid] == target:
            if visualize:
                print(f"✅ Element {target} found at index {mid}")
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    if visualize:
        print(f"❌ Element {target} not found in the array.")
    return -1


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
