# Basic Concepts

## Cấu trúc cơ sở dữ liệu

### wp_posts

Đây là bảng quan trọng nhất trong WordPress vì nó lưu trữ tất cả các bài viết, trang, và nội dung tùy chỉnh khác. Bảng này chứa các trường như:

**ID**: ID duy nhất của mỗi bài viết.
**post_title**: Tiêu đề của bài viết hoặc trang.
**post_content**: Nội dung của bài viết.
**post_type**: Phân biệt các loại bài viết như bài viết (post), trang (page), hoặc loại bài viết tùy chỉnh (custom post types).
**post_status**: Trạng thái của bài viết như publish, draft, pending.

### wp_postmeta

Bảng này lưu trữ các meta data (dữ liệu bổ sung) liên quan đến các bài viết hoặc trang trong WordPress. Meta data là những thông tin mở rộng cho mỗi bài viết, chẳng hạn như tùy chọn hiển thị, dữ liệu tùy chỉnh.

**post_id**: Liên kết đến ID của bài viết trong bảng wp_posts.
**meta_key**: Tên khóa meta.
**meta_value**: Giá trị tương ứng với khóa meta.

### wp_users

Bảng này lưu trữ thông tin về tất cả người dùng đã đăng ký trên trang WordPress.

**ID**: ID duy nhất của mỗi người dùng.
**user_login**: Tên đăng nhập của người dùng.
**user_pass**: Mật khẩu của người dùng (được mã hóa).
**user_email**: Địa chỉ email của người dùng.

### wp_usermeta

Tương tự như wp_postmeta, bảng này lưu trữ meta data cho người dùng.

**user_id**: Liên kết đến ID người dùng trong bảng wp_users.
**meta_key**: Khóa meta tùy chỉnh (ví dụ: khả năng người dùng, giao diện quản trị, thông tin bổ sung).
**meta_value**: Giá trị của khóa meta.

### wp_terms

Bảng này lưu trữ các terms (thẻ, chuyên mục, hoặc thuật ngữ phân loại tùy chỉnh).

**term_id**: ID duy nhất cho mỗi term.
**name**: Tên của term (ví dụ: tên của chuyên mục hoặc thẻ).
**slug**: URL thân thiện với SEO của term.

### wp_term_taxonomy

Bảng này giúp phân loại các terms từ bảng (wp_terms) thành các loại khác nhau (taxonomy).

**term_taxonomy_id**: ID duy nhất cho mỗi phân loại.
**term_id**: Liên kết đến ID trong bảng wp_terms.
**taxonomy**: Loại phân loại (ví dụ: category cho chuyên mục, post_tag cho thẻ).

### wp_term_relationships

Bảng này tạo liên kết giữa các bài viết trong bảng wp_posts và các terms trong wp_terms.

**object_id**: ID của bài viết (liên kết đến wp_posts).
**term_taxonomy_id**: ID phân loại (liên kết đến wp_term_taxonomy).

### wp_options

Bảng này lưu trữ tất cả các tùy chọn cấu hình của WordPress và các plugin. Đây là nơi các cài đặt chính được lưu trữ.

**option_name**: Tên của tùy chọn.
**option_value**: Giá trị tương ứng với tùy chọn.

### wp_comments

Bảng này lưu trữ tất cả các bình luận trên các bài viết hoặc trang của WordPress.

**comment_ID**: ID duy nhất của mỗi bình luận.
**comment_post_ID**: ID của bài viết mà bình luận này liên quan đến.
**comment_content**: Nội dung của bình luận.

### wp_commentmeta

Bảng này lưu trữ các meta data liên quan đến các bình luận, tương tự như *wp_postmeta* và *wp_usermeta*.

**comment_id**: Liên kết đến ID của bình luận trong bảng wp_comments.
**meta_key**: Khóa meta.
**meta_value**: Giá trị meta tương ứng.

## Action hooks

- Action hooks cho phép bạn thực hiện hành động (chạy một đoạn mã) tại các thời điểm xác định trong quá trình thực thi của WordPress.
- WordPress cung cấp nhiều action hooks tại những thời điểm khác nhau (ví dụ: khi tải trang, khi đăng bài viết, hoặc khi người dùng đăng nhập).

- **Cách sử dụng**:
  - **do_action( 'action_name' )**: Được gọi ở một điểm nào đó trong mã WordPress để kích hoạt các hàm hoặc chức năng bổ sung.
  - **add_action( 'action_name', 'your_function_name' )**: Sử dụng để gán một hàm vào một action cụ thể.

```php
function notify_on_new_post( $ID, $post ) {
    $admin_email = get_option( 'admin_email' );
    $subject = "Bài viết mới đã được đăng!";
    $message = "Bài viết mới có tiêu đề: " . $post->post_title . " đã được đăng!";
    wp_mail( $admin_email, $subject, $message );
}
add_action( 'publish_post', 'notify_on_new_post', 10, 2 );


```

## Filter hooks

- Filter hooks cho phép bạn lọc và thay đổi dữ liệu trước khi nó được hiển thị hoặc lưu trữ.
- Filter thường được sử dụng để sửa đổi dữ liệu như nội dung bài viết, tiêu đề, hoặc các giá trị trước khi xuất ra giao diện người dùng hoặc lưu vào cơ sở dữ liệu.

- **Cách sử dụng**:
  - **apply_filters( 'filter_name', $value )**: Được sử dụng để thực hiện việc lọc trên một giá trị nào đó.
  - **add_filter( 'filter_name', 'your_function_name' )**: Sử dụng để gán một hàm vào một filter cụ thể để thay đổi giá trị.

```php
function append_text_to_post( $content ) {
    if ( is_single() ) {
        $content .= '<p>Chúc bạn đọc bài viết vui vẻ!</p>';
    }
    return $content;
}
add_filter( 'the_content', 'append_text_to_post' );


```

## Example Action hooks & Filter hooks

```php
// Action: Gửi email thông báo khi bài viết được publish
function notify_admin_on_publish( $ID, $post ) {
    $admin_email = get_option( 'admin_email' );
    
    // Sử dụng apply_filters để thay đổi tiêu đề email
    $subject = apply_filters( 'custom_email_subject', "Bài viết mới được xuất bản!" );
    
    // Sử dụng apply_filters để thay đổi nội dung email
    $message = apply_filters( 'custom_email_message', "Bài viết có tiêu đề: " . $post->post_title . " đã được xuất bản." );
    
    // Gửi email
    wp_mail( $admin_email, $subject, $message );
    
    // Kích hoạt một hành động sau khi email được gửi
    do_action( 'email_sent_to_admin', $admin_email, $subject, $message );
}
add_action( 'publish_post', 'notify_admin_on_publish', 10, 2 );

// Filter: Thay đổi tiêu đề email trước khi gửi
function modify_email_subject( $subject ) {
    return "Thông báo: " . $subject;
}
add_filter( 'custom_email_subject', 'modify_email_subject' );

// Filter: Thay đổi nội dung email trước khi gửi
function modify_email_message( $message ) {
    return $message . "\n\n Đây là email tự động, vui lòng không trả lời.";
}
add_filter( 'custom_email_message', 'modify_email_message' );

// Action: Thực hiện hành động sau khi email đã gửi thành công
function log_email_sent( $email, $subject, $message ) {
    error_log( "Email đã được gửi đến $email với tiêu đề: $subject" );
}
add_action( 'email_sent_to_admin', 'log_email_sent', 10, 3 );

```
