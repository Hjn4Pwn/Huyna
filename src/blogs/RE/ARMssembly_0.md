# ARMssembly 0

### hint :

What integer does this program print with arguments 4004594377 and 4110761777? 

File: chall.S Flag format: picoCTF{XXXXXXXX} -> (hex, lowercase, no 0x, and 32 bits. ex. 5614267 would be picoCTF{0055aabb})

### file code:

```asm
	.arch armv8-a
	.file	"chall.c"
	.text
	.align	2
	.global	func1
	.type	func1, %function
func1:
	sub	sp, sp, #16
	str	w0, [sp, 12]
	str	w1, [sp, 8]
	ldr	w1, [sp, 12]
	ldr	w0, [sp, 8]
	cmp	w1, w0
	bls	.L2
	ldr	w0, [sp, 12]
	b	.L3
.L2:
	ldr	w0, [sp, 8]
.L3:
	add	sp, sp, 16
	ret
	.size	func1, .-func1
	.section	.rodata
	.align	3
.LC0:
	.string	"Result: %ld\n"
	.text
	.align	2
	.global	main
	.type	main, %function
main:
	stp	x29, x30, [sp, -48]!
	add	x29, sp, 0
	str	x19, [sp, 16]
	str	w0, [x29, 44]
	str	x1, [x29, 32]
	ldr	x0, [x29, 32]
	add	x0, x0, 8
	ldr	x0, [x0]
	bl	atoi
	mov	w19, w0
	ldr	x0, [x29, 32]
	add	x0, x0, 16
	ldr	x0, [x0]
	bl	atoi
	mov	w1, w0
	mov	w0, w19
	bl	func1
	mov	w1, w0
	adrp	x0, .LC0
	add	x0, x0, :lo12:.LC0
	bl	printf
	mov	w0, 0
	ldr	x19, [sp, 16]
	ldp	x29, x30, [sp], 48
	ret
	.size	main, .-main
	.ident	"GCC: (Ubuntu/Linaro 7.5.0-3ubuntu1~18.04) 7.5.0"
	.section	.note.GNU-stack,"",@progbits

```

Oke thì để nâng cao trình Re của mình thì ở chall này mình sẽ làm 2 cách là ***đọc asm*** và ***compile file***

First, we have some docs like:

* [ARM instructions](https://azeria-labs.com/arm-instruction-set-part-3/)
* [Running ARM binaries on X86 with QEMU-USER](https://azeria-labs.com/arm-on-x86-qemu-user/)
* [Running ARMv8 via Linux Command Line](https://github.com/joebobmiles/ARMv8ViaLinuxCommandline)

### Compile

```shell

sudo apt-get update
sudo apt-get upgrade     
sudo apt install binutils-aarch64-linux-gnu                                                           
sudo apt-get install gcc-aarch64-linux-gnu

aarch64-linux-gnu-as -o chall.o chall.S
aarch64-linux-gnu-gcc -static -o chall chall.o

sudo apt install qemu-user-static 

./chall 4004594377 4110761777                                             
Result: 4110761777

```
convert **4110761777** to hex with [tool](https://www.rapidtables.com/convert/number/decimal-to-hex.html?x=)


Yah, we done.

### Đọc asm

[For more](https://diveintosystems.org/book/C9-ARM64/common.html)

#### func1

```asm
func1:
	sub	sp, sp, #16
	str	w0, [sp, 12]
	str	w1, [sp, 8]
	ldr	w1, [sp, 12]
	ldr	w0, [sp, 8]
	cmp	w1, w0
	bls	.L2
	ldr	w0, [sp, 12]
	b	.L3

```


* ***sub sp,sp, #16*** : to create a new stack frame; AARCH64 requirement: must be multiple of 16
* ***str w0, [sp, 12]*** : store wo => mem[sp+12]
* ***ldr	w1, [sp, 12]*** : load value in mem[sp+12] to w1
* ***cmp	w1, w0*** : w1 - w0
* ***bls	.L2*** : if w1 <= w0 then jump .L2
* ***ldr	w0, [sp, 12]*** : load value in mem[sp+12] to w0
* ***b	.L3*** : jump to .L3


```asm
.L2:
	ldr	w0, [sp, 8]
.L3:
	add	sp, sp, 16
	ret
	.size	func1, .-func1
	.section	.rodata
	.align	3

```

Đại khái sẽ trong như này :

```c
if (w1 <= w0) ret w0
else  ret w1

```

```asm
main:
	stp	x29, x30, [sp, -48]!  ; sets sp = sp - 16, then stores *(sp) = x29, *(sp+8) = x30
	add	x29, sp, 0 ; x29 = sp+0
	str	x19, [sp, 16] ;x19 =sp+16
	str	w0, [x29, 44] ; *[x29+44] = w0 ; tham số thứ 1
	str	x1, [x29, 32] ; *[x29+32] = x1 ; tham số thứ 2
	ldr	x0, [x29, 32] ; x0 = [x29+32]
	add	x0, x0, 8 ; x0 = x0+8
	ldr	x0, [x0] ; x0 = [x0]
	bl	atoi
	mov	w19, w0 ; w0 -> w19
	ldr	x0, [x29, 32]
	add	x0, x0, 16
	ldr	x0, [x0]
	bl	atoi ; branch with link to atoi
	mov	w1, w0 ; load w0 -> w1
	mov	w0, w19 ; load w19 -> w0
	bl	func1 ; nhìn lên trên thấy 2 tham số là w1,w0
	mov	w1, w0
	adrp	x0, .LC0
	add	x0, x0, :lo12:.LC0
	bl	printf
	mov	w0, 0
	ldr	x19, [sp, 16]
	ldp	x29, x30, [sp], 48
	ret
```

Ta nhìn thấy ở trên sau khi gọi atoi thì giá trị trả về được lưu ở w0 => w19, lần gọi atoi kế tiếp giá trị trả về lưu ở w0 => w1, tiếp đến mov w19 => w0, lúc này w1,w0 là 2 tham số của func1, có thể thấy 2 lần atoi là đang xử lý chuỗi đầu vào convert to interger

Gọi func1 => ret số lớn hơn => convert to hex => flag