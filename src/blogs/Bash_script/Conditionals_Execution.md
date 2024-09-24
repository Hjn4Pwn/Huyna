# Conditionals Execution

- [test command](#test-command)
- [if else](#if-else)
- [status command](#status-command)
- [logic AND OR](#logic-and-or)
- [Numeric comparison](#numeric-comparison)
- [String comparison](#string-comparison)
- [Shell command line parameters](#shell-command-line-parameters)
  - [How to use positional parameters](#how-to-use-positional-parameters)
  - [Parameters Set by the Shell](#parameters-set-by-the-shell)
- [The case statement](#the-case-statement)
- [Challenge](#write-a-shell-script-that-display-one-of-ten-unique-fortune-cookie-message-at-random-each-it-is-run)

## test command

```sh
test 5 -eq 5 && echo Yes || echo No
test 5 -eq 15 && echo Yes || echo No
test 5 -ne 10 && echo Yes || echo No
test -f /etc/resolv.conf && echo "File /etc/resolv.conf found." || echo "File /etc/resolv.conf not found."
test -f /etc/resolv1.conf && echo "File /etc/resolv1.conf found." || echo "File /etc/resolv1.conf not found."

Yes
No
Yes
File /etc/resolv.conf found.
File /etc/resolv1.conf not found.
```

## if else

```sh
if [condition]
then
     command1 
     command2
     ...
     commandN 
fi

if test condition 
then
     command1 
     command2
     ...
     commandN 
fi



if command
then
            command executed successfully
            execute all commands up to else statement
            or to fi if there is no else statement

else
            command failed so
            execute all commands up to fi
fi


#!/bin/bash

read -s -p "Enter password: " pass
if test $pass == 0
then
    echo -e "\nSuccessfully 0"
elif [ $pass -eq 1 ]
then
    echo -e "\nSuccessfully 1"
else
    echo -e "\nWrong"
fi


```

## status command

We can check the status of command by **echo $?** after execute command like:

```sh
date
echo $?

huyna
echo $?
```

Return 0 for successful execution, 1-255 for errors

## logic AND, OR

Exit if a directory /tmp/foo does not exist

```sh
test ! -d /tmp/foo && { read -p "Directory /tmp/foo not found. Hit [Enter] to exit..." enter; exit 1; }


test $(id -u) -eq 0  && echo "Root user can run this script." || echo "Use sudo or su to become a root user."
```

## Numeric comparison

-{eq, lt, gt, le, ge, ne}

## String comparison

== !=

```sh

#!/bin/bash
read -s -p "Enter your password: " pass
echo 
if test -z $pass #check null, empty
then
    echo "No password was entered!!! Cannot verify an empty password!!!" 
    exit 1
fi
if test "$pass" = "a"
then
    echo "you enter a"
elif test "$pass" == "b"
then
    echo "you enter b"
else 
    echo "you enter what the heck i dont know bro"
fi
```

## [File attributes comparisons](https://bash.cyberciti.biz/guide/File_attributes_comparisons)

## Shell command line parameters

### How to use positional parameters

```sh
#!/bin/bash
echo "The script name : $0"
echo "The value of the first argument to the script : $1"
echo "The value of the second argument to the script : $2"
echo "The value of the third argument to the script : $3"
echo "The number of arguments passed to the script : $#"
echo "The value of all command-line arguments (\$* version) : $*"
echo "The value of all command-line arguments (\$@ version) : $@"


./bash3.sh a ab abc
The script name : ./bash3.sh
The value of the first argument to the script : a
The value of the second argument to the script : ab
The value of the third argument to the script : abc
The number of arguments passed to the script : 3
The value of all command-line arguments ($* version) : a ab abc
The value of all command-line arguments ($@ version) : a ab abc
```

trong đó:

- $@: các arguments cách nhau khoảng trống
- $*: các argumants cách nhau dựa theo **IPS** đã được nói ở chương trước

```sh
#!/bin/bash
IFS=", "
echo "* Displaying all pizza names using \$@"
echo "$@"
echo 

echo "* Displaying all pizza names using \$*"
echo "$*"


./pizza.sh Margherita Tomato Panner Gourmet
* Displaying all pizza names using $@
Margherita Tomato Panner Gourmet

* Displaying all pizza names using $*
Margherita,Tomato,Panner,Gourmet

```

### Parameters Set by the Shell

```sh
All command line parameters or arguments can be accessed via $1, $2, $3,..., $9.
$* holds all command line parameters or arguments.
$# holds the number of positional parameters.
$- holds flags supplied to the shell.
$? holds the return value set by the previously executed command.
$$ holds the process number of the shell (current shell).
$! hold the process number of the last background command.
$@ holds all command line parameters or arguments.
```

## The case statement

```sh
case  $variable-name  in
    pattern1)       
        command1
        ...
        ....
        commandN
        ;;
    pattern2)
        command1
        ...
        ....
        commandN
        ;;            
    patternN)       
        command1
        ...
        ....
        commandN
        ;;
    *)              
esac



case  $variable-name  in
    pattern1|pattern2|pattern3)       
        command1
        ...
        ....
        commandN
        ;;
    pattern4|pattern5|pattern6)
        command1
        ...
        ....
        commandN
        ;;            
    pattern7|pattern8|patternN)       
        command1
        ...
        ....
        commandN
        ;;
    *)              
esac 


#!/bin/bash
NOW=$(date +"%a")
case $NOW in
 Mon) 
  echo "Full backup";;
 Tue|Wed|Thu|Fri)
  echo "Partial backup";;
 Sat|Sun) 
  echo "No backup";;
 *) ;;
esac
```

### Dealing with case sensitive pattern

```sh
#!/bin/bash
# A shell script to backup mysql, webserver and files to tape
# allinonebackup.sh version 2.0
# -------------------------------------------------------
# covert all passed arguments to lowercase using
# tr command and here strings
opt=$( tr '[:upper:]' '[:lower:]' <<<"$1" )
case $opt in
        sql)
                echo "Running mysql backup using mysqldump tool..."
                ;;
        sync)
                echo "Running backup using rsync tool..."
                ;;
        tar)
                echo "Running tape backup using tar tool..."
                ;;
        *)
             echo "Backup shell script utility"
                echo "Usage: $0 {sql|sync|tar}"
                echo " sql  : Run mySQL backup utility."
                echo " sync : Run web server backup utility." 
                echo " tar  : Run tape backup utility." ;;
esac
```

```sh
#!/bin/bash
# A shell script to backup mysql, webserver and files to tape
opt=$1
# Turn on a case-insensitive matching (-s set nocasematch)
shopt -s nocasematch
case $opt in
        sql)
                echo "Running mysql backup using mysqldump tool..."
                ;;
        sync)
                echo "Running backup using rsync tool..."
                ;;
        tar)
                echo "Running tape backup using tar tool..."
                ;;
        *)
             echo "Backup shell script utility"
                echo "Usage: $0 {sql|sync|tar}"
                echo " sql  : Run mySQL backup utility."
                echo " sync : Run web server backup utility." 
                echo " tar  : Run tape backup utilty." ;;
esac

# Turn off a case-insensitive matching (-u unset nocasematch)
shopt -u nocasematch

```

## Write a shell script that display one of ten unique fortune cookie message, at random each it is run

```sh
#!/bin/bash
# Genarate a number (random number) between 1 and 10
r=$(( $RANDOM%10+0 ))

# Quotes author name
author="\t --Bhagavad Gita."

# Store cookies or quotes in an array
array=( "Neither in this world nor elsewhere is there any happiness in store for him who always doubts." 
 "Hell has three gates: lust, anger, and greed." 
 "Sever the ignorant doubt in your heart with the sword of self-knowledge. Observe your discipline. Arise." 
 "Delusion arises from anger. The mind is bewildered by delusion. Reasoning is destroyed when the mind is bewildered. One falls down when reasoning is destroyed." 
 "One gradually attains tranquillity of mind by keeping the mind fully absorbed in the Self by means of a well-trained intellect, and thinking of nothing else." 
 "The power of God is with you at all times; through the activities of mind, senses, breathing, and emotions; and is constantly doing all the work using you as a mere instrument."
 "One who has control over the mind is tranquil in heat and cold, in pleasure and pain, and in honor and dishonor; and is ever steadfast with the Supreme Self"
 "The wise sees knowledge and action as one; they see truly." 
 "The mind acts like an enemy for those who do not control it." 
 "Perform your obligatory duty, because action is indeed better than inaction." )

# Display a random message
echo 
echo ${array[$r]}
echo -e "$author"
echo
```
