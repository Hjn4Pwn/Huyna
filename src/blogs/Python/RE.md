# Regular Expression

- [Dấu ngoặc vuông \[ \]](#dấu-ngoặc-vuông)
- [Dấu chấm](#dấu-chấm)
- [Dấu mũ ^](#dấu-mũ)
- [Dấu Dollar $](#dấu-dollar)
- [Dấu hoa thị *](#dấu-hoa-thị)
- [Dấu cộng +](#dấu-cộng)
- [Dấu chấm hỏi](#dấu-chấm-hỏi)
- [Dấu ngoặc nhọn {}](#dấu-ngoặc-nhọn)
- [Dấu sổ dọc](#dấu-sổ-dọc)
- [Dấu ngoặc đơn](#dấu-ngoặc-đơn)
- [Dấu gạch chéo ngược](#dấu-gạch-chéo-ngược)
- [Regex Lookahead](#regex-lookahead)
- [Regex Password check](#regex-password-check)

## Dấu ngoặc vuông[]

- Ví dụ: \[abc\]:
  - Thỏa: a, b, ac, ab,...
  - Không thỏa: Hjn4,...
- Có thể chỉ định phạm vi bằng cách: \[a-z\], \[1-7\], ...

- Hoặc nếu muốn phủ định thì: \[^abc\]: tức là sẽ thỏa với các strings không chứa 1 trong các kí tự **abc**
- Các kí tự đặc biệt trong dấu \[\] sẽ được coi như kí tự thông thường

## Dấu chấm

- Thỏa cho bất kì kí tự nào ngoại trừ **\n**
- **..**:
  - Thỏa: abc, ac, hjn4,...
  - Không thỏa: a, 7,...

## Dấu mũ^

- Thể hiện rằng kí tự đứng sau nó phải đứng đầu 1 chuỗi
- Nếu nó đứng như này **\[^ab\]** có nghĩa là phủ định tức nó không khớp với các chuỗi chứa a,b
- **^ab**:
  - Thỏa: ab, abc, abHUYNA,...
  - Không thỏa: ac, adef,...

## Dấu Dollar$

- Thể hiện rằng kí tự trước nó phải là kí tự kết thúc 1 chuỗi
- **a$**:
  - Thỏa: huyna,...
  - Không thỏa: Hjn4,...

## Dấu hoa thị*

- Thể hiện sự cho phép **có** hoặc **không có** kí tự ngay trước nó. Kí tự này có thể được lặp lại không giới hạn.
- **ma\*n**:
  - Thỏa: mn, man, maaaan, woman,...
  - Không thỏa: main,...

## Dấu cộng+

- Thể hiện sự cho phép **có** kí tự trước nó. Kí tự này được có thể được lặp lại không giới hạn
- **ma\+n**
  - Thỏa: man, maaaan,...
  - Không thỏa: mn, main,...

## Dấu chấm hỏi?

- Thể hiện sự cho phép **có** hoặc **không có** kí tự trước nó. Kí tự này **Không được phép** lặp lại nhiêu lần, **chỉ cho phép xuất hiện 1 lần duy nhất**
- **ma?n**:
  - Thỏa: man, mn, woman,...
  - Không thỏa: maaan, main,...

## Dấu ngoặc nhọn\{\}

- Sự dụng theo công thức tổng quát **{n,m}**. Nếu bỏ trống **n** thì mặc định nó là 0, bỏ trống **m** mặc định nó là vô cùng.
- Thể hiện rằng kí tự trước nó có thể xuất hiện tối thiểu **n** lần và tối đa **m** lần
- **a{2,5}**:
  - Thỏa: aa, haaaaa,...
  - Không thỏa: haha, haaaaaaa,...
- **\[0-9\]{2,5}**:
  - Thỏa: ab123cde, 1and22,...
  - Không thỏa: 1and3,...

## Dấu sổ dọc|

- Thể hiện sự cho phép tồn tại 1 trong 2 kí tự trước và sau nó.
- **a|b**: *Cho phép bất kì chuỗi nào chứa a hoặc b*
  - Thỏa: ac, ahin4b,...
  - Không thỏa: efgh,...

## Dấu ngoặc đơn()

- Làm nhiệm vụ gom nhóm các pattern lại với nhau

## Dấu gạch chéo ngược\\

- Đây là dấu biến kí tự đặc biệt thành kí tự thường
- Tuy nhiên nó cũng có thể làm điều ngược lại ở một số trường hợp đặc biệt.

## Regex Lookahead

### Intro

- So khớp có điều kiện, giả dụ như tìm số nhưng số đó phải đứng trước *km* thì mới khớp, mới nhận cái số đấy.
- Syntax cơ bản: **X(?=Y)** : *Tức là chỉ khớp với các X mà có Y theo sau nó*
- Ví dụ:
  - String: **1 Python is about 4 feet long**
  - Pattern: **\d+(?=\s\*feet)**
  - Trong đó:
    - **\d+** : đại diện cho kí tự 0-9 phải xuất hiện ít nhất 1 lần
    - **\s*feet** : đại diện cho việc có 1 hoặc vô số hoặc không có khoảng trắng trước feet
    - Tóm lại: pattern này đại diện cho việc tìm cái số mà sao cho có thể có 1 hoặc nhiều chữ số mà phía sau nó có hoặc không có khoảng trắng rồi đến feet
  - Thỏa: **123      feet**, **1feet**

## Example

```python
import re

def check(password):
    regex_1 = r"\d+(?=\s*a)"
    matches = re.finditer(regex_1, password)

    if re.search(regex_1, password):
        for match in matches:
            print(match.group())
        return True
    else:
        return False

password = "7    abbbbbb"
if check(password):
    print("Valid")

else:
    print("Invalid")

➜ Python_learn ⚡( master)                                     2 days ago 
▶ python3 level3/bai_1.py 
7
Valid
```

### Regex multiple lookaheads

- Tương tự như thằng ở trên thoi, cơ mà nó sẽ có nhiều điều kiện để match hơn
- Syntax: **X(?=Y)(?=Z)**

### Regex negative lookaheads

- Đơn giản là thay vì **(?=)** thì chuyển thành **(?!)** cho việc phủ định đi thoi :3

## Regex Password check

- Ít nhất 1 kí tự thường, 1 kí tự hoa, 1 kí tự nằm trong @#$, có độ dài tối thiểu là 6 tối đa là 12:

> **r"^(?=.\*[a-z])(?=.\*[0-9])(?=.\*[A-Z])(?=.\*[$#@]).{6,12}$"**

[**For more**](https://stackoverflow.com/questions/19605150/regex-for-password-must-contain-at-least-eight-characters-at-least-one-number-a)
