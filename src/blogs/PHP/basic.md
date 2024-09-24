# Basic Concepts

- [Some basic](#some-basic)
- [String vs Array](#string-vs-array)
- [Redirect](#redirect)
- [Global variables](#global-variables)
- [Combine files](#combine-files)
- [Form HTML with PHP](#form-html-with-php)
- [Conditional Form](#conditional-form)
- [Date](#date)
- [File](#file)
- [Cookie](#cookie)
- [Session](#session)
- [Filter_var](#filter_var)
- [Page layout](#page-layout)
- [Delete element in Array](#delete-element-in-array)

## Some basic

- **isset()**

```php
// Kiểm tra xem một biết có tồn tại và không null không
$x = 10;
if (isset($x)) {
    echo '$x đã được khởi tạo.';
} else {
    echo '$x chưa được khởi tạo.';
}

```

- **declare(strict_types=1)**

```php
declare(strict_types=1);

function add(int $a, int $b): int {
    return $a + $b;
}

echo add(5, "3"); // Throws a TypeError

```

- **unset()**

```php
$x = 10;
unset($x);
echo $x; // Throws a Notice: Undefined variable

```

## String vs Array

```php
// convert string to array
<?php

$myStr = "11/03/2003";
$myArr = explode("/", $myStr);

// print_r($myArr);
var_dump($myArr);
/*--------------------------------------------*/
// convert array to string 
<?php

$myArr = array("huy", "na", "antn2021");
$myStr = implode("-", $myArr); // huy-na-antn2021

echo ($myStr);

```

## Redirect

> header("location: login.php");

## Global variables

```php
<?php

$a = 5;
function multi5()
{
    return $GLOBALS['a'] * 5;
}
echo (multi5(7));

/*--------------------------------------------*/
// $_POST - bảo mật hơn, k hiện data trên url
<form action="index.php" method="post">
    <input type="text" name="myData">
    <input type="submit" class="btn" value="Click me">
</form>

<?php
echo $_POST['myData'];

/*--------------------------------------------*/
// #_GET

<form action="index.php" method="GET">
    <input type="password" name="myData">
    <input type="submit" class="btn" value="Click me">
</form>

<?php
echo $_GET['myData'];

/*--------------------------------------------*/
// #_REQUEST dùng để nhận data từ post và get

<form action="index.php" method="POST">
    <input type="password" name="myData">
    <input type="submit" class="btn" value="Click me">
</form>

<?php
echo $_REQUEST['myData'];

```

## Combine files

```php
/*--------------------------------------------*/
// require
<?php
// copy code trong file login.php vào file hiện tại và thực thi, copy mấy lần thì thực thi mấy lần
require "login.php";
require "login.php";


// require_once
// chỉ thực thi 1 lần dù có copy bao nhiêu lần đi nữa
require_once "login.php";
require_once "login.php";


/*--------------------------------------------*/
// include và include_once cũng tương tự như trên


// tuy nhiên khác ở chỗ:

/**
 * Nếu require và require_once copy file bị lỗi vào thì nó
 * sẽ dừng toàn bộ code và báo lỗi
 * 
 * Trong khi đó include và include_once thì code ở page 
 * hiện tại vẫn chạy bthg và nó chỉ báo có lỗi thoi
 * /
```

## Form HTML with PHP

```html
<!-- file index.php -->
<form action="login.php" method="post">
    <label for="username">
        Username
        <input type="text" name="username" id="username" value="" size="35" placeholder="" />
    </label>
    <br> <br>
    <label for="password">
        Password
        <input type="password" name="password" id="password" value="" size="35" placeholder="" />
    </label>

    <br> <br>
    <label>
        Gender
        <label for="maleGender"><input type="radio" name="gender" id="maleGender" value="male" />Nam</label>
        <label for="femaleGender"><input type="radio" name="gender" id="femaleGender" value="female" />Nữ</label>
        <label for="otherGender"><input type="radio" name="gender" id="otherGender" value="other" />Khác</label>
    </label>

    <br> <br>
    <label>
        Favorite Activites
        <label for="fav1"><input type="checkbox" name="fav1" id="fav1" value="badminton" />badminton</label>
        <label for="fav2"><input type="checkbox" name="fav2" id="fav2" value="soccer" />soccer</label>
        <label for="fav3"><input type="checkbox" name="fav3" id="fav3" value="gym" />Gym</label>
    </label>

    <br> <br>
    <input type="submit" value="Submit" name="btn_submit">
</form>
```

```php
// file login.php 
<?php

echo "Username: " . $_POST['username'];
echo "<br>";
echo "Password: " . $_POST['password'];
echo "<br>";
echo "Gender: " . $_POST['gender'];
echo "<br>";
echo "Favourite 1: " . $_POST['fav1'];
echo "<br>";
echo "Favourite 2: " . $_POST['fav2'];
echo "<br>";

if (isset($_POST['fav3'])) {
    echo "Favourite 3: " . $_POST['fav3'];
} else {
    echo "No";
}
// catch event click :))
// if(isset($_POST['btn_submit']))
// {
//     //code
// }

```

## Conditional Form

### Basic

```php
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <?php
    $warning = "";
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $warning = "Please fill this input!!!";
    } else {
        $warning = "";
    }
    ?>
    <form action="" method="post">
        <label for="username">Username
            <!-- for username này focus vào id -->
            <input type="text" name="username" id="username">
            <span class="warning" style="color: red;">
                <?php
                echo $warning;
                ?>
            </span>
        </label>
        <br><br>
        <input type="submit" value="Submit">
    </form>

</body>

</html>

```

### Advance

```php
// dựa trên base kia tự xử
```

## Date

```php
<?php

echo date("d/m/y");
echo "<br>";
echo date("H:i:s a"); //h:12h, H: 24h

```

## File

### Read

```php
<?php

// readfile("test.txt");

// $file_content = file_get_contents("test.txt");
// if ($file_content !== false) {
//     echo "Nội dung của tập tin là: <br>";
//     echo $file_content;
// } else {
//     echo "Không thể đọc tập tin.";
// }


$filename = "test.txt";
$file_handle = fopen($filename, "r");

if ($file_handle !== false) {
    echo "Nội dung của tập tin là: <br>";
    // check xem con trỏ đã ở cuối file chưa, nếu chưa thì tiếp tục lặp
    while (!feof($file_handle)) {
        echo fgets($file_handle) . "<br>";
    }
    fclose($file_handle);
} else {
    echo "Không thể mở tập tin.";
}


```

### Write

```php
<?php
$filename = "test.txt";
$content = "Nội dung mẫu để ghi vào tập tin.";

$file_handle = fopen($filename, "w"); // a là add thêm vào, w là tạo mới và ghi đè 

if ($file_handle === false) {
    echo "Không thể mở tập tin.";
} else {
    // Ghi dữ liệu vào tập tin
    fwrite($file_handle, $content);
    fclose($file_handle);
    echo "Ghi dữ liệu vào tập tin thành công.";
}


```

***Giới hạn upload file tự xử..., biết keyword thoi gg k ít đâu***

## Cookie

```php
<?php

// Define variables for cookie name and value
$cookieName = "user";
$cookieValue = "normal";

// Set cookie with a 30-day expiration time
setcookie($cookieName, $cookieValue, time() + (86400 * 30), "/"); // có sẵn trong toàn bộ domain /

if (isset($_COOKIE[$cookieName])) {
    echo "Cookie " . $cookieName . " is available.";
} else {
    echo "Cookie " . $cookieName . " is unavailable.";
}

// delete cookie 
setcookie($cookieName, "", time() - 3600, "/");
echo "The cookie has been deleted.";


```

## Session

```php
<?php

session_start();
$_SESSION["name"] = "huyna";

// delete session
unset($_SESSION["name"]);

// delete all session
session_destroy();

```

## Filter_var

**Tương đối thoi, muốn fit cứng hơn, chặt chẽ hơn thì dủng regex**

```php
<?php

$email = "example@example.com";
if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo "This is a valid email address. <br>";
} else {
    echo "This is an invalid email address. <br>";
}

$number = "123";
if (filter_var($number, FILTER_VALIDATE_INT)) {
    echo "This is a valid integer. <br>";
} else {
    echo "This is an invalid integer. <br>";
}

$ip = "192.168.1.1aaa";

if (filter_var($ip, FILTER_VALIDATE_IP)) {
    echo "This is a valid IP address. <br>";
} else {
    echo "This is an invalid IP address. <br>";
}

$url = "https://www.example.com";

if (filter_var($url, FILTER_VALIDATE_URL)) {
    echo "This is a valid URL.";
} else {
    echo "This is an invalid URL.";
}


```

## Page layout

```php
// giúp hiển thị nội dung các page ở trang index
<ul>
    <li><a href="index.php?page_layout=main_page">Trang chủ</a></li>
    <li><a href="index.php?page_layout=cart">Giỏ Hàng</a></li>
</ul>

<?php

if (isset($_GET['page_layout'])) {
    switch ($_GET['page_layout']) {
        case 'main_page':
            include "mainpage.php";
            break;
        case 'cart':
            include "cart.php";
            break;
        default:
            # code...
            break;
    }
}


```

## Delete element in Array

[details](https://stackoverflow.com/questions/369602/deleting-an-element-from-an-array-in-php)
