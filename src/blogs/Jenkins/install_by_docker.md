# Install Jenkins By Docker

*Note: thì trong quá trình bắt đầu thực hành, do tutorial mình follow theo nó chỉ là kiểu để quảng cáo khóa học của owner, do đó thì nó được cắt khúc, trích xuất không đầy đủ, làm quá trình troubleshoot của mình khá quải chè. Tuy nhiên nhờ có vậy thì mình cũng hiểu rõ hơn về bản chất Jenkins, pipeline. Cũng nâng cao khả năng tự research, gg search blabla... và đương nhiên rồi đã là free thì mình cũng không thể đòi hỏi gì nhiều*

> docker run -u 0 --privileged --name jenkins -d -p 8080:8080 -p 50000:50000 -v /var/run/docker.sock:/var/run/docker.sock -v $(which docker):/usr/bin/docker -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts

Mình sẽ phân tích kĩ chút, vì mỗi cái này thoi đã làm mình sml cả 1 ngày trời khi mà mình build pipeline có stage build image dùng docker trong docker

- **docker run**: Lệnh này được sử dụng để tạo và chạy một container từ một image Docker.

- **-u 0**: Đặt quyền người dùng (user) của container thành người dùng root (user ID 0).

- **--privileged**: Cấp quyền đặc quyền cho container, có nghĩa là container có quyền truy cập đầy đủ đến hệ thống host. Sử dụng tùy chọn này có thể có rủi ro về bảo mật và nên được cân nhắc khi sử dụng.

- **--name jenkins**: Đặt tên cho container là "*jenkins*".

- **-d**: Chạy container ở chế độ nền (detached mode), có nghĩa là container sẽ chạy ẩn và không chiếm quyền điều khiển của terminal.

- **-p 8080:8080 -p 50000:50000**: Ánh xạ cổng của container với cổng trên máy host. Cổng a:b thì a là cổng trên máy host, b là cổng trên container

- **-v /var/run/docker.sock:/var/run/docker.sock**: Chia sẻ socket Docker giữa container và host để container có thể tương tác với Docker daemon trên host. Điều này cho phép container thực hiện các hoạt động liên quan đến Docker, chẳng hạn như chạy các container bổ sung.

- **-v $(which docker):/usr/bin/docker**: Chia sẻ lệnh Docker từ host với container, đặt lệnh Docker trên host vào đường dẫn /usr/bin/docker trong container. Điều này làm cho lệnh Docker có sẵn trong container.

- **-v jenkins_home:/var/jenkins_home**: Chia sẻ thư mục jenkins_home giữa container và host. Thư mục này chứa dữ liệu cấu hình và dữ liệu làm việc của Jenkins.

- **jenkins/jenkins:lts**: Tên và phiên bản của image Docker mà container sẽ được tạo ra từ đó.

Câu lệnh trên có tích hợp docker vào trong jenkins container do đó, ta có thể dùng docker để build image và push lên docker hub trong các stages trong pipeline

## password for jenkins container

> docker logs \<id-container\>
Để lấy xem log lấy password

## ngrok

> ngrok http 8080

Để expose cái jenkins trên local của mình ra internet nhầm mục đích để thằng github có thể nhìn thấy và request tới
