# jQuery

## document.ready

```js
$(document).ready(function(){

  // jQuery methods go here...

});

```

- Điều này nhằm ngăn chặn bất kỳ mã jQuery nào chạy trước khi tài liệu tải xong.
- **document.ready**: Sự kiện này sẽ được kích hoạt khi tất cả các phần tử HTML đã được tạo ra trong **DOM**, nhưng trước khi tất cả các tài nguyên như hình ảnh hoặc CSS được tải xong. Có thể bắt đầu tương tác với các phần tử trong **DOM** ở giai đoạn này.
- **window.load**: Sự kiện này chỉ xảy ra khi toàn bộ trang, bao gồm tất cả các tài nguyên (hình ảnh, CSS, v.v.), đã được tải xong. Nếu cần làm việc với hình ảnh hoặc các yếu tố phụ thuộc vào tài nguyên đã tải xong, sẽ sử dụng sự kiện này.

## Selectors
