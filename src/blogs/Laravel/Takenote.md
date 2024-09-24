# Take note

- [Docs](#docs)
- [Seed data into new Table](#seed-data-into-new-table)
- [Add Custom Gaurd - Authen](#add-custom-gaurd---authen)
- [Valid request](#valid-request)
- [Add Custom Middleware](#add-custom-middleware)
- [Get all Users - Pagination](#get-all-users---pagination)
- [Frontend Upload && Show image](#frontend-upload--show-image)
- [Use Select2 for Select - Option](#use-select2-for-select---option)
- [Render Province - District - Ward](#render-province---district---ward)
- [Update User](#update-user)
- [Delete User](#delete-user)

## Docs

- [Faker Repo](https://github.com/fzaninotto/Faker)
- [VietNam Provinces](https://github.com/ThangLeQuoc/vietnamese-provinces-database/blob/master/README_vi.md)
- [Select2](https://select2.org/getting-started/installation)

## Seed data into new Table

- **php artisan make:model Admin**

- **php artisan make:factory AdminFactory --model=Admin**

-**Define factory:**

```php
namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class AdminFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition()
    {
        return [
            'username' => $this->faker->unique()->name,
            'password' => bcrypt('defaultPassword'), // Encrypt the password
        ];
    }
}

```

- **Use the Factory in DatabaseSeeder:**

```php
namespace Database\Seeders;

use App\Models\Admin; // Ensure you import the Admin model
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Create one admin
        Admin::factory()->create([
            'username' => 'adminUser',
            'password' => bcrypt('adminPassword') // Encrypt the password
        ]);

        // Optionally, create multiple admins
        // Admin::factory(5)->create();
    }
}


```

- **php artisan db:seed**

## Add Custom Gaurd - Authen

- **config/auth.php**:

```php
return [

    'guards' => [
        //...
        'admin' => [
            'driver' => 'session',
            'provider' => 'admins',
        ],
    ],

    'providers' => [
        //...
        'admins' => [
            'driver' => 'eloquent',
            'model' => App\Models\Admin::class,
        ],

    ],
];

```

- **Create model Admin**:

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Admin extends Authenticatable
{
    use HasFactory;
}

```

- **Controller**:

```php
    public function auth(Request $request)
    {
        $credentials = $request->validate([
            'username' => ['required'],
            'password' => ['required'],
        ]);

        if (Auth::guard('admin')->attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->route('admin.dashboard');
        }

        return back()->withErrors([
            'username' => 'The provided credentials do not match our records.',
        ]);
    }

```

- **php artisan config:cache**

## Valid request

- **php artisan make:request AdminAuthRequest**

- **AdminAuthRequest.php**:

```php
//...
{ 
    public function rules(): array
    {
        return [
            'username' => ['required'],
            'password' => ['required'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.required' => 'Please enter your username.',
            'password.required' => 'Please enter your password.',
        ];
    }
}

```

- **AdminController**:

```php
public function auth(AdminAuthRequest $request)
    {
        // $credentials = $request->validate([
        //     'username' => ['required'],
        //     'password' => ['required'],
        // ]);
        $credentials = $request->only('username', 'password');

        if (Auth::guard('admin')->attempt($credentials)) {
            $request->session()->regenerate();
            return redirect()->route('admin.dashboard')->with('success', 'Login successfully');
        }

        return redirect()->route('admin.login')->with('error', 'Username or Password is incorrect');
    }

```

- **View**

```php
@if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif

```

## Add Custom Middleware

- **php artisan make:middleware AdminAuthMiddleware**

- **middleware config**:

```php
public function handle(Request $request, Closure $next): Response
{
    if (!Auth::guard('admin')->check()) {
        // Redirect to login page if not admin
        return redirect()->route('admin.login')->with('error', 'Please login to access the admin area.');
    }
    return $next($request);
}

```

- **bootstrap/app.php**:

```php
return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->alias([
            'AdminAuth' => AdminAuthMiddleware::class,
            'AdminLogin' => AdminLoginMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();


```

- **Route use middleware**:

```php
Route::get('admin/dashboard', [DashboardController::class, 'index'])
    ->middleware('AdminAuth')
    ->name("admin.dashboard");

```

## Get all Users - Pagination

### Non use Service or Repository

*Controller Dashboard call User Model*

- **DashboardController**

```php
class DashboardController extends Controller
{
    public function index()
    {
        $users = User::all(); //->toArray();
        // dd($users);
        return view('admin.user.manageUser', [
            'users' => DB::table('users')->paginate(15),
        ]);
        // return view('admin.dashboard.pages.index');
    }
}


```

- View:

```php
@if (isset($users))
    {{ $i = 0 }}
    @foreach ($users as $user)
        <tr>
            <td>{{ ++$i }}</td>
            <td>{{ $user->name }}</td>
            // ...
            <td>{{ $user->address }}</td>
    @endforeach
@endif

//-- pagination --
<div class="text-center">
    {{ $users->links() }}
</div>
```

- **App\Providers\AppServiceProvider**

```php
use Illuminate\Pagination\Paginator;
 
/**
 * Bootstrap any application services.
 */
public function boot(): void
{
    // Paginator::useBootstrapFive();
    Paginator::useBootstrapFour();
}

```

### Use Service for Pagintion

- **composer require getsolaris/laravel-make-service --dev**

- **php artisan make:service UserService --i**

- **UserServiceInterface**:

```php
namespace App\Services\Interfaces;

/**
 * Interface UserServiceInterface
 * @package App\Services\Interfaces
 */
interface UserServiceInterface
{
    public function paginate();
}

```

- **UserService**:

```php
namespace App\Services;

use App\Services\Interfaces\UserServiceInterface;
use App\Models\User;

/**
 * Class UserService
 * @package App\Services
 */
class UserService implements UserServiceInterface
{
    public function __construct()
    {
        //
    }

    public function paginate()
    {
        return User::paginate(15);
    }
}

```

- **App\Providers\AppServiceProvider**

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Pagination\Paginator;

class AppServiceProvider extends ServiceProvider
{

    public $serviceBindings = [
        'App\Services\Interfaces\UserServiceInterface' => 'App\Services\UserService',
    ];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        foreach ($this->serviceBindings as $key => $value) {
            $this->app->bind($key, $value);
        }
    }
    // ...
}

```

- **ManageUserController**:

```php
use App\Models\User;
use App\Services\Interfaces\UserServiceInterface as UserService;

class DashboardController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index()
    {
        $users = $this->userService->paginate();
        return view('admin.user.manageUser', [
            'users' => $users,
        ]);
    }
}

```

## Frontend Upload && Show image

```html
<div class="form-group row">
    <label class="col-sm-2 col-form-label">Upload Image</label>

    <div class="col-sm-2">
        <img id="customerImage"
            src={{ asset('AdminResource/images/test/sampleAvatar.png') }}
            class="rounded-3" style="width: 100px; " alt="Product Image" />
    </div>

    <div class="col-sm-8">
        <input type="file" class="form-control" id="imageInput">
    </div>
</div>

<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script>
    $(document).ready(function() {
        $('#imageInput').change(function(e) {
            var reader = new FileReader();
            reader.onload = function(e) {
                $('#customerImage').attr('src', e.target.result);
            }
            reader.readAsDataURL(e.target.files[0]);
        });
    });
</script>

```

## Use Select2 for Select - Option

```html
<link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>

<!-- .......... -->

<div class="form-group row">
    <label class="col-sm-2 col-form-label">Ward</label>
    <div class="col-sm-10">
        <select id="wardSelect" name="ward"
            class="form-control select2-format" style="width:100%;">
            <option value="opt1">Please select one
            </option>
            {{--  --}}
        </select>
    </div>
</div>

<!-- .......... -->

<script>
    $(document).ready(function() {
        $('.select2-format').select2();
    });
</script>

```

## Render Province - District - Ward

- **Create Model: Province**

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Province extends Model
{
    use HasFactory;

    protected $primaryKey = 'code';
    // protected $table = 'provinces';
    protected $fillable = ['code', 'name'];

    public function districts()
    {
        return $this->hasMany(District::class, 'province_code', 'code');
    }
}

```

- **Create Model: District**

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class District extends Model
{
    use HasFactory;

    protected $primaryKey = 'code';
    // protected $table = 'districts';
    protected $fillable = ['code', 'name', 'province_code'];

    public function province()
    {
        return $this->belongsTo(Province::class, 'province_code');
    }

    public function wards()
    {
        return $this->hasMany(Ward::class, 'district_code');
    }
}

```

- **Create Model: Ward**

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ward extends Model
{
    use HasFactory;

    protected $primaryKey = 'code';
    // protected $table = 'wards';
    protected $fillable = ['code', 'name', 'district_code'];

    public function district()
    {
        return $this->belongsTo(District::class, 'district_code');
    }
}

```

- **LocationServiceInterface**:

```php
namespace App\Services\Interfaces;

/**
 * Interface LocationServiceInterface
 * @package App\Services\Interfaces
 */
interface LocationServiceInterface
{
    public function getAllProvince();
    public function getDistrictsByProvinceId($provinceId);
    public function getWardsByDistrictId($districtId);
}

```

- **LocationService**:

```php
namespace App\Services;

use App\Services\Interfaces\LocationServiceInterface;
use App\Models\Province;
use App\Models\District;
use App\Models\Ward;

/**
 * Class LocationService
 * @package App\Services
 */
class LocationService implements LocationServiceInterface
{
    public function getAllProvince()
    {
        // có thể dùng repository để tương tác thẳng tới dữ liệu
        // return Province::all();

        // Trả về tất cả các tỉnh
        return Province::with('districts')->get(); // Tải sẵn các quận/huyện liên kết
    }

    public function getDistrictsByProvinceId($provinceId)
    {
        // $districts = District::where('province_code', $provinceId)->get();

        // Tải sẵn các xã/phường liên kết với các quận/huyện
        $districts = Province::findOrFail($provinceId)->districts;
        $output = '<option value="">Select a Ward</option>';
        foreach ($districts as $district) {
            $output .= '<option value="' . $district->code . '">' . $district->name . '</option>';
        }
        return $output;
    }
    public function getWardsByDistrictId($districtId)
    {
        // $wards = Ward::where('district_code', $districtId)->get();

        // Tải sẵn các xã/phường liên kết với các quận/huyện
        $wards = District::findOrFail($districtId)->wards;
        $output = '<option value="">Select a Ward</option>';
        foreach ($wards as $ward) {
            $output .= '<option value="' . $ward->code . '">' . $ward->name . '</option>';
        }
        return $output;
    }
}

```

- **AdminController**:

```php
public function editCustomer()
{
    $provinces = $this->locationService->getAllProvince();
    return view('admin.pages.customer.editCustomer', [
        'provinces' => $provinces,
        'parentPage' => ['Customers', 'admin.customers'],
        'childPage' => 'Edit',
    ]);
}

```

- **LocationController**:

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\Interfaces\LocationServiceInterface;

class LocationController extends Controller
{
    protected $locationService;

    public function __construct(
        LocationServiceInterface $locationService
    ) {
        $this->locationService = $locationService;
    }

    public function getDistrictsByProvinceId($provinceId)
    {
        return $this->locationService->getDistrictsByProvinceId($provinceId);
    }

    public function getWardsByDistrictId($districtId)
    {
        return $this->locationService->getWardsByDistrictId($districtId);
    }
}

```

- **Route**:

```php
// frontend call backend
Route::get('getDistricts/{provinceId}', [LocationController::class, 'getDistrictsByProvinceId'])
    ->middleware('AdminLogin')
    ->name('getDistrictsByProvinceId');

Route::get('getWards/{districtId}', [LocationController::class, 'getWardsByDistrictId'])
    ->middleware('AdminLogin')
    ->name('getWardsByDistrictId');

```

- **View**:

```php
<div class="form-group row">
    <label class="col-sm-2 col-form-label">Province</label>
    <div class="col-sm-10">
        <select id="provinceSelect" name="province"
            class="form-control select2-format " style="width:100%;">
            <option value="">Please select one
            </option>
            @foreach ($provinces as $province)
                <option value={{ $province->code }}>
                    {{ $province->name }}
                </option>
            @endforeach
        </select>
    </div>
</div>
<div class="form-group row">
    <label class="col-sm-2 col-form-label">District</label>
    <div class="col-sm-10">
        <select id="districtSelect" name="district"
            class="form-control select2-format" style="width:100%;">
            <option value="">Please select one
            </option>
            // 
        </select>
    </div>
</div>
<div class="form-group row">
    <label class="col-sm-2 col-form-label">Ward</label>
    <div class="col-sm-10">
        <select id="wardSelect" name="ward"
            class="form-control select2-format" style="width:100%;">
            <option value="opt1">Please select one
            </option>
            // 
        </select>
    </div>
</div>
                                         
// {{-- render Provinces, Districts, Wards --}}
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
// {{-- get Districts By Province Id --}}
<script>
    $(document).ready(function() {
        $('#provinceSelect').on('change', function() {
            var provinceId = $(this).val();
            if (provinceId) {
                $.ajax({
                    url: '/getDistricts/' + provinceId,
                    type: 'GET',
                    timeout: 5000,
                    success: function(data) {
                        $('#districtSelect').html(data);
                        // $('#districtSelect').select2();
                    },
                    error: function(xhr, status, error) {
                        console.error("Failed to fetch districts: " + error);
                        alert("Could not fetch data. Please try again later.");
                    }
                });
            } else {
                $('#districtSelect').html('<option value="">Select a District</option>');
            }
        });
    });
</script>

// {{-- get Wards By District Id --}}
<script>
    $(document).ready(function() {
        $('#districtSelect').on('change', function() {
            var districtId = $(this).val();
            if (districtId) {
                $.ajax({
                    url: '/getWards/' + districtId,
                    type: 'GET',
                    timeout: 5000,
                    success: function(data) {
                        $('#wardSelect').html(data);
                        // $('#wardSelect').select2();
                    },
                    error: function(xhr, status, error) {
                        console.error("Failed to fetch wards: " + error);
                        alert("Could not fetch data. Please try again later.");
                    }
                });
            } else {
                $('#wardSelect').html('<option value="">Select a Ward</option>');
            }
        });
    });
</script>
```

## Update User

*Nhớ update trường fillable*

- **view**:

```php
<form action="{{ route('admin.updateUserInfo', ['userId' => $userInfo->id]) }}"
    method="POST">
    @csrf
    @method('PUT')
    // ....

```

- **route**:

```php
Route::put('editUser/{userId}/update', [AdminController::class, 'updateUserInfo'])
    ->name('admin.updateUserInfo');
```

- **userService**:

```php
public function updateUserInfo($userId, $validatedData)
{
    $user = User::findOrFail($userId);
    $user->update($validatedData);
}

```

- **AdminController**:

```php
public function updateUserInfo(AdminUpdateUserInfoRequest $request, $userId)
{
    // $validatedData = $request->validate([
    //     'name' => 'required|string|max:255',
    //     'email' => 'required|email|max:255',
    //     'phone' => 'required|max:255',
    //     'address_detail' => 'required|max:255',
    // ]);

    $validatedData = $request->validated();
    $this->userService->updateUserInfo($userId, $validatedData);
    return redirect()->route('admin.users')->with('success', 'User updated successfully');
}

```

## Delete User

- **view**:

```php
<form
    action="{{ route('admin.deleteUser', ['userId' => $user->id]) }}"
    method="POST" onsubmit="return confirmDelete()">
    @csrf
    @method('DELETE')
    <button type="submit"
        class="btn btn-danger waves-effect waves-light">
        <i class="fa fa-trash"></i>
    </button>
</form>

<script>
    function confirmDelete() {
        return confirm('Are you sure you want to delete this user?');
    }
</script>

```

- **route**:

```php
Route::delete('deleteUser/{userId}', [AdminController::class, 'deleteUser'])
    ->name('admin.deleteUser');
```

- **userService**:

```php
public function deleteUser($userId)
{
    $user = User::findOrFail($userId);
    $user->delete();
}

```

- **AdminController**:

```php
public function deleteUser($userId)
{
    $this->userService->deleteUser($userId);
    return redirect()->route('admin.users')->with('success', 'User deleted successfully');
}

```
