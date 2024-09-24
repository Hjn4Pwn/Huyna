# Setup Environment

- [Setup PHP on Nginx with fastCGI (PHP-FPM)](#setup-php-on-nginx-with-fastcgi-php-fpm)
- [Use Dockerfile](#use-dockerfile)
- [Xdebug](#)

## Setup PHP on Nginx with fastCGI (PHP-FPM)

```sh
sudo apt-get update -y
sudo apt-get upgrade -y

sudo apt-get install nginx -y
sudo systemctl status nginx

sudo apt-get install php8.1-fpm -y
sudo systemctl status php8.1-fpm

```

> sudo vim /etc/nginx/sites-available/default

```sh
server {
  # Example PHP Nginx FPM config file
  listen 80 default_server;
  listen [::]:80 default_server;
  root /var/www/html;

  # Add index.php to setup Nginx, PHP & PHP-FPM config
  index index.php index.html index.htm index.nginx-debian.html;

  server_name _;

  location / {
    try_files $uri $uri/ =404;
  }

  # pass PHP scripts on Nginx to FastCGI (PHP-FPM) server
  location ~ \.php$ {
    include snippets/fastcgi-php.conf;

    # Nginx php-fpm sock config:
    fastcgi_pass unix:/run/php/php8.1-fpm.sock;
    # Nginx php-cgi config :
    # Nginx PHP fastcgi_pass 127.0.0.1:9000;
  }

  # deny access to Apache .htaccess on Nginx with PHP, 
  # if Apache and Nginx document roots concur
  location ~ /\.ht {
    deny all;
  }
} # End of PHP FPM Nginx config example
```

```sh
sudo nginx -t
sudo systemctl restart nginx

sudo chmod -R 777 /var/www/html
echo "<?php phpinfo(); ?>" >> /var/www/html/info.php
#check with localhost/info.php
```

### Link host (win 11) file code.php to Ubuntu VM

- Đầu tiên cần share thư mục trên máy host vào Ubuntu VM
- Sau đó link từ thư mục đó trên máy host đến **/var/www/html/index.php**

> ln -s /mnt/hgfs/share-folder/index.php /var/www/html/index.php

[*detail*](https://www.theserverside.com/blog/Coffee-Talk-Java-News-Stories-and-Opinions/Nginx-PHP-FPM-config-example)

## Use Dockerfile

### Nginx Dockerfile

- Dockerfile

```Dockerfile
FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d
# COPY /data /var/www/html
```

- config file

```sh
server {
    listen 0.0.0.0:80;
    root /var/www/html;
    location / {
        index index.php index.html;
    }
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass php:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root/$fastcgi_script_name;
    }
}
```

### PHP Dockerfile

```Dockerfile
FROM php:fpm-alpine
# To connect to MySQL, add mysqli
RUN docker-php-ext-install mysqli pdo pdo_mysql
# COPY ./data /var/www/html
```

### Docker compose

```sh
version: "3.8"
services:
  nginx:
    build: ./nginx
    ports:
      - "8080:80"
    volumes:
      - ./Share-Folder:/var/www/html
  php:
    build: ./php
    volumes:
      - ./Share-Folder:/var/www/html
# add Mysql 
```

## Debugging PHP on Docker with VS Code

with Xdebug

[ref](https://blog.devsense.com/2019/debugging-php-on-docker-with-visual-studio-code)

- install ping: apt-get update && apt-get install -y iputils-ping
- check port: netstat -an | find "9300"
- launch.json:

```json
{
    "version": "0.2.0",
    "configurations": [
        {
            "name": "Listen for Xdebug",
            "type": "php",
            "request": "launch",
            "port": 9003,
            "pathMappings": {
                "/var/www/html": "d:/PHP/nginx-php-mysql/data"
            },
            "log": true
        },
    ]
}

```

### Docker

- **nginx**:

```dockerfile
FROM nginx:alpine
COPY default.conf /etc/nginx/conf.d

```

- **default.conf**:

```sh
server {
    listen 0.0.0.0:80;

    root /var/www/html;

    location / {
        index index.php index.html;
    }

    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_pass php:9000;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root/$fastcgi_script_name;
    }

    error_log /var/log/nginx/error.log;
    access_log /var/log/nginx/access.log;
}

```

- **Php dockerfile**:

```dockerfile
FROM php:fpm
RUN pecl install xdebug
RUN docker-php-ext-enable xdebug

# Thêm cấu hình Xdebug vào php.ini
RUN echo "xdebug.mode=debug" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.start_with_request=yes" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.client_host=host.docker.internal" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.client_port=9003" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini && \
    echo "xdebug.log=/tmp/xdebug.log" >> /usr/local/etc/php/conf.d/docker-php-ext-xdebug.ini

WORKDIR /var/www/html

```
