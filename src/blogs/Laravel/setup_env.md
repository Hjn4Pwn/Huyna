# Setup Environment

- [Install Laravel](#install-laravel)
- [Update php version](#update-php-version)
- [Trouble shoot composer update](#trouble-shoot-composer-update)
- [Container MySQL](#container-mysql)
- [Toast with Laravel](#trouble-shoot-composer-update)

## Install Laravel

- install xampp
- [install composer](https://getcomposer.org/download/)
- [create laravel proj by composer](https://laravel.com/docs/11.x/installation)

## Update php version

[ref](https://allurcode.com/how-to-install-the-latest-php-version-on-windows-subsystem-for-linux-wsl/)

```sh
# update default version

➜ ~ ⚡                                                                          08:54:05
▶ sudo apt install php8.3
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
php8.3 is already the newest version (8.3.4-1+ubuntu22.04.1+deb.sury.org+1).
The following packages were automatically installed and are no longer required:
  cabextract fuseiso libfuse2 libmspack0 libstd-rust-1.72 p7zip p7zip-full python3-attr
  python3-certifi python3-chardet python3-docker python3-dockerpty python3-docopt
  python3-idna python3-jsonschema python3-pyrsistent python3-requests python3-texttable
  python3-urllib3 python3-websocket
Use 'sudo apt autoremove' to remove them.
0 upgraded, 0 newly installed, 0 to remove and 55 not upgraded.


▶ php -v
PHP 8.1.2-1ubuntu2.14 (cli) (built: Aug 18 2023 11:41:11) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.1.2, Copyright (c) Zend Technologies
    with Zend OPcache v8.1.2-1ubuntu2.14, Copyright (c), by Zend Technologies


➜ ~ ⚡                                                                                        08:55:42
▶ sudo update-alternatives --set php /usr/bin/php8.3
update-alternatives: using /usr/bin/php8.3 to provide /usr/bin/php (php) in manual mode

➜ ~ ⚡                                                                                        08:56:39
▶ php -v
PHP 8.3.4 (cli) (built: Mar 16 2024 08:40:08) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.3.4, Copyright (c) Zend Technologies
    with Zend OPcache v8.3.4, Copyright (c), by Zend Technologies

➜ ~ ⚡                                                                                        08:56:45
▶ sudo update-alternatives --config php
There are 3 choices for the alternative php (providing /usr/bin/php).

  Selection    Path                  Priority   Status
------------------------------------------------------------
  0            /usr/bin/php.default   100       auto mode
  1            /usr/bin/php.default   100       manual mode
  2            /usr/bin/php8.1        81        manual mode
* 3            /usr/bin/php8.3        83        manual mode

Press <enter> to keep the current choice[*], or type selection number:
➜ ~ ⚡                                                                                        08:58:14
▶
```

## Trouble shoot composer update

### Error

```sh
composer update
Composer could not detect the root package (laravel/laravel) version, defaulting to '1.0.0'. See https://getcomposer.org/root-version
Loading composer repositories with package information
Updating dependencies
Your requirements could not be resolved to an installable set of packages.

  Problem 1
    - Root composer.json requires laravel/pint ^1.13 -> satisfiable by laravel/pint[v1.13.0, ..., v1.15.1].
    - laravel/pint[v1.13.0, ..., v1.15.1] require ext-xml * -> it is missing from your system. Install or enable PHP's xml extension.
  Problem 2
    - phpunit/phpunit[10.5.0, ..., 10.5.17] require ext-dom * -> it is missing from your system. Install or enable PHP's dom extension.
    - Root composer.json requires phpunit/phpunit ^10.5 -> satisfiable by phpunit/phpunit[10.5.0, ..., 10.5.17].

To enable extensions, verify that they are enabled in your .ini files:
    - /etc/php/8.3/cli/php.ini
    - /etc/php/8.3/cli/conf.d/10-opcache.ini
    - /etc/php/8.3/cli/conf.d/10-pdo.ini
    - /etc/php/8.3/cli/conf.d/20-calendar.ini
    - /etc/php/8.3/cli/conf.d/20-ctype.ini
    - /etc/php/8.3/cli/conf.d/20-curl.ini
    - /etc/php/8.3/cli/conf.d/20-exif.ini
    - /etc/php/8.3/cli/conf.d/20-ffi.ini
    - /etc/php/8.3/cli/conf.d/20-fileinfo.ini
    - /etc/php/8.3/cli/conf.d/20-ftp.ini
    - /etc/php/8.3/cli/conf.d/20-gettext.ini
    - /etc/php/8.3/cli/conf.d/20-iconv.ini
    - /etc/php/8.3/cli/conf.d/20-phar.ini
    - /etc/php/8.3/cli/conf.d/20-posix.ini
    - /etc/php/8.3/cli/conf.d/20-readline.ini
    - /etc/php/8.3/cli/conf.d/20-shmop.ini
    - /etc/php/8.3/cli/conf.d/20-sockets.ini
    - /etc/php/8.3/cli/conf.d/20-sysvmsg.ini
    - /etc/php/8.3/cli/conf.d/20-sysvsem.ini
    - /etc/php/8.3/cli/conf.d/20-sysvshm.ini
    - /etc/php/8.3/cli/conf.d/20-tokenizer.ini
You can also run `php --ini` in a terminal to see which files are used by PHP in CLI mode.
Alternatively, you can run Composer with `--ignore-platform-req=ext-xml --ignore-platform-req=ext-dom` to temporarily ignore these required extensions.


# Check thấy thiếu 2 ext mà nó đề cập là ext-dom và ext-xml
▶ php --ini
Configuration File (php.ini) Path: /etc/php/8.3/cli
Loaded Configuration File:         /etc/php/8.3/cli/php.ini
Scan for additional .ini files in: /etc/php/8.3/cli/conf.d
Additional .ini files parsed:      /etc/php/8.3/cli/conf.d/10-opcache.ini,
/etc/php/8.3/cli/conf.d/10-pdo.ini,
/etc/php/8.3/cli/conf.d/20-calendar.ini,
/etc/php/8.3/cli/conf.d/20-ctype.ini,
/etc/php/8.3/cli/conf.d/20-curl.ini,
/etc/php/8.3/cli/conf.d/20-exif.ini,
/etc/php/8.3/cli/conf.d/20-ffi.ini,
/etc/php/8.3/cli/conf.d/20-fileinfo.ini,
/etc/php/8.3/cli/conf.d/20-ftp.ini,
/etc/php/8.3/cli/conf.d/20-gettext.ini,
/etc/php/8.3/cli/conf.d/20-iconv.ini,
/etc/php/8.3/cli/conf.d/20-phar.ini,
/etc/php/8.3/cli/conf.d/20-posix.ini,
/etc/php/8.3/cli/conf.d/20-readline.ini,
/etc/php/8.3/cli/conf.d/20-shmop.ini,
/etc/php/8.3/cli/conf.d/20-sockets.ini,
/etc/php/8.3/cli/conf.d/20-sysvmsg.ini,
/etc/php/8.3/cli/conf.d/20-sysvsem.ini,
/etc/php/8.3/cli/conf.d/20-sysvshm.ini,
/etc/php/8.3/cli/conf.d/20-tokenizer.ini
```

### Solve

```sh
▶ sudo apt-get install php8.3-xml
[sudo] password for hjn4: 
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following packages were automatically installed and are no longer required:
  cabextract fuseiso libfuse2 libmspack0 libstd-rust-1.72 p7zip p7zip-full php8.1-curl python3-attr python3-certifi python3-chardet python3-docker python3-dockerpty python3-docopt python3-idna python3-jsonschema python3-pyrsistent
  python3-requests python3-texttable python3-urllib3 python3-websocket
Use 'sudo apt autoremove' to remove them.
The following NEW packages will be installed:
  php8.3-xml
0 upgraded, 1 newly installed, 0 to remove and 54 not upgraded.
Need to get 129 kB of archives.
After this operation, 517 kB of additional disk space will be used.
Get:1 https://ppa.launchpadcontent.net/ondrej/php/ubuntu jammy/main amd64 php8.3-xml amd64 8.3.4-1+ubuntu22.04.1+deb.sury.org+1 [129 kB]
Fetched 129 kB in 4s (32.9 kB/s)     
Selecting previously unselected package php8.3-xml.
(Reading database ... 78661 files and directories currently installed.)
Preparing to unpack .../php8.3-xml_8.3.4-1+ubuntu22.04.1+deb.sury.org+1_amd64.deb ...
Unpacking php8.3-xml (8.3.4-1+ubuntu22.04.1+deb.sury.org+1) ...
Setting up php8.3-xml (8.3.4-1+ubuntu22.04.1+deb.sury.org+1) ...

Creating config file /etc/php/8.3/mods-available/dom.ini with new version

Creating config file /etc/php/8.3/mods-available/simplexml.ini with new version

Creating config file /etc/php/8.3/mods-available/xml.ini with new version

Creating config file /etc/php/8.3/mods-available/xmlreader.ini with new version

Creating config file /etc/php/8.3/mods-available/xmlwriter.ini with new version

Creating config file /etc/php/8.3/mods-available/xsl.ini with new version
Processing triggers for libapache2-mod-php8.3 (8.3.4-1+ubuntu22.04.1+deb.sury.org+1) ...
Processing triggers for php8.3-cli (8.3.4-1+ubuntu22.04.1+deb.sury.org+1) ...

▶ php -m | grep -E 'xml|dom'
dom
libxml
random
xml
xmlreader
xmlwriter


▶ php --ini
Configuration File (php.ini) Path: /etc/php/8.3/cli
Loaded Configuration File:         /etc/php/8.3/cli/php.ini
Scan for additional .ini files in: /etc/php/8.3/cli/conf.d
Additional .ini files parsed:      /etc/php/8.3/cli/conf.d/10-opcache.ini,
/etc/php/8.3/cli/conf.d/10-pdo.ini,
/etc/php/8.3/cli/conf.d/15-xml.ini,
/etc/php/8.3/cli/conf.d/20-calendar.ini,
/etc/php/8.3/cli/conf.d/20-ctype.ini,
/etc/php/8.3/cli/conf.d/20-curl.ini,
/etc/php/8.3/cli/conf.d/20-dom.ini,
/etc/php/8.3/cli/conf.d/20-exif.ini,
/etc/php/8.3/cli/conf.d/20-ffi.ini,
/etc/php/8.3/cli/conf.d/20-fileinfo.ini,
/etc/php/8.3/cli/conf.d/20-ftp.ini,
/etc/php/8.3/cli/conf.d/20-gettext.ini,
/etc/php/8.3/cli/conf.d/20-iconv.ini,
/etc/php/8.3/cli/conf.d/20-phar.ini,
/etc/php/8.3/cli/conf.d/20-posix.ini,
/etc/php/8.3/cli/conf.d/20-readline.ini,
/etc/php/8.3/cli/conf.d/20-shmop.ini,
/etc/php/8.3/cli/conf.d/20-simplexml.ini,
/etc/php/8.3/cli/conf.d/20-sockets.ini,
/etc/php/8.3/cli/conf.d/20-sysvmsg.ini,
/etc/php/8.3/cli/conf.d/20-sysvsem.ini,
/etc/php/8.3/cli/conf.d/20-sysvshm.ini,
/etc/php/8.3/cli/conf.d/20-tokenizer.ini,
/etc/php/8.3/cli/conf.d/20-xmlreader.ini,
/etc/php/8.3/cli/conf.d/20-xmlwriter.ini,
/etc/php/8.3/cli/conf.d/20-xsl.ini

```

## Container MySQL

```sh
docker run -d --name e-commerce-project -e MYSQL_ROOT_PASSWORD=123456 -v e-commerce-project:/var/lib/mysql -p 3306:3306 mysql/mysql-server

docker exec -it e-commerce-project mysql -uroot -p

CREATE USER 'huyna'@'%' IDENTIFIED BY '123456';
GRANT ALL PRIVILEGES ON *.* TO 'huyna'@'%';

mysql -h 127.0.0.1 -u root -p


php artisan config:cache
php artisan migrate

docker exec -t mysql-old mysqldump -u root -p'password' mydatabase > ./backup.sql
# import sql file to running container
docker exec -i mysql-new mysql -u root -p'password' mydatabase < ./backup.sql

```

## Toast with Laravel

- **composer require yoeunes/toastr**

- [ref](https://github.com/yoeunes/toastr)

```php
public function auth(Request $request)
{
  $credentials = $request->validate([
    'username' => ['required'],
    'password' => ['required'],
  ]);

  if (Auth::guard('admin')->attempt($credentials)) {
    $request->session()->regenerate();
    return redirect()->route('admin.dashboard')->with('success', 'Login successfully');
  }

  return redirect()->route('admin.login')->with('error', 'Username or Password is incorrect');
}

```
