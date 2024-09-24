# Database

## Eloquent ORM

- **Khai báo mối quan hệ 1-N:**

```php
public function category()
{
    return $this->belongsTo(Category::class, 'category_id'); // foreign key
}

public function images()
{
    return $this->hasMany(ProductImage::class, 'product_id'); // foreign key
}

```

- **Tương tác với DB bằng 2 cách, tận dụng mối quan hệ 1-N và ngược lại:**

```php
$images = ProductImage::where('product_id', $product->id)->get();

// --------------------------------------------------------------- //

$images = $product->images;

```

```php
public function storeProductImage(Product $product, $path, $sort_order)
{
    ProductImage::create([
        'product_id' => $product->id,
        'path' => $path,
        'sort_order' => $sort_order,
    ]);
}

// --------------------------------------------------------------- //

public function storeProductImage(Product $product, $path, $sort_order)
{
    $product->images()->create([
        'path' => $path,
        'sort_order' => $sort_order,
    ]);
}

```

```php
public function getMainImageForProduct(Product $product)
{
    return ProductImage::where('product_id', $product->id)
        ->where('sort_order', 1)
        ->first();
}

// --------------------------------------------------------------- //

public function getMainImageForProduct(Product $product)
{
    return $product->images()->where('sort_order', 1)->first();
}

```

```php
return ProductFlavor::create([
    'product_id' => $product->id,
    'flavor_id' => $flavor_id,
]);

// --------------------------------------------------------------- //

return $product->flavors()->create([
    'flavor_id' => $flavor_id,
]);

```

## DB Facade

### Query Builder

- Tương tác trực tiếp với DB, không thông qua model:

```php
public function index(): View
{
    $users = DB::table('users')->get();

    return view('user.index', ['users' => $users]);
}

```

### Raw SQL

```php
use Illuminate\Support\Facades\DB;

$users = DB::select('SELECT * FROM users WHERE active = ?', [1]);

foreach ($users as $user) {
    echo $user->name;
}

```

## Stored Procedures

## Views

## Eager-Loading vs Lazy-Loading

```php
// return $category->products;
// return Product::with('category')->where('category_id', $category->id)->get();
return $category->products()->with('category')->get();

```

***Giả sử users->posts (1-N)***

```php
// User.php
class User extends Model
{
    public function posts()
    {
        return $this->hasMany(Post::class);
    }
}

// Post.php
class Post extends Model
{
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}

```

### Eager Loading

- **Cách hoạt động**:
  - Truy vấn bảng cha (users): Truy vấn tất cả các bản ghi từ bảng users.
  - Truy vấn bảng con (posts): Truy vấn tất cả các bản ghi từ bảng posts mà có user_id khớp với danh sách id từ bảng users.
  - Ghép nối dữ liệu: Laravel sẽ ghép nối các bản ghi từ bảng posts với các bản ghi tương ứng từ bảng users dựa trên khóa chính (users.id) và khóa ngoại (posts.user_id).

```php
use App\Models\User;

// Eager-Loading các bài viết khi truy vấn người dùng
$users = User::with('posts')->get();

foreach ($users as $user) {
    echo $user->name . ' has posts:';
    foreach ($user->posts as $post) {
        echo $post->title;
    }
}

```

- **SQL thực thi**:
  - SELECT * FROM users;
  - SELECT * FROM posts WHERE user_id IN (1, 2, 3, ...);

- **Lợi ích**:
  - Giảm Số Lượng Truy Vấn SQL: Thay vì thực hiện một truy vấn cho mỗi bản ghi liên quan, Eager-Loading thực hiện hai truy vấn lớn và ghép nối dữ liệu trong bộ nhớ.
  - Cải Thiện Hiệu Suất: Giảm tải cho database server bằng cách hạn chế số lượng truy vấn.
  - Truy Xuất Dữ Liệu Dễ Dàng: Giúp mã nguồn dễ đọc và bảo trì hơn khi truy xuất dữ liệu liên quan.

=> ***Sử dụng khi biết trước rằng sẽ cần truy cập các mối quan hệ của các bản ghi. Điều này giúp tránh N+1 query problem và tăng hiệu suất.***

### Lazy Loading

