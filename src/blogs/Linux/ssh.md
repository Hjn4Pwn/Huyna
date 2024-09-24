# SSH

## Generate ssh key then connect to remote server

- Install SSH:

```bash
sudo apt-get update
sudo apt-get install openssh-server
```

- Generate the SSH key:

```bash
ssh-keygen -t rsa
cat ~/.ssh/id_rsa.pub > ~/.ssh/authorized_keys
```

- Copy the private key to the guest. On their side:

```bash
chmod 700 id_rsa
ssh -i id_rsa user@host
```
