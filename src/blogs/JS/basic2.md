# Basic Concepts 2

## Json

```json
data = {
  "id": "AWcvsjx864kVeDHDi2gB",
  "timestamp": 1542693469197,
  "description": "This network device leaf2.abc.inc is unreachable from controller. The device role is ACCESS.",
  "actualServiceId": "10.10.20.82",
  "assignedTo": "",
  "enrichmentInfo": {
    "issueDetails": {
      "issue": [
        {
          "issueId": "AWcvsjx864kVeDHDi2gB",
          "issuePriority": "",
          "issueSummary": "Network Device 10.10.20.82 Is Unreachable From Controller",
          "issueTimestamp": 1542693469197,
          "suggestedActions": [
            {
              "message": "From the controller, verify whether the last hop is reachable.",
              "steps": []
            },
            {
              "message": "Verify access to the device.",
              "steps": []
            }
          ],
          "impactedHosts": [
            {
              "hostName": "DUT",
              "failedAttempts": 3,
              "location": {
                "siteId": "SanJose",
                "apsImpacted": []
              },
              "timestamp": 1542693469197
            }
          ]
        }
      ]
    },
    "connectedDevice": [
      {
        "deviceDetails": {
          "inventoryStatusDetail": "<status><general code=\"SNMP_TIMEOUT\"/></status>",
          "lastUpdateTime": 1542693255158,
          "errorDescription": "SNMP timeouts are occurring with this device. Either the SNMP credentials are not correctly provided to controller or the device is responding slow and snmp timeout is low. If its a timeout issue, controller will attempt to progressively adjust the timeout in subsequent collection cycles to get device to managed state. User can also run discovery again only for this device using the discovery feature after adjusting the timeout and snmp credentials as required. Or user can update the timeout and snmp credentials as required using update credentials.",
          "tagCount": "0",
          "lastUpdated": "2018-11-20 05:54:15",
          "id": "a7633ae5-d3c9-4aea-837d-c3ad5b19c802",
          "neighborTopology": [
            {
              "errorCode": 5000,
              "message": "An internal has error occurred while processing this request.",
            }
          ],
          "cisco360view": "https://10.10.20.22/dna/assurance/home#networkDevice/a7633ae5-d3c9-4aea-837d-c3ad5b19c802"
        }
      }
    ]
  }
}

```

## Promise

### Sync

*Đồng bộ*

### Async

*Bất đồng bộ*

- setTimeout
- setInterval
- fetch
- XMLHttpRequest
- Read file
- request animation frame

*callback giúp xử lý trạng thái bật đồng bộ*

### Problem

Khi các tác vụ bị ràng buộc với nhau, ví dụ tác n chỉ được chạy khi tác vụ thứ n-1 đã chạy xong => phải dùng callback lồng callback (**callback hell**) => sinh ra thẳng promise giúp giải quyết vấn đề này

### Basic

- *Promise* sinh ra để xử lý các thao tác bất đồng bộ
- Trước khi có *promise* thì ta dùng callback, có 1 vấn đề là callback hell, code sẽ bị sâu vào khó hiểu
- *Promise* sinh ra để khắc phục tình trạng callback hell, giúp code dễ đọc dễ hiểu hơn
- Dùng new tạo *Promise*, trong *contructor* truyền vào 1 *executor* function, truyền vào 2 tham số là function, 1 là **resolve**, 2 là **reject**
- Call **resolve** khi thao tác xử lý thành công và ngược lại
- Dùng *promise* sẽ có 3 method là *.then*, *.catch*, *.finally*
- cả 3 đều nhận callback function, then được thực thi khi *promise* **resolve** và ngược lại

### Format code

```js
/**
 * Có 3 trạng thái:
 * 1. Pendding: Đang wait cho thành công hay thất bại
 * 2. Fulfilled
 * 3. Rejected
 */

let promise = new Promise(
    // Executor
    function (resolve, reject) {
        /**
         * Logic
         * Thành công => call resolve()
         * Thất bại => call reject()
         * 
         * Pải call 1 trong 2 nếu không sẽ gây ra Mem leak
         */

        // resolve(); // return 1 3
        // reject(); // return 2 3

        // fake call API
        resolve(
            [
                {
                    id: 1,
                    name: "JS"
                }
            ]
        );

    }
);

promise
    // 1
    // .then(function () {
    //     console.log('Successfully!');
    // })

    .then(function (course) {
        console.log(course);
    })


    // 2
    .catch(function () {
        console.log('Failure!');
    })

    // 3
    .finally(function () {
        console.log('Done!');
    })

```

