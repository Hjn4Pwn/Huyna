# Pipeline jenkinsfile with github

*ở đây chỉ đơn giản là demo việc link jenkins với github, trigger push event, build 1 basic Jenkinsfile*

[Code for demo](https://github.com/Hjn4Pwn/learn-jenkins.git)

- Đầu tiên vẫn là link giữa jenkins và github  tương tự như đã làm trước đó
- Khác là item được tạo trên jenkins là pipeline, và cần file **Jenkinsfile** để thực thi pipeline khi mà có hành động push được trigger từ github
- Ở lần đầu tiên ta sẽ phải nhấn **Build now** trên jenkins, tuy nhiên các lần sau đó jenkins sẽ tự động chạy khi được trigger
