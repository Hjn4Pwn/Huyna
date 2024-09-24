# Basic Concepts

## Basic built-in function

- **alert**
- **console**

```js
console.log("a");
console.warn("b");
console.error("c");
```

- **confirm**

```js
confirm("r u ready???")
let isConfirm = confirm("r u ready???");
console.log(isConfirm);
// hiện msg box có ok - cancle, có thể xử lý lấy value
```

- **prompt**

```js
prompt("r u ready???")
//ngoài msg còn thêm input, có thể xử lý 
```

- **setTimeout**

```js
setTimeout(function () {
    alert("show this alert after 3s");
}, 3000)

```

- **setInterval**

```js
setInterval(function () {
    alert("show this alert ever 3s");
}, 3000)
```

## String method

```js
let myString = "Huy Na";
// length
console.log(myString.length);

// find index
console.log(myString.indexOf("y"));
// find from index 5
console.log(myString.indexOf("1", 5));
// find last
console.log(myString.lastIndexOf("1"));

// support regex
console.log(myString.search("1"));

// includes method
const str = 'Hello, world!';

console.log(str.includes('Hello'));  // true
console.log(str.includes('world', 5));  // true
console.log(str.includes('JavaScript'));  // false


// cut string from to 
console.log(myString.slice(4,6));

// replace
console.log(myString.replace("1", "2"));

// convert to upper/lower case 
console.log(myString.toUpperCase());
console.log(myString.toLowerCase());

// trim
console.log(myString.trim());

// split
console.log(myString.split(" "));

// get a character by index
console.log(myString.charAt(3));


```

## Number

```js
// to string
let a = 5;
let strA = a.toString();

// to fixed
let a = 5.5;
console.log(a.toFixed()); // 6

let a = 5.5786;
console.log(a.toFixed(2)); // 5.58
```

## Array method

```js
let myArr = [
    'Javascript',
    'PHP',
    'Ruby'
];

console.log(myArr);

console.log(Array.isArray(myArr)); // check isArray?

// toString
console.log(myArr.toString()); // Javascript,PHP,Ruby

// Join
console.log(myArr.join("--")); // Javascript--PHP--Ruby

// Pop
console.log(myArr.pop()); // Ruby 

console.log(myArr); //(2) ['Javascript', 'PHP']

// Push
console.log(myArr.push('Python')); // 4

console.log(myArr); //(4) ['Javascript', 'PHP', 'Ruby', 'Python']

// Shift
console.log(myArr.shift()); // Javascript

console.log(myArr); // (2) ['PHP', 'Ruby']

// Unshift
console.log(myArr.unshift('Python')); // 4

console.log(myArr); // (4) ['Python', 'Javascript', 'PHP', 'Ruby']

// Splice
console.log(myArr.splice(1, 1)); // ['PHP']
console.log(myArr); // (2) ['Javascript', 'Ruby']
//
console.log(myArr.splice(1, 0, 'Python'));
console.log(myArr); // (4) ['Javascript', 'Python', 'PHP', 'Ruby']
//
console.log(myArr.splice(1, 1, 'C++'));
console.log(myArr); // (3) ['Javascript', 'C++', 'Ruby']

// concat
let myArr1 = [
    'Javascript',
    'PHP',
    'Ruby'
];

let myArr2 = [
    'Huy Na',
];

console.log(myArr1.concat(myArr2)); // (4) ['Javascript', 'PHP', 'Ruby', 'Huy Na']

console.log(myArr1); // (3) ['Javascript', 'PHP', 'Ruby']


// slice
console.log(myArr.slice(1, 2)); // ['PHP']

console.log(myArr); // (3) ['Javascript', 'PHP', 'Ruby']


/*--------------------------------------*/
// includes method
console.log(myArr.includes('PHP')) // return true
console.log(myArr.includes('PHP', 2)) // return false

```

## Function

```js
/**
 * function writeLog(arg1, arg2) {
 * 
 * }
*/

function writeLog() {
    console.log(arguments);
    for (let param of arguments) {
        console.log(param);
    }
}
writeLog("1", "2", "huyna");

```

- *Có thể định nghĩa function trùng tên => overwrite*
- *Có thể định nghĩa function trong function*

- **Declaration function**: như thông thường, có thể hosting gọi trc khi được định nghĩa
- **Expression function**:

```js
// Có thể đặt tên hoặc không, giúp code dễ hiểu hơn
let myFunct = function() {

}

setTimeout(function() {

});

let myObj = {
    myfunct: function() {

    }
}
```