### Promise chain

*Tính chất nối chuỗi, tức là then sau sẽ đợi return data từ then trước (nếu nó resolve)*

Tức là kết quả trả về của function đằng trước là input của function đằng sau

```js
let promise = new Promise(
    function (resolve, reject) {
        resolve();
    }
);

promise
    .then(function () {
        return 1;
    })
    .then(function (data) {
        console.log(data);
        return 2;
    })
    .then(function (data) {
        console.log(data);
        return 3;
    })
    .then(function (data) {
        console.log(data);
    })
    .catch(function () {
        console.log('Failure!');
    })

    .finally(function () {
        console.log('Done!');
    })


```

#### return promise

```js


let promise = new Promise(
    function (resolve, reject) {
        resolve();
    }
);

promise
    .then(function () {
        /**
         * Nếu return ra bất cứ cái gì không phải promise
         * thì 
         * thằng đằng sau sẽ chạy ngay khi được return
         * 
         * Nếu return promise
         * thì
         * thằng đằng sau phải đợi promise xử lý xong mới được chạy
         * 
         * Lúc này promise được return, có method .then bên dưới
         * Tương tự như việc khởi tạo promise và gọi .then như thông thường
         */

        // arrow function (recommend)
        return new Promise((resolve, reject) => {
            // setTimeout(reject, 3000);
            setTimeout(resolve, 3000);
        })
    })
    /**
     * Thằng then này được xem là method của promise được
     * return ở thằng then trước nó. 
     * 
     * Nó phải đợi promise xử lí logic xong và call resolve thì mới được thực thi
     * Nếu promise ở trên reject thì nó nhảy đến call catch như thông thường
     */
    .then(function () {
        console.log('Successfully!');
    })
    .catch(function () {
        console.log('Failure!');
    })

    .finally(function () {
        console.log('Done!');
    })

```

```js
function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

sleep(1000)
    .then(() => {
        console.log(1);
        return sleep(1000);
    }).then(() => {
        console.log(2);
        return sleep(1000);
    }).then(() => {
        console.log(3);
        return new Promise((resolve, reject) => {
            reject();
        });
    }).then(() => {
        console.log(4); // skip do reject ở trên nó
        return sleep(1000);
    }).catch(() => {
        console.log("Error");
    });

```

### Promise all-resolve-reject

```js
let promiseResolve = Promise.resolve(); // return promise always resolve
// Promise.reject()
promiseResolve
    .then(() => {
        console.log("Success");
    }).catch(() => {
        console.log("Error");
    });

// -------------------------------------- //

let promise1 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve([1, 2])
    }, 2000);
});

let promise2 = new Promise((resolve, reject) => {
    setTimeout(() => {
        resolve([3, 4, 5])
    }, 5000);
});

/**
 * Gộp các thằng xử lý độc lập, có thể chạy song song với nhau
 * Promise.all sẽ đợi các promise chạy xong
 * Nếu 1 thằng có lỗi thì nó kệ hết nhảy vô catch
 */
Promise.all([promise1, promise2])
    .then((result) => {
        console.log(result);
        console.log(result[0].concat(result[1]));
    }).catch((err) => { 
        console.log("Error");
    });

```

## Var - Let - Const

```js
/**
 * var vs (let, const): scope
 * 
 * var hoạt động cả trong và ngoài block, tức là khai bảo ở trong block, vẫn truy vấn được từ bên ngoài
 * 
 * let, const thì khai báo ở block chỉ dùng được trong block đó và con của block đó
 */

{
    var myStr = "Huy Na";
    // let myStr = "Huy Na"; //error
}
console.log(myStr);

// -------------------------------------- //

/**
 * var vs (let, const): hosting
 * Browser sẽ mang cái định nghĩa biến lên trên đầu
 */

a = 1;
var a;
// let a; // error

console.log(a);

// -------------------------------------- //

/**
 * const vs (let, var): assignment
 * const không cho phép gán lần 2 cho CHÍNH BIẾN đó
 */

const a = 1;
a = 2; // error

const myObl = {
    name: "huyna"
}

myObl.name = "Hjn4";
console.log(myObl); // OK


```

