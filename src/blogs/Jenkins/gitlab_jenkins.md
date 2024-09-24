# Link gitlab with Jenkins

## Install gitlab plugin

Manage Jenkins > Plugins > Availble plugins > gitlab > install

## link gitlab with jenkins

- Đầu tiên cần tạo repo trên gitlab, khởi tạo webhook
- Tạo item trên jenkins
- Tạo token: hjn4 > configure > api token > add new token
- Trên gitlab tiến hành cấu hình webhook với URL như sau:

> <https://hjn4:11759ec1367bfb54fc7ab44ecf3feaddf6@2670-104-28-205-72.ngrok-free.app/project/webhook-gitlab>

- hjn4: username of jenkins
- 117....ddf6: token được tạo từ jenkins
- 2670-104-28-205-72.ngrok-free.app: jenkins url
- webhook-gitlab: name of item from jenkins

![Alt text](./image/image-2.png)

## link gitlab repo to jenkins with Jenkinsfile

Sau khi đã làm các bước như trên, giờ sẽ tiếp tục...

- Tạo token cho phép jenkins có thể link vào gitlab để lấy code: setting > repository > deploy token
- Sau đấy trong jenkins item tick vào Gitlab plugin, thêm repo url, credentials (lấy username và passwork từ token vừa tạo trên gitlab)
