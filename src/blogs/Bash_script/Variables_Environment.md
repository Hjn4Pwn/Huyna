# Shell Variables and Environment

[Source](https://bash.cyberciti.biz/guide/Main_Page)

- [Variables in shell](#variables-in-shell)
  - [Assign values to shell variables](#assign-values-to-shell-variables)
  - [Display variable value](#display-variable-value)
  - [Default shell variable value](#default-shell-variable-value)
  - [-= syntax](#syntax)
  - [Rules for Naming variable name](#rules-for-naming-variable-name)
  - [echo & printf](#echo--printf)
  - [Quoting](#quoting)
  - [Unset](#unset)
  - [Getting User Input Via Keyboard](#getting-user-input-via-keyboard)
- [Perform arithmetic operations](#perform-arithmetic-operations)
  - [Create an integer variable](#create-an-integer-variable)
  - [Create the constants variable](#create-the-constants-variable)
- [Bash variable existence check](#bash-variable-existence-check)
- [Customize the bash shell environments](#customize-the-bash-shell-environments)
  - [Recalling command history](#recalling-command-history)
  - [Path name expansion](#path-name-expansion)
  - [Create and use aliases](#create-and-use-aliases)

## Variables in shell

### Assign values to shell variables

Việc gán a = 10 và export a=10 là 2 case hoàn toàn khác nhau.

- a=10 : chỉ có giá trị với tiến trình hiện tại
- export a=10 : có giá trị với các tiến trình con, là 1 biến môi trường

### Display variable value

```shell
echo $a
echo ${a}
echo "${a}"
printf "$a"
printf "%f\n" $a
....
```

### default shell variable value

Nếu biến chưa được set giá trị thì ta có thể set mới, nếu đã có giá trị thì thoi vẫn giữ value cũ:

```shell
echo ${a=1}
echo ${a:-1}
echo ${a:=10}

```

Cả **:=** và **:-** đều có thể gán giá trị cho biến nếu như nó chưa được gán giá trị. Tuy nhiên ta có thể thấy là với syntax **:=** thì không thể dùng để gán với các Positional parameters and special parameters

#### Script to print currently logged in users information, and current date & time

```sh
clear
echo "Hello $USER"
echo -e "Today is \c ";date
echo -e "Number of user login : \c" ; who | wc -l
echo "Calendar"
cal
exit 0

```

option -e => allow to use \c, \t, \n,... in content

#### press enter to continue or exit

```sh
echo "huyna"
read -p "Press [Enter] to continue..."
```

### syntax

```sh
die(){
  local error=${1:=hjn4}
  echo "$0: $error" 
}
die "huyna"
die

#./bash1.sh: huyna
#./bash1.sh: line 2: $1: cannot assign in this way
```

**-=** không thể dùng với các variable số như $1 $2 $3 ... Do đó cần dùng **:-**

```sh
die(){
  local error=${1:-hjn4}
  echo "$0: $error" 
}
die "huyna"
die

#./bash1.sh: huyna
#./bash1.sh: hjn4
```

### [Rules for Naming variable name](https://bash.cyberciti.biz/guide/Rules_for_Naming_variable_name)

### echo & printf

```sh
no=10
printf "%d\n" $no

big=5355765
printf "%e\n" $big
printf "%5.2e\n" $big

sales=54245.22
printf "%f\n" $sales
printf "%.2f\n" $sales


10

5.355765e+06
5.36e+06

54245.220000
54245.22

```

### Quoting

```sh
a=10
echo "a=$a"
echo 'a=$a'
echo "a=\$a"

# a=10
# a=$a
# a=$a


▶ read -p "give me 3 numbers: " num1 num2 num3
give me 3 numbers: 1 2 3
➜ chapter3 ⚡                                                                15:33:12
▶ echo $num1 $num2 $num3
1 2 3
```

### unset

```sh
function hello(){ echo "Hello $USER. Today is $(date)."; }
hello 
# Hello hjn4. Today is Fri Jan 12 14:49:10 +07 2024.
unset hello
hello
# Command 'hello' not found ...
```

### Getting User Input Via Keyboard

```sh
▶ read -p "Give me yr name: " name
Give me yr name: huyna
➜ chapter3 ⚡                                                                15:11:51
▶ echo $name
huyna

```

#### time out input

```sh
read -t 10 -p "Give me yr name: " name
```

#### hide user input like password

```sh
read -s -p "Password: " passwd
```

#### get value from string

```sh

echo "$IFS" # xác định thứ phân cách

nameservers="ns1 ns2\n    ns3 huyna"
read -r ns1 ns2 ns3 <<< "$nameservers"

echo "ns1: $ns1"
echo "ns2: $ns2"
echo "ns3: $ns3"

ns1: ns1
ns2: ns2\n
ns3: ns3 huyna
```

-r : chấp nhận các ký tự đặc biệt và k xử lý nó.

```sh
pwd="hjn4:x:1000:1000:,,,:/home/hjn4:/bin/bash"

old="$IFS" # save previous version of IFS
IFS=: # ngăn cách được xét bây giờ là dấu :

read -r login password uid gid info home shell <<< "$pwd"
printf "Your login name is %s, uid %d, gid %d, \
home dir set to %s with %s as login shell\n" $login $uid $gid $home $shell

IFS="$old"

# Your login name is hjn4, uid 1000, gid 1000, home dir set to /home/hjn4 with /bin/bash as login shell
```

## Perform arithmetic operations

```sh
a=5+10
echo $a
# 5+10

a=$((5+10))
echo $a
# 15
```

|Operator | Description | Example | Result|
|---------|------|------|------|
\+       | Addition | echo $((20+5))      | 25
\-       | Subtraction | echo $((20-5))      | 15
/       | Division     | echo $((20/5))      | 4
\*      | Multiplication      | echo $((20*5))     | 100
%       | Modulus     | echo $((20%3))   | 2
++       | Add 1  | a=5; echo $((a++)); echo $a   | 5 6
--       |Sub 1    | a=5; echo $((a--)); echo $a | 5 4
**       | Exponentation     | a=2; b=3; echo $((a**b))    | 8

### Create an integer variable

```sh
#!/bin/bash
# set x,y and z to an integer data type
declare -i x=10
declare -i y=10
declare -i z=0
z=$(( x + y ))
echo "$x + $y = $z"
# 10 + 10 = 20

# try setting to character 'a'
x=a
z=$(( x + y ))
echo "$x + $y = $z"
# 0 + 10 = 10
```

Do x được khai báo là số nguyên nên khi gán nó là a, nó sẽ convert => 0

### Create the constants variable

Có 2 cách để khởi tạo 1 biến const

```sh
readonly var
readonly varName=value


declare -r var
declare -r varName=value
```

```sh
readonly DATA=Huyna
echo $DATA

DATA=/tmp/foo
unset DATA

# Huyna
# ./bash5.sh: line 4: DATA: readonly variable
# ./bash5.sh: line 6: unset: DATA: cannot unset: readonly variable
```

## Bash variable existence check

Ta có thể dùng command bên dưới để check kiểu như nếu biến đó chưa được set thì báo lỗi và stop chương trình lại, cái thông báo này mình có thể tự chỉnh sửa theo ý mình:

```sh
${varName?Error varName is not defined}
${varName:?chung ta co the tu dieu chinh thu nay}

```

```sh
#!/bin/bash
# varcheck.sh: Variable sanity check with :? 
path=${1:?Error command line argument not passed}

echo "Backup path is $path."
echo "I'm done if \$path is set."


➜ chapter3 ⚡                                                                  22:23:16
▶ ./bash6.sh
./bash6.sh: line 3: 1: Error command line argument not passed

➜ chapter3 ⚡                                                                 22:23:38
▶ ./bash6.sh huyna
Backup path is huyna.
I'm done if $path is set.
```

## Customize the bash shell environments

### Recalling command history

- Ta có thể dùng command **history** để xem lịch sử các command đã dùng.
- Có thể dùng các nút move up/down để di chuyển giữa các câu lệnh đã dùng
- Dùng **!!** để thực hiện câu lệnh cuối cùng
- Dùng **CTRL + R** rồi gõ lệnh nó sẽ gợi ý ra các lệnh mà bạn đã dùng

### Path name expansion

```sh
echo huyn{1,2,3,4}
huyn1 huyn2 huyn3 huyn4

echo file{1..5}.txt
file1.txt file2.txt file3.txt file4.txt file5.txt

ls -l /etc/resolv.conf /etc/hosts /etc/passwd
ls /etc/{resolv.conf,hosts,passwd}

rm -v hello.{sh,py,pl,c}

D=/webroot
mkdir -p $D/{dev,etc,bin,sbin,var,tmp}
```

#### Wildcards

```sh
ls /etc/*.conf

ls *.{c,h}
f.c  fo1.c  fo1.h  fo2.c  fo2.h  fo3.c fo3.h  fo4.c  fo4.h  fo5.c  fo5.h  t.c

ls image?.png
imageH.png image7.png

ls /etc/[ab]*.conf
/etc/aHHHHH.conf /etc/bABCD.conf
```

### Create and use aliases

```sh
alias c="clear"
unalias c
alias
```