## Arrow function

```js



const sum = (a, b) => a + b;

/**
 * sau "=>" không dùng {} nếu không sẽ bị hiểu là {return...}
 * Do đó để return object thì bọc ngoài bằng ()
 */
const returnObj = (a, b) => ({ a: a, b: b });

const oneArgument = log => console.log(log);

console.log(sum(2, 3));
console.log(returnObj(2, 3));
console.log(oneArgument("Có thể bỏ dấu () nếu chỉ có 1 argument"));


/**
 * Function bình thường có thể dùng "this" trong phương thức để chỉ obj call đến nó
 * Tuy nhiên arrow function không hỗ trợ "this"
 * 
 * Arrow function không thể dùng làm contructor function
 */

```

## Destructuring - Rest parameters

### Destructuring

```js
// ---------------- Array ----------------
let arr = ["JS", "PHP", "Python"];

// let [a, b, c] = arr;
let [a, , c] = arr;

console.log(a, c); // JS Python


// ---------------- Object ----------------
let course = {
    name: "JS",
    price: "1000",
    version: "v1",
    childObj: {
        name: "PHP"
    }
};
// let { name } = course;
// console.log(name); // JS
let { name: parentName, childObj: { name: childName } } = course;
console.log(parentName, childName); // JS PHP
```

### Rest parameters

```js
// ---------------- Array ----------------
let arr = ["JS", "PHP", "Python"];

let [a, ...rest] = arr;

console.log(a);
console.log(rest); // phần tử còn lại

// ---------------- Object ----------------

let course = {
    name: "JS",
    price: "1000",
    version: "v1"
};

// let { name, version } = course;
let { name, ...rest } = course;

// console.log(name);
// console.log(version);
console.log(rest);  // {price: '1000', version: 'v1'}

// ---------------- Function ----------------
function logger(a, b, ...params) {
    console.log(a); // 1
    console.log(b); // 2
    console.log(params); // [3, 4, 5, 6]
}

logger(1, 2, 3, 4, 5, 6);

```

### Rest + Destructuring

```js
// ---------------- Object ----------------
function logger({ name, price, ...rest }) {
    console.log(name); // js
    console.log(price); // 1000
    console.log(rest); // {desc: 'haiz', type: 'demo'}
}

logger({
    name: "js",
    price: 1000,
    desc: "haiz",
    type: "demo"
});

// ---------------- Array ----------------
function logger([a, b, ...rest]) {
    console.log(a); // 1
    console.log(b); // 2
    console.log(rest); // [3, 4]
}

logger([1, 2, 3, 4]);
```

## Spread

*Lấy content bên trong*

```js
// ---------------- Array ----------------
let arr1 = ["JS", "PHP"];

let arr2 = ["C++", "Python"]

let arr3 = [...arr2, ...arr1];

console.log(arr3); //  ['C++', 'Python', 'JS', 'PHP']


// ---------------- Object ----------------
let obj1 = {
    name: "JS",
    price: "1000"
};
let obj2 = {
    ...obj1,
    price: "1",
    type: "demo"
};

console.log(obj2); //  {name: 'JS', price: '1', type: 'demo'}

// ---------------- Combine rest & spread ----------------
let array = ["JS", "PHP", "Python"];

function logger(...rest) { // rest parameters
    console.log(rest); //  ['JS', 'PHP', 'Python']
}

logger(...array); // spread

```

## Tagged template literals

```js
const hightlight = (...rest) => {
    console.log(rest);

    /**
     * [Array(3), 'Laptop', 'HCM']
     * 
     * 0: Array(3)
     *      0: "Buy "
     *      1: " at "
     *      2: ""
     * 1: "Laptop"
     * 2: "HCM"
     * 
     */
};

let device = "Laptop";
let place = "HCM";

hightlight`Buy ${device} at ${place}`;

```

## Module

[ref](https://www.youtube.com/watch?v=08lWi4T2Bfg&list=PL_-VfJajZj0VgpFpEVFzS5Z-lkXtBe-x5&index=103)
