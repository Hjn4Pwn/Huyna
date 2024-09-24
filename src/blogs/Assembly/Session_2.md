# Session 2

### Data movement

* dword = double word = 32 bits
* qword = 64 bits

* mov dword [dValue], 27 : như là convert 27 sang giá trị 32bits

* không thể mov 2 ô nhớ, do đó cần thanh ghi trung gian:
    
    ;bAns = bNum
    mov al, byte [bNum]
    mov [bAns], al

### Signed extension


|  instruction |       Explanation                                  |
|--------------|----------------------------------------------------|
|     cbw      | convert byte in **al** into word in **ax**         |
|     cwd      | convert word in **ax** into dword in **dx:ax**     |
|     cwde     | convert word in **ax** into dword in **eax**       |
|     cdq      | convert dword in **eax** into qword in **edx:eax** |
|     cdqe     | convert dword in **eax** into qword in **rax**     |
|     cqo      | convert dword in **rax** into qword in **rdx:rax** |


Lý mà có cwd rồi còn cwde trong khi nó tương tự nhau đều convert sang 32 bits, tuy nhiên nhu cầu xử lý 32bits đã có từ lâu lúc đấy chưa có thanh ghi eax, nên mới dùng cwd giá trị 32bits sẽ được chứa trong cặp dx:ax, tuy nhiên giờ cứ **cwde** mà quất

Còn đây là các lệnh mở rộng hơn mà các vi xử lý sau này mới có:

* movsx ***reg16*** , ***op8***
* movsx ***reg32*** , ***op8***
* movsx ***reg32*** , ***op16***
* movsx ***reg64*** , ***op8***
* movsx ***reg64*** , ***op16***
* movsxd ***reg64*** , ***op32***

***op*** là thanh ghi hay ô nhớ đều được

### Interger Arithmetic Instruction

* add ***dest***, ***src*** : 2 toán hạng phải cùng kiểu
* inc ***operand*** : operand += 1

* sub ***dest***, ***src*** : dest = dest - src , cả 2 phải cùng kiểu 
* dec ***operand*** : operand -= 1

Nhân chia sẽ khá rắc rối, bởi kết quả nhân có thể vượt quá giới hạn ban đầu mỗi toán hạng

***Phép nhân số không dấu***

* mul ***src***

Một toán hạng là source, vậy toán hạng còn lại mặc nhiên nằm trong thanh ghi A (al/ax/eax/rax)

- case 1: al  * src (op8)  = ah al   <=> ax      = al*op8

- case 2: ax  * src (op16) = dx ax   <=> dx:ax   = ax*op16

- case 3: eax * src (op32) = edx eax <=> edx:eax = eax*op32

- case 4: rax * src (op64) = rdx rax <=> rdx:rax = rax*op64

Tùy theo toán hạng trong src mà lệnh *mul* sẽ nhân với giá trị lưu trữ tương ứng. Nếu như src là toán hạng 16 bits thì thg mul src nó sẽ đem src nhân với thanh ghi ***ax***

***Phép nhân số có dấu***

* imul src ; tương đương với thg không dấu ở trên
* imul dest, src/imm32
* imul dest, src, imm32 ; dest = src * imm

Trường hợp thứ 2 3 thì toán hạng phải nhỏ vì 16bits * 16bits được lưu vào 16 bits do đó nên là nếu nó lớn thì cờ tràn bật lên => kết quả sai

***Phép chia***

|  instruction  |       Explanation                                     |
|---------------|-------------------------------------------------------|
| div op8(src)  | byte: al(kết quả) = ax/src, số dư lưu vào ah          |
| div op16(src) | word: ax(kết quả) = dx:ax/src, số dư lưu vào dx       |
| div op32(src) | double: eax(kết quả) = edx:eax/src, số dư lưu vào edx |
| div op64(src) | quad: rax(kết quả) = rdx:rax/src, số dư lưu vào rdx   |

idiv : với số có dấu cũng tương tự, túm gọn lại là giả dụ **div số 8bit** thì nghiễm nhiên lấy cái giá trị 16 bit tức là dx:ax đem chi cho src(8bits) lúc này cần lưu ý phải xor sạch dx (=0)trong trường hợp số bị chia không phải 16bits.

Còn với việc số bị chia là số âm, thì thay vì để dx = 0 thì ta nên mở rộng số có dấu với các lệnh kiểu như **cbw** thì kết quả chia mới đúng được

### Logical operations

* and ***dest***, ***src***
    x&1 = x ; x&0 = 0 ; có thể &0 để xóa bit đó đi

* or ***dest***, ***src***
    x|1 = 1 ; x|0 = x ; có thể dùng |1 để bật bit lên

* xor ***dest***, ***src***
    0^1 = 1 ; 1^1 = 0 ; có thể dùng lật bit, dùng mã hóa, vì a^b = c; thì c^b = a. 
    
    Thêm nữa ta có thể khởi tạo giá trị cho thanh ghi bằng 0, xor ecx, ecx