# CSS

- [Syntax](#syntax)
- [ID & class](#id--class)
- [Methods to use CSS](#methods-to-use-css)
- [Style priority](#style-priority)
- [Basic CSS selectors](#basic-css-selectors)
  - [*](#basic-css-selectors)
  - [#X](#x)
  - [.X](#x-1)
  - [X Y](#x-y)
  - [X](#x-2)
  - [X + Y](#x--y)
  - [X > Y](#x--y-1)
  - [X ~ Y](#x--y-2)
- [Attribute Selector (X[attribute])](#attribute-selector-xattribute)
  - [X\[href*="viblo"\]](#xhrefviblo)
  - [X\[href^="http"\]](#xhrefhttp)
  - [X\[href$=".jpg"\]](#xhrefjpg)
  - [name\[data-*="value"\]](#namedata-value)
  - [X\[foo~="bar"\]](#xfoobar)
- [Pseudo-class Selectors](#pseudo-class-selectors)
  - [focus](#focus)
  - [active](#active)
  - [hover](#hover)
  - [link - visited](#link---visited)
  - [target](#target)
  - [empty](#empty)
  - [nth-child(n) - nth-last-child(n)](#nth-childn---nth-last-childn)
  - [nth-of-type(n) - nth-last-of-type(n)]()
  - [only-of-type](#only-of-type)
  - [only-child](#only-child)
  - [not()](#not)
  - [checked](#checked)
  - [enable - disable](#enable---disable)
  - [valid - invalid](#valid---invalid)
  - [fist-of-type - last-of-type](#fist-of-type---last-of-type)
  - [fist-child - last-child](#fist-child---last-child)
- [Pseudo-element Selectors](#pseudo-element-selectors)
  - [::before](#before)
  - [::after](#after)
  - [::first-letter](#first-letter)
  - [::first-line](#first-line)
  - [::selection](#selection)
  - [::placeholder](#placeholder)
  - [::marker](#marker)
- [CSS properties](#css-properties)

## Syntax

```css
selector {
  property: value;
}

p {
  color: red;
  text-align: center;
}
```

- **Selector**: Là phần xác định phần tử HTML nào sẽ được áp dụng các quy tắc CSS.
- **Property**: Là thuộc tính của phần tử HTML mà muốn thay đổi (ví dụ: màu sắc, kích thước, font chữ).
- **Value**: Là giá trị của thuộc tính.

## ID & class

- **ID**: Dùng để xác định duy nhất một phần tử. Trong HTML, một phần tử chỉ có thể có một **ID** và mỗi **ID** phải là duy nhất trong toàn bộ tài liệu.
- Example:

```css
#id_name {
  /* Các thuộc tính CSS */
}

```

- **Class**: Có thể được sử dụng cho nhiều phần tử và một phần tử có thể có nhiều class.
- Example:

```css
.class_name {
  /* Các thuộc tính CSS */
}

```

## Methods to use CSS

**Có ba cách để áp dụng CSS vào HTML:**

- **Inline CSS**: CSS được viết trực tiếp trong thẻ HTML sử dụng thuộc tính style.

```html
<p style="color: blue;">Hello</p>

```

- **Internal CSS**: CSS được viết trong thẻ *\<style\>* bên trong phần *\<head\>* của tài liệu HTML.

```html
<head>
  <style>
    p {
      color: green;
    }
  </style>
</head>

```

- **External CSS:** CSS được viết trong một file riêng biệt (*ví dụ styles.css*) và được liên kết với tài liệu HTML thông qua thẻ *\<link\>*.

```css
<link rel="stylesheet" href="styles.css">

```

## Style priority

Độ ưu tiên từ **thấp đến cao**

- **CSS mặc định của trình duyệt**.
- **External/Linked CSS**.
- **Internal CSS** (*trong thẻ \<style\>*).
- **Inline CSS** (trong thuộc tính style của từng thẻ HTML).
- **!important**: Bất kỳ quy tắc nào sử dụng !important sẽ có độ ưu tiên cao nhất.

**Inline CSS** > **ID Selector** > **Class Selector** > **Element Selector**

## Basic CSS selectors

[ref 1](https://viblo.asia/p/30-css-selectors-can-nho-p1-0bDM6ko6G2X4)
[ref 2](https://viblo.asia/p/30-css-selectors-can-nho-p2-aKYMNjelM83E)

### *

```css
* {
 margin: 0;
 padding: 0;
}
/* Tất cả các thẻ trong website đều được áp dụng 2 thuộc tính margin, padding với giá trị 0 */
```

- Có nghĩa là chọn tất cả các elements.
- \* cũng có thể sử dụng để chọn tất cả các elements trong 1 element

```css
#container * {
 border: 1px solid black;
}
/* áp dụng cho tất cả các elements là con của #container */
```

### #X

```css
#container {
   width: 960px;
   margin: auto;
}

```

- Đây là id selector.
- Css ứng với selector này được áp dụng cho duy nhất 1 element có id="X". Vì id là duy nhất nên nó không thể tái sử dụng.

### .X

```css
.error {
  color: red;
}

```

- Đây là class selector.
- Với class selector thì ta có thể tái sử dụng chúng. Vì class có thể đặt ở nhiều nơi. Đây cũng là sự khác nhau của id và class selector.

### X Y

```css
li a {
  text-decoration: none;
}

```

- Đây gọi **descendant selector**. Không yêu cầu phần tử con phải trực tiếp, chỉ cần nằm trong phần tử cha.
- Ví dụ trên có nghĩa là tất cả các tag **a** nằm trong tag **li** thì đều mang giá trị css *text-decoration: none*.
- X Y chỉ là đại diện cho selector. Không nhất thiết phải là tag element.
- Ta có thể hoặc xen kẽ thêm nhiều tấng id, class, type selector.

```css
#table td.title  {
    text-align: center;
}
```

### X

```css
a { color: red; }
ul { margin-left: 0; }

```

- Type selector được sử dụng khi ta muốn áp dụng CSS cho tất cả các **tag** cùng tên trong page.

### X + Y

```css
ul + p {
   color: red;
}

```

- Đây gọi là **adjacent selector**. Phạm vi áp dụng là những element liền kề ngay sau selector được khai báo(X).
- Phần tử Y phải liền kề với X trên cùng một cấp độ trong DOM.
- Trong ví dụ trên ta có thể hiểu là: Css áp dụng cho thẻ **p** đầu tiên đứng ngay sau thẻ **ul** sẽ có *color: red;*

### X > Y

```css
div#container > ul {
  border: 1px solid black;
}

```

- Chỉ chọn phần tử Y là con trực tiếp của phần tử X
- Như ví dụ trên thì chỉ có thẻ **ul** là con trực tiếp của **div** có *id="container"* mới được lấy

### X ~ Y

```css
ul ~ p {
   color: red;
}

```

- Nó tương tự **X+Y** nhưng ít nghiêm ngặt hơn, có nghĩa là **X+Y** sẽ lấy phần tử **Y** đầu tiên sau **X** còn **X~Y** thì nó sẽ lấy tất cả **Y** sau **X**

## Attribute Selector (X[attribute])

Attribute selector chọn các phần tử dựa trên giá trị của thuộc tính. Selector có thể chi tiết dựa trên giá trị thuộc tính hoặc chỉ yêu cầu phần tử có thuộc tính đó.

```css
a[title] {
  color: green;
}

input[type="text"] {
  border: 1px solid blue;
}

```

### X\[href*="viblo"\]

Lấy tất cả thẻ **X** có thuộc tính **href** và giá trị có chứa từ *viblo*

### X\[href^="http"\]

Lấy tất cả thẻ **X** mà có thuộc tính **href** bắt đầu bằng ***http***

### X\[href$=".jpg"\]

Trái ngược với selector trên, nó tham chiếu đến element có thuộc tính mang giá trị kết thúc bằng value.

### name\[data-*="value"\]

Chọn các phần tử mà **attribute** được bắt đầu bằng **data-**

### X\[foo~="bar"\]

Chọn các phần tử có thuộc tính **foo** chứa giá trị **bar** như một từ riêng biệt (ngăn cách bởi dấu cách).

## Pseudo-class Selectors

Chọn phần tử dựa trên trạng thái đặc biệt của phần tử đó.

### focus

```css
input:focus {
  border: 2px solid blue;
}

```

### active

```css
a:active {
    color: orange;
}
/* kích hoạt khi phần tử được click vào */
```

### hover

```css
a:hover {
    color: red;
}
/* Kích hoạt khi người dùng di chuyển chuột qua phần tử. */
```

### link - visited

```css
a:link {
    color: blue;
}
/* link để style thẻ a chưa được nhấp vào */
a:visited {
    color: purple;
}
/* visited để style thẻ a đã được nhấp vào - đã truy cập */
```

### target

```css
div:target {
  background-color: yellow;
}
/* Chọn phần tử khi nó là mục tiêu của một liên kết Fragment identifier - href="#section1", sẽ style cho thẻ có id là section1 */
```

### empty

```css
div:empty {
  background-color: yellow;
}

```

### nth-child(n) - nth-last-child(n)

*n có thể là odd/even*

```css
li:nth-child(3) {
  color: red;
}
/* style cho những thẻ li thứ 3 đếm từ trên xuống. */
/* thằng kia ngược lại từ dưới lên. */
```

### nth-of-type(n) - nth-last-of-type(n)

*n có thể là odd/even*

```css
p:nth-of-type(3) {
  font-weight: bold;
}
/* Chọn phần tử thứ 3 từ trên xuống trong số các phần tử cùng loại là p trong phần tử cha */
/* thằng kia ngược lại từ dưới lên */
```

### only-of-type

```css
/* chọn phần tử nếu nó là duy nhất của loại đó trong phần tử cha */
p:only-of-type{
  color: green;
}
/* Nếu trong phần tử cha chỉ có 1 thằng p thì nó sẽ màu xanh */
```

### only-child

```css
/* chọn phần tử nếu nó là con duy nhất */
div p:only-child {
  font-size: 20px;
}
/* nếu p là con duy nhất của div thì nó sẽ có cỡ chữ là 20px */
```

### not()

```css
/* chọn tất cả các phần tử, trừ ... */
p:not(.important) {
  color: grey;
}
/* Tất cả đoạn văn p không có class important sẽ có màu xám */
```

### checked

```css
/* Chọn các phần tử radio hoặc checkbox đã được chọn */
input[type="checkbox"]:checked {
  background-color: yellow;
}
/* các ô checkbox đã được chọn sẽ có nền vàng */
```

### enable - disable

```css
input:enabled {
  background-color: white;
}
input:disabled {
  background-color: lightgrey;
}

```

### valid - invalid

```css
input:valid {
  border: 2px solid green;
}
input:invalid {
  border: 2px solid red;
}

```

### fist-of-type - last-of-type

```css
/* chọn phần tử đầu/cuối trong các phần tử cùng loại trong phần tử cha. */
li:first-of-type {
  font-weight: bold;
}
li:last-of-type {
  color: red;
}

```

### fist-child - last-child

```css
/* Chọn phần tử con đầu tiên hoặc cuối cùng trong phần tử cha */
div p:first-child {
  color: blue;
}
div p:last-child {
  color: red;
}

```

## Pseudo-element Selectors

### ::before

```css
p::before {
    content: "Prefix: ";
    color: blue;
}
/* Chuỗi Prefix sẽ được thêm vào trước mỗi đoạn văn */
```

### ::after

```css
p::after {
    content: " [Read More]";
    color: red;
}
/* Chuỗi [Read More] sẽ được thêm vào sau mỗi đoạn văn */

.notify::after{
    position: absolute;
    top: -15px;
    width: 100%;
    height: 10%;
    content: "";
    /* background-color: blue; */
    display: block;
}
```

### ::first-letter

```css
p::first-letter {
    font-size: 2em;
    color: green;
    font-weight: bold;
}
/* Áp dụng cho chữ cái đầu tiên của đoạn văn. */
```

### ::first-line

```css
p::first-line {
    font-weight: bold;
    color: darkblue;
}
/* Ap dụng style cho dòng đầu tiên của đoạn văn */
```

### ::selection

```css
::selection {
    background-color: yellow;
    color: black;
}
/* Áp dụng cho văn bản được highlight */
```

### ::placeholder

```css
input::placeholder {
    color: grey;
    font-style: italic;
}
/* style cho văn bản placeholder trong trường nhập liệu */
```

### ::marker

```css
ul li::marker {
    color: red;
    font-size: 1.5em;
}
/* style cho bullet point, chấm đầu dòng của li */
```

## CSS properties

### font-size - font-family

```css
h1 {
    font-size: 32px;
}

body {
    font-family: Arial, sans-serif;
}

```

### text-align

```css
h1 {
    text-align: center; /*start/end/justify*/
}

```

### margin

```css
.box1 {
    margin-top: 25px;
    margin-right: 50px;
    margin-botton: 75px;
    margin-left: 100px;
}

.box2 {
    margin: 25px; /*cả 4 hướng*/
    margin: 25px 50px; /*trên-dưới trái-phải*/
    margin: 25px 50px 75px; /*trên trái-phải dưới */
    margin: 25px 50px 75px 100px; /*trên phải dưới trái*/
}
```

### padding

```css
.box1 {
    padding-top: 25px;
    padding-right: 50px;
    padding-botton: 75px;
    padding-left: 100px;
}

.box2 {
    padding: 25px; /*cả 4 hướng*/
    padding: 25px 50px; /*trên-dưới trái-phải*/
    padding: 25px 50px 75px; /*trên trái-phải dưới */
    padding: 25px 50px 75px 100px; /*trên phải dưới trái*/
}
```

### border

```css
.box1 {
    border-width: 2px;
    border-style: solid;
    border-color: black;
}

.box2 {
    border: 2px solid black; /*mặc định solid là 2px*/
}
/* có đường viền màu đen, rộng 2px và loại viền là "solid". */
```

### width - height

```css
div {
    width: 300px;
    height: 200px;
}
```

### display

```css
span {
    display: block; /*inline, none, flex,...*/
    background-color: lightblue;
}

```

### position

**position: static;**: Phần tử giữ vị trí mặc định của nó (mặc định).
**position: relative;**: Nó lấy chính nó làm gốc tọa độ và có thể được di chuyển tương đối so với vị trí ban đầu.

```css
div.relative {
  position: relative;
  left: 30px;
  border: 3px solid #73AD21;
}
```

**position: absolute;**: Phụ thuộc với phần tử cha gần nhất có thuộc tính position (nếu không có thì so với toàn bộ trang).

```css
div.relative {
  position: relative;
  width: 400px;
  height: 200px;
  border: 3px solid #73AD21;
}

div.absolute {
  position: absolute;
  top: 80px;
  right: 0;
  width: 200px;
  height: 100px;
  border: 3px solid #73AD21;
}
```

**position: fixed;**: Phần tử cố định trên màn hình ngay cả khi trang được cuộn

```css
div.fixed {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 300px;
  border: 3px solid #73AD21;
}
```

**position: sticky;**: Để làm ra header bám dính, bthg nó có thể ở bất cứ đâu, tuy nhiên khi cuộn trang thì nó sẽ bám dính lên top của browser.

```css
div.sticky {
  position: sticky;
  top: 0;
  background-color: green;
  border: 2px solid #4CAF50;
}
```

### overflow

- Thuộc tính kiểm soát việc nội dung bên trong phần tử có kích thước lớn hơn không gian cho phép của phần tử đó.
  - **overflow: visible;**: Nội dung tràn sẽ hiển thị ra ngoài (mặc định).
  - **overflow: hidden;**: Nội dung tràn sẽ bị ẩn.
  - **overflow: scroll;**: Luôn luôn hiển thị thanh cuộn, dù nội dung có tràn hay không.
  - **overflow: auto;**: Hiển thị thanh cuộn nếu nội dung tràn.

```css
div {
    width: 200px;
    height: 100px;
    overflow: auto;
    background-color: lightgrey;
}

```

### z-index

```css
/* kiểm soát thứ tự xếp chồng, layer giữa các phần tử, càng cao thì càng ở trên */
div {
    position: absolute;
    z-index: 10;
}

```

### opacity

```css
div {
    opacity: 0.5;
}
/* Độ trong suốt của phần tử */
```

### box-shadow

```css
div {
    box-shadow: 5px 5px 10px grey;
}
/* Div có bóng đổ với khoảng cách 5px theo trục X và Y, độ mờ 10px. */
```

### line-height

```css
p {
    line-height: 1.5;
}

```

### text-decoration

```css
a {
    text-decoration: none;
}

```

### visibility

- Kiểm soát việc phần tử có hiển thị hay không, nhưng vẫn giữ nguyên vùng không gian của nó

```css
p {
    visibility: hidden; /*visible - mặc định*/
}

```

### float

```css
img {
    float: left; 
    margin-right: 10px;
}
/* căn phần tử sang trái-phải  */
```

### box-sizing

- **box-sizing**: tự động tính toán làm sao cho khi thêm padding, border (trong kích thước cho phép) mà không làm tăng kích thước của element

- **box-sizing**:
  - unset
  - content-box: như khi không set box-sizing
  - border-box

```css
.box {
  width: 300px;
  height: 100px;  
  padding: 50px;
  border: 1px solid red;
  box-sizing: border-box;
}

```

### flex

[Đọc bài này dễ hiểu hơn](https://itviec.com/blog/flex-css/)

### transition

```css
/* Cho phép tạo hiệu ứng chuyển đổi mượt mà giữa hai trạng thái CSS */
button {
    background-color: blue;
    transition: background-color 0.5s ease;
}

button:hover {
    background-color: red;
}
/* Khi hover, màu nền của nút sẽ từ từ chuyển từ xanh sang đỏ */
```

### transform

```css
/* Biến đổi phần tử (rotate() - quay, translate() - dịch chuyển, scale() - phóng to/thu nhỏ) */
div{
  transform: rotate(45deg);
}
```

### animation

Thuộc tính cho phép tạo ra các hiệu ứng hoạt ảnh cho phần tử qua thời gian

- **animation-name**: định nghĩa name
- **animation-duration**: thời gian thực hiện
- **animation-iteration-count**: số lần lặp lại

```css
@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

div {
    animation-name: fadeIn;
    animation-duration: 2s;
}

```

### border-radius

```css
div {
    border: 1px solid black;
    border-radius: 10px;
}

```

### cursor

```css
a {
    cursor: pointer;
}
/* Con trỏ chuột sẽ chuyển sang hình bàn tay khi di chuột qua liên kết */
```

- **default**: Con trỏ mặc định.
- **move**: Con trỏ dịch chuyển.
- **text**: Con trỏ dạng chữ (thường xuất hiện khi nhấp vào vùng văn bản).
- **wait**: Con trỏ dạng đồng hồ đợi.
- **not-allowed**: Con trỏ biểu thị hành động không được phép.
