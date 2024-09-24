# Advance Concepts

## Service - Binding Service

- Service Provide: ????

```php
public $serviceBindings = [
    'App\Services\Interfaces\UserServiceInterface' => 'App\Services\UserService',
];

public function register(): void
{
    foreach ($this->serviceBindings as $key => $value) {
        $this->app->bind($key, $value);
    }
}

```

- Việc bind trong **AppServiceProvider** như trên là quá trình đăng ký các **service** và **interface** vào **container** dịch vụ của *Laravel*, điều này cho phép bạn quản lý sự phụ thuộc (*dependency management*) một cách linh hoạt và hiệu quả. Khi bạn đăng ký một *binding*, bạn đang nói với *Laravel* rằng mỗi khi một phần của ứng dụng yêu cầu **UserServiceInterface**, thì nên trả về một **instance** của **UserService**.

- Nếu bạn không thực hiện bind này, *Laravel* sẽ không biết phải tạo **instance** của lớp nào khi một phần của ứng dụng yêu cầu **UserServiceInterface**. Điều này sẽ dẫn đến lỗi khi ứng dụng cố gắng giải quyết sự phụ thuộc này. Việc đăng ký *binding* giúp giảm sự cứng nhắc trong mã nguồn và tăng tính tái sử dụng cũng như khả năng bảo trì mã nguồn.

- **Container** dịch vụ (*Service Container*) trong Laravel là một công cụ quản lý sự phụ thuộc (*dependency injection container*). Nó được sử dụng để liên kết các lớp với nhau, giải quyết và trả về các **instance** của các lớp khi cần thiết. Nói cách khác, **container** là nơi mà tất cả các **class** được đăng ký với các dịch vụ cụ thể của chúng, và từ đó bạn có thể dễ dàng truy xuất và sử dụng các **class** này trong toàn bộ ứng dụng của bạn.

- **Instance của UserService**: là một thực thể của lớp **UserService**. Khi bạn yêu cầu Laravel tạo một **instance**, nó sẽ kiểm tra xem lớp này có yêu cầu thêm sự phụ thuộc nào không (ví dụ các lớp khác, cấu hình, hoặc tài nguyên) và tự động cung cấp những thứ này khi tạo **instance**.

- **Yêu cầu UserServiceInterface** xảy ra khi một phần của ứng dụng cần sử dụng các chức năng được cung cấp bởi **UserService**. Ví dụ, bạn có thể có một *controller* mà cần truy xuất dữ liệu người dùng từ cơ sở dữ liệu. Thay vì tạo một instance của **UserService** trực tiếp trong *controller*, bạn có thể khai báo rằng bạn cần một **UserServiceInterface**. Laravel sẽ tự động giải quyết sự phụ thuộc này và cung cấp một instance của **UserService** vào *controller* của bạn.

- Ví dụ:

**Giả sử bạn có một interface và một service như sau:**

```php
namespace App\Services\Interfaces;

interface UserServiceInterface {
    public function getAllUsers();
}

namespace App\Services;

use App\Models\User;
use App\Services\Interfaces\UserServiceInterface;

class UserService implements UserServiceInterface {
    public function getAllUsers() {
        return User::all();
    }
}

```

**Và bạn đăng ký trong AppServiceProvider:**

```php
namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Services\Interfaces\UserServiceInterface;
use App\Services\UserService;

class AppServiceProvider extends ServiceProvider {
    public function register() {
        $this->app->bind(UserServiceInterface::class, UserService::class);
    }
}

```

**Trong một controller, bạn có thể yêu cầu UserServiceInterface như một phụ thuộc:**

```php
namespace App\Http\Controllers;

use App\Services\Interfaces\UserServiceInterface;

class UserController extends Controller {
    protected $userService;

    public function __construct(UserServiceInterface $userService) {
        $this->userService = $userService;
    }

    public function index() {
        $users = $this->userService->getAllUsers();
        return view('users.index', compact('users'));
    }
}

```

***Laravel sẽ tự động giải quyết UserServiceInterface và cung cấp một instance của UserService cho bạn trong controller này.***

## Lazy Loading - Eager Loading

## 