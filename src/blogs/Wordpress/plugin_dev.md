# Plugin Development

## [Docs](https://developer.wordpress.org/plugins), [Video](https://www.youtube.com/watch?v=ufhkvSoi94w&list=PL0-Cg8lpmCm3lBsQ6dciJGU4e7oNs-S5w&index=20)

## Plugin

- Contact form 7
- Classic Widgets
- Classic Editor
- WooCommerce

## Setup

- Tìm thư mục cài đặt project: **C:\laragon\www\devPlugin**
- Truy cập vào thư mục **wp-content/plugins** trong cài đặt WordPress (ví dụ: **C:\laragon\www\devPlugin\wp-content\plugins)**
- Tạo một thư mục mới cho plugin, ví dụ: *my-custom-plugin*.

## Folder Structure

```go
/plugin-name
     plugin-name.php
     uninstall.php
     /languages
     /includes
     /admin
          /js
          /css
          /images
     /public
          /js
          /css
          /images

```

- **plugin-name.php**:

```php
/*
 * Plugin Name:       Wordpress 2024 - Ecommerce
 * Plugin URI:        #
 * Description:       Học cách tạo ra plugin
 * Version:           1.0
 * Requires at least: 5.2
 * Requires PHP:      7.2
 * Author:            HuyNa
 * Author URI:        #
 * License:           GPL v2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Update URI:        #
 * Text Domain:       my-basics-plugin
 * Domain Path:       /languages
 */

//  Định nghĩa các hằng số của plugin

define('WP2024_PATH', plugin_dir_path(__FILE__)); // wp-content\plugins\wp2024-ecommerce/
define('WP2024_URI', plugin_dir_url(__FILE__)); // http://devplugin.test/wp-content/plugins/wp2024-ecommerce/



function wp2024_ecommerce_activate()
{
    //
}

register_activation_hook(__FILE__, 'wp2024_ecommerce_activate');


function wp2024_ecommerce_deactivate()
{
    //
}


register_deactivation_hook(__FILE__, 'wp2024_ecommerce_deactivate');


```

- **uninstall.php**:

```php
// if uninstall.php is not called by WordPress, die
if (! defined('WP_UNINSTALL_PLUGIN')) {
    die;
}

// drop a custom database table
// global $wpdb;
// $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}mytable" );

```

## New post_type

*page, post*

**include file này vào file plugin_name.php**

**Hook init** là một trong những hook được gọi tự động bởi WordPress trong mỗi lần tải trang, và do đó, custom post type product sẽ được tạo ra mà không cần bạn phải gọi *do_action* một cách thủ công.

```php
// Đăng ký loại post_type: product
add_action('init', 'wp2024_custom_post_type');
function wp2024_custom_post_type()
{
    // post, page
    register_post_type(
        'product',
        array(
            'labels'      => array(
                'name'          => __('Products', 'wp2024-ecommerce'),
                'singular_name' => __('Product', 'wp2024-ecommerce'),
            ),
            'public'      => true,
            'has_archive' => true,
            'rewrite'     => array('slug' => 'products'), // my custom slug
            'supports'    => array('title', 'editor', 'thumbnail', 'excerpt', 'comments'),
        )
    );
}


```

- 1 hook có thể có nhiều callback

```php
add_action('abc', 'callback_one');
add_action('abc', 'callback_two');

```

## New taxonomy