Ngược lại, khi sử dụng Lazy-Loading, mỗi lần truy cập vào một mối quan hệ, Laravel sẽ thực hiện một truy vấn mới để lấy dữ liệu liên quan. Ví dụ:

```php
$users = User::all();

foreach ($users as $user) {
    foreach ($user->posts as $post) {
        echo $post->title;
    }
}

```

- **SQL thực thi**:
  - SELECT * FROM users;
  - SELECT * FROM posts WHERE user_id = 1;
  - SELECT * FROM posts WHERE user_id = 2;
  - SELECT * FROM posts WHERE user_id = 3;
  - ....

=> ***Sử dụng khi không chắc chắn rằng sẽ cần truy cập tất cả các mối quan hệ, giúp tiết kiệm tài nguyên nếu chỉ cần một phần nhỏ của dữ liệu liên quan.***

## $product->images() vs $product->images

```php
ProductFlavor::where([
    ['product_id', '=', $product->id],
    ['flavor_id', '=', $flavor_id],
])->delete();

// --------------------------------------------------------------- //

$product->flavors()->where('flavor_id', $flavor_id)->delete();

// --------------------------------------------------------------- //

$product->flavors->where('flavor_id', $flavor_id)->delete();

```

```php
// Trả về đối tượng quan hệ, cho phép xây dựng thêm truy vấn
$query = $product->images();

// Bạn có thể thêm các điều kiện vào truy vấn trước khi thực hiện
$images = $query->where('some_condition', 'value')->get();

// --------------------------------------------------------------- //

// Gọi phương thức để xây dựng truy vấn
$query = $product->images()->where('active', true);

// Thực hiện truy vấn lấy tất cả các hình ảnh active
$activeImages = $query->get();

```

- **Cách hoạt động**:
  - Gọi phương thức images trên model Product.
  - Trả về một đối tượng Illuminate\Database\Eloquent\Relations\HasMany hoặc loại quan hệ tương tự.
  - Cho phép bạn xây dựng thêm các truy vấn trước khi thực hiện truy vấn thực tế đến cơ sở dữ liệu.

```php
// Ngay lập tức thực hiện truy vấn và trả về tập hợp các model liên quan
$images = $product->images;

// Kết quả đã được tải vào bộ nhớ, bạn có thể làm việc với nó trực tiếp
foreach ($images as $image) {
    // Do something with $image
}

// --------------------------------------------------------------- //

// Truy vấn ngay lập tức để lấy tất cả các hình ảnh
$images = $product->images;

// Lọc kết quả sau khi đã lấy từ cơ sở dữ liệu
$activeImages = $images->where('active', true);

```

- **Cách hoạt động**:
  - Truy cập thuộc tính images của đối tượng Product.
  - Ngay lập tức thực hiện truy vấn đến cơ sở dữ liệu để lấy tất cả các bản ghi liên quan và trả về tập hợp các model Image.
  - Kết quả này được lưu vào bộ nhớ đệm (cache) của đối tượng Product, nên các lần truy cập tiếp theo sẽ không cần thực hiện truy vấn lại trừ khi đối tượng Product bị làm mới (refreshed).

- **Thực hiện truy vấn:**
  - **$product->images()** chỉ trả về đối tượng quan hệ, không thực hiện truy vấn cho đến khi bạn gọi một phương thức thực thi như get(), first(), count(), v.v.
  - **$product->images** thực hiện truy vấn ngay lập tức và tải tất cả các bản ghi liên quan vào bộ nhớ đệm.

- **Khả năng xây dựng truy vấn:**
  - **$product->images()** cho phép bạn xây dựng thêm các điều kiện hoặc thao tác trên truy vấn trước khi thực thi.
  - **$product->images** không cho phép bạn xây dựng thêm truy vấn vì nó đã thực thi ngay lập tức.

- **Name**:
  - **->images()**: Được gọi là **method call**. Nó trả về một đối tượng quan hệ (relationship object) và cho phép bạn xây dựng thêm truy vấn trước khi thực hiện hành động.
  - **->images**: Được gọi là **property access**. Nó ngay lập tức thực hiện truy vấn và tải tất cả các bản ghi liên quan vào bộ nhớ.
