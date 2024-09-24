# Take note 2

- [Resource controller: route - method](#resource-controller-route---method)
- [Use TinyMCE editor - Call API](#use-tinymce-editor---call-api)
- [Use removebg - Remove background](#use-removebg---remove-background)
- [Get Products By Category - Save Old Select](#get-products-by-category---save-old-select)
- [BelongTo - HasMany: Render category from product](#belongto---hasmany-render-category-from-product)
- [PostTooLargeException](#posttoolargeexception)
- [User Login - Register - Logout - Default Guard](#user-login---register---logout---default-guard)
- [Admin - Login - Logout - Custom Guard](#admin---login---logout---custom-guard)

## Resource controller: route - method

- [ref](https://laravel.com/docs/11.x/controllers#actions-handled-by-resource-controllers)

- **route**:

```php
// route
Route::get('categories', [CategoryController::class, 'index'])
    ->name('admin.categories.index');

Route::get('categories/create', [CategoryController::class, 'create'])
    ->name('admin.categories.create');

Route::post('categories', [CategoryController::class, 'store'])
    ->name('admin.categories.store');

Route::get('categories/{category}/edit', [CategoryController::class, 'edit'])
    ->name('admin.categories.edit');

Route::put('categories/{category}', [CategoryController::class, 'update'])
    ->name('admin.categories.update');

Route::delete('categories/{category}', [CategoryController::class, 'destroy'])
    ->name('admin.categories.destroy');
// --------------------------------------------------------------

```

- **CategoryController**:

```php
namespace App\Http\Controllers;

use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Models\Category;
use App\Services\Interfaces\CategoryServiceInterface;

class CategoryController extends Controller
{
    protected $categoryService;

    public function __construct(
        CategoryServiceInterface $categoryService
    ) {
        $this->categoryService = $categoryService;
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = $this->categoryService->getAll();
        return view('admin.pages.category.categories', [
            'categories' => $categories,
            'page' => 'Categories',
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.pages.category.createCategory', [
            'parentPage' => ['Categories', 'admin.categories.index'],
            'childPage' => 'Create',
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $validatedData = $request->validated();
        if ($this->categoryService->store($validatedData)) {
            return redirect()->route('admin.categories.index')->with('success', 'Create Category successfully');
        }
        return back()->withErrors('Failed to create category.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        return view('admin.pages.category.editCategory', [
            'category' => $category,
            'parentPage' => ['Categories', 'admin.categories.index'],
            'childPage' => 'Edit',
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $validatedData = $request->validated();
        if ($this->categoryService->update($category, $validatedData)) {
            return redirect()->route('admin.categories.index')->with('success', 'Update Category successfully');
        }
        return back()->withErrors('Failed to update category.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        if ($this->categoryService->delete($category)) {
            return redirect()->route('admin.categories.index')->with('success', 'Delete Category successfully');
        }
        return back()->withErrors('Failed to delete category.');
    }
}


```

- **CategoryService**:

```php
namespace App\Services;

use App\Services\Interfaces\CategoryServiceInterface;
use App\Models\Category;

/**
 * Class CategoryService
 * @package App\Services
 */
class CategoryService implements CategoryServiceInterface
{
    public function getAll()
    {
        return Category::all();
    }

    public function store($validatedData)
    {
        return Category::create($validatedData);
    }

    public function update(Category $category, $validatedData)
    {
        return $category->update($validatedData);
    }

    public function delete(Category $category)
    {
        return $category->delete();
    }
}

```

## Use TinyMCE editor - Call API

- [ref](https://www.tiny.cloud/docs/tinymce/latest/laravel-tiny-cloud/)

- **file.blade.php**:

```php
<script src="https://cdn.tiny.cloud/1/{{ env('TinyMCE_API_KEY') }}/tinymce/7/tinymce.min.js" referrerpolicy="origin">
</script>
<script>
    tinymce.init({
        selector: 'textarea#editorTinyMCE', // Replace this CSS selector to match the placeholder element for TinyMCE
        // plugins: 'code table lists',
        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate mentions tableofcontents footnotes mergetags autocorrect typography inlinecss markdown',
        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | addcomment showcomments | spellcheckdialog a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | emoticons charmap | removeformat',
        // toolbar: 'undo redo | blocks | bold italic | alignleft aligncenter alignright | indent outdent | bullist numlist | code | table'
    });
</script>

```

- **View**:

```html
<div class="form-group row">
    <label class="col-sm-2 col-form-label">Describe</label>
    <div class="col-sm-10">
        <textarea id="editorTinyMCE" name="describe" rows="5" cols="5" class="form-control"
            placeholder="Typing ..."></textarea>
    </div>
</div>

```

## Use removebg - Remove background

- **composer require guzzlehttp/guzzle**

- **Use Intervention: version 2.7.\***: [ref](https://www.youtube.com/watch?v=-E3amn3gGFo)
  - *composer require intervention/image:2.7.\**
  - *use Intervention\Image\Facades\Image;*

- **ProductController**:

```php
public function store(StoreProductRequest $request)
{
    // dd($request);
    $validatedData = $request->validated();
    if ($request->hasFile('image')) {
        $path = $this->imageService->removeBackgroundAndStore($request);
        $validatedData['image'] = $path;
    }
    if ($this->productService->store($validatedData)) {
        return redirect()->route('admin.products.index')->with('success', 'Create product successfully');
    }
    return back()->withErrors('Failed to create product.');
}

public function update(UpdateProductRequest $request, Product $product)
{
    $validatedData = $request->validated();
    $oldImagePath = $product->image;

    if ($request->hasFile('image')) {
        $path = $this->imageService->removeBackgroundAndStore($request);
        $validatedData['image'] = $path;
    }

    if ($this->productService->update($product, $validatedData)) {
        if ($oldImagePath && $oldImagePath != $product->image) {
            $this->imageService->deleteImage($oldImagePath); // Xóa ảnh cũ nếu cập nhật ảnh mới thành công
        }

        return redirect()->route('admin.products.index')->with('success', 'Update product successfully');
    }
    return back()->withErrors('Failed to update product.');
}
```

- **Request Rule**:

```php
public function rules(): array
{
    return [
        //...
        'image' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048',
        //...
    ];
}

```

- **ImageService**:

```php
public function removeBackgroundAndStore(Request $request)
    {
        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $image = Image::make($file);

            if (!in_array($image->mime(), ['image/png'])) {
                $image = $image->encode('png');
            }

            $filename = time() . '_' . uniqid() . '.png';
            $tempPath = sys_get_temp_dir() . '/' . $filename;

            $image->save($tempPath);

            $client = new \GuzzleHttp\Client();
            $response = $client->post('https://api.remove.bg/v1.0/removebg', [
                'multipart' => [
                    [
                        'name'     => 'image_file',
                        'contents' => fopen($tempPath, 'r')
                    ],
                    [
                        'name'     => 'size',
                        'contents' => 'auto'
                    ]
                ],
                'headers' => [
                    'X-Api-Key' => env('REMOVE_BG_API_KEY')
                ]
            ]);

            $path = 'storage/images/products/' . $filename;
            Storage::disk('public')->put('images/products/' . $filename, $response->getBody());

            unlink($tempPath);

            return $path;
        }

        throw new Exception('No image uploaded or failed to remove background');
        return true;
    }

    public function deleteImage($ImagePath)
    {
        $ImagePath = str_replace('storage/', '', $ImagePath);
        Storage::disk('public')->delete($ImagePath);
    }
```

## Get Products By Category - Save Old Select

- Route:

```php
Route::get('products/category/{category}', [ProductController::class, 'indexByCategory'])
    ->name('admin.products.byCategory');

```

- View:

```php
<form class="form-material" method="get" action="" id="categoryForm">
    @csrf
    <div class="form-group row">
        <label class="col-sm-2 col-form-label">Choose Category</label>
        <div class="col-sm-6">
            <select name="category" class="form-control select2-format"
                id="categorySelect">
                <option value="all"
                    {{ session('selectedCategory') == 'all' ? 'selected' : '' }}>All
                </option>
                @foreach ($categories as $category)
                    <option value="{{ $category->id }}"
                        {{ session('selectedCategory') == $category->id ? 'selected' : '' }}>
                        {{ $category->name }}
                    </option>
                @endforeach
            </select>

        </div> 
    </div>
</form>

```

- **Script**:

```html
<script>
    document.getElementById('categorySelect').addEventListener('change', function() {
        var selectedCategory = this.value;
        var form = document.getElementById('categoryForm');
        if (selectedCategory == 'all') {
            form.action = '{{ route('admin.products.index') }}';
        } else {
            form.action = '{{ route('admin.products.byCategory', '') }}/' + selectedCategory;
        }
        form.submit(); // Tự động gửi form sau khi lựa chọn thay đổi
    });
</script>

```

- **ProductController**: *Save selected in session*

```php
public function index()
{
    $products = $this->productService->getAll();
    $categories = $this->productService->getAllCategories();
    session(['selectedCategory' => 'all']); //
    return view('admin.pages.product.products', [
        'selectedCategory' => 'all', //
        'products' => $products,
        'categories' => $categories,
        'page' => 'Products',
    ]);
}

public function indexByCategory(Category $category)
{
    $categories = $this->productService->getAllCategories();
    $products = $this->productService->getProductsByCategory($category);
    // dd($products);
    session(['selectedCategory' => $category->id]); //
    return view('admin.pages.product.products', [
        'selectedCategory' => $category->id, //
        'categories' => $categories,
        'products' => $products,
        'page' => 'Products',
    ]);
}

```

## BelongTo - HasMany: Render category from product

*Truy xuẩt qua lại: VD: Lấy category của product thông qua categoryId*

- **Model**:

```php
// category
public function products()
{
    return $this->hasMany(Product::class, 'categoryId');
}

// product
public function category()
{
    return $this->belongsTo(Category::class, 'categoryId');
}

```

- **Service - Method**:

```php
public function getProductsByCategory(Category $category)
{
    // return $category->products;
    return Product::with('category')->where('categoryId', $category->id)->get();
}


public function getAll()
{
    // return Category::all(); 
    return Category::with('products')->get();
}

```

- **View**:

```php
<td class="text-center">{{ $product->category->name }}</td>

<td class="text-center">{{ $category->products->count() }}</td>
```

## PostTooLargeException

- [ref](https://medium.com/@nedsoft/how-to-fix-posttoolargeexception-in-laravel-on-apache-server-4dbdb7cdaaac)

```sh
php -i | grep php.ini
# edit file config - php.ini: 
post_max_size = 2G
upload_max_filesize = 1G
memory_limit = 3G

sudo /etc/init.d/apache2 restart
```

## User Login - Register - Logout - Default Guard

### Controller - User

```php
class AuthUserController extends Controller
{
    public function showLoginForm()
    {
        return view('login');
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            return redirect()->intended('/');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    public function showRegistrationForm()
    {
        return view('register');
    }

    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = new User([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $user->save();

        return redirect()->route('login')->with('success', 'Registration successful. Please login.');
    }

    public function logout()
    {
        Auth::logout();
        return redirect('/');
    }
}

```

### Route - User

```php
// login - register - logout
Route::middleware(['guest'])->group(function () {
    Route::get('/login', [AuthUserController::class, 'showLoginForm'])->name('login');
    Route::post('/login', [AuthUserController::class, 'login'])->name('login.post');
    Route::get('/register', [AuthUserController::class, 'showRegistrationForm'])->name('register');
    Route::post('/register', [AuthUserController::class, 'register'])->name('register.post');
});

Route::post('/logout', [AuthUserController::class, 'logout'])->name('logout');

// authen pages
Route::middleware(['auth'])->group(function () {
    Route::get('/cart', function () {
        return view('shop.pages.cart');
    })->name('shop.cart');
});

```

### Middleware - User

```php
class UserRedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            return redirect('/')->with('warning', 'Are you serious???');
        }

        return $next($request);
    }
}

```

### bootstrap/app.php - User

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin' => AdminAuthMiddleware::class,
            'guest.admin' => AdminRedirectIfAuthenticated::class,
            'guest' => UserRedirectIfAuthenticated::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

```

## Admin - Login - Logout - Custom Guard

### Controller - Admin

```php
class AuthAdminController extends Controller
{
    public function showLoginForm()
    {
        return view('admin.pages.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::guard('admin')->attempt($credentials)) {
            return redirect()->intended('admin/')->with('success', 'Login successfully');
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ]);
    }

    public function logout()
    {
        Auth::guard('admin')->logout();
        return redirect('/admin/login')->with('success', 'Logout successfully');
    }
}

```

### Route - Admin

```php
Route::prefix('admin')->group(function () {
    // authen admin
    Route::middleware('admin')->group(function () {
        // authen pages
        // .............
    });

    // admin - login - logout
    Route::group(['middleware' => 'guest.admin'], function () {
        Route::get('/login', [AuthAdminController::class, 'showLoginForm'])->name('admin.login');
        Route::post('/login', [AuthAdminController::class, 'login'])->name('admin.login.post');
    });
    Route::get('/logout', [AuthAdminController::class, 'logout'])->name('admin.logout');
});

```

### Middleware - Admin

```php
class AdminAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */

    public function handle(Request $request, Closure $next)
    {
        if (!Auth::guard('admin')->check()) {
            return redirect('admin/login')->with('error', 'Please login to access the admin area.');
        }

        return $next($request);
    }
}

```

```php
class AdminRedirectIfAuthenticated
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */

    public function handle($request, Closure $next, $guard = 'admin')
    {
        if (Auth::guard($guard)->check()) {
            return redirect('admin/')->with('warning', 'Are you serious???');
        }

        return $next($request);
    }
}

```

- **bootstrap/app.php**

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'admin' => AdminAuthMiddleware::class,
            'guest.admin' => AdminRedirectIfAuthenticated::class,
            'guest' => UserRedirectIfAuthenticated::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();

```

### config/auth.php

```php
return [
    'guards' => [
        // Các guard khác...

        'admin' => [
            'driver' => 'session',
            'provider' => 'admins',
        ],
    ],

    'providers' => [
        // Các provider khác...

        'admins' => [
            'driver' => 'eloquent',
            'model' => App\Models\Admin::class,
        ],
    ],

    // Các cài đặt khác...
];


```
