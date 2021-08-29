/**
 * Returns index of x if it is present in arr[],
 * else return -1
 * @param {String[]} arr
 * @param {String} x
 * @returns
 */
export function binarySearch(arr, x) {
  let l = 0;
  let r = arr.length - 1;
  while (l <= r) {
    let m = l + Math.floor((r - l) / 2);

    let res = x.toString().localeCompare(arr[m]);

    // Check if x is present at mid
    if (res == 0) return m;

    // If x greater, ignore left half
    if (res > 0) l = m + 1;
    // If x is smaller, ignore right half
    else r = m - 1;
  }

  return -1;
}