- **Arrow function**

## Object

```js
abc = 'sex';

let myInfo = {
    name: "Huyna",
    age: 21,
    [abc]: 'male',
    getName: function () {
        return this.name;
    }
}

myInfo.address = 'TP-HCM'; 
myInfo['my-email'] = 'abc@gmail.com';

check = 'my-email';

console.log(myInfo.address); // TP-HCM
console.log(myInfo['my-email']); // abc@gmail.com

console.log(myInfo[check]); // abc@gmail.com

console.log(myInfo.getName()); // Huyna

console.log(myInfo);
```

### Object constructor

```js
function User(firstName, lastName, avatar) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatar = avatar;

    this.getName = function () {
        return `${this.firstName} ${this.lastName}`;
    }
}

let admin = new User('Huy', 'Na', 'AVT');
let user = new User('ABC', 'xyz', 'avt');

admin.tittle = "ahihi";
user.comment = "so good!!!";

console.log(admin.getName());
console.log(user.getName());

```

### Object prototype - basic

```js
// giúp thêm thuộc tính, phương thức từ bên ngoài vào đối tượng, sau khi contructor được tạo ra

function User(firstName, lastName, avatar) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.avatar = avatar;

    this.getName = function () {
        return `${this.firstName} ${this.lastName}`;
    }
}

let admin = new User('Huy', 'Na', 'AVT');
let user = new User('ABC', 'xyz', 'avt');

User.prototype.className = "ANTN2021";
User.prototype.getClassName = function () {
    return this.className;
}

console.log(admin.className);
console.log(user.getClassName());

```

## Date

```js
let date = new Date(); //object
// let date = Date(); //string


let year = date.getFullYear();
let month = date.getMonth(); // +1 (return 0 -> 11)
let day = date.getDate();

console.log(`${day}/${month}/${year}`);

```

## Branching statement

```js
let date = 2;

if ()
{
    //
}
else if ()
{
    //
}
else
{
    //
}

/*--------------------------------------*/
switch (date) {
    case 1:
        
        break;

    case 2:
        
        break;
    case 3: // use ===
        
        break;

    default:
        break;
}
/*--------------------------------------*/
let date = 5;

console.log(date > 2 ? "lt 2" : "gt 2");
```

## Loop

### For

```js
// for
for (let i = 0; i <= 10; i++) {
    console.log(i);
}

/*--------------------------------------*/
// for - in
let myInfo = {
    name: 'huyna',
    age: 21
}

for (let key in myInfo) {
    console.log(myInfo[key]);
}

/*--------------------------------------*/
// for - of
let myArr = [
    "js",
    "php",
    "ruby",
    "php"
];

for (let value of myArr) {
    console.log(value);
}

/*--------------------------------------*/
// for - of
let myStr = "huyna";

for (let char of myStr) {
    console.log(char);
}

/*--------------------------------------*/
// for - of
let myInfo = {
    name: 'huyna',
    age: 21
}

console.log(Object.keys(myInfo)); // return array of keys
console.log(Object.values(myInfo)); // return array of values


for (let key of Object.keys(myInfo)) {
    console.log(myInfo[key]);
}

for (let value of Object.values(myInfo)) {
    console.log(value);
}

```

### While

```js
/*--------------------------------------*/
let i = 1;

while(i <= 1000)
{
    i++;
}

/*--------------------------------------*/
let i = 1;

do {
    
    i++;
}while (i <= 1000)

/*--------------------------------------*/

// break : thoát khỏi vòng lặp
// continue: nhảy tới vòng lặp kế tiếp
```

## Array method with function

