# MySQLi

- [Connect DB](#connect-db)
- [Create DB by PHP](#create-db-by-php)
- [Create table](#create-table)
- [Insert data](#insert-data)
- [Select data](#select-data)
- [Delete data](#delete-data)
- [Update data](#update-data)

## Connect DB

- Create DB use phpMyAdmin
- Connect

```php
<?php

$server = "localhost";
$user = "root";
$passwd = "";
$database = "createbyui";

// Connect to the database
$conn = new mysqli($server, $user, $passwd, $database);

// Check the connection
if ($conn) {
    mysqli_query($conn, "SET NAMES 'utf8'");
    echo "Connected to the database '$database' successfully!!!<br>";
} else {
    echo "Can't connect to the database '$database'!!!";
}

```

## Create DB by PHP

```php
<?php

// connect to the previously created database
include "connect.php";

$newDBName = "create_by_php";

$checkExistDB = mysqli_query($conn, "SHOW DATABASES LIKE '$newDBName'");
$existDB = mysqli_num_rows($checkExistDB) > 0;

if ($existDB) {
    echo "Database '$newDBName' already exists!";
} else {
    $sql = "CREATE DATABASE $newDBName";

    if (mysqli_query($conn, $sql)) {
        echo "Database '$newDBName' created successfully!";
    } else {
        echo "Failed to create database!";
    }
}

```

## Create table

```php
<?php

include "connect.php";

$sql = "CREATE TABLE users (
    id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    password VARCHAR(30) NOT NULL,
    level INT(6)
)";

if ($conn->query($sql)) {
    echo "Table creation succeeded!";
} else {
    echo "Table creation failed!";
}

```

## Insert data

```php
<?php

include "connect.php";

$samples = [
    ["huyna", "aaaaa", 9],
    ["changme", "bbbbb", 10]
];

$sql = "INSERT INTO users (username, password, level)
        VALUES (?, ?, ?)";

$stmt = $conn->prepare($sql);

if ($stmt) {
    foreach ($samples as $sample) {
        $stmt->bind_param("ssi", $sample[0], $sample[1], $sample[2]);

        if ($stmt->execute()) {
            echo "Record inserted successfully!<br>";
        } else {
            echo "Failed to insert record!";
        }
    }
    $stmt->close();
} else {
    echo "Failed to prepare statement!";
}


```

## Select data

### select all

```php
<?php

include "connect.php";


$sql = "SELECT * FROM users";

$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        echo "ID: " . $row["id"] . "<br>";
        echo "Username: " . $row["username"] . "<br>";
        echo "Password: " . $row["password"] . "<br>";
        echo "Level: " . $row["level"] . "<br>";
        echo "<br>";
    }
} else {
    echo "No records found!";
}
$conn->close();

```

### select where

```php
<?php

include "connect.php";

$username = "huyna";

$sql = "SELECT * FROM users WHERE username = ?";

// Prepare the statement
$stmt = $conn->prepare($sql);

// Check if the statement is prepared successfully
if ($stmt) {
    // Bind the value to the parameter
    $stmt->bind_param("s", $username);

    // Execute the statement
    $stmt->execute();

    // Get the result of the statement
    $result = $stmt->get_result();

    // Check if any records are found
    if ($result->num_rows > 0) {
        // Loop through each record and display the data
        while ($row = $result->fetch_assoc()) {
            echo "ID: " . $row["id"] . "<br>";
            echo "Username: " . $row["username"] . "<br>";
            echo "Password: " . $row["password"] . "<br>";
            echo "Level: " . $row["level"] . "<br>";
            echo "<br>";
        }
    } else {
        echo "No records found!";
    }

    // Close the statement
    $stmt->close();
} else {
    echo "Failed to prepare statement!";
}

// Close the connection
$conn->close();

```

## Delete data

```php
<?php

include "connect.php";

$username = 'abc';

$sql = "DELETE FROM users WHERE username = ?";

// Prepare the statement
$stmt = $conn->prepare($sql);

// Check if the statement is prepared successfully
if ($stmt) {
    // Bind the value to the parameter
    $stmt->bind_param("s", $username);

    // Execute the statement
    if ($stmt->execute()) {
        echo "Record deleted successfully!";
    } else {
        echo "Failed to delete record!";
    }

    // Close the statement
    $stmt->close();
} else {
    echo "Failed to prepare statement!";
}

// Close the connection
$conn->close();

```

## Update data

```php
<?php

include "connect.php";

$username = "huyna";

$sql = "UPDATE users SET password = ?, level = ? 
        WHERE username = ?";

$stmt = $conn->prepare($sql);

if ($stmt) {

    // New password and level values
    $newPassword = 'aaaaaa';
    $newLevel = 10;

    $stmt->bind_param("sis", $newPassword, $newLevel, $username);

    // Execute the statement
    if ($stmt->execute()) {
        echo "Record updated successfully!";
    } else {
        echo "Failed to update record!";
    }

    // Close the statement
    $stmt->close();
} else {
    echo "Failed to prepare statement!";
}

// Close the connection
$conn->close();

```
