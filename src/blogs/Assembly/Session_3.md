# Session 3

- [Logical Shift](#logical_shift)
- [Arithmetic Shift](#arithmetic_shift)
- [Rotate operations](#rotate_operations)
- [Unconditional control](#unconditional_control)
- [Conditional control](#conditional_control)



## logical_shift
*Dịch luận lý _ Dịch không để ý đến dấu*

Bit trống sẽ được điền là **0**

- shl | shr **dest**, **imm**
- shl | shr **dest**, ***cl***  

*nếu dùng reg thì chỉ có thể dùng cl và chỉ được dịch tối đa 64 lần*




## arithmetic_shift
*Dịch số học _ Dịch có để ý đến dấu*

Bit cao nhất là bít dấu

- sal | sar **dest**, **imm**
- sal | sar **dest**, ***cl***   

*nếu dùng reg thì chỉ có thể dùng cl và chỉ được dịch tối đa 64 lần*



## rotate_operations
*phép quay*

Giống dịch tuy nhiên thay vì mất luôn nó sẽ nạp vào đầu bên kia.

- rol | ror **dest**, **imm**
- rol | ror **dest**, ***cl***  

*nếu dùng reg thì chỉ có thể dùng cl và chỉ được quay tối đa 64 lần*

**khi mà để hoán đổi phần high và low thì có thể dùng rotate**



## unconditional_control
*chuyến điều khiển không điều kiện*

jmp **target**


## conditional_control
*chuyến điều khiển có điều kiện*

2 steps:
- test the codition( **test**, **cmp** ) *test là and nhưng không thay đổi source*
- jump

Group of conditional jumps:
- jumps based on the value of a single flag
- jumps based on the value of CX | ECX | RCX
- jumps based on comparisions of signed operands
- jumps based on comparisions of unsigned operands


**cmp op1, op2**

mấy cái j___ thì tự research chứ tui lười ghi ra quá =="

- **jz, je** : jump if zero, equal ***!=*** **jnz, jne **
- **ja** : jump if above ***!=*** **jnbe** : jump not above or equal

... blabla tự suy ra nhea bro


### Loop instructions

- **Loop target** : *Loop*

*Action :*

CX = CX - 1; 
IF CX != 0 jump to target


- **Loope target** : *Loop while equal*
- **Loopz target** : *Loop while zero*

*Action :*

CX = CX - 1; 
IF CX != 0 AND ZF == 1 jump to target


- **Loopne target** : *Loop while not equal*
- **Loopnz target** : *Loop while not zero*

*Action :*

CX = CX - 1; 
IF CX != 0 AND ZF == 0 jump to target