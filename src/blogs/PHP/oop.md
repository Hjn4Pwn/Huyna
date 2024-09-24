# OOP

```php
class Car {
    public $color;
    public $model;
    
    public function __construct($color, $model) {
        $this->color = $color;
        $this->model = $model;
    }
    
    public function message() {
        return "My car is a " . $this->color . " " . $this->model . ".";
    }
}

$myCar = new Car("red", "Toyota");
echo $myCar->message(); 

```

## Access Modifiers

- **public**: cho phép các thuộc tính hoặc phương thức được truy cập từ bất kỳ đâu, kể cả từ bên ngoài lớp, từ các lớp con, hoặc từ bên trong lớp đó. (nhưng phải thông qua đối tượng của lớp đó)
- **protected**: chỉ cho phép truy cập từ bên trong lớp hiện tại và từ các lớp con (subclasses) kế thừa từ lớp đó.
- **private** chỉ cho phép truy cập từ bên trong lớp hiện tại. Các thuộc tính hoặc phương thức được khai báo là private sẽ không thể được truy cập hoặc thay đổi từ các lớp con hoặc từ bên ngoài lớp đó.

## Features

- **Tính đa hình** (Polymorphism):
  - Đa hình cho phép các phương thức trong các lớp khác nhau được gọi qua cùng một tên nhưng có các hành vi khác nhau.
  - Đa hình đạt được qua kế thừa và ghi đè phương thức (method overriding).
- **Tính đóng gói** (Encapsulation)
  - Đóng gói là việc ẩn đi các chi tiết triển khai của một đối tượng và chỉ cung cấp một giao diện công khai để tương tác với đối tượng đó.
  - Trong PHP, đóng gói được thực hiện thông qua các phạm vi truy cập như public, protected, và private
- **Tính trừu tượng**(Abstraction)
  - Trừu tượng liên quan đến việc định nghĩa các phương thức mà không triển khai chúng. Một lớp trừu tượng không thể được khởi tạo trực tiếp.
  - PHP hỗ trợ tính trừu tượng thông qua lớp trừu tượng (abstract class) và phương thức trừu tượng (abstract method).
  - Ví dụ Abstract class Hình học có các phương thức tính chu vi, diện tích.
- **Tính kế thừa** (Inheritance)
  - Kế thừa cho phép một lớp mới kế thừa các thuộc tính và phương thức của một lớp hiện có. Lớp mới được gọi là lớp con (subclass), và lớp hiện có được gọi là lớp cha (parent class).

## static

- **Từ khóa static được sử dụng để định nghĩa các thuộc tính và phương thức thuộc về lớp (class) chứ không thuộc về bất kỳ đối tượng cụ thể nào của lớp đó. Điều này có nghĩa là có thể truy cập vào các thuộc tính và phương thức tĩnh mà không cần tạo một đối tượng của lớp.**

*Lưu ý: Phương thức tĩnh không thể truy cập vào các thuộc tính hoặc phương thức không tĩnh (non-static) trực tiếp, vì nó không hoạt động trên một đối tượng cụ thể.*

```php
class Counter {
    public static $count = 0;

    public static function increment() {
        self::$count++;
    }
}

echo Counter::$count; 

Counter::increment();
echo Counter::$count; 

```

- **Khi một lớp kế thừa từ một lớp khác, các thuộc tính và phương thức tĩnh cũng được kế thừa.**

```php
class ParentClass {
    public static function staticMethod() {
        return "ParentClass static method";
    }
}

class ChildClass extends ParentClass {
    public static function staticMethod() {
        return "ChildClass static method";
    }
}

echo ParentClass::staticMethod(); 
echo ChildClass::staticMethod(); 

```

- **Từ khóa self:: và static::**
  - **self::** : Được sử dụng để truy cập các thuộc tính và phương thức tĩnh của lớp hiện tại. Nó sẽ luôn tham chiếu đến lớp mà phương thức đang được định nghĩa.
  - **static::** : Được sử dụng để truy cập các thuộc tính và phương thức tĩnh của lớp hiện tại, nhưng nó linh hoạt hơn **self::** vì nó hỗ trợ gọi tĩnh từ các lớp con trong trường hợp kế thừa. **static::** sẽ tham chiếu đến lớp gọi phương thức, ngay cả khi phương thức đó được kế thừa từ lớp cha.

```php
class A {
    public static function who() {
        echo __CLASS__;
    }

    public static function test() {
        self::who();
    }
}

class B extends A {
    public static function who() {
        echo __CLASS__;
    }
}

B::test(); 

# self::who() trong lớp A luôn gọi phương thức who() của chính lớp A, ngay cả khi test() được gọi từ lớp B.
# Nếu thay self::who(); bằng static::who();, kết quả sẽ là B, vì static:: sẽ gọi phương thức who() từ lớp con B.

```

- *Không thể sử dụng **$this** trong một phương thức tĩnh vì **$this** chỉ tồn tại trong ngữ cảnh của một đối tượng cụ thể.*

## namespace

**Namespace trong PHP là một cách để tổ chức mã nguồn, đặc biệt là khi làm việc với các dự án lớn hoặc khi cần tích hợp các thư viện khác nhau vào cùng một ứng dụng. Namespace giúp tránh các xung đột tên (name conflicts) bằng cách nhóm các lớp, hàm, và hằng số dưới một không gian tên cụ thể.**

```php
namespace MyProject;

class MyClass {
    public function myMethod() {
        echo "Hello from MyClass";
    }
}

// khi sử dụng:
// Cách 1: Sử dụng tên đầy đủ
$obj = new \MyProject\MyClass();
$obj->myMethod();

// Cách 2: Sử dụng từ khóa use để rút gọn
use MyProject\MyClass;
// use MyProject\MyClass as mc;

$obj = new MyClass();
$obj->myMethod();

```