```js
let courses = [
    {
        id: 1,
        name: "JS",
        coin: 250
    },
    {
        id: 2,
        name: "HTML-CSS",
        coin: 350
    },
    {
        id: 3,
        name: "PHP",
        coin: 200
    },
    {
        id: 4,
        name: "PHP",
        coin: 0
    }
];

// return 2 tham số phần tử của arr và index
// forEach duyệt qua các phần tử của array
courses.forEach(function (course, index) {
    console.log(index, course)
});

/*--------------------------------------*/

/**
 * Kiểm tra TẤT CẢ các phần tử của mảng ĐỀU phải thỏa 
 * điều kiện thì sẽ return về true
 */
let isFree = courses.every(function (course, index) {
    return course.coin === 0;
});

console.log(isFree)

/*--------------------------------------*/
/**
 * Kiểm tra các phần tử của mảng chỉ cần MỘT phần tử thỏa 
 * điều kiện thì sẽ return về true
 */
let isFree = courses.some(function (course, index) {
    return course.coin === 0;
});

console.log(isFree)

/*--------------------------------------*/
/**
 * Kiểm tra các phần tử của mảng return về PHẦN TỬ ĐẦU TIÊN 
 * thỏa điều kiện
 */
let course = courses.find(function (course, index) {
    return course.name === "PHP";
});

console.log(course)


/*--------------------------------------*/
/**
 * Kiểm tra các phần tử của mảng return TẤT CẢ phần tử
 * thỏa điều kiện
 */
let listCourse = courses.filter(function (course, index) {
    return course.name === "PHP";
});

console.log(listCourse)


/*--------------------------------------*/
/**
 * Duyệt từng phần tử và callback (function chỉ định) rồi
 * tiến hành lấy phần tử đó làm tham số, thay đổi, tùy chỉnh tùy ý
 * trong funct rồi return về. courses có bao nhiêu phần tử
 * thì newCourses cũng có bấy nhiêu phần tử
 * 
 * Chỉ khác là nó đã được chỉnh sửa, thay đổi như nào
 */
let newCourses = courses.map(function (course, index, originArray) {
    return {
        id: course.id,
        name: `Course: ${course.name}`,
        coin: course.coin,
        index: index,
        originArray: originArray
    }
    // return course.name; return 1 array chứa name of courses
});

console.log(newCourses);

/*--------------------------------------*/

/**
 * accmulator: Biến lưu trữ, lưu trữ giá trị return mỗi vòng lặp, được khởi tạo bằng 0 lúc gọi map 
 * currentValue: Phần tử hiện tại đang duyệt
 * currentIndex: Index của phần tử hiện tại đang duyệt
 * originArray: === courses, cùng trỏ đến 1 địa chỉ với courses <=> khi originArray này thay đổi => courses cũng thay đổi
 */
function coinHandler(accmulator, currentValue, currentIndex, originArray) {
    return accmulator + currentValue.coin
}

let totalCoin = courses.reduce(coinHandler, 0);  // 0 là giá trị khởi tạo

console.log(totalCoin);

/**
 * Khi không có giá trị khởi tạo nó sẽ lấy phần tử đầu tiên làm giá trị khởi tạo. 
 * Lúc này thì thằng currentValue lại là phần tử thứ 2
 * 
 * khi dữ liệu mình cần trả về trung với cái dữ liệu đầu tiên của phần tử, khi k cần truyền mà vẫn đúng thì khỏi truyền
 * / 

```

## Math object

```js
console.log(Math.PI) // 3.141592653589793

console.log(Math.round(5.789)); // 6

console.log(Math.abs(-5)); // 5

console.log(Math.ceil(5.123)); // làm tròn trên => 6

console.log(Math.floor(5.99)); // làm tròn dưới => 5

console.log(Math.random()); // return 1 số thập phân nhỏ hơn 1

console.log(Math.floor(Math.random() * 10)); // random từ 0 => 9

console.log(Math.min(-100, 2, 34534, 7)); // -100

console.log(Math.max(-100, 2, 34534, 7)); // 34534

```

## Callback function

- Là function
- Là tham số của một hàm khác

```js
function myFunction(param) {
    if (typeof param === "function") {
        param("haizzz");
    }
}

function myCallback(value) {
    console.log("Value: ", value);
}

myFunction(myCallback);

```

### Define Prototype

```js
var courses = [
    'js',
    'php',
    'python'
]

/**
 * lặp qua các phần tử trong courses
 * mỗi lần lặp qua thì tiến hành gọi hàm callback
 * this => courses
 */
Array.prototype.mapHuyNa = function (callback) {
    let output = [];
    arrayLength = this.length;

    for (let i = 0; i < arrayLength; i++) {
        let result = callback(this[i], i); // định nghĩa hàm return về 2 giá trị, nên ở dưới mới nhận được
        output.push(result);
    }
    return output;
}

var htmls = courses.mapHuyNa(function (course) {
    return `<h2>${course}</h2>`;
})

console.log(htmls.join(' '))

```

*Khi mà định nghĩa mapHuyNa như này thì thằng courses sẽ thừa hưởng luôn method này => nó sẽ có cái key là mapHuyNa nếu ta duyệt qua bằng for-in sẽ thấy*

```js
for (let index in this)
{
    console.log(index, this.hasOwnProperty(index));
    // check xem index có nằm trong nhóm lớn hay nằm trong nhóm prototype
}

```
