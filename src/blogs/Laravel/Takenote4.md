# Take note 4

- [Show more comment](#show-more-comment)
- [Email Verification](#email-verification)
- [Captcha](#captcha)
- [2fa](#2fa)
- [Login with facebook-google](#login-with-facebook-google)
- [Slug URL](#slug-url)
- [Production Command](#production-command)

## Show more comment

### View

```php
<div class="mt-5" id="reviews-container">
    @if ($reviews->isNotEmpty())
        @foreach ($reviews as $review)
            <div class="per-rating mb-5">
                <div class="d-flex align-items-center">
                    <span class="font-weight-bold mr-2">{{ $review->user->name }}</span>
                    <div class="star-ratings-comment">
                        <div class="fill-ratings"
                            style="width: {{ $review->rating * 20 }}%;">
                            <span>★★★★★</span>
                        </div>
                        <div class="empty-ratings">
                            <span>★★★★★</span>
                        </div>
                    </div>
                </div>
                <div class="mt-2 mb-2">
                    <div class="comment-content">{{ $review->comment }}</div>
                    @if (strlen($review->comment) > 370)
                        <span class="read-more" onclick="toggleReadMore(this)">Xem
                            thêm</span>
                    @endif
                </div>
                <div>
                    <ul class="list-unstyled d-flex align-items-center mb-0 comment-actions">
                        <li class="comment-actions__item mr-3">
                            <a href="#" class="comment-actions__link"
                                onclick="toggleLike(this);">
                                <i
                                    class="fa-solid fa-thumbs-up comment-actions__icon comment-actions__icon-like"></i>
                                <span class="comment-actions__text f-16">0</span>
                                <span class="comment-actions__text f-16">Hữu ích</span>
                            </a>
                        </li>
                        <li class="comment-actions__item mr-3">
                            <a href="#" class="comment-actions__link">
                                <i
                                    class="fa-solid fa-triangle-exclamation comment-actions__icon comment-actions__icon-report"></i>
                                <span
                                    class="comment-actions__text comment-actions__text-report f-16">Báo
                                    cáo</span>
                            </a>
                        </li>
                        <li class="comment-actions__item mr-3">
                            <span
                                class="comment-actions__time f-16">{{ $review->formatted_created_at }}</span>
                        </li>
                    </ul>
                </div>
            </div>
        @endforeach

        <div class="row justify-content-center">
            {{ $reviews->links() }}
        </div>
    @else
        <div class="text-center text-info">
            <span class="f-20">Chưa có đánh giá nào.</span>
        </div>
    @endif
</div>

```

- **div.comment-content**: chứa nội dung bình luận.
- **span.read-more**: chứa dòng chữ "Xem thêm" và có sự kiện onclick gọi đến hàm JavaScript toggleReadMore(this).

### CSS

```css
.comment-content {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    overflow: hidden;
    -webkit-line-clamp: 2; /* Giới hạn hiển thị 2 hàng */
    text-overflow: ellipsis;
    max-height: 3em; /* Chiều cao tối đa cho 2 hàng (1.5em mỗi hàng) */
}

.comment-content.expanded {
    -webkit-line-clamp: unset; /* Mở rộng khi bấm vào "Xem thêm" */
    max-height: none; /* Bỏ giới hạn chiều cao */
}

.read-more {
    color: blue;
    cursor: pointer;
    text-decoration: none;
}

```

- **-webkit-line-clamp**: 2: Giới hạn nội dung chỉ hiển thị 2 dòng.
- **overflow**: hidden: Ẩn phần nội dung tràn ra ngoài khung.
- **text-overflow**: ellipsis: Thêm dấu "..." vào cuối nội dung bị cắt.
- **.comment-content.expanded**: Khi thêm class expanded vào div.comment-content, CSS sẽ bỏ giới hạn chiều cao, cho phép hiển thị toàn bộ nội dung.
- **.read-more**: Định dạng cho dòng chữ "Xem thêm".

### JS

```js
<script>
    function toggleReadMore(element) {
        var content = element.previousElementSibling;
        if (content.classList.contains('expanded')) {
            content.classList.remove('expanded');
            element.textContent = '... Xem thêm';
        } else {
            content.classList.add('expanded');
            element.textContent = 'Thu gọn';
        }
    }
</script>
```

- JavaScript được sử dụng để thêm hoặc xóa class expanded cho div.comment-content khi người dùng bấm vào "Xem thêm" hoặc "Thu gọn".

## Email Verification

- **Config file .env để gửi mail**:

```sh
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=gymstore.foryou@gmail.com
MAIL_PASSWORD=gzjmnwmvcnxpkkrh
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@gmail.com"
MAIL_FROM_NAME="${APP_NAME}"

```

- **Tạo một bảng để xử lý lưu trữ mã xác thực**: php artisan make:migration create_verification_codes_table

```php
public function up(): void
{
    Schema::create('verification_codes', function (Blueprint $table) {
        $table->id();
        $table->string('email');
        $table->string('code');
        $table->string('role'); // xác định là user/admin thực hiện change/reset/register
        $table->timestamp('created_at')->useCurrent(); // xác định thời gian có giá trị của mã xác thực
        $table->timestamp('expires_at');
    });
}

/**
 * Reverse the migrations.
 */
public function down(): void
{
    Schema::dropIfExists('verification_codes');
}

```

- **Model**

```php
class VerificationCode extends Model
{
    use HasFactory;

    protected $fillable = ['email', 'code', 'role', 'expires_at'];

    public $timestamps = false;
}

```

- **file Mail/VerificationCodeMail.php**

```php
namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class VerificationCodeMail extends Mailable
{
    use Queueable, SerializesModels;

    public $code;

    /**
     * Create a new message instance.
     */
    public function __construct($code)
    {
        $this->code = $code;
    }

    public function build()
    {
        return $this->subject('Đây là mã xác thực của bạn')
            ->view('email.verification_code');
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Xác thực Email',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'email.verification_code',
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}

```

- **routes**:

```php
Route::post('/send-verification-code', [AuthUserController::class, 'sendVerificationCode'])->name('send.verification.code');
Route::post('/verify-code', [AuthUserController::class, 'verifyCode'])->name('verify.code');

```

- **VerificationService**:

```php
class VerificationService implements VerificationServiceInterface
{
    public function sendVerificationCode($email, $role)
    {
        $code = Str::random(10);
        $expiresAt = Carbon::now()->addMinutes(2);

        VerificationCode::create([
            'email' => $email,
            'code' => $code,
            'role' => $role,
            'expires_at' => $expiresAt,
        ]);

        Mail::to($email)->send(new VerificationCodeMail($code));
    }

    public function validateVerificationCode($email, $code, $role)
    {
        $verificationCode = VerificationCode::where('email', $email)
            ->where('code', $code)
            ->where('role', $role)
            ->where('expires_at', '>', Carbon::now())
            ->first();

        return $verificationCode !== null;
    }

    public function emailExists(string $email, string $role): bool
    {
        $table = $role === 'admin' ? 'admins' : 'users';
        return DB::table($table)->where('email', $email)->exists();
    }
}

```

- **AuthenUserController**:

```php
public function register(RegisterRequest $request)
{
    $validatedData = $request->validated();

    $isValid = $this->verificationService->validateVerificationCode($validatedData['email'], $validatedData['code'], $validatedData['role']);

    if ($isValid) {
        $user = new User([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'password' => Hash::make($validatedData['password']),
        ]);

        $user->save();
        return redirect()->route('login')->with('success', 'Đăng ký thành công. Hãy đăng nhập.');
    } else {
        return back()->withErrors('Mã xác thực không đúng hoặc đã hết hạn.')->withInput();
    }
}

```

- **AuthenAdminController**:

```php
public function sendVerificationCode(Request $request)
{
    $request->validate([
        'role' => 'required|string',
    ]);

    $email = null;

    switch ($request->role) {
        case 'admin-reset-password':
            $request->validate([
                'email' => 'required|email',
            ]);

            if (!$this->verificationService->emailExists($request->email, 'admin')) {
                return response()->json(['errors' => ['email' => ['Email không tồn tại trong hệ thống.']]], 400);
            }

            $email = $request->email;
            break;
        case 'admin-change-password':
            $email = auth()->guard('admin')->user()->email;
            if (!$email) {
                return response()->json(['message' => 'Email không được tìm thấy cho tài khoản hiện tại.'], 400);
            }
            break;
        default:
            return response()->json(['message' => 'Role không hợp lệ.'], 400);
    }

    $this->verificationService->sendVerificationCode($email, $request->role);

    return response()->json(['message' => 'Mã xác thực đã được gửi.']);
}

```

- **AdminController**:

```php
public function resetPassword(ResetPasswordRequest $request)
{
    if (!$this->verificationService->emailExists($request->email, 'admin')) {
        return back()->withErrors('Email không tồn tại trong hệ thống.')->withInput();
    }

    $validatedData = $request->validated();

    $isValid = $this->verificationService->validateVerificationCode($validatedData['email'], $validatedData['code'], $validatedData['role']);

    if ($isValid) {
        $admin = $this->adminService->getAdminByEmail($request->email);
        $result = $this->adminService->resetPassword($admin, $request->password);
        if ($result['status'] == 'error') {
            return back()->withErrors([$result['field'] => $result['message']]);
        }
    } else {
        return back()->withErrors('Mã xác thực không đúng hoặc đã hết hạn.')->withInput();
    }

    return redirect()->route('admin.login')->with('success', 'Đã đổi mật khẩu thành công. Hãy đăng nhập');
}

public function changePassword(ChangePasswordRequest $request)
{
    $validatedData = $request->validated();

    $admin = auth()->guard('admin')->user();

    $isValid = $this->verificationService->validateVerificationCode($admin->email, $validatedData['code'], $validatedData['role']);

    if ($isValid) {
        $result = $this->adminService->changePassword($admin, $request->current_password, $request->new_password);
        if ($result['status'] == 'error') {
            return back()->withErrors([$result['field'] => $result['message']]);
        }
    } else {
        return back()->withErrors('Mã xác thực không đúng hoặc đã hết hạn.');
    }

    return redirect()->back()->with('success', 'Đã đổi mật khẩu thành công.');
}

```

- **UserController**:

```php
public function changePassword(ChangePasswordRequest $request)
{

    $validatedData = $request->validated();

    $user = Auth::user();

    $isValid = $this->verificationService->validateVerificationCode($user->email, $validatedData['code'], $validatedData['role']);

    if ($isValid) {
        $result = $this->userService->changePassword($request->user(), $request->current_password, $request->new_password);
        if ($result['status'] == 'error') {
            return back()->withErrors([$result['field'] => $result['message']]);
        }
    } else {
        return back()->withErrors('Mã xác thực không đúng hoặc đã hết hạn.');
    }

    return redirect()->back()->with('success', 'Đã đổi mật khẩu thành công.');
}

public function resetPassword(ResetPasswordRequest $request)
{
    if (!$this->verificationService->emailExists($request->email, 'user')) {
        return back()->withErrors('Email không tồn tại trong hệ thống.');
    }

    $validatedData = $request->validated();

    $isValid = $this->verificationService->validateVerificationCode($validatedData['email'], $validatedData['code'], $validatedData['role']);

    if ($isValid) {
        $user = $this->userService->getUserByEmail($request->email);
        $result = $this->userService->resetPassword($user, $request->password);
        if ($result['status'] == 'error') {
            return back()->withErrors([$result['field'] => $result['message']]);
        }
    } else {
        return back()->withErrors('Mã xác thực không đúng hoặc đã hết hạn.');
    }

    return redirect()->route('login')->with('success', 'Đã đổi mật khẩu thành công. Hãy đăng nhập');
}

```

## Captcha

- **composer require google/recaptcha**
- **composer require anhskohbo/no-captcha**

- truy cập vào [đây](https://www.google.com/recaptcha/admin/create) để tạo 2 key là site key và secret key

- **Sau đó thêm 2 key trên vào .env**:

```sh
NOCAPTCHA_SITEKEY=6LeVdhzzzzzzHyw-Dzzzzzz7_yyuGorzzzzzz1S
NOCAPTCHA_SECRET=6LeVdzzzzzzabDzzzzzzNzzzzzz9Ex-5Kdj_
```

- **Thêm đoạn mã captcha vào view**:

```php
{!! NoCaptcha::renderJs() !!}
{!! NoCaptcha::display() !!}
@if ($errors->has('g-recaptcha-response'))
    <span class="text-danger">{{ $errors->first('g-recaptcha-response') }}</span>
@endif

```

- **Xử lý request**:

```php
public function rules(): array
{
    return [
        'current_password' => 'required',
        'new_password' => 'required|confirmed|min:6',
        'role' => 'required|string',
        'code' => 'required|string',
        'g-recaptcha-response' => 'required|captcha',

    ];
}

public function messages()
{
    return [
        'g-recaptcha-response.required' => 'Vui lòng xác thực Captcha.',
        'g-recaptcha-response.captcha' => 'Xác thực Captcha không thành công.',
    ];
}

```

[Tham khảo flow](https://www.youtube.com/watch?v=UQ72lOS6B2o&t=370s)

## 2fa

- Thêm cột lưu trữ **google2fa_secret** vào bảng admins (đây là đối tượng sẽ có tính năng 2fa): **php artisan make:migration add_google2fa_secret_to_admins_table --table=admins**

- **composer require pragmarx/google2fa-laravel**
- **composer require bacon/bacon-qr-code**

- **php artisan vendor:publish --provider="PragmaRX\Google2FALaravel\ServiceProvider"**

- Thêm vào file : **/config/google2fa.php**:

```php
'enabled' => true,
'service' => 'BaconQrCode',

```

- **Cần lưu ý: triển khai múi giờ của server và điện thoại quét mã QR nên đồng nhất, để gen ra cái OTP đúng, và khớp với nhau**:

```php
// Hàm check múi giờ của server
public function test()
{
    echo 'Current server timezone: ' . date_default_timezone_get();
}

// tiến hành config múi giờ cho server tại /config/app.php
'timezone' => 'Asia/Ho_Chi_Minh',
```

- **Code controller xử lý bật, tắt, xác thực 2fa**:

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Requests\Validate2faRequest;
use App\Models\Admin;
use Illuminate\Support\Facades\Auth;

class Google2FAController extends Controller
{
    public function showEnable2faForm(Request $request)
    {
        $user = auth()->guard('admin')->user();
        $google2fa = app('pragmarx.google2fa');
        $google2fa_secret = $user->google2fa_secret ?: $google2fa->generateSecretKey();
        $google2fa_url = $google2fa->getQRCodeInline('GymStore', $user->email, $google2fa_secret);

        if (!$user->google2fa_secret) {
            $request->session()->flash('google2fa_secret', $google2fa_secret);
        }

        return view('admin.pages.adminInfo.2fa', [
            'google2fa_url' => $google2fa_url,
            'secret' => $google2fa_secret,
            'user' => $user,
            'enabled' => (bool) $user->google2fa_secret,
        ]);
    }

    public function showValidate2faForm(Request $request)
    {
        if (!$request->session()->has('2fa:user:id')) {
            return redirect()->route('admin.login')->withErrors('Phiên đăng nhập không hợp lệ.');
        }

        return view('admin.pages.2fa-validate');
    }

    public function verifyEnable2fa(Validate2faRequest $request)
    {
        $user = auth()->guard('admin')->user();
        $google2fa_secret = $request->session()->get('google2fa_secret');
        $google2fa = app('pragmarx.google2fa');

        if ($google2fa->verifyKey($google2fa_secret, $request->input('one_time_password'))) {
            $user->google2fa_secret = $google2fa_secret;
            $user->save();
            return redirect('/admin')->with('success', "2FA đã được bật thành công.");
        }

        return back()->withErrors(['one_time_password' => 'Mã OTP không chính xác.']);
    }

    public function disable2fa(Request $request)
    {
        $user = auth()->guard('admin')->user();
        $user->google2fa_secret = null;
        $user->save();

        return redirect('/admin')->with('success', "2FA đã được tắt thành công.");
    }

    public function validate2fa(Request $request)
    {
        $adminId = $request->session()->get('2fa:user:id');
        $admin = Admin::find($adminId);
        $google2fa = app('pragmarx.google2fa');

        if ($google2fa->verifyKey($admin->google2fa_secret, $request->input('one_time_password'))) {
            Auth::guard('admin')->login($admin);
            $request->session()->forget(['2fa:user:id']);
            return redirect()->intended('admin/')->with('success', 'Đăng nhập thành công.');
        }

        return back()->withErrors(['one_time_password' => 'Mã OTP không chính xác.']);
    }

}

```

- **Code xử lý khi admin đã bật tính năng 2fa thì khi login sẽ check thêm otp, logic như bên dưới**:

```php
public function login(Request $request)
{
    $credentials = $request->only('email', 'password');

    if (Auth::guard('admin')->attempt($credentials)) {
        $user = Auth::guard('admin')->user();

        if ($user->google2fa_secret) {
            Auth::guard('admin')->logout();
            $request->session()->put('2fa:user:id', $user->id);
            // $request->session()->put('2fa:remember', $request->has('remember'));

            return redirect()->route('2fa.validate.form');
        }

        return redirect()->intended('admin/')->with('success', 'Đăng nhập thành công.');
    }

    return back()->withErrors([
        'email' => 'Thông tin đăng nhập không chính xác.',
    ])->withInput();
}

```

- routes:

```php
// authen
Route::get('2fa/enable', [Google2FAController::class, 'showEnable2faForm'])->name('2fa.enable.form');
Route::post('2fa/enable', [Google2FAController::class, 'verifyEnable2fa'])->name('2fa.enable.verify');
Route::post('2fa/disable', [Google2FAController::class, 'disable2fa'])->name('2fa.disable');

// non-auth
Route::post('2fa/validate', [Google2FAController::class, 'validate2fa'])->name('2fa.validate');
Route::get('2fa/validate', [Google2FAController::class, 'showValidate2faForm'])->name('2fa.validate.form');
```

[Tham khảo flow](https://www.youtube.com/watch?v=2V2YV3fIoxU&t=2s)

## Login with facebook-google

- **Với facebook**:
  - Truy cập vào [đây](https://developers.facebook.com/) để tạo project lấy key
  - Tham khảo cách làm [1](https://www.youtube.com/watch?v=YZqfiwSljfA&t=205s), [2](https://viblo.asia/p/tich-hop-xac-thuc-facebook-vao-website-voi-laravel-socialite-4P856j2A5Y3)

- **Với google**:
  - Truy cập vào [đây](https://console.cloud.google.com/) để tạo project lấy key, [edit](https://console.cloud.google.com/apis/dashboard?pli=1)
  - Tham khảo cách làm [1](https://www.youtube.com/watch?v=-TYXtbOcAOU), [2](https://viblo.asia/p/login-vao-ung-dung-bang-tai-khoan-google-924lJqO0ZPM)

- **composer require laravel/socialite**

- **.env**

```php
# facebook
FACEBOOK_CLIENT_ID=aaaaaaaaaaaaaaaaaaaaaaaaa
FACEBOOK_CLIENT_SECRET=aaaaaaaaaaaaaaaaaaaaaaaaa
FACEBOOK_REDIRECT_URL=http://localhost:8000/auth/facebook/callback

# google
GOOGLE_CLIENT_ID=aaaaaaaaa-aaaaaaaaaaaaaaaaaaaaaaaaa.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=aaaaaa-aaaaaaaaaaaaaaaaaaaaaaaaa
GOOGLE_REDIRECT_URL=http://localhost:8000/auth/google/callback

```

- **config/services.php**

```php
'facebook' => [
    'client_id' => env('FACEBOOK_CLIENT_ID'),
    'client_secret' => env('FACEBOOK_CLIENT_SECRET'),
    'redirect' => env('FACEBOOK_REDIRECT_URL'),
],

'google' => [
    'client_id' => env('GOOGLE_CLIENT_ID'),
    'client_secret' => env('GOOGLE_CLIENT_SECRET'),
    'redirect' => env('GOOGLE_REDIRECT_URL'),
],

```

- **UserService**

```php
public function findOrCreateUser($providerUser, $provider)
{
    $authUser = User::where('email', $providerUser->getEmail())->first();

    if ($authUser) {
        if (is_null($authUser->provider)) {
            throw ValidationException::withMessages([
                'email' => 'Email này đã tồn tại trong hệ thống và không thể đăng nhập bằng ' . $provider . '.',
            ]);
        }

        $authUser->update([
            'provider' => $provider,
            'provider_id' => $providerUser->getId(),
        ]);
        return $authUser;
    }
    return User::create([
        'name' => $providerUser->name,
        'email' => $providerUser->email,
        'provider' => $provider,
        'provider_id' => $providerUser->id,
    ]);
}

```

- **AuthUserController**

```php
public function redirectToFacebook()
{
    return Socialite::driver('facebook')->redirect();
}

public function handleFacebookCallback()
{
    try {
        $user = Socialite::driver('facebook')->user();
        $authUser = $this->userService->findOrCreateUser($user, 'facebook');

        auth()->login($authUser, true);
        return redirect()->route('shop.index');
    } catch (ValidationException $e) {
        return redirect()->route('login')->withErrors($e->errors());
    }
}

public function redirectToGoogle()
{
    return Socialite::driver('google')->redirect();
}

public function handleGoogleCallback()
{
    try {
        $user = Socialite::driver('google')->user();
        $authUser = $this->userService->findOrCreateUser($user, 'google');

        auth()->login($authUser, true);
        return redirect()->route('shop.index');
    } catch (ValidationException $e) {
        return redirect()->route('login')->withErrors($e->errors());
    }
}

```

- **Routes**:

```php
// login facebook
Route::get('auth/facebook', [AuthUserController::class, 'redirectToFacebook'])->name('auth.facebook');
Route::get('auth/facebook/callback', [AuthUserController::class, 'handleFacebookCallback']);

// login google
Route::get('auth/google', [AuthUserController::class, 'redirectToGoogle'])->name('auth.google');
Route::get('auth/google/callback', [AuthUserController::class, 'handleGoogleCallback']);

```

- **Model**: *Dùng quan hệ này để check xem user hiện tại có đăng nhập bằng provider như fb, gg không. Nếu có thì sẽ ẩn route change password đi*

```php
public function hasProvider()
{
    return !is_null($this->provider);
}

```

- **View**:

```php
<div class="row mb-2">
    <a href="{{ route('auth.facebook') }}" class="btn btn-outline-primary col-md-12"
        style="text-transform: none;">
        <i class="fa-brands fa-facebook-f"></i> Đăng nhập bằng Facebook
    </a>
</div>

<div class="row mb-2">
    <a href="{{ route('auth.google') }}" class="btn btn-outline-warning col-md-12"
        style="text-transform: none;">
        <i class="fa-brands fa-google"></i> Đăng nhập bằng Google
    </a>
</div>

```

## Slug URL

- **Add slug col to products table**:

```php
// php artisan make:migration add_slug_to_products_table --table=products
 Schema::table('products', function (Blueprint $table) {
    $table->string('slug')->unique()->after('name');
});

```

- **Product Model**:

```php
// Đăng ký sự kiện "saving" để tự động tạo slug trước khi lưu sản phẩm vào cơ sở dữ liệu (create-edit).
public static function boot()
{
    parent::boot();

    static::saving(function ($product) {
        $product->slug = Str::slug($product->name);
    });
}

public function getSlugAttribute()
{
    return Str::slug($this->name);
}

```

- **AppServiceProvider**: *Đăng ký một ràng buộc tùy chỉnh cho route, cho phép Laravel tự động tìm sản phẩm bằng slug khi tham số productSlug được truyền vào route.*

```php
public function boot(Router $router): void
{
    $router->bind('productSlug', function ($value) {
        return Product::where('slug', $value)->firstOrFail();
    });
}

```

- **route**:

```php
Route::get('product/{productSlug}', [HomeController::class, 'productDetails'])->name('shop.products.productDetails');

```

- **View**:

```php
<div onclick="location.href='{{ route('shop.products.productDetails', ['productSlug' => $product->slug]) }}';" style="cursor: pointer;">

```

- **Controller**:

```php
public function productDetails(Product $productSlug)
{
    $categories = $this->categoryService->getAllCategories();
    //    ....

    return view('shop.pages.productDetails', [
        //    ....
        'reported_reviews' => $reviewData['reported_reviews'],
    ]);
}

```

## Production Command

- **Vài lệnh setup đầu tiên**

```sh
docker exec -i mysql mysql -u root -p123456 EcommerceProject < ../backup.sql

docker exec -it nginx rm /etc/nginx/conf.d/default.conf
docker compose restart nginx

curl -X GET "http://localhost:9200/_snapshot/my_backup?pretty"
curl -X PUT "http://localhost:9200/_snapshot/my_backup" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups",
    "compress": true
  }
}'
curl -X GET "http://localhost:9200/_snapshot/my_backup?pretty"

curl -X POST "http://localhost:9200/app_index/_close"
curl -X POST "http://localhost:9200/_snapshot/my_backup/snapshot_1/_restore"

docker compose down
docker compose up --build -d

docker exec -i mysql mysql -u root -p'123456' -e "CREATE DATABASE EcommerceProject;"
docker exec -i mysql mysql -u root -p'123456' EcommerceProject < ../backup.sql

docker exec -it mysql mysql -uroot -p
```

- **SSL**

```sh
sudo apt-get update
sudo apt-get install certbot

sudo certbot certonly --standalone -d gymstore.io.vn -d www.gymstore.io.vn
openssl dhparam -out ./ssl-dhparams.pem 2048

```

- **Tạo thêm account admin với tinker**:

```sh
docker exec -it gymstore-website php artisan tinker

use Illuminate\Support\Facades\Hash;
use App\Models\Admin;

Admin::create([
    'name' => 'Admin Huy',
    'email' => '********@gmail.com',
    'password' => Hash::make('********'),
]);

= App\Models\Admin {#5250
    name: "Admin Huy",
    email: "'********@.'********@@gmail.com",
    password: "$2y$12$f10/'********@/'********@/.'********@",
    updated_at: "2024-08-19 22:28:04",
    created_at: "2024-08-19 22:28:04",
    id: 3,
  }

> exit

   INFO  Goodbye.

```

- **Tạo mới index cho elasticsearch**:

```php
curl -X DELETE "http://localhost:9200/app_index"

curl -X PUT "http://localhost:9200/app_index" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "analysis": {
      "tokenizer": {
        "edge_ngram_tokenizer": {
          "type": "edge_ngram",
          "min_gram": 2,
          "max_gram": 20,
          "token_chars": [
            "letter"
          ]
        }
      },
      "analyzer": {
        "edge_ngram_analyzer": {
          "type": "custom",
          "tokenizer": "edge_ngram_tokenizer",
          "filter": [
            "lowercase"
          ]
        },
        "default_analyzer": {
          "type": "custom",
          "tokenizer": "standard",
          "filter": [
            "lowercase"
          ]
        }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": {
        "type": "integer"
      },
      "name": {
        "type": "text",
        "analyzer": "edge_ngram_analyzer",
        "search_analyzer": "default_analyzer"
      },
      "type": {
        "type": "keyword"
      }
    }
  }
}
'

curl -X GET "http://localhost:9200/app_index/_analyze" -H 'Content-Type: application/json' -d'
{
  "analyzer": "edge_ngram_analyzer",
  "text": "Amix"
}
'

php artisan reindex:all

```
