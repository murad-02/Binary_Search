def binary_search(arr, target):
    low = 0
    high = len(arr) - 1

    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid  # Target found
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1

    return -1  # Target not found


# Example usage
if __name__ == "__main__":
    numbers = [2, 4, 6, 8, 10, 12, 14]
    target = 10

    result = binary_search(numbers, target)
    if result != -1:
        print(f"Element {target} found at index {result}")
    else:
        print(f"Element {target} not found in the list")
