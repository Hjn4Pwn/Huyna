# Basic Concepts

## Route

### Regex

```php
Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])
            ->name('admin.categories.edit')
            ->where('category', '[0-9]+');
```

### Rate Limiting

```php
// Maximum 10 requests per minute
Route::middleware('throttle:10,1')->group(function () {
    Route::get('/profile', [ProfileController::class, 'index']);
});


```

## Controller

## Seeder

- Seeder là công cụ cho phép chèn dữ liệu vào cơ sở dữ liệu một cách tự động và có hệ thống.
- Mục đích chính của Seeder là để giúp tạo dữ liệu mẫu (seed data) nhằm phục vụ cho việc kiểm thử, hoặc tạo các dữ liệu mặc định cho hệ thống, chẳng hạn như thêm người dùng quản trị, dữ liệu sản phẩm ban đầu, hoặc thông tin cấu hình.
- Dùng khi bạn muốn chèn dữ liệu tĩnh, cụ thể hoặc tạo số lượng nhỏ dữ liệu mẫu.

- **php artisan make:seeder UsersTableSeeder**

```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        // Chèn 1 user vào bảng 'users'
        DB::table('users')->insert([
            'name' => 'Huy Na',
            'email' => 'huyna@example.com',
            'password' => Hash::make('password123'), // Mã hóa mật khẩu
        ]);
    }
}

```

- **database/seeders/DatabaseSeeder.php**

```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call(UsersTableSeeder::class); // Gọi seeder vừa tạo
    }
}

```

- **php artisan db:seed --class=UsersTableSeeder**
- hoặc chạy tất cả các seeders đã được gọi trong DatabaseSeeder: **php artisan db:seed**

## Factory

- Sử dụng Factory khi cần sinh ra nhiều dữ liệu hoặc dữ liệu cần tính ngẫu nhiên.

- Tạo Factory cho User: **php artisan make:factory UserFactory --model=User**

```php
namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition()
    {
        return [
            'name' => $this->faker->name(), 
            'email' => $this->faker->unique()->safeEmail(), 
            'password' => Hash::make('password'), 
            'remember_token' => Str::random(10), 
        ];
    }
}

```

- Tạo Seeder để sử dụng Factory: **php artisan make:seeder UsersTableSeeder**

```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        // Tạo 100 user bằng factory
        User::factory(100)->create();
    }
}

```

- **Gọi Seeder trong DatabaseSeeder**

```php
namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call(UsersTableSeeder::class); // Gọi seeder tạo 100 users
    }
}

```

- **php artisan db:seed --class=UsersTableSeeder** hoặc **php artisan db:seed**

## Database Transaction

```php
use Illuminate\Support\Facades\DB;

DB::beginTransaction();

try {
    // .............

    DB::commit();
} catch (\Exception $e) {
    DB::rollBack();

    throw $e;
}

```

## Query Builder

Query Builder giúp xây dựng các truy vấn SQL một cách đơn giản và dễ dàng mà không cần viết trực tiếp SQL. Query Builder hoạt động trực tiếp với cơ sở dữ liệu, không cần ánh xạ đối tượng.

- Sử dụng khi:
  - Cần tối ưu hóa hiệu suất, làm việc với dữ liệu lớn mà không cần phải ánh xạ với các model.
  - Cần thực hiện các câu lệnh SQL phức tạp, chẳng hạn như JOIN, UNION, hoặc các truy vấn đòi hỏi sự tùy chỉnh cao.

```php
$users = DB::table('users')->get();

$user = DB::table('users')->where('email', 'giahuyluu@example.com')->first();

DB::table('users')->insert([
    'name' => 'Huy Na',
    'email' => 'giahuyluu@example.com',
    'password' => bcrypt('password123'),
]);

DB::table('users')
    ->where('id', 1)
    ->update(['email' => 'newemail@example.com']);

DB::table('users')->where('id', 1)->delete();

```

## Eloquent ORM

Eloquent ORM là hệ thống Object–relational mapping của Laravel, giúp bạn làm việc với cơ sở dữ liệu thông qua các model (lớp đối tượng) đại diện cho các bảng trong cơ sở dữ liệu. Eloquent có các mối quan hệ (relationship) mạnh mẽ như hasOne, hasMany, belongsTo, belongsToMany.

