# HTML

- [Doctype html](#doctype-html)
- [html](#html)
- [header](#header)
- [script](#script)
- [link](#link)
- [div](#div)
- [img](#img)
- [span](#span)
- [p](#p)
- [Format tags](#format-tags)
- [form tags](#form-tags)
- [table](#table)
- [ul](#ul)
- [ol](#ol)
- [iframe](#iframe)

## Doctype html

- Thông báo cho browser về version của HTML đang sử dụng, để hiển thị chính xác
- Khi có doctype, browser sẽ tuân thủ các chuẩn hiện đại của html và css
- Khi không có doctype thì browser sẽ hoạt động như các phiên bản cũ để hỗ trợ các trang web cũ

## html

- Là một trong những thẻ quan trọng nhất, bao bọc nội dung trang web
- Là thẻ cha chứa hai thẻ là head và body

```html
<!DOCTYPE html>
<html lang="en">

<head>
  <title>Title of the document</title>
</head>

<body>
    <h1>This is a heading</h1>
    <p>This is a paragraph.</p>
</body>
</html>

```

- Ý nghĩa:
  - Bao bọc toàn bộ dữ liệu, đảm bảo browser hiểu rằng nội dung trong đó được viết theo cú pháp HTML
  - Thẻ này luôn nằm ngoài cùng, và bọc các thẻ head, body, và các phần tử khác

### lang

- Chỉ định ngôn ngữ chính của tài liệu
- Quan trọng cho SEO, các công cụ tìm kiếm, trình duyệt
- Examples:

```html
<html lang="en">
<html lang="vi">
<html lang="fr">

```

### xmlns

- XML namespace
- Trong HTML hoặc XML, nếu không có thuộc tính xmlns, các thẻ có thể bị nhầm lẫn với các thẻ của markup languages khác (SVG, MathML)
- Với HTML5 thì xmlns được chỉ định mặc định namespace của XHTML
- Trong trường hợp kết hợp HTML với markup langs khác thì cần khai báo namespace riêng cho mỗi phần tử

### manifest

**\<html manifest="offline.appcache"\>**

- Chỉ định tập tin chứa thông tin về các tài nguyên mà browser nên lưu trữ để trang web có thể hoạt động khi ngoại tuyến

```sh
CACHE MANIFEST
# Đây là file manifest cho ứng dụng ngoại tuyến

# Phần CACHE lưu trữ các tài nguyên
CACHE:
index.html
style.css
app.js
logo.png

# Phần NETWORK chỉ định tài nguyên cần truy cập từ mạng
NETWORK:
api/*
/login
/news

# Phần FALLBACK chỉ định trang dự phòng khi người dùng ngoại tuyến
FALLBACK:
/ /offline.html # khi user ngoại tuyến và cố gắng truy cập trang chính, browser sẽ auto hiển thị trang offline.html
/images/ /images/offline.png # tương tự nếu offline user muốn truy xuất img

```

## header

- Đầu trang chính của toàn bộ trang web (thường chứa logo, menu điều hướng)
- Đầu của từng phần hoặc bài viết cụ thể, như trong 1 bài báo, thường chứa tiêu đề và một đoạn giới thiệu

```html
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Trang web ví dụ</title>
</head>
<body>
  <header>
    <h1>Trang chủ</h1>
    <nav>
      <ul>
        <li><a href="#home">Trang chủ</a></li>
        <li><a href="#about">Giới thiệu</a></li>
        <li><a href="#contact">Liên hệ</a></li>
      </ul>
    </nav>
  </header>

  <section>
    <h2>Giới thiệu về trang web</h2>
    <p>Đây là một trang web ví dụ sử dụng thẻ header.</p>
  </section>
</body>
</html>


```

## script

Nhúng mã JS vào hoặc liên kết đến một tệp JS bên ngoài

### src

Thuộc tính chỉ định đường dẫn đến tệp js bên ngoài

### async

Khi có thuộc tính này thì browser sẽ tải tệp JS không đồng bộ, tức là tiếp tục tải trang mà không cần chở JS hoàn tất.

## link

- Được dùng để liên kết tài liệu HTML với các tài nguyên bên ngoài, chủ yếu là tệp CSS hoặc favicon
- Là thẻ rỗng, không có nội dung bên trong và thường được đặt trong thẻ head

### rel

- Chỉ định mối quan hệ giữa tài liệu hiện tại và tài nguyên được liên kết
- Giá trị phổ biến là **stylesheet** (liên kết với tệp css), **icon** (liên kết với favicon)

### href

Chỉ định đường dẫn đến resource bên ngoài

### type

Chỉ định kiểu nội dung của resource. Với tệp CSS giá trị là **"text/css"**, favicon là **image/x-icon**

### media

Chỉ định phương tiện mà tài nguyên CSS được áp dụng, như **all**, **screen**, **print**

## div

- Là một thẻ block được sử dụng tạo các block content hoặc nhóm các phần tử html lại với nhau
- Thẻ này không có ý nghĩa về nội dung cụ thể mà chỉ được sử dụng để tạo bố cục và cấu trúc cho trang web, thường đi kèm với CSS, JS

- **Attributes**: id, class, style

## img

Được sử dụng để chèn hình ảnh vào HTML, là thẻ rỗng, không có thể đóng, phải có thuộc tính src để chỉ định path của hình ảnh

```html
<img src="product.jpg" alt="Hình ảnh sản phẩm" width="400" height="300" title="Đây là hình ảnh mô tả sản phẩm">
<!-- alt : Chỉ định văn bản thay thế cho hình ảnh khi không thể tải được -->
<!-- title : Chỉ định văn bản chú thích khi người dùng đưa chuột qua hình ảnh. -->

```

## span

- Là thẻ inline, được sử dụng để nhóm các phần tử nhỏ trong văn bản mà không làm ảnh hưởng đến bố cục của tài liệu.
- **Attributes**: id, class, style, title

## p

- Block tag
- Browser sẽ tự động thêm 1 dòng trống ngay trước sau sau mỗi thẻ p
- **Attributes**: id, class, style, title

## Format tags

[ref](https://www.programiz.com/html/formatting)

| Thẻ       | Chức năng                                      | Ví dụ |
|-----------|------------------------------------------------|-------|
| [`<b>`](#b)     | In đậm văn bản (không ngữ nghĩa)               | `<b>In đậm</b>` |
| [`<strong>`](#strong)| In đậm văn bản với ý nghĩa nhấn mạnh           | `<strong>Nhấn mạnh</strong>` |
| [`<i>`](#i)     | In nghiêng văn bản (không ngữ nghĩa)           | `<i>In nghiêng</i>` |
| [`<em>`](#em)  | In nghiêng văn bản với ý nghĩa nhấn mạnh       | `<em>Nhấn mạnh</em>` |
| [`<u>`](#u)     | Gạch chân văn bản                              | `<u>Gạch chân</u>` |
| [`<mark>`](#mark)  | Đánh dấu văn bản (highlight)                   | `<mark>Đánh dấu</mark>` |
| [`<small>`](#small) | Giảm kích thước văn bản                        | `<small>Văn bản nhỏ</small>` |
| [`<sup>`](#sup)   | Hiển thị văn bản phía trên dòng cơ bản         | `a<sup>2</sup>` |
| [`<sub>`](#sub)   | Hiển thị văn bản phía dưới dòng cơ bản         | `H<sub>2</sub>O` |
| [`<del>`](#del)   | Gạch ngang văn bản (văn bản bị xóa)            | `<del>500.000 VNĐ</del>` |
| [`<ins>`](#ins)   | Gạch chân văn bản (văn bản mới thêm)           | `<ins>450.000 VNĐ</ins>` |

### b

- Thẻ này chỉ đơn giản là dùng để in đậm văn bản, không mang ngữ nghĩa đặc biệt
- Chủ yếu để làm nổi bật văn bản

### strong

- Cũng là in đậm văn bản, nhưng nó có ý nghĩa ngữ nghĩa: nhấn mạnh tầm quan trọng của văn bản đó.
- Công cụ tìm kiếm hoặc các công cụ hỗ trợ sẽ hiểu rẳng văn bản trong thẻ này là quan trọng

### i

- DÙng để in nghiêng văn bản, không mang ngữ nghĩa ngữ pháp

### em

- Được sử dụng để nhấn mạnh văn bản bằng cách in nghiêng, và có ý nghĩa ngữ pháp.
- Các công cụ hỗ trợ đọc văn bản cho người khiếm thị sẽ đọc phần này với giọng nhấn mạnh
- Nó mang ngữ nghĩa rằng văn bản này cần được chú ý đặc biệt

### u

- Dùng để gạch chân văn bản, chủ yếu để tạo điểm nhấn thị giác

### mark

- Dùng để highlight văn bản, thường hiển thị với nền vàng

### small

- Làm cho văn bản hiển thị ở kích thước nhỏ hơn bình thường. Nó thường được dùng cho các ghi chú, lời chú thích hoặc thông tin bổ sung không quan trọng bằng nội dung chính.

### sup

- Dùng để hiển thị văn bản nhỏ và nằm ở vị trí phía bên trên dòng cơ bản, thường dùng cho chỉ số bậc (mũ trong toán học)

### sub

- Dùng để hiển thị văn bản nhỏ và nằm ở vị trí phía dưới cơ bản, thường được sử dụng trong hóa học để biểu diễn công thức hoặc các chỉ số khác.

### del

- Được sử dụng để gạch ngang văn bản, biểu thị rằng văn bản này đã bị xóa hoặc không còn hiệu lực

### ins

- Được sử dụng để đánh dấu văn bản được thêm mới, thường được hiển thị dưới dạng văn bản có gạch chân.

## form tags

### form

- Là khung chính cho một form, nó chứa các loại input
- Các Attributes:
  - **action**: Chỉ định URL mà dữ liệu form sẽ được gửi user nhấn nút submit
  - **method**: CHỉ định phương thức HTTP để gửi dữ liệu: GET, POST

  - **enctype**: Thuộc tính này chỉ định cách dữ liệu mẫu sẽ được mã hóa khi gửi đi, [ref](https://viblo.asia/p/html-form-encoding-OeVKBM8Y5kW)
    - **application/x-www-form-urlencoded**
      - Đây là kiểu mã hóa mặc định nếu không chỉ định **enctype**
      - Dữ liệu sẽ được mã hóa theo cách mà các ký tự đặc biệt (dấu cách, dấu chấm, etc.) được chuyển thành các mã **%xx** (khoảng trống thành %20)
      - Các cặp key-value được nối bằng dấu & (**Example**: username=huy$password=123)

    - **multipart/form-data**
      - Được sử dụng khi form có file upload
      - Kiểu enc này chia data thành nhiều part nhỏ riêng biệt cho mỗi trường dữ liệu, và file sẽ được encrypt thành binary thay vì URL string

    - **text/plain**
      - Dữ liệu biểu mãua sẽ được gửi mà không có mã hóa đặc biệt nào
  - **target**: chỉ định nơi kết quả của biểu mẫu sẽ được hiển thị:
    - **_self**: Kết quả hiển thị trong tab hiện tại (mặc định).
    - **_blank**: Mở trong tab hoặc cửa sổ mới.
    - **_parent**: Hiển thị trong khung cha của trang hiện tại (nếu có).
    - **_top**: Hiển thị kết quả ở cửa sổ trên cùng.
  - **autocomplete**: on/off: kiểm soát việc hoàn thành dữ liệu trong form
  - **novalidate**: vô hiệu hóa việc kiểm tra tính hợp lệ của dữ liệu trước khi gửi biểu mẫu

### input

- Là phần tử cơ bản cho phép người dùng nhập dữ liệu vào. Thẻ này có rất nhiều kiểu (**type**) khác nhau, mỗi kiểu xác định một loại đầu vào cụ thể.

- Các Attributes
  - **type**:
    - *text*
    - *password*
    - *email*
    - *file*
    - *submit*
    - *radio*
    - *checkbox*
  - **name**
  - **placeholder**
  - **required**
  - **value**
  - **checked**
  - **disabled**

### textarea

- Được sử dụng để tạo trường nhập văn bản có thể mở rộng, thường dùng cho nhập văn bản dài (như ghi chú, bình luận).
- Các Attributes:
  - **rows & cols**
  - **placeholder**
  - **maxlength**

## table

```html
<table border="1" width="50%" style="border-collapse: collapse;">
    <thead>
        <tr>
            <th>Tên</th>
            <th>Tuổi</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>Huy</td>
            <td>21</td>
        </tr>
        <tr>
            <td>Lan</td>
            <td>22</td>
        </tr>
    </tbody>
    <tfoot>
        <tr>
            <td colspan="2">Tổng số người: 2</td>
        </tr>
    </tfoot>
</table>

```

- **thead**: Nhóm các hàng tiêu đề
- **tbody**: Nhóm các hàng dữ liệu trong bảng
- **tfoot**: Nhóm các hàng ở cuối bảng, thường chứa thông tin tổng kết
- **tr**: Đại diện cho một hàng trong bảng
- **th**: Đại diện cho ô tiêu đề (dữ liệu trong thẻ này thường được in đậm và canh giữa)
- **td**: Đại diện cho một ô dữ liệu trong bảng

### colspan

**Được sử dụng để gộp các cột lại với nhau (hợp nhất các ô theo chiều ngang)**

```html
<table border="1" width="50%" style="border-collapse: collapse;">
    <tr>
        <th>Tên</th>
        <th>Tuổi</th>
        <th>Giới tính</th>
    </tr>
    <tr>
        <td colspan="2">Nguyễn Văn A</td> <!-- Gộp 2 cột -->
        <td>Nam</td>
    </tr>
    <tr>
        <td colspan="3">Nguyễn Thị B</td> <!-- Gộp 3 cột -->
    </tr>
</table>

```

### rowspan

**Được sử dụng để gộp các hàng lại với nhau (hợp nhất các ô theo chiều dọc)**

```html
<table border="1" width="50%" style="border-collapse: collapse;">
    <tr>
        <th>Tên</th>
        <th>Tuổi</th>
        <th>Giới tính</th>
    </tr>
    <tr>
        <td rowspan="2">Nguyễn Văn A</td> <!-- Gộp 2 hàng -->
        <td>21</td>
        <td>Nam</td>
    </tr>
    <tr>
        <td>22</td>
        <td>Nữ</td>
    </tr>
</table>

```

## ul

- Được sử dụng để tạo danh sách không thứ tự, thường được hiển thị với các dấu đầu dòng (bullet points) trước mỗi mục.
- Thẻ con: **li**

## ol

- Được sử dụng để tạo danh sách có thứ tự, thường hiển thị các số thứ tự hoặc ký tự trước mỗi mục.
- Thẻ con: **li**
- Attr: **type**
  - **1**: Số (mặc định).
  - **A**: Chữ in hoa.
  - **a**: Chữ in thường.
  - **I**: Số La Mã in hoa.
  - **i**: Số La Mã in thường.
- **reversed**: Khi có thuộc tính này thì danh sách đếm ngược lại từ lớn -> nhỏ

## iframe

[ref](https://www.w3schools.com/html/html_iframe.asp)
