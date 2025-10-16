"""Small helper to test binary_search_steps without running Flask."""
from BSA import binary_search_steps

def test():
    arr = [1,3,5,7,9]
    target = 6
    steps = list(binary_search_steps(arr, target))
    for s in steps:
        print(s)

if __name__ == '__main__':
    test()
