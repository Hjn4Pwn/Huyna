# Some tips for ctf

### Một số lệnh docker thường

#### Đối với wsl, để chạy được lệnh docker cần chạy nền docker daemon với lệnh sau: 

* sudo dockerd --iptables=false &

#### Build và run:

* sudo docker build . -t "tag-name"

* sudo docker run --rm -p "host-port":"docker-port" -it "tag-name"

* sudo docker run --rm -p "host-port":"docker-port" --privileged -it "tag-name" ***// với red.pwn***

* sudo docker-compose up --build**

#### Liệt kê các container đang chạy:

* sudo docker ps

#### Thực thi lệnh linux trong docker:

* sudo docker exec -it "containter-id" "commands"

* sudo docker-compose exec "service-name" "commands"

#### Lấy file từ docker ra host:

* sudo docker cp "container-id":"path-to-file-in-docker" "path-to-file-in-host" ***// ở môi trường ngoài docker***



### Sau khi có được libc thì sẽ tiến hành như sau:

```shell
pwninit --bin chall
patchelf --set-interpreter ld-2.31.so chall
patchelf --set-rpath . chall

```

### More

* [gdb not able to debug](https://github.com/microsoft/WSL/issues/8516)
* [Failed to start docker on WSL](https://github.com/microsoft/WSL/issues/8450)
* [video's very good for me](https://www.youtube.com/watch?v=N4YuCvxeD5Y)