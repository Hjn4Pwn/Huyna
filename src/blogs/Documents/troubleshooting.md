# Troubleshooting

## Docker

```sh
➜ kub-action-01-starting-setup ⚡                                       20.8.0  11:09:32
▶ docker login
Log in with your Docker ID or email address to push and pull images from Docker Hub. If you don't have a Docker ID, head over to https://hub.docker.com/ to create one.
You can log in with your password or a Personal Access Token (PAT). Using a limited-scope PAT grants better security and is required for organizations using SSO. Learn more at https://docs.docker.com/go/access-tokens/

Username: hjn4
Password:
Error saving credentials: error storing credentials - err: fork/exec /usr/bin/docker-credential-desktop.exe: exec format error, out: ``

```

> rm ~/.docker/config.json

And then, login again

## WSL2

```sh
wsl --update

wsl.exe --update

```
