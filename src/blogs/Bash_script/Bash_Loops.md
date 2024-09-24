# Bash Loops && Functions

- [For Loop](#for-loop)
  - [Nested for loop statement](#nested-for-loop-statement)
  - [While loop](#while-loop)
  - [Reading A Text File](#reading-a-text-file)
  - [Infinite while loop](#infinite-while-loop)
  - [Until loop](#until-loop)
  - [Select loop](#select-loop)
  - [Break & Continue](#break--continue)
  - [Challenges](#challenges)
- [Functions](#functions)
  - [Defining & Writing & Calling function](#defining--writing--calling-function)
  - [Local Variable](#local-variable)
  - [Returning from a function](#returning-from-a-function)
  - [Shell functions library](#shell-functions-library)
  - [Recursive function](#recursive-function)
  - [Putting functions in background](#putting-functions-in-background)
  - [Challenge](#challenge)

## For Loop

```sh
for var in item1 item2 ... itemN
do
        command1
        command2
        ....
        ...
        commandN
done


for var in list-of-values
do
        command1
        command2
        ....
        ...
        commandN
done

for var in $(Linux-command-name)
do
        command1
        command2
        ....
        ...
        commandN
done
```

**EX:**

```sh
#!/bin/bash
for i in 1 2 3 4 5
do
  echo "Welcome $i times."
done



#!/bin/bash
# A shell script to verify user password database
files="/etc/passwd /etc/group /etc/shadow /etc/gshdow"
for f in $files
do
 [  -f $f ] && echo "$f file found" || echo "*** Error - $f file missing."
done



#!/bin/bash
# A simple shell script to display a file on screen passed as command line argument
[ $# -eq 0 ] && { echo "Usage: $0 file1 file2 fileN"; exit 1; }

# read all command line arguments via the for loop
for f in $*
   do
   echo
   echo "< $f >"
   [ -f $f ] && cat $f || echo "$f not file."
   echo "------------------------------------------------"
done



#!/bin/bash
echo "Printing file names in /tmp directory:"
for f in $(ls /tmp/*)
do
 echo $f
done



#!/bin/bash
n=$1
# make sure command line arguments are passed to the script
if [ $# -eq 0 ]
then
 echo "A shell script to print multiplication table."
 echo "Usage : $0 number"
 exit 1
fi

# Use for loop
for i in {1..10}
do
 echo "$n * $i = $(( $i * $n))"
done

#!/bin/bash
for ((i = 1; i <= 5; i++))
do
  echo -n "$i " 
done
```

### Nested for loop statement

```sh
#!/bin/bash
# A shell script to print each number five times.
for (( i = 1; i <= 5; i++ ))      ### Outer for loop ###
do

    for (( j = 1 ; j <= 5; j++ )) ### Inner for loop ###
    do
          echo -n "$i "
    done

  echo "" #### print the new line ###
done

```

```sh
#!/bin/bash
for (( i = 1; i <= 8; i++ )) ### Outer for loop ###
do
   for (( j = 1 ; j <= 8; j++ )) ### Inner for loop ###
   do
        total=$(( $i + $j))   # total 
        tmp=$(( $total % 2))  # modulus
        # Find out odd and even number and change the color 
        # alternating colors using odd and even number logic  
        if [ $tmp -eq 0 ]; 
        then
            echo -e -n "\033[47m  "
        else
            echo -e -n "\033[40m  "
        fi
  done
 echo "" #### print the new line ###
done

```

### While loop

```sh
while [ condition ]
do
        command1
        command2
        ..
        ....
        commandN
done

```

```sh
#!/bin/bash
# set n to 1
n=1

# continue until $n equals 5
while [ $n -le 5 ]
do
 echo "Welcome $n times."
 n=$(( n+1 ))  # increments $n
done

```

### Reading A Text File

```sh
#!/bin/bash
file=/etc/resolv.conf
while IFS= read -r line
do
 # echo line is stored in $line
 echo $line
done < "$file"



#!/bin/bash
file=/etc/resolv.conf
# set field separator to a single white space 
while IFS=' ' read -r f1 f2
do
 echo "field # 1 : $f1 ==> field #2 : $f2"
done < "$file"


#!/bin/bash
file=/etc/passwd
# set field delimiter to : 
# read all 7 fields into 7 vars 
while IFS=: read -r user enpass uid gid desc home shell
do
    # only display if UID >= 500 
 [ $uid -ge 500 ] && echo "User $user ($uid) assigned \"$home\" home directory with $shell shell."
done < "$file"
```

### Infinite while loop

- **true command** - do nothing, successfully (always returns exit code 0)
- **false command** - do nothing, unsuccessfully (always returns exit code 1)
- **: command** - no effect; the command does nothing (always returns exit code 0)

```sh
#!/bin/bash
# Recommend syntax for setting an infinite while loop
while :
do
 echo "Do something; hit [CTRL+C] to stop!"
done



#!/bin/bash
while true
do
 echo "Do something; hit [CTRL+C] to stop!"
done


#!/bin/bash
while false
do
 echo "Do something; hit [CTRL+C] to stop!"
done
```

```sh
#!/bin/bash
# set an infinite loop
while :
do
 clear
        # display menu
        echo "Server Name - $(hostname)"
 echo "-------------------------------"
 echo "     M A I N - M E N U"
 echo "-------------------------------"
 echo "1. Display date and time."
 echo "2. Display what users are doing."
 echo "3. Display network connections."
 echo "4. Exit"
        # get input from the user 
 read -p "Enter your choice [ 1 -4 ] " choice
        # make decision using case..in..esac 
 case $choice in
  1)
   echo "Today is $(date)"
   read -p "Press [Enter] key to continue..." readEnterKey
   ;;
  2) 
   w 
   read -p "Press [Enter] key to continue..." readEnterKey
   ;;
  3)
   netstat -nat
   read -p "Press [Enter] key to continue..." readEnterKey
   ;;
  4)
   echo "Bye!"
   exit 0
   ;;
  *)
   echo "Error: Invalid option..." 
   read -p "Press [Enter] key to continue..." readEnterKey
   ;;
 esac  
    
done

```

### Until loop

```sh
#!/bin/bash
i=1
until [ $i -gt 6 ]
do
 echo "Welcome $i times."
 i=$(( i+1 ))
done
```

### Select loop

```sh
#!/bin/bash

# Set PS3 prompt
PS3="Enter the space shuttle to get more information: "

# Set shuttle list
select shuttle in columbia endeavour challenger discovery atlantis enterprise exit
do
    echo "$shuttle selected"
    if [ "$shuttle" == "exit" ]
    then
        echo "Exiting..."
        break
    fi
done


1) columbia    3) challenger  5) atlantis    7) exit
2) endeavour   4) discovery   6) enterprise
Enter the space shuttle to get more information: 5
atlantis selected
Enter the space shuttle to get more information: 7
exit selected
Exiting...
```

### break & continue

```sh
break

break N # break N times, ex: exit for and then exit while

continue 

continue N # ~ break N
```

### challenges

#### Create a menu-driven script using the select statement to display calorie information for food items such as pizza, burger, salad, and pasta

```sh
#!/bin/bash

PS3="Choose an option to view its calorie content: "

food_items="Pizza Burger Salad Pasta Quit"

select choice in $food_items
do 
    case $choice in 
        "Pizza")
            echo "Calories in Pizza: 100";;
        "Burger")
            echo "Calories in Burger: 100";;
        "Salad")
            echo "Calories in Salad: 100";;
        "Pasta")
            echo "Calories in Pasta: 100";;
        "Quit")
            echo "Exiting the program. Goodbye!"
            break;;
        *)
            echo "Invalid choice. Please select a valid option.";;
    esac
done


```

#### Write a shell script that, given a file name as the argument will count vowels, blank spaces, characters, number of line and symbols

```sh
#!/bin/bash

file=$1
count=0

[ $# -ne 1 ] && { echo "Give me a file name as the first argument, please!"; exit 1; }

[ ! -f $file ] && { echo "$file is not a file"; exit 1; }

while read -n 1 c; do
    l=$(echo $c | tr [:upper:] [:lower:])
    [[ $l == "a" || $l == "e" || $l == "i" || $l == "o" || $l == "u" ]] && ((count++))
done < "$file"

echo "Number of Vowels: $count"
echo "Number of characters: $(cat "$file" | wc -m)"
echo "Number of lines: $(cat "$file" | wc -l)"
echo "Blank lines: $(grep -c '^$' "$file")"

exit 0


./bash8.sh  a.tx
a.tx is not a file

./bash8.sh
Give me a file name as the first argument, please!

./bash8.sh a.txt
Number of Vowels: 8
Number of characters: 32
Number of lines: 4
Blank lines: 1
```

## Functions

### Defining & Writing & Calling function

```sh
function funct_name(){
    ....
}

funct_name(){
    .....
}

funct_name # call

```

### local variable

```sh
#!/bin/bash
create_jail(){
   d=$1  
   echo "create_jail(): d is set to $d"
}

d=/apache.jail
echo "Before calling create_jail  d is set to $d"
create_jail "/home/apache/jail"
echo "After calling create_jail d is set to $d"


# Before calling create_jail  d is set to /apache.jail
# create_jail(): d is set to /home/apache/jail
# After calling create_jail d is set to /home/apache/jail
```

```sh
#!/bin/bash
# global d variable
d=/apache.jail

# User defined function
create_jail(){
   # d is only visible to this fucntion
   local d=$1  
   echo "create_jail(): d is set to $d"
}

echo "Before calling create_jail  d is set to $d"
create_jail "/home/apache/jail"
echo "After calling create_jail d is set to $d"


# Before calling create_jail  d is set to /apache.jail
# create_jail(): d is set to /home/apache/jail
# After calling create_jail d is set to /apache.jail
```

### Returning from a function

```sh
#!/bin/bash
# Variables
domain="CyberCiti.BIz  HUYNA"
out=""

##################################################################
# Purpose: Converts a string to lower case
# Arguments:
#   $@ -> String to convert to lower case
##################################################################
function to_lower() 
{
    echo $2
    local str="$@"
    local output
    output=$(tr '[A-Z]' '[a-z]'<<<"${str}")
    echo $output
}

# invoke the to_lower()
to_lower "This Is a TEST"

# invoke to_lower() and store its result to $out variable
out=$(to_lower ${domain})

# Display  back the result from $out
echo "Domain name : $out"

```

### Shell functions library

1 file chứa các list functs => library funct. Sẽ được import vào script khác và dùng như python import thư viện:

```sh
#!/bin/bash
# set variables 
declare -r TRUE=0
declare -r FALSE=1
declare -r PASSWD_FILE=/etc/passwd

##################################################################
# Purpose: Converts a string to lower case
# Arguments:
#   $1 -> String to convert to lower case
##################################################################
function to_lower() 
{
    local str="$@"
    local output     
    output=$(tr '[A-Z]' '[a-z]'<<<"${str}")
    echo $output
}
##################################################################
# Purpose: Display an error message and die
# Arguments:
#   $1 -> Message
#   $2 -> Exit status (optional)
##################################################################
function die() 
{
    local m="$1" # message
    local e=${2-1} # default exit status 1
    echo "$m" 
    exit $e
}
##################################################################
# Purpose: Return true if script is executed by the root user
# Arguments: none
# Return: True or False
##################################################################
function is_root() 
{
   [ $(id -u) -eq 0 ] && return $TRUE || return $FALSE
}

##################################################################
# Purpose: Return true $user exits in /etc/passwd
# Arguments: $1 (username) -> Username to check in /etc/passwd
# Return: True or False
##################################################################
function is_user_exits() 
{
    local u="$1"
    grep -q "^${u}" $PASSWD_FILE && return $TRUE || return $FALSE
}

```

```sh
#!/bin/bash
# Load the  myfunctions.sh 
# My local path is /home/vivek/lsst2/myfunctions.sh
. /home/vivek/lsst2/myfunctions.sh

# Define local variables
# var1 is not visitable or used by myfunctions.sh
var1="The Mahabharata is the longest and, arguably, one of the greatest epic poems in any language."

# Invoke the is_root()
is_root && echo "You are logged in as root." || echo "You are not logged in as root."

# Find out if user account vivek exits or not
is_user_exits "vivek" && echo "Account found." || echo "Account not found."

# Display $var1
echo -e "*** Orignal quote: \n${var1}"

# Invoke the to_lower()
# Pass $var1 as arg to to_lower()
# Use command substitution inside echo
echo -e "*** Lowercase version: \n$(to_lower ${var1})"

```

load lib funct to current shell environment:

```sh
. myfunctions.sh
. /path/to/myfunctions.sh
source myfunctions.sh
source /path/to/myfunctions.sh

# dot is an alias of source command
```

### Recursive function

```sh
#!/bin/bash
# fact.sh - Shell script to to find factorial of given command line arg
factorial(){
  local i=$1
  local f
  declare -i i
  declare -i f
  
  # factorial() is called until the value of $f is returned and is it is <= 2
  # This is called the recursion
  [ $i -le 2 ] && echo $i || { f=$(( $(factorial $((i-1)) ) * i )); echo $f; }
}

# display usage
[ $# -eq 0 ] && { echo "Usage: $0 number"; exit 1; }

# call factorial
factorial $1
```

### Putting functions in background

```sh
name(){
  echo "Do something"
  sleep 1
}

# put a function in the background
name &

# do something

```

### Challenge

Create user-defined functions in a shell script for the following tasks:

- add_user() - Add a user to the system.
- add_group() - Add a group to the system.
- change_password() - Change user password.
- delete_user() - Remove a user from the system.

```sh
#!/bin/bash

# cut -d: -f1 /etc/group | sort | uniq
# cut -d: -f1 /etc/passwd

# Check if the script is run as root
[ "$EUID" -ne 0 ] && { echo "This script requires root privileges. Please run it with sudo."; exit 1; }

PS3="Give me your choice: "
choices=("add_user" "add_group" "change_password" "delete_user" "delete_group" "Quit")

select choice in "${choices[@]}"
do
    case $choice in
    "add_user")
        read -p "Give me the username to add: " username
        useradd "$username"
        passwd "$username"
        echo "Added $username!"
        ;;
    "add_group")
        read -p "Give me the group name to add: " groupname
        groupadd "$groupname"
        ;;
    "change_password")
        read -p "Give me the username to change the password: " username
        passwd "$username"
        ;;
    "delete_user")
        read -p "Give me the username to delete: " username
        userdel "$username"
        ;;
    "delete_group")
        read -p "Give me the group name to delete: " groupname
        groupdel "$groupname"
        ;;
    "Quit")
        echo "You chose to quit!"
        break
        ;;
    *)
        echo "Invalid choice. Please select a valid option."
        ;;
    esac
done


```