- **Có thể khai báo nhiều namespace trong cùng một file**

```php
namespace MyProject;

class MyClass {
    public function myMethod() {
        echo "Hello from MyClass";
    }
}

namespace AnotherProject;

class AnotherClass {
    public function anotherMethod() {
        echo "Hello from AnotherClass";
    }
}

// khi sử dụng:
$obj1 = new \MyProject\MyClass();
$obj2 = new \AnotherProject\AnotherClass();

$obj1->myMethod();    // Output: Hello from MyClass
$obj2->anotherMethod(); // Output: Hello from AnotherClass

```

- **Global Namespace**
  - Khi không khai báo namespace trong một file PHP, tất cả các lớp, hàm, và hằng số trong file đó sẽ thuộc về global namespace.
  - Để truy cập các phần tử trong global namespace từ một namespace cụ thể, sử dụng dấu gạch chéo ngược \ trước tên lớp hoặc hàm.

```php
namespace MyProject;

$date = new \DateTime(); 

```

## Inheritance

```php
class Vehicle {
    public $brand;
    public $color;

    public function __construct($brand, $color) {
        $this->brand = $brand;
        $this->color = $color;
    }

    public function startEngine() {
        echo "Engine started";
    }
}

class Car extends Vehicle {
    public $model;

    public function __construct($brand, $color, $model) {
        parent::__construct($brand, $color); // Gọi constructor của lớp cha
        $this->model = $model;
    }

    public function displayInfo() {
        echo "This is a {$this->color} {$this->brand} {$this->model}.";
    }
}

$myCar = new Car("Toyota", "Red", "Corolla");
$myCar->startEngine();
$myCar->displayInfo();

```

- Từ khóa **final** có thể được sử dụng để ngăn lớp con ghi đè một phương thức của lớp cha. Khi một phương thức được khai báo là **final**, nó không thể được ghi đè trong bất kỳ lớp con nào.

```php
class Animal {
    final public function sound() {
        echo "Some generic animal sound";
    }
}
```

## Abstract class vs Interface

### Abstract

- **Abstract class (lớp trừu tượng) được sử dụng để định nghĩa các lớp không thể khởi tạo trực tiếp, mà chỉ có thể được kế thừa. Một abstract class thường chứa một hoặc nhiều phương thức trừu tượng, và nó thường được sử dụng làm cơ sở để các lớp con cụ thể kế thừa và triển khai.**

```php
abstract class Animal {
    abstract public function makeSound();

    public function sleep() {
        echo "The animal is sleeping.";
    }
}

class Dog extends Animal {
    public function makeSound() {
        echo "Bark";
    }
}

class Cat extends Animal {
    public function makeSound() {
        echo "Meow";
    }
}

$dog = new Dog();
$dog->makeSound(); 
$dog->sleep();     

$cat = new Cat();
$cat->makeSound(); 
$cat->sleep();     


```

- **Abstract class thường được sử dụng để định nghĩa một khung chung cho các lớp con. Các lớp con sẽ kế thừa từ abstract class và bắt buộc phải triển khai các phương thức trừu tượng, đồng thời có thể sử dụng hoặc ghi đè các phương thức không trừu tượng.**

- **Abstract class hỗ trợ tính đa hình, cho phép bạn sử dụng một đối tượng của lớp con trong bất kỳ ngữ cảnh nào mà một đối tượng của abstract class được yêu cầu.**

```php
function describeAnimal(Animal $animal) {
    $animal->makeSound();
}

$dog = new Dog();
$cat = new Cat();

describeAnimal($dog); 
describeAnimal($cat); 

```

### Interface

- **Interface cho phép định nghĩa một tập hợp các phương thức mà bất kỳ lớp nào triển khai interface đó phải thực hiện. Interface đóng vai trò như một "hợp đồng" mà các lớp phải tuân thủ, đảm bảo rằng chúng cung cấp các chức năng được định nghĩa bởi interface.**

- Interface chỉ có thể chứa các phương thức trừu tượng (không có phần thân). Trong PHP 8 trở đi, interface có thể chứa các phương thức mặc định (default methods) với phần thân.
- Interface không thể chứa các thuộc tính
- Giống như abstract class, interface không thể được khởi tạo trực tiếp. Chỉ có thể sử dụng interface như một hợp đồng cho các lớp triển khai.
- Mọi phương thức được khai báo trong interface đều phải là public.
- Một lớp có thể triển khai nhiều interface, điều này cho phép bạn tạo ra các thiết kế linh hoạt và mạnh mẽ.

```php
interface Logger {
    public function log($message);
}

class FileLogger implements Logger {
    public function log($message) {
        echo "Logging message to a file: " . $message;
    }
}

$fileLogger = new FileLogger();
$fileLogger->log("File log message"); 

```

- Interface trong PHP cũng có thể kế thừa từ các interface khác. Interface con sẽ kế thừa các phương thức từ interface cha, và các lớp triển khai interface con sẽ phải thực hiện tất cả các phương thức từ cả interface con và cha.

```php
interface Animal {
    public function makeSound();
}

interface Pet extends Animal {
    public function play();
}

class Dog implements Pet {
    public function makeSound() {
        echo "Bark";
    }

    public function play() {
        echo "Dog is playing";
    }
}

$dog = new Dog();
$dog->makeSound(); 
$dog->play();      


```

### Differents

- Interfaces cannot have properties, while abstract classes can
- All interface methods must be public, while abstract class methods is public or protected
- All methods in an interface are abstract, so they cannot be implemented in code and the abstract keyword is not necessary
- Classes can implement an interface while inheriting from another class at the same time


