# Hackerrank

## Basic

- **array_sum()**: Sum elements of array

- array_map():

```php
$arr1 = array('a' => 1, 'b' => 3, 'c' => 10);
$arr2 = array('a' => 2, 'b' => 1, 'c' => 5);

function arrayFunc($arr1, $arr2)
{
    $subtracted = array_map(function ($x, $y) {
        return $y - $x;
    }, $arr1, $arr2);
    print_r($subtracted);

    $result = array_combine(array_keys($arr1), $subtracted);
    print_r($result);
}
arrayFunc($arr1, $arr2);

// Array ( [0] => 1 [1] => -2 [2] => -5 ) Array ( [a] => 1 [b] => -2 [c] => -5 )

```
