# Interview

[Câu hỏi phỏng vấn PHP](https://www.topcv.vn/cac-cau-hoi-phong-van-php-thuong-gap-khi-di-xin-viec#cac-cau-hoi-phong-van-php-thuong-gap-cau-7-phan-biet-hang-bien-trong-php)

[PHP 8](https://niithanoi.edu.vn/php-8-co-gi-moi.html)

Phân biệt hằng – biến trong PHP?
Mảng là gì? Có những loại mảng nào trong PHP?
Phân biệt POST và GET trong php?
Website và web app có gì giống và khác?
Sự khác nhau của toán từ & và && trong php là gì?
$a++ và ++$a khác nhau ở điểm nào?
Hàm để gộp mảng/tách là hàm gì?
Sử dụng hàm nào để chuyển từ mảng thành chuỗi, tách chuỗi?
Serialize và Json_encode khác nhau như thế nào?
Session và Cookie khác nhau như thế nào?
Trong PHP thường gặp những lỗi nào?
Hàm include() and require() khác nhau ở đâu?
Khi website bị chậm bạn phải làm gì?
Làm thế nào để website có thể phục vụ hàng triệu người dùng?
Làm cách nào để kích hoạt tính năng báo lỗi trong PHP?
Xác định đối tượng dữ liệu PHP là gì? PDO??
Khi nào nên sử dụng phương pháp OOP thay vì lập trình chức năng?
Sự khác biệt giữa lớp trừu tượng và giao diện là gì?
Persistence cookie là gì?
Cách để tìm các bản ghi Email bị trùng lặp trong “Table”?
Hàm explode() được sử dụng như thế nào?
Hàm array_walk hoạt động như thế nào trong PHP?
Biến $_get và $_post được sử dụng như thế nào trong PHP?
Khi nào bạn sử dụng === thay vì ==?
Tính kế thừa trong PHP hoạt động như thế nào?
MVC là gì và mỗi thành phần có chức năng gì?

## Trình bày 4 tính chất của Lập trình hướng đối tượng (OOP). Nêu ví dụ thực tế của từng tính chất này

**Tính đóng gói (Encapsulation):** Tính đóng gói là khả năng đóng gói các thông tin liên quan bên trong một đối tượng, chỉ có thể tương tác với các thông tin của đối tượng qua các phương thức của nó. Nó giúp bảo vệ dữ liệu của đối tượng khỏi sự can thiệp từ bên ngoài.

**Tính kế thừa (Inheritance):** Tính kế thừa cho phép một lớp mới (lớp con) có thể thừa hưởng các thuộc tính và phương thức từ một lớp hiện có (lớp cha), đồng thời có thể mở rộng hoặc ghi đè các thuộc tính, phương thức của lớp cha.

**Tính đa hình (Polymorphism):** Tính đa hình cho phép các đối tượng thuộc các lớp khác nhau có thể được xử lý bằng cách gọi cùng một phương thức, nhưng mỗi lớp có thể có cách thực hiện riêng.

**Tính trừu tượng (Abstraction):** Tính trừu tượng cho phép tạo ra một giao diện (interface) hoặc lớp trừu tượng mà các lớp con sẽ phải tuân theo.

## overriding vs overloading

**Overloading (Nạp chồng phương thức):** là kỹ thuật cho phép định nghĩa nhiều phương thức cùng tên trong cùng một lớp, nhưng với các tham số khác nhau (số lượng hoặc kiểu tham số). Trình biên dịch sẽ phân biệt các phương thức này dựa trên danh sách tham số khi bạn gọi chúng.Giúp một phương thức có thể hoạt động với nhiều kiểu dữ liệu hoặc số lượng tham số khác nhau.

**Overriding (Ghi đè phương thức):** là kỹ thuật cho phép một lớp con (subclass) định nghĩa lại phương thức của lớp cha (superclass) với cùng tên, cùng kiểu trả về và cùng danh sách tham số. Lớp con sẽ cung cấp cách triển khai mới cho phương thức của lớp cha.Giúp lớp con có thể điều chỉnh hoặc mở rộng hành vi của phương thức từ lớp cha để phù hợp với nhu cầu cụ thể của lớp con.

## isset() vs empty()

**isset()** kiểm tra xem biến có tồn tại và khác null hay không.
**empty()** kiểm tra xem biến có "rỗng" **(0, "0", null, "")** hay không, bao gồm cả trường hợp biến không tồn tại.

## Prevent SQL injection

*MySQL Improved ~ mysqli*

### Prepared Statements

```php
$mysqli = new mysqli("localhost", "username", "password", "testdb");

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

$sql = "SELECT * FROM users WHERE email = ?";

$stmt = $mysqli->prepare($sql);
$stmt->bind_param("s", $email);

$email = 'test@example.com';
$stmt->execute();

$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    echo $row['name'];
}


$stmt->close();
$mysqli->close();

```

- **regex + prepared statements**:

```php
$mysqli = new mysqli("localhost", "username", "password", "testdb");

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

$name = $_POST['name']; 
$email = $_POST['email']; 
$age = $_POST['age']; 
$status = $_POST['status']; 

if (!preg_match("/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/", $email)) {
    die("Invalid email format");
}

if (!preg_match("/^[0-9]{1,3}$/", $age)) {
    die("Invalid age");
}

$sql = "SELECT * FROM users WHERE name LIKE ? AND email = ? AND age = ? AND status = ?";

$stmt = $mysqli->prepare($sql);

$stmt->bind_param("ssis", $name_param, $email, $age, $status);

$name_param = "%$name%";
$email = $email; 
$age = (int)$age;
$status = $status; 

$stmt->execute();

$result = $stmt->get_result();

while ($row = $result->fetch_assoc()) {
    echo $row['name'] . " - " . $row['email'] . " - " . $row['age'] . " - " . $row['status'];
    // $users[] = $row;

}

$stmt->close();
$mysqli->close();


```

### real_escape_string

```php
$mysqli = new mysqli("localhost", "username", "password", "testdb");

if ($mysqli->connect_error) {
    die("Connection failed: " . $mysqli->connect_error);
}

$email = $mysqli->real_escape_string('test@example.com');

$sql = "SELECT * FROM users WHERE email = '$email'";

$result = $mysqli->query($sql);

while ($row = $result->fetch_assoc()) {
    echo $row['name'];
}

$mysqli->close();

```

## Search

### Linear Search

Tìm kiếm tuyến tính là phương pháp đơn giản nhất, duyệt qua từng phần tử của mảng hoặc danh sách từ đầu đến cuối cho đến khi tìm thấy phần tử cần tìm.

### Binary Search

Tìm kiếm nhị phân chỉ áp dụng cho danh sách đã được sắp xếp. Nó bắt đầu bằng cách so sánh phần tử ở giữa danh sách với phần tử cần tìm. Nếu phần tử cần tìm lớn hơn phần tử giữa, tìm kiếm tiếp tục ở nửa bên phải, ngược lại tìm kiếm ở nửa bên trái. Quá trình này lặp lại cho đến khi tìm thấy phần tử hoặc kết luận rằng phần tử không tồn tại.

```php
function binarySearch(array $arr, int $x)
{
    $left = 0;
    $right = count($arr) - 1;

    while ($left <= $right) {
        $mid = floor(($left + $right) / 2);

        if ($arr[$mid] == $x) {
            return $mid;
        }

        if ($arr[$mid] < $x) {
            $left = $mid + 1;
        } else {
            $right = $mid - 1;
        }

        return -1;
    }
}


$arr = [2, 3, 4, 10, 40, 50, 60];
$x = 10;

$result = binarySearch($arr, $x);

if ($result != -1) {
    echo "Phần tử tìm thấy tại chỉ mục: " . $result;
} else {
    echo "Phần tử không có trong mảng.";
}


```

## More questions

- **Các biến siêu toàn cục?**

- **Sự khác biệt sử print và echo?**

| **Tiêu chí**                | **echo**                                | **print**                               |
|-----------------------------|-----------------------------------------|-----------------------------------------|
| **Sử dụng cú pháp**         | echo string1, string2, ...;             | print(string);                          |
| **Trả về giá trị**          | Không trả về giá trị                    | Trả về giá trị 1                        |
| **Khả năng xuất nhiều chuỗi**| Có thể xuất nhiều chuỗi cùng lúc        | Chỉ có thể xuất một chuỗi tại một thời điểm |
| **Hiệu suất**               | Nhanh hơn chút ít (do không trả về giá trị) | Chậm hơn chút ít                        |
| **Sử dụng trong biểu thức** | Không thể sử dụng trong biểu thức       | Có thể sử dụng trong biểu thức          |

- **const vs define()?**
- **include vs require?**

--------------------------------------------------

## Câu hỏi về PHP cơ bản

OOP trong PHP là gì? Hãy giải thích các khái niệm về class, object, inheritance, encapsulation và polymorphism.
Sự khác biệt giữa public, private, và protected là gì?
Namespace trong PHP là gì? Tại sao chúng ta nên sử dụng namespace?
Abstract class và Interface khác nhau như thế nào? Khi nào nên sử dụng cái nào?
Trait trong PHP là gì? Khi nào sử dụng trait thay vì kế thừa class?
Sự khác biệt giữa include, require, include_once và require_once?
Explain how PHP handles sessions and cookies.
How do you handle error handling in PHP? Hãy nêu các phương pháp sử dụng try-catch và các kiểu lỗi khác nhau (E_NOTICE, E_WARNING, E_ERROR).

## Câu hỏi về PHP nâng cao

PDO là gì? Làm thế nào để kết nối cơ sở dữ liệu MySQL với PDO trong PHP?
Sự khác biệt giữa POST và GET trong PHP là gì? Khi nào sử dụng POST và GET?
Explain how to prevent SQL injection in PHP.
Làm thế nào để upload một file trong PHP?
Composer là gì? Làm sao để cài đặt và sử dụng các package với Composer?
Explain how to handle file permissions in PHP.
Sự khác biệt giữa unlink() và unset() trong PHP là gì?

## Câu hỏi về Laravel Framework

MVC là gì? Hãy giải thích cách Laravel implement MVC.
Làm sao để tạo một Controller trong Laravel?
Route trong Laravel hoạt động như thế nào? Giải thích các loại route như GET, POST, PUT, DELETE.
Middleware là gì? Khi nào chúng ta nên sử dụng middleware trong Laravel?
Explain the service container in Laravel and how dependency injection works.
Eloquent ORM là gì? Làm sao để sử dụng Eloquent để truy vấn cơ sở dữ liệu?
Relationship trong Eloquent là gì? Hãy giải thích các loại mối quan hệ: One-to-One, One-to-Many, Many-to-Many.
Tại sao chúng ta sử dụng migration trong Laravel? Hãy nêu ví dụ về cách tạo migration.
Form validation trong Laravel hoạt động như thế nào?
Explain Laravel Blade và cách sử dụng Blade template engine.
Làm thế nào để xử lý file upload trong Laravel?
Giải thích khái niệm route model binding trong Laravel.
Explain the concept of queues in Laravel and how they work.
Events và Listeners trong Laravel là gì?
Explain how you can handle API authentication in Laravel using Passport hoặc Sanctum.

## Câu hỏi về Cơ sở dữ liệu (Database)

SQL là gì? Sự khác biệt giữa SQL và NoSQL?
Explain the use of foreign keys and indexing in databases.
JOIN trong SQL là gì? Hãy giải thích các loại JOIN (INNER JOIN, LEFT JOIN, RIGHT JOIN).
Làm thế nào để tạo một bảng trong MySQL và cách sử dụng các ràng buộc (constraints) như UNIQUE, NOT NULL, PRIMARY KEY, FOREIGN KEY?
Làm thế nào để tối ưu hóa truy vấn SQL?
Giải thích khái niệm transaction trong SQL và cách thực hiện transaction trong Laravel.

## Câu hỏi về bảo mật (Security)

Các cách phổ biến để ngăn chặn SQL Injection là gì?
Explain CSRF (Cross-Site Request Forgery) and how Laravel protects against it.
XSS (Cross-Site Scripting) là gì và làm thế nào để phòng tránh trong Laravel?
Explain how to secure file uploads in Laravel.
Làm thế nào để mã hóa mật khẩu người dùng trong Laravel (sử dụng Hash::make())?
Explain how Laravel handles session security.

## Câu hỏi về triển khai (Deployment)

Làm thế nào để deploy một ứng dụng Laravel lên server?
Làm sao để cấu hình .env trong Laravel để triển khai trên môi trường production?
Cách sử dụng cache trong Laravel?
Giải thích quá trình sử dụng các công cụ như Forge hoặc Envoyer để deploy ứng dụng.

## Câu hỏi thực hành (Hands-on)

Yêu cầu ứng viên viết một controller cơ bản để hiển thị danh sách người dùng từ cơ sở dữ liệu.
Yêu cầu ứng viên viết một route cho phép upload file và lưu trữ file đó.
Yêu cầu ứng viên tạo một migration và seed dữ liệu mẫu vào bảng.
Yêu cầu ứng viên xử lý form validation khi thêm mới một user.
Viết một hàm để lấy danh sách tất cả các bài viết của một user cụ thể và paginate kết quả.

## Câu hỏi liên quan đến kỹ năng mềm và tư duy logic

Làm thế nào để bạn xử lý khi gặp lỗi không rõ nguồn gốc trong ứng dụng của mình?
Làm sao bạn giải quyết xung đột giữa các thành viên trong nhóm phát triển?
Kể về một dự án hoặc tính năng mà bạn từng làm và bạn thấy tự hào nhất?
Bạn làm gì để tối ưu hiệu suất của một ứng dụng Laravel?
Bạn thường làm thế nào để nâng cao kỹ năng lập trình của mình?

## Câu hỏi về phiên bản và các công cụ khác

Sự khác biệt giữa Laravel 7, 8 và 9 là gì? Bạn có quen thuộc với các thay đổi trong các phiên bản mới nhất của Laravel không?
Composer là gì và làm sao để cài đặt Laravel bằng Composer?
Bạn đã từng sử dụng Docker để triển khai Laravel chưa? Nếu có, bạn đã sử dụng nó như thế nào?
Bạn có biết cách sử dụng Redis trong Laravel không? Redis có vai trò gì?
