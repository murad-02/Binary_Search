from BSA import binary_search


def run_case(arr, target):
    print("Array:", arr)
    print("Target:", target)
    idx = binary_search(arr, target, visualize=False)
    if idx != -1:
        print(f"Result: {target} is found at index {idx}.\n")
    else:
        print(f"Result: {target} not found.\n")


if __name__ == '__main__':
    # Test 1: already sorted
    run_case([3, 4, 5, 6, 7], 6)  # expected index 3

    # Test 2: unsorted input - BSA.binary_search assumes sorted input; simulate sorting like server
    arr2 = [3, 4, 6, 2, 1]
    sorted_arr2 = sorted(arr2)
    run_case(sorted_arr2, 4)  # expected index 3 (in sorted array [1,2,3,4,6])
