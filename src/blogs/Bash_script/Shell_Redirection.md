# Shell Redirection & Pipes and Filters

## Shell Redirection

0 - Input - Keyboard (stdin)
1 - Output - Screen (stdout)
2 - Error - Screen (stderr)

**> filename** => create new empty file

```sh
command >/dev/null
command 1>/dev/null
# ghi output => 

command 2>/dev/null
# ghi error => /dev/null nơi mà ghi dữ liệu dô sẽ bị hủy bỏ đi và k được lưu ở bất cứ đâu

command &>/dev/null
# ghi cả stdout và stderr > file
```

### Here documents

[Source](https://bash.cyberciti.biz/guide/Here_documents)

### Here strings

[Source](https://bash.cyberciti.biz/guide/Here_strings)

### Assigns the file descriptor (fd) to file for output

[source](https://bash.cyberciti.biz/guide/Assigns_the_file_descriptor_(fd)_to_file_for_output)

### Opening the file descriptors for reading and writing

```sh
#!/bin/bash
FILENAME="/tmp/out.txt"
# Opening file descriptors # 3 for reading and writing
# i.e. /tmp/out.txt
exec 3<>$FILENAME

# Write to file
echo "Today is $(date)" >&3
echo "Fear is the path to the dark side. Fear leads to anger. " >&3
echo "Anger leads to hate. Hate leads to suffering." >&3
echo "--- Yoda" >&3

# close fd # 3
exec 3>&-

```

### Reads from the file descriptor (fd)

```sh
#!/bin/bash
# Let us assign the file descriptor to file for input fd # 3 is Input file 
exec 3< /etc/resolv.conf

# Let us assign the file descriptor to file for output fd # 3 is Input file 
exec 4> /tmp/output.txt
 
# Use read command to read first line of the file using fd # 3
read -u 3 a b

# Display data on screen
echo "Data read from fd # 3:"
echo $a $b

# Write the same data to fd # 4 i.e. our output file
echo "Writing data read from fd #3 to fd#4 ... "
echo  "Field #1 - $a " >&4
echo  "Field #2 - $b " >&4

# Close fd # 3 and # 4
exec 3<&-
exec 4<&-

```

### Executes commands and send output to the file descriptor (fd)

```sh
#!/bin/bash
exec 4> /tmp/out.txt
free -m >&4

```

## Pipes and Filters

### Linking Commands

[source](https://bash.cyberciti.biz/guide/Linking_Commands)

```sh
;
command1; command2
cmd1 pải thực thi xong cmd2 mới được thực thi

&
command arg &
cmd chạy ngầm

&&
command1 && command2
logic

||
command1 || command2
logic

|
command1 | command2
output của cmd1 là input của cmd2


Multi command
command1 ; command2 ; commandN
{ command1; command2 }

```
