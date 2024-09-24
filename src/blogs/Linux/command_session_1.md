# Command session 1

Do một phần là mình tương tác với linux cũng nhiều nên blog này chủ yếu note lại các lệnh mình ít có cơ hội dùng nhưng nó có ích và nó tồn tại :)) .

Còn về những lệnh quá basic, mình nhớ và dùng thường xuyên sẽ không note chi tiết

- [Hệ thống tập tin Linux](#hệ-thống-tập-tin-linux)
- [Các lệnh cơ bản](#các-lệnh-cơ-bản)
- [Tìm kiếm tập tin trong Kali Linux](#tìm-kiếm-tập-tin-trong-kali-linux)
- [Bash environment](#bash-environment)
- [Piping và chuyển hướng](#piping-và-chuyển-hướng)
- [Tìm kiếm và thao tác văn bản](#tìm-kiếm-và-thao-tác-văn-bản)
- [Tải tập tin](#tải-tập-tin)

## Hệ thống tập tin Linux

Các thư mục thường sử dụng:

- **/bin** : các chương trình cơ bản (ls, cd, cat,...)
- **/sbin** : các chương trình hệ thống (fdisk, mkfs, sysctl,...)
- **/etc** : các tập tin cấu hình
- **/tmp** : các tập tin tạm thời (thường sẽ bị xóa sau khi restart lại máy)
- **/usr/bin** : các ứng dụng (apt, ncat,...)
- **/usr/share** : hỗ trợ ứng dụng và các tập dữ liệu

## Các lệnh cơ bản

- **sudo ss -tuln**
- **ls**
- **cat**
- **cd**
- **pwd**
- **mkdir**
- **touch**
- **file**
- **cp**
- **mv**
- **rm**
- **rmdir**
- **more** : tương tự như **cat**, khác là có thể xem nổi dung bằng trang, thực hành sẽ rõ, nhớ thu nhỏ terminal để thấy sự khác biệt

## Tìm kiếm tập tin trong Kali Linux

- **which** : sẽ tìm kiếm các tập tin nếu nó có trong các thư mục được định nghĩa trong biến môi trường $PATH

- **locate** : Muốn dùng tốt **locate** thì trước đó cần phải update cái CSDL **locate.db** mà **locate** dùng nó để tìm kiếm bằng lệnh **updatedb** sau đó mới dùng **locate tên-file**

- **find**: Là 1 lệnh khá phức tạp nhưng lại linh hoạt và có hiệu quả nhất trong 3 lệnh ở đây là bởi vì nó có thể tìm kiếm nhiều thuộc tính hơn (kích thước, chủ sở hữu, quyền thực thi,...)

## Bash environment

- Khi mở một terminal, một tiến trình Bash mới, với các biến môi trường riêng, được khởi tạo. Các biến này là một dạng lưu trữ toàn cục cho các cài đặt khác nhau được kế thừa bởi bất kỳ ứng dụng nào được chạy trong suốt phiên làm việc của terminal đó.

- Một trong những biến môi trường được tham chiếu phổ biến nhất là PATH, là danh sách các đường dẫn thư mục được phân tách bằng dấu “:” mà Bash sẽ tìm kiếm bất cứ khi nào một lệnh được chạy mà không có đường dẫn đầy đủ.

- Chúng ta có thể xem nội dung của biến môi trường bằng cách sử dụng lệnh echo theo sau bởi ký tự “**$**” và **tên biến môi trường**

- Có nhiều biến môi trường như **PATH**, **HOME**, **PWD**,... Dùng lệnh **env** để xem các biến môi trường này

- Các để thêm 1 path vào biến môi trường **$PATH**:

```shell

╰─ export PATH="$PATH:/home/Hjn4/

╰─ echo $PATH                        
/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/snap/bin:/home/Hjn4/

╰─ export PATH="/home/Hjn4/:$PATH"   

╰─ echo $PATH    
/home/Hjn4/:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin:/snap/bin:/home/Hjn4/

```

- **history** : bash có lưu lại các lệnh đã được nhập

## Piping và chuyển hướng

- Standard Input (**STDIN**) : Dữ liệu được cung cấp cho chương trình
- Standard Output (**STDOUT**) : Kết quả từ chương trình (mặc định được
xuất ra terminal)
- Standard Error (**STDERR**) :Các thông điệp lỗi (mặc định được xuất ra
terminal)

- Piping (sử dụng toán tử “**|**”) và chuyển hướng (sử dụng các toán tử “**<**” và “**>**”) kết nối các luồng giữa các chương trình và tập tin. Trong đó:  **>** cho việc ghi đè, **>>** ghi thêm vào file

- Chuyển hướng STDERR : **2> file**

## Tìm kiếm và thao tác văn bản

- **grep**
- **sed** : Lệnh **sed** là một trình chỉnh sửa luồng mạnh mẽ. Ở cấp độ cao, lệnh **sed** thực hiện chỉnh sửa văn bản trên một luồng văn bản, hoặc một tập hợp các tập tin được chỉ định hoặc ở STDOUT.

```shell
➜ ~ ⚡                                                             21:58:51
▶ echo "Hello abc" | sed "s/abc/Hjn4/"
Hello Hjn4

```

- **cut**: Lệnh **cut** được sử dụng để trích xuất một phần văn bản từ 1 dòng và xuất nó ra STDOUT. Một số thuộc tính được sử dụng phổ biến bao gồm **-f** cho thứ tự trường muốn lấy và **-d** cho ký tự muốn phân cách.

```shell
▶ echo "hjn4 loves a,b,c,d,e" | cut -d "," -f 3
c
➜ ~ ⚡                                                             22:00:09
▶ echo "hjn4 loves a,b,c,d,e" | cut -d " " -f 2
loves
```

- **awk**: AWK là ngôn ngữ lập trình được thiết kế để xử lý văn bản và thường được sử dụng làm công cụ báo cáo và trích xuất dữ liệu. Nó cũng cực kỳ mạnh mẽ và khá phức tạp. Một tùy chọn thường được sử dụng với lệnh awk là **-F**, là **dấu phân cách giữa các trường**, và lệnh **print**, xuất kết quả ra STDOUT.

```shell
➜ ~ ⚡                                                             22:02:41
▶ echo "hjn4 loves a,b,c,d,e" | awk -F " " '{print $1}'
hjn4
➜ ~ ⚡                                                             22:02:50
▶ echo "hjn4 loves a,b,c,d,e" | awk -F "," '{print $1, $4}'
hjn4 loves a d
➜ ~ ⚡                                                             22:03:02
▶ echo "hjn4 loves a,b,c,d,e" | awk -F "," '{print $1}'
hjn4 loves a

```

## Tải tập tin

- **wget**: Lệnh wget được sử dụng thường xuyên để tải các tập tin sử dụng giao thức HTTP/HTTPS và FTP. Sử dụng tùy chọn -O để lưu kết quả vào tập tin với tên khác

**wget URL -O file-for-storage-we-like**

- **curl**: Curl là một công cụ dùng để truyền dữ liệu đến hoặc từ máy chủ sử dụng một loạt các giao thức bao gồm IMAP/S, POP3/S, SCP, SFTP, SMB/S, SMTP/S, TELNET, TFTP và các giao thức khác. Các sử dụng cơ bản nhất của nó cũng giống với wget.

**curl URL -o file-for-storage-we-like**
