# Dockerfile

## FROM

- Để khai báo base image. Base image là môi trường để code project của mình có thể chạy trên đó
- Các base image này có thể tìm các version, name trên docker Hub
- Là bắt buộc, để chỉ ra cái image cần làm base để chạy được project của mình
- Example: *FROM node:18-alpine*

## WORKDIR

- Chỉ định thư mục chúng ta sẽ làm việc trong docker

## USER

- Chỉ định user làm việc
- Cần tạo user chỉ định: *RUN addgroup app && adduser -S -G app hjn4*

## ADD

- Syntax: **ADD** *source* *dest*
- Source là vị trí thư mục project local hoặc 1 file nào đấy trên internet mà có thể truy cập bất cứ đâu, không được fit cứng đường dẫn
- Dest là vị trí của thư mục project trong docker
- Không hỗ trợ authentication, ví dụ như cần login để truy cập 1 file trên internet mà muốn để nó ở source thì cần phải chạy **RUN** trước **ADD**
- Nếu là file nén như rar, tar thì nó sẽ tự động giải nén
- Example: *RUN index.html /app/*
- Example: *RUN /folder/ /app/*

## COPY

- Tương tự như add chỉ khác là không thể copy file remote trên internet
- Có thể phân quyền
- Không thể tự động giải nén như **ADD**, nó sẽ copy y chang file nén luôn
- Example: *COPY \["index.html","/app/"\]*
- Example: *COPY index.html /app/*
- Example: *\[--chown=user:group\] index.html /app/*

## RUN

- Để chạy các lệnh để build image
- Syntax: **RUN** *command*
- Example: **RUN** *npm i*
- Example: **RUN** *apt-get update*
- Example: **RUN** *\["npm","i"\]*

## CMD

- Dùng khi image đã build
- Example: **CMD** *npm run dev*
- Example: **CMD** *\["ls","-la"\]*
- Nếu trong Dockerfile có nhiều **CMD** thì nó chỉ lấy thg cuối cùng nó chạy thoi
- Có thể bị ghi đè khi *docker run .... ls -la*

## ENTRYPOINT

- Tương tự **CMD**
- Nếu có **CMD** và **ENTRYPOINT** cùng lúc thì **CMD** sẽ là parameter của **ENTRYPOINT**
- Nếu dùng dàng không có **[]** thì nó sẽ ignore toàn bộ **CMD** nếu có
- Không bị ghi đè như **CMD**

## ENV

- Syntax: **ENV** *key=value*
- Syntax: **ENV** *key value*
- Cung cấp metadata vào image
- Nếu 1 key mà có nhiều value thì nó sẽ lấy cái key và value cuối cùng
- Example:
  - ENV folder-name=app
  - ADD index.html $folder-name

## ARG

- Tương tự như ENV, cơ mà không chạy trên container, chỉ chạy được lúc build image

## EXPOSE

- Syntax: **EXPOSE** *port*

## LABEL

- Systax: **LABEL** *key="value"*
- Để lưu các thông tin metadata như ngày giờ, tên website, blabla
- Có thể dùng lệnh: **docker inspect image \<image-id\>** để xem metadata

## VOLUME
