# Transform - Transition - Animation

- **Transform**

[For more](https://www.w3schools.com/cssref/css3_pr_transform.php)

```css
.test:hover{
    transform: rotate(20deg);
}

```

*Tuy nhiên nó sẽ không mượt mà, do đó cần sự support của transition*

- **Transition**

[For more](https://www.w3schools.com/cssref/css3_pr_transition.php)

```css
div {
  width: 100px;
  transition: width 2s;
}

div:hover {
  width: 300px;
}

```

- Có 4 thuộc tính:
  - transition-property
  - transition-duration
  - transition-timing-function
  - transition-delay

- **Animation**

[*Dùng class animation có sẵn*: **Animation - CDN**](https://animate.style/)

*Cũng như transition tuy nhiên cần tạo ra chuyển đổi phức tạp (keyframe)*

[for more](https://www.w3schools.com/cssref/css3_pr_animation.php)

```css
.test{
    animation: changeTextColor ease 1s;
}

@keyframes changeTextColor{
    from{
        color: white;
    }
    to {
        color: green;
    }
}

/*Có ý nghĩa từ 0 -> 25% của animation-duration thì nó sẽ làm gì */
@keyframes changeTextColor{

    0%{
        color: white;
    }
    25% {
        color: blue;
    }

    100% {
        color: green;
    }
}

```