- Sử dụng khi:
  - Làm việc với dữ liệu có các mối quan hệ rõ ràng giữa các bảng và muốn tận dụng tính năng ORM để truy xuất và quản lý mối quan hệ này.
  - Muốn sử dụng các tính năng như scope, accessors, mutators, eager loading, và lazy loading để làm việc với dữ liệu dễ dàng hơn.

```php
$users = User::all();

$user = User::where('email', 'giahuyluu@example.com')->first();

// insert
$user = new User;
$user->name = 'Lưu Gia Huy';
$user->email = 'giahuyluu@example.com';
$user->password = bcrypt('password123');
$user->save();

User::create([
    'name' => 'Lưu Gia Huy',
    'email' => 'giahuyluu@example.com',
    'password' => bcrypt('password123'),
]);

// update
$user = User::find(1);
$user->email = 'newemail@example.com';
$user->save();

User::where('id', 1)->update(['email' => 'newemail@example.com']);

// delete
$user = User::find(1);
$user->delete();

User::destroy(1);

// 
$users = User::with('posts', 'comments')->get();

```

## Scope

***Truy vấn có phạm vi tùy chỉnh***

Giả sử có một model User, và muốn tạo một scope để chỉ lấy những người dùng đang hoạt động (active).

- **User Model:**

```php

// Định nghĩa scope
public function scopeActive($query)
{
    return $query->where('status', 'active');
}

public function scopeEmailVerified($query)
{
    return $query->whereNotNull('email_verified_at');
}

```

- **Sử dụng scope trong truy vấn:**

```php
// Lấy tất cả người dùng đang hoạt động
$activeUsers = User::active()->get();

// Lấy người dùng có email đã xác nhận
$verifiedUsers = User::emailVerified()->get();

// Kết hợp nhiều scopes
$activeAndVerifiedUsers = User::active()->emailVerified()->get();

```

## Accessors

***Lấy dữ liệu đã biến đổi***

Accessors là các phương thức giúp bạn tùy chỉnh dữ liệu sau khi truy xuất từ cơ sở dữ liệu nhưng trước khi hiển thị ra bên ngoài. Điều này giúp bạn định dạng dữ liệu mà không ảnh hưởng đến dữ liệu gốc trong cơ sở dữ liệu.

```php
// Model
// Định nghĩa accessor cho thuộc tính "name"
public function getNameAttribute($value)
{
    return ucfirst($value); // Viết hoa chữ cái đầu tiên
}


// sử dụng accessors
$user = User::find(1);
echo $user->name; 

```

## Mutators

***Biến đổi dữ liệu trước khi lưu***

Mutators hoạt động theo cách ngược lại với Accessors, cho phép thay đổi dữ liệu trước khi lưu vào cơ sở dữ liệu.

- **User Model**

```php
// Định nghĩa mutator cho thuộc tính "password"
public function setPasswordAttribute($value)
{
    $this->attributes['password'] = Hash::make($value); // Mã hóa mật khẩu trước khi lưu
}

```

- Dùng Mutators:

```php
$user = new User();
$user->name = 'Lưu Gia Huy';
$user->email = 'giahuyluu@example.com';
$user->password = 'password123'; // Tự động được mã hóa
$user->save();


```

## Eager Loading

***Tải trước các mối quan hệ***

Sử dụng khi biết chắc chắn sẽ cần dữ liệu của các quan hệ trong quá trình xử lý.

```php
// model
class Post extends Model
{
    public function comments()
    {
        return $this->hasMany(Comment::class);
    }
}

// Lấy tất cả các bài viết và tải trước các bình luận của từng bài
$posts = Post::with('comments')->get();

```

## Lazy Loading

***Tải chậm các mối quan hệ***

Sử dụng khi không chắc chắn có cần dữ liệu của quan hệ hay không.

```php
$post = Post::find(1);

// Chỉ khi bạn truy cập $post->comments thì truy vấn lấy bình luận mới được thực hiện
$comments = $post->comments;

```

*Lazy Loading có thể dẫn đến vấn đề N+1 problem: nếu lấy 100 bài viết và sau đó truy vấn bình luận cho từng bài viết, Laravel sẽ thực hiện 1 truy vấn cho bài viết và 100 truy vấn cho bình luận, gây ra nhiều truy vấn không cần thiết.*

## Validation & Exception Handling
