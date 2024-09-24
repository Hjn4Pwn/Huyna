# DSA

[ref](https://dsawithphp.com/)

## Array

- It is important to check if an array element exists before accessing it. Trying to access an undefined array element can result in an error. To avoid this, you can use the **isset()** function to check if an element exists in the array. For example:

```php
if (isset($user['name'])) {
    echo $user['name'];
} else {
    echo 'Name not found';
}

```

### Array Manual

```php
$fruits = []
// or
$fruits = array("apple", "banana", "orange");
// or
$fruits = ["apple", "banana", "orange"];
var_dump($fruits);
echo $fruits[0]; // Output: apple

// ----------------------------------

// Thêm phần tử ở vị trí cụ thể
array_splice($myList, 1, 0, "Orange");

foreach ($myList as $item) {
    echo $item . " "; 
}
// ----------------------------------

//Keys not on all elements
$array = array(
         "a",
         "b",
    6 => "c",
         "d",
);
var_dump($array);
print_r($array);

//Output
array(4) {
  [0]=>
  string(1) "a"
  [1]=>
  string(1) "b"
  [6]=>
  string(1) "c"
  [7]=>
  string(1) "d"
}
// ----------------------------------

function getArray() {
    return array(1, 2, 3);
}

$secondElement = getArray()[1];
// ----------------------------------

// Creating/modifying with square bracket syntax 
$arr = array(5 => 1, 12 => 2);

$arr[] = 56;    // This is the same as $arr[13] = 56;
$arr["x"] = 42; // This adds a new element to the array with key "x"
                
unset($arr[5]); // This removes the element from the array
unset($arr);    // This deletes the whole array
// ----------------------------------

$arr = [[]]; 

```

- **print_r($array);**: Hiển thị nội dung của mảng (array) hoặc đối tượng (object) một cách dễ đọc hơn, thường dùng để kiểm tra giá trị một cách nhanh chóng. Nó sẽ không hiển thị kiểu dữ liệu và độ dài của các giá trị.
- **var_dump($array);**: Hiển thị chi tiết hơn, bao gồm cả kiểu dữ liệu và độ dài của các giá trị trong mảng hoặc đối tượng. Đây là công cụ mạnh mẽ hơn để kiểm tra thông tin chi tiết của một biến.

- **Array destructuring:**

```php
$source_array = ['foo', 'bar', 'baz'];

[$foo, $bar, $baz] = $source_array;

echo $foo;    // prints "foo"
echo $bar;    // prints "bar"
echo $baz;    // prints "baz"

```

- Nếu $source_array có ít hơn số biến trong cú pháp destructuring (ví dụ như chỉ có 2 phần tử), các biến còn lại sẽ nhận giá trị null.

- Nếu $source_array có nhiều phần tử hơn số biến trong cú pháp destructuring, các phần tử thừa sẽ bị bỏ qua.

### Problem Solving with PHP Array

```php
$numbers = [5, 10, 2, 8, 3];
$maxValue = max($numbers);
echo "The maximum value is: " . $maxValue;
// ----------------------------------

$fruits = ["apple", "banana", "orange"];
$numFruits = count($fruits);
echo "The number of fruits is: " . $numFruits;

// ----------------------------------
$names = ["John", "Jane", "Michael"];
$searchName = "Jane";
if (in_array($searchName, $names)) {
    echo $searchName . " is found in the array.";
} else {
    echo $searchName . " is not found in the array.";
}
// ----------------------------------

$numbers = [5, 10, 2, 8, 3];
sort($numbers);
echo "The sorted array is: ";
foreach ($numbers as $number) {
    echo $number . " ";
}


```

## Linked List

- Linked List (Danh sách liên kết) là một cấu trúc dữ liệu bao gồm một chuỗi các node (nút), trong đó mỗi node chứa hai thành phần chính:
  - **Dữ liệu**: Giá trị mà node lưu trữ.
  - **Con trỏ**: Trỏ đến node tiếp theo trong danh sách.

- Không giống như mảng, các phần tử của linked list không nằm liên tiếp trong bộ nhớ. Điều này làm cho linked list linh hoạt hơn trong việc thêm hoặc xoá các phần tử, vì không cần di chuyển các phần tử khác để giữ thứ tự.

- **Các loại Linked List**:
  - Singly Linked List: Mỗi node chứa dữ liệu và một con trỏ trỏ đến node kế tiếp. Không có con trỏ quay lại node trước đó.
  - Doubly Linked List: Mỗi node chứa dữ liệu và hai con trỏ: một trỏ đến node kế tiếp và một trỏ đến node trước đó.
  - Circular Linked List: Một biến thể của Singly hoặc Doubly Linked List, trong đó node cuối cùng trỏ lại node đầu tiên, tạo thành một vòng lặp.

- **Các thao tác cơ bản trên Linked List**:
  - Thêm phần tử (Insertion)
  - Xoá phần tử (Deletion):
  - Tìm kiếm (Search)
  - Duyệt danh sách (Traversal)

```php
class Node
{
    public $data;
    public $next;

    public function __construct($data)
    {
        $this->data = $data;
        $this->next = null;
    }
}

class LinkedList
{
    private $head;
    private $tail;

    public function __construct()
    {
        $this->head = null;
        $this->tail = null;
    }

    public function insertAtBeginning($data)
    {
        $newnode = new Node($data);

        if ($this->head === null) {
            $this->head = $newnode;
            $this->tail = $newnode;
        } else {
            $newnode->next = $this->head;
            $this->head = $newnode;
        }
    }

    public function insertAtEnd($data)
    {
        $newNode = new Node($data);
        if ($this->head === null) {
            $this->head = $newNode;
            $this->tail = $newNode;
        } else {
            $this->tail->next = $newNode;
            $this->tail = $newNode;
        }
    }

    public function display()
    {
        $current = $this->head;
        while ($current !== null) {
            echo $current->data . " ";
            $current = $current->next;
        }
        echo "<br>"; //PHP_EOL; // \n, \r\n
    }

    public function deleteFirst()
    {
        if ($this->head !== null) {
            $this->head = $this->head->next;
            if ($this->head === null) {
                $this->tail = null;
            }
        }
    }

    public function deleteLast()
    {
        if ($this->head === null) {
            return;
        }

        if ($this->head->next === null) {
            $this->head = null;
            $this->tail = null;
        }

        $current = $this->head;
        while ($current->next !== $this->tail) {
            $current = $current->next;
        }

        $current->next = null;
        $this->tail = $current;
    }
}

$linkedList = new LinkedList();
$linkedList->insertAtEnd(1);
$linkedList->insertAtEnd(2);
$linkedList->insertAtBeginning(0);
$linkedList->display(); // Kết quả: 0 1 2 

$linkedList->deleteFirst();
$linkedList->display(); // Kết quả: 1 2

$linkedList->deleteLast();
$linkedList->display(); // Kết quả: 1


```

## Stack

**LIFO**

```php
class Stack {
    private $stack = [];

    // Thêm một phần tử vào ngăn xếp
    public function push($item) {
        array_push($this->stack, $item);
    }

    // Lấy phần tử trên cùng ra khỏi ngăn xếp
    public function pop() {
        if (!$this->isEmpty()) {
            return array_pop($this->stack);
        } else {
            return null; // Ngăn xếp rỗng
        }
    }

    // Kiểm tra phần tử trên cùng của ngăn xếp
    public function peek() {
        return end($this->stack);
    }

    public function isEmpty() {
        return empty($this->stack);
    }
}

$myStack = new Stack();
$myStack->push(1);
$myStack->push(2);
$myStack->push(3);
echo $myStack->pop(); 
echo $myStack->peek(); 


```

## Queue

```php
class Queue {
    private $queue = [];

    // Thêm phần tử vào cuối hàng đợi
    public function enqueue($item) {
        array_push($this->queue, $item);
    }

    // Lấy phần tử từ đầu hàng đợi
    public function dequeue() {
        if (!$this->isEmpty()) {
            return array_shift($this->queue);
        } else {
            return null; 
        }
    }

    // Xem phần tử đầu tiên trong hàng đợi
    public function peek() {
        return reset($this->queue);
    }

    public function isEmpty() {
        return empty($this->queue);
    }
}

// Sử dụng queue
$myQueue = new Queue();
$myQueue->enqueue(1);
$myQueue->enqueue(2);
$myQueue->enqueue(3);
echo $myQueue->dequeue(); 
echo $myQueue->peek(); 

```

- **array_push($array, $item)**: Thêm một phần tử vào cuối mảng, hoạt động như push trong Stack và enqueue trong Queue.
- **array_pop($array)**: Lấy và xóa phần tử cuối cùng của mảng, hoạt động như pop trong Stack.
- **array_shift($array)**: Lấy và xóa phần tử đầu tiên của mảng, hoạt động như dequeue trong Queue.
- **end($array)**: Lấy phần tử cuối cùng của mảng mà không xóa nó, hoạt động như peek trong Stack.
- **reset($array)**: Lấy phần tử đầu tiên của mảng mà không xóa nó, hoạt động như peek (hoặc front) trong Queue.
- **empty($array)**: Kiểm tra mảng có rỗng không, dùng để xác định trạng thái của Stack hoặc Queue.

## Binary Tree

```php
<?php

class TreeNode
{
    public $value;
    public $left;
    public $right;

    public function __construct($value)
    {
        $this->value = $value;
        $this->left = null;
        $this->right = null;
    }
}

class BinaryTree
{
    public $root;

    public function __construct()
    {
        $this->root = null;
    }

    public function insert($value)
    {
        $this->root = $this->insertNode($this->root, $value);
    }

    private function insertNode($node, $value)
    {
        if ($node === null) {
            return new TreeNode($value);
        }

        if ($value < $node->value) {
            $node->left = $this->insertNode($node->left, $value);
        } else {
            $node->right = $this->insertNode($node->right, $value);
        }

        return $node;
    }

    public function search($value)
    {
        return $this->searchNode($this->root, $value);
    }

    private function searchNode($node, $value)
    {
        if ($node === null || $node->value == $value) {
            return $node;
        }

        if ($value < $node->value) {
            return $this->searchNode($node->left, $value);
        } else {
            return $this->searchNode($node->right, $value);
        }
    }

    public function delete($value)
    {
        $this->root = $this->deleteNode($this->root, $value);
    }

    private function deleteNode($node, $value)
    {
        // Nếu cây rỗng, không cần làm gì, trả về null
        if ($node === null) {
            return null;
        }

        // Tìm nút cần xóa: nếu giá trị nhỏ hơn thì tìm trong cây con trái
        if ($value < $node->value) {
            $node->left = $this->deleteNode($node->left, $value);

            // Nếu giá trị lớn hơn thì tìm trong cây con phải
        } elseif ($value > $node->value) {
            $node->right = $this->deleteNode($node->right, $value);

            // Đã tìm thấy nút cần xóa
        } else {
            // Trường hợp 1: Nút không có con hoặc có 1 con
            if ($node->left === null) {
                return $node->right; // Trả về con phải (có thể là null)
            } elseif ($node->right === null) {
                return $node->left; // Trả về con trái (có thể là null)
            }

            // Trường hợp 2: Nút có hai con
            // Tìm nút nhỏ nhất ở cây con phải (successor) hoặc có thể tìm nút lớn nhất ở cây con trái (predecessor)
            $minNode = $this->findMinNode($node->right);

            // Thay thế giá trị của nút cần xóa bằng giá trị của nút nhỏ nhất trong cây con phải
            $node->value = $minNode->value;

            // Xóa nút nhỏ nhất trong cây con phải
            $node->right = $this->deleteNode($node->right, $minNode->value);
        }

        return $node;
    }

    private function findMinNode($node)
    {
        while ($node->left !== null) {
            $node = $node->left;
        }
        return $node;
    }


    // Duyệt cây theo thứ tự giữa (Inorder Traversal)
    public function inorderTraversal()
    {
        $this->inorder($this->root);
        echo "<br>";
    }

    private function inorder($node)
    {
        if ($node !== null) {
            $this->inorder($node->left);
            echo $node->value . " ";
            $this->inorder($node->right);
        }
    }

    // Duyệt cây theo thứ tự trước (Preorder Traversal)
    public function preorderTraversal()
    {
        $this->preorder($this->root);
        echo "<br>";
    }

    private function preorder($node)
    {
        if ($node !== null) {
            echo $node->value . " ";
            $this->preorder($node->left);
            $this->preorder($node->right);
        }
    }

    // Duyệt cây theo thứ tự sau (Postorder Traversal)
    public function postorderTraversal()
    {
        $this->postorder($this->root);
        echo "<br>";
    }

    private function postorder($node)
    {
        if ($node !== null) {
            $this->postorder($node->left);
            $this->postorder($node->right);
            echo $node->value . " ";
        }
    }

}

$tree = new BinaryTree();
$tree->insert(50);
$tree->insert(30);
$tree->insert(20);
$tree->insert(40);
$tree->insert(70);
$tree->insert(60);
$tree->insert(80);

// Duyệt cây theo thứ tự giữa (Inorder Traversal)
echo "Inorder Traversal: ";
$tree->inorderTraversal(); // Kết quả: 20 30 40 50 60 70 80

// Duyệt cây theo thứ tự trước (Preorder Traversal)
echo "Preorder Traversal: ";
$tree->preorderTraversal(); // Kết quả: 50 30 20 40 70 60 80

// Duyệt cây theo thứ tự sau (Postorder Traversal)
echo "Postorder Traversal: ";
$tree->postorderTraversal(); // Kết quả: 20 40 30 60 80 70 50

// Tìm kiếm một giá trị
$searchValue = 40;
$foundNode = $tree->search($searchValue);
if ($foundNode !== null) {
    echo "Found value $searchValue in the tree.<br>";
} else {
    echo "Value $searchValue not found in the tree.<br>";
}

// Xóa một nút khỏi cây
$deleteValue = 30;
echo "Deleting value $deleteValue...<br>";
$tree->delete($deleteValue);

// Hiển thị cây sau khi xóa một nút
echo "Inorder Traversal after deleting $deleteValue: ";
$tree->inorderTraversal(); // Kết quả: 20 40 50 60 70 80

```

## Standard PHP Library

### SplDoublyLinkedList

```php
$dll = new SplDoublyLinkedList();

$dll->push("A"); // Thêm vào cuối
$dll->push("B");
$dll->unshift("C"); // Thêm vào đầu

echo $dll->shift(); // Lấy phần tử đầu ra (C)
echo $dll->pop();   // Lấy phần tử cuối ra (B)

// Duyệt danh sách
for ($dll->rewind(); $dll->valid(); $dll->next()) {
    echo $dll->current() . " ";
}
// Output: A

```

- **Một số phương thức chính:**
  - **push($value)**: Thêm phần tử vào cuối danh sách.
  - **pop()**: Xóa và trả về phần tử cuối cùng trong danh sách.
  - **unshift($value)**: Thêm phần tử vào đầu danh sách.
  - **shift():** Xóa và trả về phần tử đầu tiên trong danh sách.
  - **rewind()**: Đưa con trỏ về vị trí đầu tiên.
  - **next()**: Chuyển sang phần tử kế tiếp.
  - **prev()**: Chuyển sang phần tử trước đó.
  - **valid()**: Kiểm tra xem phần tử hiện tại có hợp lệ không.
  - **current()**: Trả về giá trị của phần tử hiện tại.

### SplStack

### SplQueue
