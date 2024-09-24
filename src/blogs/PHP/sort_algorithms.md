# Sort Algorithms

## Bubble Sort

So sánh các phần tử liền kề và hoán đổi chúng nếu chúng không theo đúng thứ tự. Quá trình này lặp lại cho đến khi mảng được sắp xếp.

```php
do

  swapped = false

  for i = 1 to indexOfLastUnsortedElement-1

    if leftElement > rightElement

      swap(leftElement, rightElement)

      swapped = true; ++swapCounter

while swapped

```

```php
function BubbleSort($arr)
{
    do {
        $swapped = false;
        for ($i = 0; $i < count($arr) - 1; $i++) {
            if ($arr[$i] > $arr[$i + 1]) {
                [$arr[$i], $arr[$i + 1]] = [$arr[$i + 1], $arr[$i]];
                $swapped = true;
            }
        }
    } while ($swapped);
    return $arr;
}

```

## Selection Sort

Thuật toán này tìm phần tử nhỏ nhất (hoặc lớn nhất) trong danh sách và đưa nó vào vị trí đầu tiên, sau đó lặp lại quá trình cho các phần tử còn lại.

```php
repeat (numOfElements - 1) times

  set the first unsorted element as the minimum

  for each of the unsorted elements

    if element < currentMinimum

      set element as new minimum

  swap minimum with first unsorted position

```

```php
function SelectionSort($arr)
{
    for ($i = 0; $i < count($arr); $i++) {
        $min_index = $i;
        for ($j = $i + 1; $j < count($arr); $j++) {
            if ($arr[$min_index] > $arr[$j]) {
                $min_index = $j;
            }
        }
        if ($i != $min_index) {
            [$arr[$i], $arr[$min_index]] = [$arr[$min_index], $arr[$i]];
        }
    }
    return $arr;
}

```

## Quick Sort

Thuật toán này chọn một phần tử làm pivot, phân chia mảng thành hai phần dựa trên pivot, sau đó sắp xếp từng phần một cách đệ quy. Đây cũng là một thuật toán chia để trị.

```php
for each (unsorted) partition

set first element as pivot

  storeIndex = pivotIndex+1

  for i = pivotIndex+1 to rightmostIndex

    if ((a[i] < a[pivot]) or (equal but 50% lucky))

      swap(i, storeIndex); ++storeIndex

  swap(pivot, storeIndex-1)

```

```php
function QuickSort(array &$arr, int $left, int $right): void
{
    if ($left < $right) {
        $pivotIndex = partition($arr, $left, $right);

        QuickSort($arr, $left, $pivotIndex - 1);
        QuickSort($arr, $pivotIndex + 1, $right);
    }
}

function partition(array &$arr, int $left, int $right): int
{
    $pivot = $arr[$left];
    $storeIndex = $left + 1;

    for ($i = $left + 1; $i <= $right; $i++) {
        if ($arr[$i] < $pivot || ($arr[$i] == $pivot && rand(0, 1) == 1)) {
            [$arr[$i], $arr[$storeIndex]] = [$arr[$storeIndex], $arr[$i]];
            $storeIndex++;
        }
    }

    [$arr[$left], $arr[$storeIndex - 1]] = [$arr[$storeIndex - 1], $arr[$left]];

    return $storeIndex - 1;
}

```

## Insertion Sort

Thuật toán này xây dựng mảng sắp xếp bằng cách lặp qua các phần tử, chèn từng phần tử vào vị trí chính xác của nó trong mảng con đã được sắp xếp trước đó.

```php
mark first element as sorted

for each unsorted element X

  'extract' the element X

  for j = lastSortedIndex down to 0

    if current element j > X

      move sorted element to the right by 1

    break loop and insert X here

```

```php
function insertionSort(array $arr): array
{
    $n = count($arr);

    for ($i = 1; $i < $n; $i++) {
        $key = $arr[$i];
        $j = $i - 1;

        while ($j >= 0 && $arr[$j] > $key) {
            $arr[$j + 1] = $arr[$j];
            $j--;
        }
        $arr[$j + 1] = $key;
    }

    return $arr;
}

```