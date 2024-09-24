# Resposive

## Media query

```css
@media not|only mediatype and (mediafeature and|or|not mediafeature){
    /*CSS code*/
}
```

- Mediatypes:
  - print
  - screen
  - speech
  - all - default

- Media Features:
  - min-width
  - max-width

- Polyfill: *giúp các trình duyệt cũ support media query*

[cdn](https://cdnjs.com/libraries/picturefill)

```html
<!--[if lt IE 9]>
<script src="https://cdnjs.cloudflare.com/ajax/libs/picturefill/3.0.3/picturefill.min.js" integrity="sha512-Nh/FthCqOFq56kGp1DsNb6GKK29iIv2ZJc7Fylln1WRrWpeE5LjSBWeAp61dkBASDxZT12aL9mZyIrhsAqgRpw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<![endif]-->

```

## Breakpoints

*Là những điểm/vị trí mà bố cục website sẽ thay đổi - thích ứng để tạo nên giao diện responsive*

[Try here if it's alive](https://ui.dev/rwd/develop/browser-feature-support/media-queries-for-common-device-breakpoints)

```css
/* Mobile: width < 740px */
@media only screen and (max-width: 739px){
  /* Styles */
}

/* Tablet width >= 740px and width < 1024px */
@media only screen and (min-width: 740px) and (max-width: 1023px){
  /* Styles */
}

/* PC: width >= 1024px */
@media only screen and (min-width: 1024px){
  /* Styles */
}

```

## Media quert units

***px , rem , em ???***

- [For more comparisons](https://zellwk.com/blog/media-query-units/)

- [Convert **px** to **em**](https://www.w3schools.com/tags/ref_pxtoemconversion.asp)

The end => use **em**
