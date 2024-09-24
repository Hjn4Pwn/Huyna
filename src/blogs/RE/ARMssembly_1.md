# ARMssembly 1

### hint

For what argument does this program print `win` with variables 83, 0 and 3? 

File: chall_1.S Flag format: picoCTF{XXXXXXXX} -> (hex, lowercase, no 0x, and 32 bits. ex. 5614267 would be picoCTF{0055aabb})

### file code

```asm
	.arch armv8-a
	.file	"chall_1.c"
	.text
	.align	2
	.global	func
	.type	func, %function
func:
	sub	sp, sp, #32
	str	w0, [sp, 12]
	mov	w0, 83
	str	w0, [sp, 16]
	str	wzr, [sp, 20]
	mov	w0, 3
	str	w0, [sp, 24]
	ldr	w0, [sp, 20]
	ldr	w1, [sp, 16]
	lsl	w0, w1, w0
	str	w0, [sp, 28]
	ldr	w1, [sp, 28]
	ldr	w0, [sp, 24]
	sdiv	w0, w1, w0
	str	w0, [sp, 28]
	ldr	w1, [sp, 28]
	ldr	w0, [sp, 12]
	sub	w0, w1, w0
	str	w0, [sp, 28]
	ldr	w0, [sp, 28]
	add	sp, sp, 32
	ret
	.size	func, .-func
	.section	.rodata
	.align	3
.LC0:
	.string	"You win!"
	.align	3
.LC1:
	.string	"You Lose :("
	.text
	.align	2
	.global	main
	.type	main, %function
main:
	stp	x29, x30, [sp, -48]!
	add	x29, sp, 0
	str	w0, [x29, 28]
	str	x1, [x29, 16]
	ldr	x0, [x29, 16]
	add	x0, x0, 8
	ldr	x0, [x0]
	bl	atoi
	str	w0, [x29, 44]
	ldr	w0, [x29, 44]
	bl	func
	cmp	w0, 0
	bne	.L4
	adrp	x0, .LC0
	add	x0, x0, :lo12:.LC0
	bl	puts
	b	.L6
.L4:
	adrp	x0, .LC1
	add	x0, x0, :lo12:.LC1
	bl	puts
.L6:
	nop
	ldp	x29, x30, [sp], 48
	ret
	.size	main, .-main
	.ident	"GCC: (Ubuntu/Linaro 7.5.0-3ubuntu1~18.04) 7.5.0"
	.section	.note.GNU-stack,"",@progbits

```

Oke, do đã có tí kinh nghiệm với chall trước đó nên là ở chall này mình làm khá là nhanh.

Đâu tiên đọc hint thì okela, chúng ta xem hàm win, xem how to call win func? Win là .LC0, để call được win phải bypass *bne* ngay trước nó, branch with not equal, oke trước đấy là cmp with zero, lúc này chỉ cần w0 =0 là pass

Trước đấy thì call func, ret => w0. Ta xem tham số của func chỉ có 1 là w0, ta xem để có được w0 ta vẫn gọi atoi như chall trước. chỉ gọi 1 lần atoi => 1 tham số truyển vào hàm main sau đấy convert to int rồi gọi func với tham số đấy.

Oke giờ đến hàm func:

```asm
func:
	sub	sp, sp, #32
	str	w0, [sp, 12]
	mov	w0, 83
	str	w0, [sp, 16]
	str	wzr, [sp, 20]
	mov	w0, 3
	str	w0, [sp, 24]
	ldr	w0, [sp, 20]
	ldr	w1, [sp, 16]
	lsl	w0, w1, w0
	str	w0, [sp, 28]
	ldr	w1, [sp, 28]
	ldr	w0, [sp, 24]
	sdiv	w0, w1, w0
	str	w0, [sp, 28]
	ldr	w1, [sp, 28]
	ldr	w0, [sp, 12]
	sub	w0, w1, w0
	str	w0, [sp, 28]
	ldr	w0, [sp, 28]
	add	sp, sp, 32
	ret

```

flow như sau:
w0 => sp + 12
83 => sp + 16
wzr = 0 => sp + 20
3  => sp + 24

sp + 20 => w0 = 0
sp + 16 => w1 = 83 

=> w0 = w1 << w0 = 93 << 0 = 83

w0 => sp + 28 => w1 = 83
sp + 24 => w0 = 3

=> w0 = w1 / w0 = 83/3 = 27

w0 => sp+28 => w1 = 27
sp + 12 => w0 = ***tham số ta truyền vào*** 

=> w0 = w1 - w0

We need ret = 0 for comparing with 0 to bypass cmp	w0, 0; bne	.L4. So w0 = 0 <=> w1 = w0 = 27

```shell
╰─ ./chall_1 27                                                              ─╯
You win!

```
convert 27 to hex => flag = picoCTF{0000001b}