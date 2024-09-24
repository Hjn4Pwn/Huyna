# Basic Network 1

- [IP](#ip)
- [Router](#router)
- [Routing protocol](#routing_protocol)

## ip

### Phân lớp IP

0xxxxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx : class A

dãy địa chỉ lớp A: 1.0.0.1 -> 126.255.255.254

10xxxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx : class B

dãy địa chỉ lớp A: 128.0.0.1 -> 191.255.255.254

110xxxxx.xxxxxxxx.xxxxxxxx.xxxxxxxx : class C

dãy địa chỉ lớp A: 192.0.0.1 -> 223.255.255.254

### Phân loại IP

- Private IP: **LAN**
  - 10.0.0.0 -> 10.255.255.254
  - 172.16.0.0 -> 172.31.255.254
  - 192.168.0.0 -> 192.168.255.254
- Public IP : **WAN**

### Địa chỉ Host

- Là ip address đặt cho các interface
- Hai host chung 1 net, ip sẽ có phần net giống nhau và phần host khác nhau

### Địa chỉ Network

- Là ip triển khai cho các mạng, không dùng đặt cho card mạng, và không thể đặt cho các interface
- ip này có phần host là các bits không

### Địa chỉ Broadcast

- Là địa chỉ được dùng đại diện cho tất cả các Host trong cùng 1 mạng
- Phần host chỉ chứa bit 1
- Không thể đặt cho các interface

EX: 10.255.255.255 ; 172.16.255.255 ; 192.168.1.255

### Subnetmask

- Là thứ giúp máy tính xác định được địa chỉ mạng, bật hết các bits net lên 1, các bits host là 0

EX: 255.0.0.0 là subnetmask của lớp A

### Subnet

- Khi ta chia các mạng thành các mạng nhỏ hơn, thì các mạng nhỏ hơn này được gọi là subnet
- Hình thức chia là : Net mượn bits của Host làm Subnet

EX: 192.168.5.0/25

### VLSM

*Variable Length Subnet Masking*

Đơn giản là thay vì chia ip các net có số host bằng nhau, thì dựa trên nhu cầu thực tế để chia sau cho phụ hợp nhu cầu cần sử dụng

## Router

- Có tính năng chuyên biệt là định tuyến. Định tuyến hiểu đơn giản là làm sao để các máy tính ở các lớp mạng khác nhau có thể thấy được nhau...

### Vai trò của router trong mạng WAN

- Chọn lựa đường đi tốt nhất tới mạng đích
- Chuyển tiếp gói tín tới Interface tương ứng với đường đi ngắn nhất

- Router có thể làm được tốt công việc định tuyến (Routing) là do sử dụng Routing Protocol để xây dựng Routing table. Và dựa vào Routing table để định tuyến gói tin

### Những thành phần cơ bản của Router

- CPU
- RAM: phục vụ cho việc sử lý tính toán của router
- NVRAM: lưu trữ cấu hình router

Mở router lên cấu hình, restart lại sẽ mất hết, do đó cấu hình xong cần phải dùng lệnh ghi cấu hình vào NVRAM

- Flash: lưu trữ OS
- Buses, ROM, Interfaces, Power Supply

### Cổng console, AUX, LAN, WAN

- Kết nối với WAN thông qua cổng Serial:
  - Leased Line
  - Circuit-Switched
  - Paket-Switched

### Quy trình Boot-up của Router

1. Perform POST
2. Execute Bootstap Loader

-> Khởi động các tập lệnh

3. Locate the IOS (IOS đã có trong Flash)
4. Load the IOS (IOS cần load từ TFTP server)

5. Locate the Configuration file
6. Execute the Configuration file
7. Enter setup mode

### Cấu hình cơ bản cho Router

- Thiết lập Hostname, Password
- Kiểm tra bằng lệnh show command
- Cấu hình Serial Interface
- Cấu hình Ethernet Interface
- Lưu thống tin cấu hình
- Backup

### Routing_protocol
