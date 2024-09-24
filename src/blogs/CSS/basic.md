# Basic Concepts

- [Import CSS into HTML code](#import-css-into-html-code)
- [ID & Class](#id--class)
- [Priority level](#priority-level)
- [CSS Variable](#css-variable)
- [CSS Units](#css-units)
- [CSS Padding](#css-padding)
- [CSS Border](#css-border)
- [CSS Margin](#css-margin)
- [CSS Box-sizing](#css-box-sizing)
- [CSS Background-clip](#css-background-clip)
- [CSS Background-image](#css-background-image)
- [CSS Function](#css-function)
- [CSS pseudo-classes](#css-pseudo-classes)
- [CSS pseudo-elements](#css-pseudo-elements)
- [CSS Position](#css-position)
- [CSS Box shadow](#css-box-shadow)

## Import CSS into HTML code

### Internal

```html
<head>
    <style>
        h1 {
            color: red;
        }
    </style>
</head>

```

### External

Tạo file .css, link vào html code.

```html
<head>
    <!-- <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title> -->
    <link rel="stylesheet" href="path...">
</head>
```

### Inline

```html
<body>
    <h1 style="color:red; font-size: 20px;">huyna</h1>
</body>
```

## ID & Class

- **ID**: unique trong HTML code, do đó mới có class để gom nhóm các object khác nhau. **Dùng dấu #**

```html
<head>
    <!-- <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title> -->
    <style>
        #first-heading {
            color: blue;
        }
    </style>
</head>

<body>
    <h1 id="first-heading">huyna</h1>
</body>
```

- **class**: Dùng chung, gom nhóm cho nhiều đối tượng. **Dùng dấu .**

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .first-heading {
            color: blue;
        }
    </style>
</head>

<body>
    <h1 class ="first-heading">huyna</h1>
    <h2 class="first-heading">abc</h2>
</body>

```

## Priority level

### Internal vs External

- Cái nào mới hơn thì ưu tiên, tức là được gọi sau.

### Inline-id-class-tag

- Inline **+1000**:
- id **+100**:
- class **+10**:
- tag *(gọi thẳng tag name)* **+1**:

### Combine id-class

```html
    <style>
        h1.first-heading#huyna {
            color: violet;
        }
    </style>
```

### More

```html
<style>
    * {
        color: blue !important; /* Đặc biệt ưu tiên nếu có !important */
    }

    h1.first-heading#huyna {
        color: violet;
    }
</style>
```

## CSS Variable

- Global

```html
<style>
    :root {
        --text-color: red;
    }

    h1.first-heading#huyna {
        color: var(--text-color);
    }
</style>
```

- Local

```html
<style> 
    h2 {
        --my-color: green;
        color: var(--my-color);
    }
</style>

```

## CSS Units

- **Absolute units** (*px*)
- **Relative units**:
  - **%**: *50%*, phụ thuộc vào thẻ chứa nó
  - **rem**: *1rem*, phụ thuộc vào thẻ html
  - **em**: *2em*, phụ thuộc vào thẻ có thuộc tính tương ứng gần nó nhất
  - **vw**: *50vw*, viewport width, bằng 50% kích thước chiều ngang của trình duyệt
  - **vh**: *50vh*, viewport height, bằng 50% kích thước chiều dọc của trình duyệt

## CSS Padding

```html
<style>
    .box1 {
        padding-top: 10px;
        padding-right: 10px;
        padding-botton: 10px;
        padding-left: 10px;
    }

    .box2 {
        padding: 10px; /*cả 4 hướng*/
    } 

    .box3 {
        padding: 10px 12px; /*trên-dưới trái-phải*/
        padding: 10px 12px 8px; /*trên trái-phải dưới */
        padding: 10px 12px 8px 9px; /*trên phải dưới trái*/
    }
</style>

```

## CSS Border

```html
<style>
    .box1 {
        border-width: 10px;
        border-style: solid;
        border-color: #333;
    }

    .box2 {
        border: 10px solid #333; /*mặc định solid là 2px*/
    }

</style>

```

## CSS Margin

- Padding, Border: chỉ làm dày bản thân nó lên
- Margin giúp tạo ra khoảng cách

```html

<style>
    .box1 {
        margin-top: 20px
    }

    .box2 {
        /* Viết ngắn, rút gọn tương tự padding */
    }

</style>

```

## CSS box-sizing

- **box-sizing**: tự động tính toán làm sao cho khi thêm padding, border (trong kích thước cho phép) mà không làm tăng kích thước của element

- **box-sizing**:
  - unset
  - content-box: như khi không set box-sizing
  - border-box

```html
<style>
.box {
    width: 100px
    height: 100px
    padding: 16px
    border: 2px solid #333;
    box-sizing: border-box;
}
</style>

```

## CSS background-clip

- Xác định background sẽ bắt đầu từ đâu đổ vào
- **background-clip**:
  - **border-box** (*default*): bg đổ từ border vào trong
  - **padding-box**: đổ từ padding vào
  - **content-box**: chỉ đổ content

## CSS background-image

```html
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .header {
            width: 100%;
            height: 100vh;
            background-image: url(https://modgents.com/cdn/shop/files/rosegold-beautiful-engagement-ring-claire.jpg?v=1694707576&width=1920);
            background-size: 100px; /*contain, cover*/
            background-repeat: repeat-x;
            /*linear-gradient(0, rgba(),....), url(...) ;*/

            /*background-origin ~ background-clip*/
            /*background-position*/
            /*shorthand -> tự research*/
        }
    </style>
</head>

<body>
    <div class="header"></div>
</body>

</html>

```

## CSS function

- var()
- linear-gradient()
- rgba()
- rgb()
- calc()
- attr()

## CSS pseudo-classes

- **:root**
- **:hover**: chỉ được kích hoạt ghi di chuột vào
- **:active**: bấm và giữ chuột thì kích hoạt
- **:first-child**:  
- **:last-child**:

## CSS pseudo-elements

- ::before
- ::after
- ::first-letter
- ::first-line
- ::selection

## CSS Position

- **Relative**: Nó lấy chính nó làm gốc tọa độ, chả quan tâm đến những thằng khác

```html
<style>
    h1 {
        position: relative;
        top: 100px; 
    }
</style>
```

- **Absolute**: Phụ thuộc vào thẻ cha gần nhất có thuộc tính *position*

- Đối tượng A là đối tượng con của đối tượng B, khi cần di chuyển A quanh B thì cần dùng **Absolute**

```html
<style>
    .box {
        position: relative;
    }
    .box-child {
        position: absolute;
        top: 0; 
        right: 0; 
    }
</style>

```

- **Fixed**: Cố định đối tượng để khi trượt trang thì đối tượng đó vẫn đứng yên. Khi đối tượng phụ thuộc vào đối tượng khác => *Absolute*, còn phụ thuộc vào trình duyệt => *fixed*

```html
<style>
    .box {
        position: fixed;
        top: 0;
    }
</style>

```

- **Sticky**: để làm ra các header bám dính, tức là bthg nó có thể đứng ở bất cứ đâu tuy nhiên trượt trang thì nó sẽ bám dính vào trên top của browser.

## CSS Box shadow

```css
.shadow{
    /*box-shadow: x y blur scale color*/
    /*
        scale: độ rộng của shadow (px)
        x,y: âm dương tùy chỉnh (px)
        blur: độ mờ (px)
    */
    box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.5);

    /*text-shadow ....*/
}
```

*Chrome có hỗ trợ chỉnh trực quan hơn*  [for more](https://www.youtube.com/watch?v=77_A9Q819MM)
