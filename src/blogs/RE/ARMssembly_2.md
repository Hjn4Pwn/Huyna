# ARMssembly 2

Bài này thì hmmm mình compile rồi run thử thì nó ra kết quả k đúng. nên thoi vào đọc asm tiếp vậy

### hint

What integer does this program print with argument 3297082261? 
File: chall_2.S Flag format: picoCTF{XXXXXXXX} -> (hex, lowercase, no 0x, and 32 bits. ex. 5614267 would be picoCTF{0055aabb})

### code

```asm
	.arch armv8-a
	.file	"chall_2.c"
	.text
	.align	2
	.global	func1
	.type	func1, %function
func1:
	sub	sp, sp, #32
	str	w0, [sp, 12]
	str	wzr, [sp, 24]
	str	wzr, [sp, 28]
	b	.L2
.L3:
	ldr	w0, [sp, 24]
	add	w0, w0, 3
	str	w0, [sp, 24]
	ldr	w0, [sp, 28]
	add	w0, w0, 1
	str	w0, [sp, 28]
.L2:
	ldr	w1, [sp, 28]
	ldr	w0, [sp, 12]
	cmp	w1, w0
	bcc	.L3
	ldr	w0, [sp, 24]
	add	sp, sp, 32
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
	str	w0, [x29, 28]
	str	x1, [x29, 16]
	ldr	x0, [x29, 16]
	add	x0, x0, 8
	ldr	x0, [x0]
	bl	atoi
	bl	func1
	str	w0, [x29, 44]
	adrp	x0, .LC0
	add	x0, x0, :lo12:.LC0
	ldr	w1, [x29, 44]
	bl	printf
	nop
	ldp	x29, x30, [sp], 48
	ret
	.size	main, .-main
	.ident	"GCC: (Ubuntu/Linaro 7.5.0-3ubuntu1~18.04) 7.5.0"
	.section	.note.GNU-stack,"",@progbits

```

Đọc hàm main thì đơn giản, nhận vào tham số, gọi atoi convert to int, call func1 với giá trị ret về sau khi call atoi.

Vào func1 xem thì input được đưa vào sp + 12. Mà thoi mình đi nhanh tí :3

Phần code basic dựa sát trên asm:

```python
tmp1 = tmp2 = 0
input = 3297082261

w0 = tmp1
w0 = w0 + 3
tmp1 = w0

w0 = tmp2
w0 = w0 + 1 
tmp2 = w0

w1 = tmp2
w0 = input

while w1 < w0:
    w0 = tmp1
    w0 = w0 + 3
    tmp1 = w0

    w0 = tmp2
    w0 = w0 + 1 
    tmp2 = w0

    w1 = tmp2
    w0 = input
print(tmp1) # chính là giá trị sẽ in ra màn hình 

```


### clean code for win 

```python
input_val = 3297082261
tmp1, tmp2 = 0, 0

tmp1 += 3
tmp2 += 1

while tmp2 < input_val:
    tmp1 += 3
    tmp2 += 1

print(tmp1)

```
Sau 1 hồi đợi chờ thì: 

```shell
hjn4@LAPTOP-TEHHNDTG:/mnt/d/RE$ python3 script_chall_2.py 
9891246783

```

convert to hex = 24D9072BF
Do chỉ lấy 32 bit for flag. So, flag = picoCTF{4D9072BF}

Yah, we done. Time for sleep :3