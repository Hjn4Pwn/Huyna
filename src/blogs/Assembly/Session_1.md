# Session 1

Sau khi trải qua 1 kì test Binary thì mình nhận ra khả năng pwn của mình còn khá kém (maybe do mình chỉ mới bắt đầu). Hơn thế nữa là khả năng **RE**, đọc Assembly của mình quá kém nên là, mình sẽ bắt đầu viết về những cái mình học được ở chuỗi seri asm này.

Oke now, let's go

1. segment data:
    1. section .data
    2. section .bss

2. segment Code:
    1. section .text

3. segment stack

### section .data 

Ở đây ta sẽ khai báo hằng và khai báo biến, các biến này được khởi tạo ngay khi khai báo **(initialized variables)**

> ####  Khai báo : Tên biến + kiểu dữ liệu + ***giá trị khởi tạo***  

| type    |    num_bit variable        |
|---------|----------------------------|
|   db    |      8-bit variable        |
|   dw    |     16-bit variable        |
|   dd    |     32-bit variable        |
|   dq    |     64-bit variable        |
|  ddq    |   128-bit variable (int)   |
|   dt    |  128-bit variable (float)  |

**EX:** a db 9

* Times prefix

    start times 9 db '\*'  *Tức là khai báo start có 9 vùng nhớ có 9 dấu \**


### section .bss

Còn đây thì sẽ khai báo các biến chưa khởi tạo **(uninitialized variables)**. Tuy nhiên thì cứ nghiễm nhiên khởi tạo nó = 0 thì việc không có section .bss trong program là bình thường 

> #### tên biến + kiểu dữ liệu + ***Số phần tử*** 

| type    |    num_bit variable   |
|---------|-----------------------|
|   resb  |      8-bit variable   |
|   resw  |     16-bit variable   |
|   resd  |     32-bit variable   |
|   resq  |     64-bit variable   |
|  resdq  |   128-bit variable    |

**EX:** bArr resb 10

### section .text

Đây là section chứa code, tuy nhiên cần khai báo vị trí bắt đầu của chương trình, kiểu như trong C thì có hàm main, thì ở đây ta cần khai báo:

```shell
section .text
    global _start   ; <-- program entry

_start:   ; <-- label


_exit:   ; <-- label

    mov eax, 1
    int 0x80    ; <-- systemcall
                ; is comment
```

* Ở đây thì khi ta viết số bình thường : **10,15,190** được hiểu là ***dec***. Nếu muốn biểu diễn dạng ***hex*** thì cần **0x10, 0x190**

* Khai báo hằng: 

    Format:  ***name*** equ ***value*** 

    Ex: SIZE equ 1000

Về cơ bản thì khi khai báo hằng (thường viết in hoa), thì lúc compile thì những cái là tên hằng sẽ được thay bằng giá trị mà ta khai báo. Hằng thì không chiếm ô nhớ trong chương trình (?) 


### Example

```shell
section .data

SYS_EXIT equ 1

a db 17
b db 9
c db 0
d dw 4096

hello db "HuyNa Hi", 10
len equ $ - hello

section .text
    global _start

_start:
    mov al, [a]
    add al, [b]
    mov [c], al

    mov eax, 4
    mov ebx, 1
    mov ecx, hello
    mov edx, len
    int 0x80

_exit:
    mov eax,SYS_EXIT
    int 0x80

```

Command for run:

* ***nasm -f elf hello.asm***
* ***ld -m elf_i386 -s -o hello hello.o***
* ***./hello***




