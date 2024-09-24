# Take note 3

- [MainImage - Use-NonUse - 1N](#mainimage---use-nonuse---1n)
  - [Không dùng quan hệ 1-N](#không-dùng-quan-hệ-1-n)
  - [Dùng quan hệ 1-N](#dùng-quan-hệ-1-n)
- [Pivot - Products - Flavors](#pivot---products---flavors)
  - [Pivot quantity](#pivot-quantity)
  - [Lấy toàn bộ flavors ra và nếu product có những flavors nào thì được đánh dấu lại](#lấy-toàn-bộ-flavors-ra-và-nếu-product-có-những-flavors-nào-thì-được-đánh-dấu-lại)
  - [Update Product-Flavors](#update-product-flavors)
  - [Update Pivot](#update-pivot)
- [Accessor](#accessor)
- [Helper Format Currency](#helper-format-currency)
- [Order](#order)
  - [VNpay online payment](#vnpay-online-payment)
  - [GHTK - Shipping fee](#ghtk---shipping-fee)
- [ElasticSearch Config](#elasticsearch-config)
  - [Config](#config)
  - [Fix bug](#fix-bug)
  - [Code](#code)
  - [Triển khai search các phần nhỏ hơn của từ (token)](#triển-khai-search-các-phần-nhỏ-hơn-của-từ-token)
- [VPS Config](#vps-config)
- [Triển khai elasticService, không dùng Laravel Scout](#triển-khai-elasticservice-không-dùng-laravel-scout)
  - [elasticService](#elasticservice)
  - [Category Model](#category-model)
  - [reindex command, search on name](#reindex-command-search-on-name)
- [Production](#production)
  - [docker-compose](#docker-compose)
  - [Docker folder](#docker-folder)
  - [Dockerfile](#dockerfile)
  - [entrypoint.sh](#entrypointsh)
  - [nginx.conf](#nginxconf)
  - [nginx/snippets/fastcgi-php.conf](#nginxsnippetsfastcgi-phpconf)
  - [php-fpm/php-fpm.conf](#php-fpmphp-fpmconf)

## MainImage - Use-NonUse - 1N

- **getMainImageByProduct()**:

```php
public function getMainImageByProduct(Product $product)
{
    return $product->images()->where('sort_order', 1)->first();
}

```

- **Product Model**:

```php
public function images()
{
    return $this->hasMany(ProductImage::class, 'product_id');
}

public function flavors()
{
    return $this->hasMany(ProductFlavor::class, 'product_id');
}

public function carts()
{
    return $this->hasMany(CartItem::class, 'product_id');
}

public function mainImage()
{
    return $this->hasOne(ProductImage::class)->where('sort_order', 1);
}

```

- **Flavor Model**:

```php
public function productFlavors()
{
    return $this->hasMany(ProductFlavor::class, "flavor_id");
}

public function carts()
{
    return $this->hasMany(CartItem::class, 'flavor_id');
}

```

- **Cart Model**:

```php
public function items()
{
    return $this->hasMany(CartItem::class);
}

```

- **CartItem Model**:

```php
public function cart()
{
    return $this->belongsTo(Cart::class);
}

public function product()
{
    return $this->belongsTo(Product::class);
}

public function flavor()
{
    return $this->belongsTo(Flavor::class);
}

```

### Không dùng quan hệ 1-N

- **Dựa vào user_id để lấy ra thông tin cart của user đó:**

```php
public function getCartItems($user_id)
{
    $cart = Cart::where('user_id', $user_id)
                ->with(['items.product', 'items.flavor'])
                ->first();

    if ($cart) {
        $cartItems = $cart->items;
        foreach ($cartItems as $item) {
            $item->product->mainImage = $this->imageService->getMainImageByProduct($item->product);
        }
        return $cartItems;
    }
    return collect([]);
}

```

- **getProductsAndImagesByCategory()**

```php
public function getProductsAndImagesByCategory(Category $category)
{
    $products = $category->products()->with('category')->get();

    foreach ($products as $product) {
        $product->main_image = $this->imageService->getMainImageForProduct($product);
    }

    return $products;
}

```

- **getProductsAndImages()**:

```php
public function getProductsAndImages()
{
    $products = $this->getAll();

    foreach ($products as $product) {
        $product->main_image = $this->imageService->getMainImageForProduct($product);
    }

    return $products;
}

```

### Dùng quan hệ 1-N

- **Dựa vào user_id để lấy ra thông tin cart của user đó:**

```php
public function getCartItems($user_id)
{
    $cart = Cart::where('user_id', $user_id)
        ->with(['items.product.mainImage', 'items.flavor'])
        ->first();
    return $cart ? $cart->items : collect([]);
}

```

- **getProductsAndImagesByCategory()**

```php
public function getProductsAndImagesByCategory(Category $category)
{
    $products = $category->products()->with(['category', 'mainImage'])->get();

    return $products;
}

```

- **getProductsAndImages()**:

```php
 public function getProductsAndImages()
{
    $products = Product::with(['mainImage'])->get();

    return $products;
}

```

## Pivot - Products - Flavors

- Trong trường hợp này ta có 2 bảng **products** và **flavors** tương ứng với model **Product** và **Flavor**. 2 model này có mối quan hệ N-N với nhau:

```php
// product model
public function flavors()
{
    return $this->belongsToMany(Flavor::class, 'product_flavors')
        ->withPivot('quantity');
}

// flavor model
public function products()
{
    return $this->belongsToMany(Product::class, 'product_flavors')
        ->withPivot('quantity');
}

```

- Trong đó bảng **product_flavors** (model **ProductFlavor**) là bảng trung gian (pivot table) chứa các cột **product_id** và **flavor_id**, và các cột bổ sung thêm như là **quantity**

- Các phương thức dùng pivot:

```php
public function storeProductFlavor(Product $product, $flavorId, $quantity)
{
    // Thêm flavor mới cùng với quantity vào pivot table
    $product->flavors()->attach($flavorId, ['quantity' => $quantity]);
}

public function deleteProductFlavor(Product $product, $flavorId)
{
    // $product->flavors()->where('flavor_id', $flavorId)->delete();
    // Xóa flavor khỏi pivot table
    $product->flavors()->detach($flavorId);
}

public function updateProductFlavorQuantity(Product $product, $flavorId, $quantity)
{
    // Cập nhật quantity của flavor hiện tại trong pivot table
    $product->flavors()->updateExistingPivot($flavorId, ['quantity' => $quantity]);
}

public function deleteFlavorByProduct(Product $product)
{
    // $product->flavors()->delete();
    // ProductFlavor::where('product_id', $product->id)->delete();
    $product->flavors()->detach(); // pivot
}

```

- Cú pháp của attach:

```php
$model->relation()->attach($id, ['additional_columns' => 'value']);

```

*Ở đây, **$id** là giá trị của khóa ngoại (foreign key), và mảng thứ hai chứa các cột bổ sung cùng giá trị của chúng.*

### Pivot quantity

```php
public function getFlavorsByProduct(Product $product)
{
    // Eager load the flavors relation with pivot data
    $flavors = $product->flavors()->get();

    // Collect flavor details along with quantity
    $flavorDetails = $flavors->map(function ($flavor) {
        return [
            'id' => $flavor->id,
            'name' => $flavor->name,
            'quantity' => $flavor->pivot->quantity, // Truy xuất quantity từ bảng pivot
        ];
    });

    return $flavorDetails;
}


```

### Lấy toàn bộ flavors ra và nếu product có những flavors nào thì được đánh dấu lại

```php
public function getFlavorsWithCheckedStatus(Product $product)
{
    // Lấy tất cả các flavors
    $allFlavors = Flavor::all();

    // Lấy các id của flavors của sản phẩm
    $productFlavorIds = $product->flavors()->pluck('flavor_id')->toArray();

    // Lấy các mối quan hệ flavors của sản phẩm cùng với quantity
    $productFlavors = $product->flavors()->get(['flavor_id', 'quantity'])->keyBy('flavor_id');

    // Ánh xạ các flavors và thêm thông tin quantity
    $flavorsWithCheckedStatus = $allFlavors->map(function ($flavor) use ($productFlavorIds, $productFlavors) {
        return [
            'id' => $flavor->id,
            'name' => $flavor->name,
            'is_checked' => in_array($flavor->id, $productFlavorIds),
            'quantity' => $productFlavors->has($flavor->id) ? $productFlavors->get($flavor->id)->quantity : 0,
        ];
    });

    return $flavorsWithCheckedStatus;
}

```

- **$allFlavors->map(...)**:
  - *map* được gọi trên *$allFlavors*, là một collection chứa tất cả các bản ghi từ bảng flavors.
  - *map* sẽ lặp qua từng phần tử trong *$allFlavors* (mỗi phần tử là một đối tượng Flavor).

- **Hàm callback**:
  - Hàm callback được truyền vào map có một tham số $flavor đại diện cho từng phần tử trong *$allFlavors*.
  - use (*$productFlavorIds*, *$productFlavors*) là cú pháp để sử dụng các biến bên ngoài hàm callback trong hàm callback.

- **Lặp qua từng phần tử ($flavor)**:
  - Đối với mỗi flavor, hàm callback sẽ tạo ra một mảng kết hợp với các thông tin:
    - *id*: ID của flavor.
    - *name*: Tên của flavor.
    - *is_checked*: Kiểm tra xem ID của flavor có nằm trong mảng *$productFlavorIds* hay không. Nếu có, giá trị là true, ngược lại là false.
    - *quantity*: Kiểm tra xem flavor có tồn tại trong mảng *$productFlavors* không. Nếu có, lấy giá trị *quantity* tương ứng, nếu không, gán giá trị là 0.

Cụ thể:

```php
// $allFlavors:
[
    (object) ['id' => 1, 'name' => 'Flavor X'],
    (object) ['id' => 2, 'name' => 'Flavor Y'],
    (object) ['id' => 3, 'name' => 'Flavor Z'],
]

// ------------------------------------------------

// $productFlavorIds:
[1, 2]

// ------------------------------------------------

// $productFlavors:
[
    1 => (object) ['flavor_id' => 1, 'quantity' => 10],
    2 => (object) ['flavor_id' => 2, 'quantity' => 5],
]

// ------------------------------------------------


```

### update Product-Flavors

```php
public function updateProductFlavors(Product $product, $newFlavors, $quantity)
{
    $currentFlavorIds = $this->getFlavorIDByProduct($product);
    $newFlavorIds = array_map('intval', $newFlavors); // Chuyển các ID thành integer

    // flavors cần thêm mới
    $flavorsToAdd = array_diff($newFlavorIds, $currentFlavorIds);

    // flavors cần xóa
    $flavorsToRemove = array_diff($currentFlavorIds, $newFlavorIds);

    // Cập nhật flavors mới
    foreach ($flavorsToAdd as $flavorId) {
        $this->storeProductFlavor($product, $flavorId, $quantity[$flavorId]);
    }

    // Xóa flavors không còn trong danh sách mới
    foreach ($flavorsToRemove as $flavorId) {
        $this->deleteProductFlavor($product, $flavorId);
    }

    // Cập nhật quantity cho flavors hiện tại (nếu có thay đổi)
    foreach ($newFlavorIds as $flavorId) {
        if (in_array($flavorId, $currentFlavorIds)) {
            $this->updateProductFlavorQuantity($product, $flavorId, $quantity[$flavorId]);
        }
    }
}

```

### Update Pivot

```php
public function updateProductFlavorQuantity(Product $product, $flavorId, $quantity)
{
    // Lấy số lượng hiện tại của hương vị từ bảng pivot
    $currentQuantity = $product->flavors()->wherePivot('flavor_id', $flavorId)->first()->pivot->quantity;

    // Chỉ cập nhật nếu số lượng mới khác với số lượng hiện tại
    if ($currentQuantity != $quantity) {
        $product->flavors()->updateExistingPivot($flavorId, ['quantity' => $quantity]);
    }
}

```

## Accessor

- Product Model

```php
// Accessor để tính tổng quantity
public function getTotalQuantityAttribute()
{
    return $this->flavors->sum(function ($productFlavor) {
        return $productFlavor->pivot->quantity;
    });
}

```

- Service method

```php
public function getProductsAndImages()
{
    $products = Product::with(['mainImage', 'flavors'])->get(); // Thêm 'flavors' vào để preload dữ liệu
    foreach ($products as $product) {
        $product->quantity = $product->total_quantity; // Sử dụng accessor
    }
    return $products;
}

```

Nếu định nghĩa một phương thức trong model với tên **get\<FieldName\>Attribute**, có thể truy cập nó như một thuộc tính bằng cách sử dụng tên **field_name**.

## Helper Format Currency

- Tạo một file helper mới trong thư mục app/Helpers: **currency_helper.php**

```php
<?php

if (!function_exists('format_currency')) {
    /**
     * Format the given number as currency.
     *
     * @param  int  $amount
     * @return string
     */
    function format_currency($amount)
    {
        return number_format($amount, 0, ',', '.') . '₫';
    }
}

```

- **Tự động tải Helper**:
Để tự động tải helper, bạn cần thêm nó vào file composer.json. Mở file composer.json và thêm helper của bạn vào mục autoload như sau:

```json
"autoload": {
    "files": [
        "app/Helpers/CurrencyHelper.php"
    ]
}

```

- Sau đó, chạy lệnh **composer dump-autoload** để tải lại các file autoload
- Có thể chạy format_currency() ở mọi nơi

## Order

### VNpay online payment

- Tham khảo docs:
  - [bài đọc trên viblo](https://viblo.asia/p/tich-hop-cong-thanh-toan-vnpay-voi-laravel-Az45bGD6KxY)
  - [docs](https://sandbox.vnpayment.vn/apis/docs/thanh-toan-pay/pay.html)

- Code:

#### Controller

```php
<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Payment;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;

use App\Services\Interfaces\CartServiceInterface;


class VNPayController extends Controller
{
    protected $cartService;

    public function __construct(
        CartServiceInterface $cartService,
    ) {
        $this->cartService = $cartService;
    }

    public function createPayment($encryptedOrderId)
    {
        $orderId = Crypt::decrypt($encryptedOrderId);

        // Lấy đối tượng Order từ ID
        $order = Order::findOrFail($orderId);

        // Xác minh người dùng hiện tại có quyền truy cập vào đơn hàng
        if ($order->user_id !== Auth::id()) {
            throw new Exception('Bạn không có quyền truy cập vào đơn hàng này.');
        }

        // dd((int) $order->total_amount);

        error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED);
        date_default_timezone_set('Asia/Ho_Chi_Minh');

        $vnp_Url = env('VNP_URL');
        $vnp_Returnurl = env('VNP_RETURN_URL');
        $vnp_TmnCode = env('VNP_TMN_CODE');
        $vnp_HashSecret = env('VNP_HASH_SECRET');

        $vnp_TxnRef = (string) $order->id; // Sử dụng order_id làm mã đơn hàng
        $vnp_OrderInfo = "Thanh toán đơn hàng";
        $vnp_OrderType = 'billpayment';
        $vnp_Amount = (int) $order->total_price * 100; // Giả sử tổng số tiền đơn hàng được lưu trong trường total_amount của bảng orders
        $vnp_Locale = 'vn';
        $vnp_BankCode = '';
        $vnp_IpAddr = $_SERVER['REMOTE_ADDR'];

        $inputData = array(
            "vnp_Version" => "2.1.0",
            "vnp_TmnCode" => $vnp_TmnCode,
            "vnp_Amount" => $vnp_Amount,
            "vnp_Command" => "pay",
            "vnp_CreateDate" => date('YmdHis'),
            "vnp_CurrCode" => "VND",
            "vnp_IpAddr" => $vnp_IpAddr,
            "vnp_Locale" => $vnp_Locale,
            "vnp_OrderInfo" => $vnp_OrderInfo,
            "vnp_OrderType" => $vnp_OrderType,
            "vnp_ReturnUrl" => $vnp_Returnurl,
            "vnp_TxnRef" => $vnp_TxnRef,
        );

        if (isset($vnp_BankCode) && $vnp_BankCode != "") {
            $inputData['vnp_BankCode'] = $vnp_BankCode;
        }

        ksort($inputData);
        $query = "";
        $i = 0;
        $hashdata = "";

        foreach ($inputData as $key => $value) {
            if ($i == 1) {
                $hashdata .= '&' . urlencode($key) . "=" . urlencode($value);
            } else {
                $hashdata .= urlencode($key) . "=" . urlencode($value);
                $i = 1;
            }
            $query .= urlencode($key) . "=" . urlencode($value) . '&';
        }

        $vnp_Url = $vnp_Url . "?" . $query;
        if (isset($vnp_HashSecret)) {
            $vnpSecureHash = hash_hmac('sha512', $hashdata, $vnp_HashSecret);
            $vnp_Url .= 'vnp_SecureHash=' . $vnpSecureHash;
        }

        return redirect($vnp_Url);
    }

    public function returnPayment(Request $request)
    {
        $vnp_HashSecret = env('VNP_HASH_SECRET');

        $inputData = $request->all();
        $vnp_SecureHash = $inputData['vnp_SecureHash'];
        unset($inputData['vnp_SecureHashType']);
        unset($inputData['vnp_SecureHash']);
        ksort($inputData);
        $hashData = "";
        foreach ($inputData as $key => $value) {
            $hashData .= urlencode($key) . "=" . urlencode($value) . "&";
        }
        $hashData = rtrim($hashData, '&');
        // dd($hashData);

        $secureHash = hash_hmac('sha512', $hashData, $vnp_HashSecret);

        $orderId = (int) $inputData['vnp_TxnRef'];
        $order = Order::find($orderId);

        try {
            if ($secureHash == $vnp_SecureHash) {
                if ($order) {
                    if ($order->total_price == $inputData['vnp_Amount'] / 100) {
                        if ($order->status == 'pending') {
                            if ($inputData['vnp_ResponseCode'] == '00' || $inputData['vnp_TransactionStatus'] == '00') {
                                $this->savePayment($inputData, true);
                                $order->status = 'processing';
                                $order->save();
                                $this->cartService->removeCartByUser(Auth::user());
                                session()->forget('phone');
                                session()->forget('address');
                                return redirect()->route('order.show')->with('success', 'Thanh toán thành công.');
                            } else {
                                return redirect()->route('cart.index')->with('error', 'Thanh toán thất bại.');
                            }
                        } else {
                            return redirect()->route('order.show')->with('info', 'Đơn hàng đã được xác nhận.');
                        }
                    } else {
                        return redirect()->route('cart.index')->with('error', 'Số tiền không hợp lệ.');
                    }
                } else {
                    return redirect()->route('cart.index')->with('error', 'Không tìm thấy đơn hàng.');
                }
            } else {
                return redirect()->route('cart.index')->with('error', 'Chữ ký không hợp lệ.');
            }
        } catch (Exception $e) {
            return redirect()->route('cart.index')->with('error', 'Lỗi không xác định.');
        }
    }

    protected function savePayment($inputData, $status)
    {
        $orderId = (int) $inputData['vnp_TxnRef'];

        Payment::create([
            'order_id' => $orderId,
            'transaction_no' => $inputData['vnp_TransactionNo'],
            'response_code' => $inputData['vnp_ResponseCode'],
            'amount' => $inputData['vnp_Amount'] / 100,
            'bank_code' => $inputData['vnp_BankCode'],
            'pay_date' => $inputData['vnp_PayDate'],
            'status' => $status
        ]);
    }
}

```

- Route:

```php
Route::get('vnpay-payment/{order}', [VNPayController::class, 'createPayment'])->name('vnpay.payment');
Route::get('vnpay-return', [VNPayController::class, 'returnPayment'])->name('vnpay.return');

```

### GHTK - Shipping fee

- API: [1](https://khachhang.giaohangtietkiem.vn/web/thong-tin-shop/tai-khoan), [2](https://docs.giaohangtietkiem.vn/?shell#t-nh-ph-v-n-chuy-n)

- code:

```php
public function calculateShippingFee(): string
{
    $orderData = $this->getTemporaryData();
    // dd($orderData);
    $total_price = $orderData['total_price'];
    $total_weight = 0;

    foreach ($orderData['items'] as $item) {
        $product = Product::find($item['product_id']);
        $total_weight += $item['quantity'] * $product->weight;
    }

    // Helper function to parse the address
    function parseAddress(string $address): array
    {
        $address_parts = array_map('trim', explode(",", $address));
        $province_name = array_pop($address_parts);
        $district_name = array_pop($address_parts);
        $ward_name = array_pop($address_parts);
        $address_detail = implode(", ", $address_parts);

        return [
            'province_name' => $province_name,
            'district_name' => $district_name,
            'ward_name' => $ward_name,
            'address_detail' => $address_detail
        ];
    }

    $to_address = session('address') ?? session('original_address');
    $from_address = session('shop_address');

    $to_address_parsed = parseAddress($to_address);
    $from_address_parsed = parseAddress($from_address);

    $data = [
        "pick_province" => $from_address_parsed['province_name'],
        "pick_district" => $from_address_parsed['district_name'],
        "province" => $to_address_parsed['province_name'],
        "district" => $to_address_parsed['district_name'],
        "address" => $to_address_parsed['address_detail'] . ", " . $to_address_parsed['ward_name'],
        "weight" => $total_weight,
        "value" => $total_price,
        "transport" => "road",
        "deliver_option" => "none",
        "tags" => [1]
    ];

    try {
        $response = Http::withHeaders([
            'Token' => env('GHTK_TOKEN'),
        ])->post(env('GHTK_URL'), $data);

        $responseData = $response->json();

        if (isset($responseData['success']) && $responseData['success']) {
            return (string)$responseData['fee']['fee'];
        } else {
            return 'Failed to calculate shipping fee: ' . ($responseData['message'] ?? 'Unknown error');
        }
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
}

```

## ElasticSearch Config

### Config

- Đầu tiên run elasticeSearch container: **Tuy nhiên hãy kéo xuống dưới phần này để đọc bug http/https về container trước tiên**

```sh
docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" docker.elastic.co/elasticsearch/elasticsearch:8.7.0

```

- **Tiến hành cài Laravel Scout và ElasticScoutDriverPlus**

```sh
composer require laravel/scout
composer require babenkoivan/elastic-scout-driver-plus

php artisan vendor:publish --provider="Laravel\Scout\ScoutServiceProvider"
```

- **config/scout.php**

- Chỉnh sửa file cấu hình:
  - Đổi giá trị driver thành elastic.
  - Thêm cấu hình cho Elasticsearch.

```php
return [

    'driver' => env('SCOUT_DRIVER', 'elastic'),

    // Các cấu hình khác...

    'elasticsearch' => [
        'hosts' => [
            env('ELASTICSEARCH_HOST', 'localhost:9200'),
        ],
    ],
];

```

- **.env**

```sh
SCOUT_DRIVER=elastic
ELASTICSEARCH_HOST=localhost:9200

```

- Model:

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Laravel\Scout\Searchable;

class User extends Model
{
    use HasFactory, Searchable;

    //...

    public function searchableAs()
    {
        return 'flavors_index';
    }

    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}


```

- **Tạo và đồng bộ chỉ mục:**

```sh
php artisan scout:import "App\Models\Flavor"
php artisan scout:import "App\Models\User"
php artisan scout:import "App\Models\Category"
php artisan scout:import "App\Models\Product"


```

### Fix bug

- Khi chạy lệnh scout:import mà gặp lỗi: **Call to undefined method App\Models\Flavor::makeAllSearchable()**: Tức là do chưa sử dụng trait **Searchable**: "*After installing the libraries, you need to add Elastic\ScoutDriverPlus\Searchable trait to your models. In case some models already use the standard Laravel\Scout\Searchable trait, you should replace it with the one provided by Elastic Scout Driver Plus.*" [from github](https://github.com/babenkoivan/elastic-scout-driver-plus/tree/master)

- Khi gặp lỗi: **Method Illuminate\Database\Eloquent\Collection::withSearchableRelations does not exist.**. Tiến hành check logs của **elasticsearch** container:

```sh
docker logs elasticsearch

```

Và nhận được: **received plaintext http traffic on an https channel, closing connection**: Điều này chỉ ra rằng Elasticsearch đang mong đợi lưu lượng HTTPS nhưng nhận được lưu lượng HTTP. Do đó, nó đóng kết nối.

- Để giải quyết vấn đề này, có thể thực hiện một trong hai cách:
  - Kích hoạt HTTP (không bảo mật): Cấu hình Elasticsearch để chấp nhận lưu lượng HTTP.
  - Sử dụng HTTPS: Cấu hình ứng dụng Laravel để sử dụng HTTPS khi kết nối với Elasticsearch.

Do đang dev ở local nên sẽ fix bằng cách dùng http như sau:

- **Tạo file cấu hình elasticsearch.yml với nội dung sau:**:

```sh
xpack.security.enabled: false
http.host: 0.0.0.0
discovery.type: single-node

# snapshot
path.repo: /usr/share/elasticsearch/backups 
```

- **Run container mới**:

```sh
docker run -d --name elasticsearch -p 9200:9200 -p 9300:9300 -e "discovery.type=single-node" -v $(pwd)/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml docker.elastic.co/elasticsearch/elasticsearch:8.7.0

```

- **Có thể check connect bằng cách:**

```sh
curl -X GET 'http://localhost:9200'

{
  "name" : "8eab380bc62f",
  "cluster_name" : "elasticsearch",
  "cluster_uuid" : "R8h7DixkSxePTQv085dDbg",
  "version" : {
    "number" : "8.7.0",
    "build_flavor" : "default",
    "build_type" : "docker",
    "build_hash" : "09520b59b6bc1057340b55750186466ea715e30e",
    "build_date" : "2023-03-27T16:31:09.816451435Z",
    "build_snapshot" : false,
    "lucene_version" : "9.5.0",
    "minimum_wire_compatibility_version" : "7.17.0",
    "minimum_index_compatibility_version" : "7.0.0"
  },
  "tagline" : "You Know, for Search"
}

```

Nếu response về là json như trên thì nó đã work

Thử lại và không còn lỗi:

```sh
➜ e-commerce-project ⚡( master)                  
▶ php artisan scout:import "App\Models\Product"

Imported [App\Models\Flavor] models up to ID: 32
All [App\Models\Flavor] records have been imported.

```

### Snapshot

```sh
docker run -d --name elasticsearch \
  -p 9200:9200 -p 9300:9300 \
  -v $(pwd)/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml \
  -v /path/to/your/backups:/usr/share/elasticsearch/backups \
  docker.elastic.co/elasticsearch/elasticsearch:8.7.0


curl -X PUT "localhost:9200/_snapshot/my_backup" -H 'Content-Type: application/json' -d'
{
  "type": "fs",
  "settings": {
    "location": "/usr/share/elasticsearch/backups",
    "compress": true
  }
}
'

curl -X GET "localhost:9200/_snapshot/_all"

curl -X POST "http://localhost:9200/app_index/_close"
curl -X POST "elasticsearch:9200/_snapshot/my_backup/snapshot_1/_restore"

```

### Code

**Ví dụ cho Model Flavor**

- Model

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
// use Laravel\Scout\Searchable;
use Elastic\ScoutDriverPlus\Searchable;

class Flavor extends Model
{
    use HasFactory, Searchable;

    protected $fillable = [
        'name',
    ];

    // public function productFlavors()
    // {
    //     return $this->hasMany(ProductFlavor::class, "flavor_id");
    // }

    public function carts()
    {
        return $this->hasMany(CartItem::class, 'flavor_id');
    }

    public function products()
    {
        return $this->belongsToMany(Product::class, 'product_flavors')
            ->withPivot('quantity');
    }

    public function searchableAs()
    {
        return 'flavors_index';
    }

    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
        ];
    }
}


```

- Route

```php
Route::get('flavors', [FlavorController::class, 'index'])->name('admin.flavors.index');

```

- Controller

```php
public function index(Request $request)
{
    $search = $request->input('search');
    $flavors = $this->flavorService->getAll($search);
    return view('admin.pages.flavor.flavors', [
        'flavors' => $flavors,
        'page' => 'Flavors',
        'search' => $search
    ]);
}

```

- Service

```php
public function getAll($search = null)
{
    if ($search) {
        return Flavor::search($search)->get();
    }

    return Flavor::all();
}

```

- View

```php
<form action="{{ route('admin.flavors.index') }}" method="GET"
    class="form-material mt-2">
    <div class="form-group form-primary">
        <input type="text" name="search" class="form-control"
            value="{{ request('search') }}" placeholder=" ">

        <span class="form-bar"></span>

        <label class="float-label"><i class="fa fa-search m-r-10"></i> 
            Search by Name
        </label>
    </div>
</form>

```

### Triển khai search các phần nhỏ hơn của từ (token)

#### Cơ chế hoạt động của **edge n-grams**

Là một phương pháp phân tích từ ngữ trong Elasticsearch. Khi sử dụng **edge n-grams**, Elasticsearch sẽ phân tách các từ thành các đoạn nhỏ hơn (n-grams) từ đầu từ. Ví dụ, từ "Banana" có thể được phân tách thành các n-grams như *"Ba", "Ban", "Bana", "Banan", "Banana".*

#### Tạo chỉ mục với **edge n-grams** analyzer

- Tạo chỉ mục với cấu hình **edge n-grams**: Trước tiên, cần gửi một yêu cầu HTTP để tạo chỉ mục mới trong Elasticsearch với cấu hình **edge n-grams**. Có thể sử dụng công cụ như curl hoặc một plugin như Sense trong Kibana.

```sh
curl -X PUT "localhost:9200/app_index" -H 'Content-Type: application/json' -d'
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
        "search_analyzer": "standard"
      },
      "type": {
        "type": "keyword"
      }
    }
  }
}
'

```

- **Cấu hình để dùng chung 1 index cho nhiều model:**

```php
use Elastic\ScoutDriverPlus\Searchable;

class Flavor extends Model
{
    use HasFactory, Searchable;

    protected $fillable = [
        'name',
    ];

    public function searchableAs()
    {
        return 'app_index';
    }

    public function toSearchableArray()
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'type' => 'flavor',
        ];
    }
}

```

- **Thêm type khi search để chắc chắn lấy đúng dữ liệu của model**:

```php
public function getAll($search = null)
{
    if ($search) {
        return Flavor::search($search)->where('type', 'flavor')->get();
    }

    return Flavor::all();
}

```

- **Đồng bộ dữ liệu**: Sau khi tạo chỉ mục mới, cần đồng bộ dữ liệu từ Laravel vào chỉ mục mới này.

```sh
php artisan scout:import "App\Models\Flavor"

```

## VPS Config

```sh
sudo adduser your_username

sudo usermod -aG sudo your_username

su your_username

```

- Install [docker](https://docs.docker.com/engine/install/ubuntu/), [docker compose](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-compose-on-ubuntu-20-04)

## Triển khai elasticService, không dùng Laravel Scout

### elasticService

```php
<?php

namespace App\Services;

use App\Services\Interfaces\ElasticsearchServiceInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException; // Import ClientException
use Illuminate\Support\Facades\Log;

/**
 * Class ElasticsearchService
 * @package App\Services
 */
class ElasticsearchService implements ElasticsearchServiceInterface
{
    protected $client;
    protected $host;

    public function __construct()
    {
        $this->client = new Client();
        $this->host = env('ELASTICSEARCH_HOST');
    }

    public function search($index, $type, $search)
    {
        $ids = collect();
        try {
            $response = $this->client->get("{$this->host}/{$index}/_search", [
                'json' => [
                    'query' => [
                        'bool' => [
                            'must' => [
                                ['match' => ['type' => $type]],
                                ['match' => ['name' => $search]]
                            ]
                        ]
                    ],
                    '_source' => false // Chỉ lấy _id, không lấy dữ liệu khác
                ]
            ]);

            $results = json_decode($response->getBody()->getContents(), true);

            $ids = collect($results['hits']['hits'])->pluck('_id');
        } catch (ClientException $e) {
            if ($e->getResponse()->getStatusCode() == 404) {
                Log::error("Elasticsearch index [{$index}] not found: " . $e->getMessage());
            } else {
                throw $e;
            }
        }

        return $ids;
    }

    public function syncModel($model, $type)
    {
        $data = [
            'id' => $model->id,
            'name' => $model->name,
            'type' => $type
        ];
        $this->indexDocument('app_index', $model->id, $data);
    }

    public function deleteDocument($index, $id)
    {
        try {
            $response = $this->client->delete("{$this->host}/{$index}/_doc/{$id}");
            return json_decode($response->getBody()->getContents(), true);
        } catch (ClientException $e) {
            Log::error("Failed to delete document from Elasticsearch index [{$index}]: " . $e->getMessage());
            throw $e;
        }
    }

    public function indexDocument($index, $id, $data)
    {
        try {
            $response = $this->client->post("{$this->host}/{$index}/_doc/{$id}", [
                'json' => $data
            ]);

            return json_decode($response->getBody()->getContents(), true);
        } catch (ClientException $e) {
            Log::error("Failed to index document in Elasticsearch [{$index}]: " . $e->getMessage());
            throw $e;
        }
    }

    public function deleteIndex($index)
    {
        try {
            $response = $this->client->delete("{$this->host}/{$index}");
            return json_decode($response->getBody()->getContents(), true);
        } catch (ClientException $e) {
            Log::error("Failed to delete Elasticsearch index [{$index}]: " . $e->getMessage());
            throw $e;
        }
    }

    public function removeModel($model)
    {
        $this->deleteDocument('app_index', $model->id);
    }
}

```

- **$this->client->get("{$this->host}/{$index}/_search", [...])**: http get gửi tới elasticsearch để thực hiện tìm kiếm trên index chỉ định

- **'json' => [...]**: chứa nội dung json để xác định điều kiện search

- **Truy vấn**:

```php
'query' => [
    'bool' => [
        'must' => [
            ['match' => ['type' => $type]],
            ['match' => ['name' => $search]]
        ]
    ]
],
'_source' => false // Chỉ lấy _id, không lấy dữ liệu khác

```

- **query**: là phần chính của câu truy vấn tìm kiếm:
- **bool**: dùng để kết hợp các điều kiện tìm kiếm khác nhau như: **must**, **should**, **must_not**, **filter**
- **must**: pải thỏa điều kiện
- **['match' => ['type' => $type]]**: điều kiện yêu cầu trường type phải thỏa chỉ định
- **'_source' => false**: chỉ định không trả về toàn bộ nội dung của document mà chỉ lấy về ID

- **Kết quả trả về**:

```json
{
  "hits": {
    "total": {
      "value": 2,
      "relation": "eq"
    },
    "max_score": 1.0,
    "hits": [
      {
        "_index": "app_index",
        "_id": "1",
        "_score": 1.0,
        "_source": {
          "type": "category",
          "name": "Laptop"
        }
      },
      {
        "_index": "app_index",
        "_id": "2",
        "_score": 0.9,
        "_source": {
          "type": "category",
          "name": "Desktop"
        }
      }
    ]
  }
}

```

- Lấy kết quả:

```php
$results = json_decode($response->getBody()->getContents(), true); //true return về mảng liên kết, false return về object
$ids = collect($results['hits']['hits'])->pluck('_id');

```

### Category Model

```php
public static function boot()
{
    parent::boot();

    static::saved(function ($category) {
        app(ElasticsearchService::class)->syncModel($category, 'category');
    });

    static::deleted(function ($category) {
        app(ElasticsearchService::class)->removeModel($category);
    });
}

```

### reindex command, search on name

```php
namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Flavor;
use App\Models\Product;
use App\Models\User;
use Illuminate\Console\Command;
use App\Services\Interfaces\ElasticsearchServiceInterface;

class ReindexAllModelsKeepName extends Command
{
    protected $elasticsearchService;

    public function __construct(ElasticsearchServiceInterface $elasticsearchService)
    {
        parent::__construct();
        $this->elasticsearchService = $elasticsearchService;
    }

    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reindex:simple';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Reindex all models into Elasticsearch, keeping only id and name fields';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        // Xóa chỉ mục cũ trước khi reindex
        $this->elasticsearchService->deleteIndex('app_index');

        // Reindex tất cả các model
        $this->reindexModel(Product::class, 'product');
        $this->reindexModel(Flavor::class, 'flavor');
        $this->reindexModel(Category::class, 'category');
        $this->reindexModel(User::class, 'user');

        $this->info('All models reindexed successfully with only id and name!');
    }

    protected function reindexModel($modelClass, $type)
    {
        $records = $modelClass::all();

        foreach ($records as $record) {
            $data = [
                'id' => $record->id,
                'name' => $record->name,
                'type' => $type
            ];
            $this->elasticsearchService->indexDocument('app_index', $record->id, $data);
        }

        $this->info("Reindexed {$modelClass} with type {$type}");
    }
}


```

## Production

### docker-compose

```yml
services:
  gymstore-website:
    build:
      context: .
      dockerfile: Dockerfile
    image: gymstore-website
    container_name: gymstore-website
    restart: unless-stopped
    environment:
      SERVICE_NAME: app
      SERVICE_TAGS: dev
    working_dir: /var/www
    volumes:
      - ./docker/php-fpm/php-fpm.conf:/usr/local/etc/php-fpm.d/zz-docker.conf
    depends_on:
      - mysql
      - elasticsearch
    networks:
      - laravel

  nginx:
    image: nginx:alpine
    container_name: nginx
    restart: unless-stopped
    ports:
      - "443:443"
    volumes:
      - .:/var/www
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/snippets/fastcgi-php.conf:/etc/nginx/snippets/fastcgi-php.conf
      - /home/hjn4/ssl/gymstore.io.vn/:/etc/nginx/ssl:ro
    depends_on:
      - gymstore-website
    networks:
      - laravel

  mysql:
    image: mysql:8.0.32
    container_name: mysql
    restart: unless-stopped
    env_file:
      - ./docker/sql/.env
    volumes:
      - mysql_data:/var/lib/mysql
    networks:
      - laravel

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.7.0
    container_name: elasticsearch
    ulimits:
      memlock:
        soft: -1
        hard: -1
    volumes:
      - es_data:/usr/share/elasticsearch/data
      - ./docker/elastic-search/elasticsearch.yml:/usr/share/elasticsearch/config/elasticsearch.yml
      - ./docker/elastic-search/backups:/usr/share/elasticsearch/backups
    networks:
      - laravel

  ml-detect-malware-jpeg:
    image: hjn4/ml-detect-malware-jpeg:v1
    container_name: ml-detect-malware-jpeg
    networks:
      - laravel

volumes:
  mysql_data:
  es_data:

networks:
  laravel:
    driver: bridge
    
```

### Docker folder

```sh
.
├── elastic-search
│   └── elasticsearch.yml         
├── entrypoint.sh
├── nginx
│   ├── nginx.conf
│   └── snippets
│       └── fastcgi-php.conf
└── php-fpm
    └── php-fpm.conf

```

### Dockerfile

```dockerfile
FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libwebp-dev \
    libonig-dev \
    locales \
    zip \
    jpegoptim optipng pngquant gifsicle \
    vim \
    unzip \
    git \
    curl

RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp && \
    docker-php-ext-install -j$(nproc) pdo_mysql mbstring exif pcntl bcmath gd

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

COPY . .

RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf

COPY ./docker/php-fpm/php-fpm.conf /usr/local/etc/php-fpm.d/zz-docker.conf

COPY ./docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

```

### entrypoint.sh

```sh
#!/bin/bash

php-fpm

```

### nginx.conf

```sh
user  nginx;
worker_processes  auto;
error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    keepalive_timeout  65;

    include /etc/nginx/conf.d/*.conf;

    server {
        listen 80;
        server_name gymstore.io.vn www.gymstore.io.vn;
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl;
        server_name gymstore.io.vn www.gymstore.io.vn;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;
        # include /etc/nginx/ssl/options-ssl-nginx.conf;
        ssl_dhparam /etc/nginx/ssl/ssl-dhparams.pem;

        root /var/www/public;
        index index.php index.html;

        location / {
            try_files $uri $uri/ /index.php?$query_string;
        }

        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            fastcgi_pass gymstore-website:9000;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            include fastcgi_params;
        }

        location ~ /\.ht {
            deny all;
        }
    }
}


```

### nginx/snippets/fastcgi-php.conf

```sh
fastcgi_split_path_info ^(.+\.php)(/.+)$;
fastcgi_index index.php;
include fastcgi_params;
fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
fastcgi_param PATH_INFO $fastcgi_path_info;

```

### php-fpm/php-fpm.conf

```sh
[global]
daemonize = no

[www]
listen = 9000

```

#### Nginx nhận yêu cầu từ người dùng

- Khi người dùng gửi một yêu cầu HTTP đến máy chủ (ví dụ: <https://gymstore.io.vn>), **Nginx** sẽ nhận yêu cầu này.
- Nếu yêu cầu là cho một file tĩnh (như CSS, JS, hình ảnh), **Nginx** có thể tự xử lý mà không cần chuyển tiếp yêu cầu đi đâu khác.
- Nếu yêu cầu là một URL cần được xử lý bởi PHP (như một URL dẫn đến một trang **Laravel**), **Nginx** sẽ chuyển tiếp yêu cầu này đến **PHP-FPM** thông qua giao thức **FastCGI**.

#### Nginx chuyển tiếp yêu cầu PHP đến PHP-FPM

- **Nginx** sử dụng cấu hình trong file nginx.conf để xác định rằng các yêu cầu liên quan đến file PHP (location ~ \.php$ { ... }) sẽ được chuyển tiếp đến **PHP-FPM**.
- Cấu hình **FastCGI** chỉ định rằng **Nginx** sẽ chuyển các yêu cầu PHP đến địa chỉ nội bộ **gymstore-website:9000**, đây là nơi **PHP-FPM** đang lắng nghe.

#### PHP-FPM nhận và xử lý yêu cầu

- **PHP-FPM** là công cụ quản lý tiến trình PHP, giúp thực thi mã PHP hiệu quả hơn. Nó xử lý mã PHP của **Laravel**
- **Laravel** sử dụng **PHP-FPM** để xử lý các yêu cầu HTTP và thực thi logic của ứng dụng.
- Khi nói **PHP-FPM** xử lý mã **Laravel**, có nghĩa là **PHP-FPM** đang thực thi mã PHP của **Laravel** để xử lý các yêu cầu đến ứng dụng.

- Ở môi trường dev, khi triển khai **Laravel** + **Apache** sẽ không cần **PHP-FPM**, do là *Apache* có mô-đun tích hợp gọi là **mod_php** (hoặc **libapache2-mod-php** trên *Debian/Ubuntu*) để xử lý các tệp PHP trực tiếp, thay vì cần đến **PHP-FPM** như khi triển khai với *Nginx*.
