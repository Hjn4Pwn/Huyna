# IAM - *Identity and Access Management*

- [IAM](#iam)
- [Policy](#policy)
- [Role](#role)
- [Resource policy](#resource-policy)
- [config access key CLI](#config-access-key-cli)
- [check MFA policy](#mfa)
- [Role-Ec2-FullS3Access](#role_ec2)
- [assume role](#assume-role)
- [switch role](#switch-role)
- [Best practice IAM](#best-practice-iam)
- **For more reference**:
  - [install cli aws](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
  - [CLI authenticate token MFA](https://repost.aws/knowledge-center/authenticate-mfa-cli)
  - [manage MFA user](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_aws_my-sec-creds-self-manage-mfa-only.html)

## IAM

*Identity and Access Management*

Nhiệm vụ là định danh phân quyền, quản lý việc ai, cái gì có thể access như thế nào tới các resource trên AWS

## policy

Có thể định nghĩa ai/ cái gì có thể làm gì hoặc không làm gì

- Effect: Allow or Deny (Deny được ưu tiên hơn nếu có conflict)
- Action: tập hợp các hành động
- Resource: tập hợp các resource cho phép tương tác
- [Condition]: Điều kiện kèm theo (time, mfa,...)

Policy có thể gắn vào Role/Group/User

Có 2 loại:

- Inline Policy: Được đính trực tiếp trên Role/group/user và không thể tái sử dụng
- Managed Policy: Này như cái option đi kèm thoi, có thể tái sử dụng và gắn thoải mái trên role/group/user

## role

Là quyền được dùng để:

- Gán cho các resource để nó tương tác với nhau, ví dụ gán cho EC2 cho phép nó tương tác với S3, vì nếu không có các role này thì các resource sẽ không tự connect và làm việc với nhau
- Assume role, switch role: **for later**

## resource-policy

Tương tự như IAM policy tuy nhiên nó sẽ được gán dô cái resource cụ thể.
Quyền của resource cao hơn, và quyền của user sẽ được tổng hợp cả IAM lẫn resource policy

IAM policy và resource policy đều không có tác dụng với account root

Demo resource policy gắn trên S3, để deny user dev-01 có thể tương tác với 1 bucket cụ thể:

```py
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "test-resource-policy",
            "Effect": "Deny",
            "Principal": {
                "AWS": "arn:aws:iam::681333694768:user/dev-01"
            },
            "Action": "s3:*",
            "Resource": [
                "arn:aws:s3:::test-hjn4",
                "arn:aws:s3:::test-hjn4/*"
            ]
        }
    ]
}

```

## config-access-key-cli

security credentials -> roll down -> access key -> ... -> download csv

```shell
➜ AWS ⚡                                                                      21:02:05
▶ aws configure
AWS Access Key ID [****************YKHC]: AKIAZ5IVHEEYHZUB2YMA
AWS Secret Access Key [****************4CKM]: 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
Default region name [ap-southeast-1]:
Default output format [json]:

➜ AWS ⚡                                                                      21:06:10
▶ aws sts get-caller-identity
{
    "UserId": "AIDAZ5IVHEEYBNDND253T",
    "Account": "681333694768",
    "Arn": "arn:aws:iam::681333694768:user/dev-01"
}

➜ AWS ⚡                                                                      21:07:43
▶ aws s3 ls
2024-01-21 20:52:58 test-hjn4

➜ AWS ⚡                                                                      21:11:55
▶ aws s3 ls s3://test-hjn4/
2024-01-21 20:40:11     383190 zoro_image.jpg

➜ AWS ⚡                                                                      21:12:30
▶ aws s3 cp s3://test-hjn4/zoro_image.jpg .
download: s3://test-hjn4/zoro_image.jpg to ./zoro_image.jpg
```

## mfa

setup policy cho việc là user phải bật policy mới được phép tướng tác với các resource

- [manage MFA user](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_aws_my-sec-creds-self-manage-mfa-only.html)

```py
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowViewAccountInfo",
            "Effect": "Allow",
            "Action": "iam:ListVirtualMFADevices",
            "Resource": "*"
        },
        {
            "Sid": "AllowManageOwnVirtualMFADevice",
            "Effect": "Allow",
            "Action": [
                "iam:CreateVirtualMFADevice"
            ],
            "Resource": "arn:aws:iam::*:mfa/*"
        },
        {
            "Sid": "AllowManageOwnUserMFA",
            "Effect": "Allow",
            "Action": [
                "iam:DeactivateMFADevice",
                "iam:EnableMFADevice",
                "iam:GetUser",
                "iam:GetMFADevice",
                "iam:ListMFADevices",
                "iam:ResyncMFADevice"
            ],
            "Resource": "arn:aws:iam::*:user/${aws:username}"
        },
        {
            "Sid": "DenyAllExceptListedIfNoMFA",
            "Effect": "Deny",
            "NotAction": [
                "iam:CreateVirtualMFADevice",
                "iam:EnableMFADevice",
                "iam:GetUser",
                "iam:ListMFADevices",
                "iam:ListVirtualMFADevices",
                "iam:ResyncMFADevice",
                "sts:GetSessionToken"
            ],
            "Resource": "*",
            "Condition": {
                "BoolIfExists": {"aws:MultiFactorAuthPresent": "false"}
            }
        }
    ]
}
```

attach policy này vào group muốn filter

Dùng Console thì ta có thể nhập code thông qua app authentication, cơ mà nếu dùng CLI thì không có chỗ nhập mã code, do đó ta cần config:

- phát hành temporary token
- config credential file
- chỉ định --profile cụ thể khi run command

- [CLI authenticate token MFA](https://repost.aws/knowledge-center/authenticate-mfa-cli)

**aws sts get-session-token --serial-number arn-of-the-mfa-device --token-code code-from-token**

Trong đó:

- **arn-of-the-mfa-device**: là arn của MFA của user đó, chứ không pải arn của user
- **code-from-token**: này là code mà user phải nhập lúc đăng nhặp trên console, cơ mà thay vì nhập ở đó ta sẽ gõ vô đây

```shell
➜ AWS ⚡                                                                      21:13:19
▶ aws s3 ls s3://test-hjn4/

An error occurred (AccessDenied) when calling the ListObjectsV2 operation: Access Denied

➜ AWS ⚡                                                                     21:20:47
▶ aws sts get-session-token --serial-number arn:aws:iam::681333694768:mfa/dev-01-phone --token-code 698227
{
    "Credentials": {
        "AccessKeyId": "ASIAZ5IVHEEYGQ4YQHMH",
        "SecretAccessKey": "X/paoqB2qi88U5y5Im7kWdrTHZaT9LSh+E66U7sF",
        "SessionToken": "IQoJb3JpZ2luX2VjEHcaDmFwLXNvdXRoZWFzdC0xIkYwRAIgHzMokdWrV74wqM/z9g0hbxphIkeWttiIOl9Rs9oklLUCIBd2WYytjYson4IlDGGoPP0looOFIshc5gcIymK4JqUkKu8BCDAQABoMNjgxMzMzNjk0NzY4IgyVbV+T35x+ZQFcBvAqzAE9FPmGOHnhtNuX3rV1i/KZVKUZAyms1utzKNccm6QYAI4bE8Fvl+4wH5KGTLdie6mmhT4EP2jTCFKj3d/TluT/FVe00DNRWZn+V+K4oPDLEDzDhbYpcf3N4xXb3rCWWO8lesst9L2ZKWUxuKPjZ/akPbxxSCKIMwDnE3z91TTgJMu9BuMewf6HBft62WjuELFkyI4laCauyrdrDrGrYHciTYbfTze5Bxmk8LAcw/mFBtPC6POop7LJdq0f5epWNgQVIOyg/bWBzZCNaMcwl9i0rQY6mQHC7INntEJmQny4phC97w8O3l5zjHtoPf7fLICKHu8sUIyqCAEKd6vjXbC9cxtoxTdTBM483DPOyQ1a9dMXxtLwH82FnR9WRdLlblRKjjIrOPvjICTzyw2IsCbmkgDswPEqd3Zp6/pvSDrK7Pp0GEM13g5JnghXPJoo4cw0oCwg63ckwIj5xXvaCTaLHK7g1+cOHxwekpRsWUs=",
        "Expiration": "2024-01-22T02:37:11+00:00"
    }
}

```

Lúc này ta sẽ đi config file **credentials** trong thư mục .aws ở home folder của user hiện tại trên máy, như bên dưới, và dùng **--profile test-mfa** để chỉ định profile. token này 8 tiếng sẽ bị expired do đó sau đó sẽ cần cấu hình lại

```py
➜ .aws ⚡                                                                    21:45:17
▶ cat credentials
[default]
aws_access_key_id = AKIAZ5IVHEEYHZUB2YMA
aws_secret_access_key = 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


[test-mfa]
aws_access_key_id = ASIAZ5IVHEEYGQ4YQHMH
aws_secret_access_key = X/paoqB2qi88U5y5Im7kWdrTHZaT9LSh+E66U7sF
aws_session_token = IQoJb3JpZ2luX2VjEHcaDmFwLXNvdXRoZWFzdC0xIkYwRAIgHzMokdWrV74wqM/z9g0hbxphIkeWttiIOl9Rs9oklLUCIBd2WYytjYson4IlDGGoPP0looOFIshc5gcIymK4JqUkKu8BCDAQABoMNjgxMzMzNjk0NzY4IgyVbV+T35x+ZQFcBvAqzAE9FPmGOHnhtNuX3rV1i/KZVKUZAyms1utzKNccm6QYAI4bE8Fvl+4wH5KGTLdie6mmhT4EP2jTCFKj3d/TluT/FVe00DNRWZn+V+K4oPDLEDzDhbYpcf3N4xXb3rCWWO8lesst9L2ZKWUxuKPjZ/akPbxxSCKIMwDnE3z91TTgJMu9BuMewf6HBft62WjuELFkyI4laCauyrdrDrGrYHciTYbfTze5Bxmk8LAcw/mFBtPC6POop7LJdq0f5epWNgQVIOyg/bWBzZCNaMcwl9i0rQY6mQHC7INntEJmQny4phC97w8O3l5zjHtoPf7fLICKHu8sUIyqCAEKd6vjXbC9cxtoxTdTBM483DPOyQ1a9dMXxtLwH82FnR9WRdLlblRKjjIrOPvjICTzyw2IsCbmkgDswPEqd3Zp6/pvSDrK7Pp0GEM13g5JnghXPJoo4cw0oCwg63ckwIj5xXvaCTaLHK7g1+cOHxwekpRsWUs=

➜ .aws ⚡                                                                     21:45:20
▶ aws s3 ls --profile test-mfa
2023-12-05 21:17:54 test-hjn4

```

## role_ec2

Đầu tiên ta sẽ tiến hành create role fulls3Acess rồi gán vào instance:

```sh
[ec2-user@ip-172-31-36-127 ~]$ aws s3 ls
Unable to locate credentials. You can configure credentials by running "aws configure".

[ec2-user@ip-172-31-36-127 ~]$ aws s3 ls
2024-01-21 14:12:30 test-hjn4
```

## trust policy

Như tên của nó thì là nó sẽ cho biết nó trust đối tượng nào, tức là cho phép thằng nào assume/switch tới nó (role)

![Alt text](./image/trust_policy.png)

## assume-role

assume role cho phép có quyền tạm thời để tương tác với 1 cái resource có thể là trên cùng hoăc khác account root.

Ví dụ account root A của ta có user là dev-01, thg dev-01 này muốn tương tác với cái resource nào đấy hay có tác vụ cần thiết nào đấy trên account root B nhưng ta lại không muốn dùng accout root B tạo thêm profile user, thì ta có thể dùng assume role để cấp cho 1 cái quyền tạm thời, để dev-01 có thể làm việc với resource ở account root B, root B có thể quản lý thời gián

Cơ mà để làm đc thì ta cần 1 cái trust policy

Demo:

- Đầu tiên ta sẽ xóa user dev-01 khỏi các group => hiện tại user này không có quyền gì cả
- Tiếp theo ta sẽ tiến hành add inline policy cho phép dev-01 **PassRole**
- Tiếp đến sẽ tiến hành tạo 1 role **PowerUser**, thiết lập trust policy cho phép dev-01 có thể assume role sang role **PowerUser** này.

![Alt text](./image/policy_assume_role.png)

Vào check thử xem có còn tương tác với S3 được nữa không

```sh
➜ .aws ⚡                                                                     21:55:08
▶ aws s3 ls --profile test-mfa

An error occurred (AccessDenied) when calling the ListBuckets operation: Access Denied

```

Tiến hành assume role bằng CLI

```sh
➜ .aws ⚡                                                                     22:30:15
▶ aws sts assume-role --role-arn "arn:aws:iam::681333694768:role/poweruser_trust_policy" --role-session-name AWSCLI-AssumeRole
{
    "Credentials": {
        "AccessKeyId": "ASIAZ5IVHEEYFCCX6LN5",
        "SecretAccessKey": "pyK8QCuyfIaPiOTTGsYXJ48o8c76Qpln/daNEGX8",
        "SessionToken": "IQoJb3JpZ2luX2VjEHgaDmFwLXNvdXRoZWFzdC0xIkgwRgIhAPy+ECiSsy9O8cwcEUqWCgEtx1alvLI/NJsIGD+uaJ0WAiEAlf6CH1tH1/4Xwrl8ZAz1MoK7qkvATXdGOG3AcBfDVs0qngIIMRAAGgw2ODEzMzM2OTQ3NjgiDGI9w9L2MN6G4DnbEyr7AbMqHpE15SjQQHKtPQPqQjSE87NMUTaA1IWG4fXM9cjmAvJYDKiMqp+7mCRrp72Y3Q3IfLXQ0qdf4Pr3XrQqwKL1oSVjBg0L63FbIawq/DTbM9L76/R2PROjEDjWqk97eVoFgI7KqSL/2rejiR0cpqZ4FNDhz6PVd2/CZ++MGP8YV1GwVFN9WZSYwcQMtxU0nCdkZzCwN+k4ukavocG2duSW0ojonvTltUDon8IRwaf86t3XSSsZ1T1DEEAS02QPpViG10XTMGG2ucYIl4fL7BTB9QEUpruWYEIKrolpfUmwY6V8/8ETa466Q2dMJF4BoTkE1E/PDSH+g0liMPLytK0GOpwBy2chkqT0oF5NaqJDNn/+7DESjx/OICr4giYy35LZz4rl9u4wBXJdoC1LRIlbgCEWCLdaLoKWcJJ9JfWVQN0hSCsRRprexCb4wC+h5BEbo5ygc+SNfTSEwBdv6Dq6xsw5LQAG0UYT2Bg1ZRhwNv+xf2jcvn753ppcpTimLEIOOqkLhmh9MjIDvQm0JZ+sUmdyl9eyP/HAGo3Bw2FU",
        "Expiration": "2024-01-21T16:34:10+00:00"
    },
    "AssumedRoleUser": {
        "AssumedRoleId": "AROAZ5IVHEEYCLSKJSX6A:AWSCLI-AssumeRole",
        "Arn": "arn:aws:sts::681333694768:assumed-role/poweruser_trust_policy/AWSCLI-AssumeRole"
    }
}               

```

Trong đó:

- **arn:aws:iam::681333694768:role/poweruser_trust_policy**: là arn của role cần assume sang đó
- **AWSCLI-AssumeRole**: tên mình đặt

Tiến hành cấu hình file:

```sh
➜ .aws ⚡                                                                     22:34:04
▶ gedit credentials


➜ .aws ⚡                                                                     22:35:47
▶ cat credentials
[default]
aws_access_key_id = AKIAZ5IVHEEYHZUB2YMA
aws_secret_access_key = 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


[test-mfa]
aws_access_key_id = ASIAZ5IVHEEYGQ4YQHMH
aws_secret_access_key = X/paoqB2qi88U5y5Im7kWdrTHZaT9LSh+E66U7sF
aws_session_token = IQoJb3JpZ2luX2VjEHcaDmFwLXNvdXRoZWFzdC0xIkYwRAIgHzMokdWrV74wqM/z9g0hbxphIkeWttiIOl9Rs9oklLUCIBd2WYytjYson4IlDGGoPP0looOFIshc5gcIymK4JqUkKu8BCDAQABoMNjgxMzMzNjk0NzY4IgyVbV+T35x+ZQFcBvAqzAE9FPmGOHnhtNuX3rV1i/KZVKUZAyms1utzKNccm6QYAI4bE8Fvl+4wH5KGTLdie6mmhT4EP2jTCFKj3d/TluT/FVe00DNRWZn+V+K4oPDLEDzDhbYpcf3N4xXb3rCWWO8lesst9L2ZKWUxuKPjZ/akPbxxSCKIMwDnE3z91TTgJMu9BuMewf6HBft62WjuELFkyI4laCauyrdrDrGrYHciTYbfTze5Bxmk8LAcw/mFBtPC6POop7LJdq0f5epWNgQVIOyg/bWBzZCNaMcwl9i0rQY6mQHC7INntEJmQny4phC97w8O3l5zjHtoPf7fLICKHu8sUIyqCAEKd6vjXbC9cxtoxTdTBM483DPOyQ1a9dMXxtLwH82FnR9WRdLlblRKjjIrOPvjICTzyw2IsCbmkgDswPEqd3Zp6/pvSDrK7Pp0GEM13g5JnghXPJoo4cw0oCwg63ckwIj5xXvaCTaLHK7g1+cOHxwekpRsWUs=

[test-assume]
aws_access_key_id = ASIAZ5IVHEEYFCCX6LN5
aws_secret_access_key = pyK8QCuyfIaPiOTTGsYXJ48o8c76Qpln/daNEGX8
aws_session_token = IQoJb3JpZ2luX2VjEHgaDmFwLXNvdXRoZWFzdC0xIkgwRgIhAPy+ECiSsy9O8cwcEUqWCgEtx1alvLI/NJsIGD+uaJ0WAiEAlf6CH1tH1/4Xwrl8ZAz1MoK7qkvATXdGOG3AcBfDVs0qngIIMRAAGgw2ODEzMzM2OTQ3NjgiDGI9w9L2MN6G4DnbEyr7AbMqHpE15SjQQHKtPQPqQjSE87NMUTaA1IWG4fXM9cjmAvJYDKiMqp+7mCRrp72Y3Q3IfLXQ0qdf4Pr3XrQqwKL1oSVjBg0L63FbIawq/DTbM9L76/R2PROjEDjWqk97eVoFgI7KqSL/2rejiR0cpqZ4FNDhz6PVd2/CZ++MGP8YV1GwVFN9WZSYwcQMtxU0nCdkZzCwN+k4ukavocG2duSW0ojonvTltUDon8IRwaf86t3XSSsZ1T1DEEAS02QPpViG10XTMGG2ucYIl4fL7BTB9QEUpruWYEIKrolpfUmwY6V8/8ETa466Q2dMJF4BoTkE1E/PDSH+g0liMPLytK0GOpwBy2chkqT0oF5NaqJDNn/+7DESjx/OICr4giYy35LZz4rl9u4wBXJdoC1LRIlbgCEWCLdaLoKWcJJ9JfWVQN0hSCsRRprexCb4wC+h5BEbo5ygc+SNfTSEwBdv6Dq6xsw5LQAG0UYT2Bg1ZRhwNv+xf2jcvn753ppcpTimLEIOOqkLhmh9MjIDvQm0JZ+sUmdyl9eyP/HAGo3Bw2FU

```

Cuối cùng đã có thể assume role thành công:

```sh
➜ .aws ⚡                                                                    22:35:15
▶ aws s3 ls --profile test-assume
2023-12-05 21:17:54 test-hjn4

```

***Note: Lúc mà create role có lỡ quên config trust policy thì sau đó có thể config lại bằng cách vô tab trust relationships***

***túm cái váy lại role ở đây là 1 cái luật 1 cái rule cho phép ai đó làm gì đó, ở cái role này ta sẽ thiết lập cái trust policy thể hiện kiểu tin tưởng ai đó trong khoảng tgian nào đó được dùng cái role này, để rồi thg đó là có thể assume cái role này trong 1 khoảng tgian nhất định, kiểu có quyền trong 1 tgian nào đó***

## switch-role

sẽ rời bỏ account ban đầu và qua tương tác với các resource của account thứ 2. ***review on udemy***

- **Add policy cho phép assume role cho user cần switch role**
- **Bên thằng cho switch sang thì cần add trust policy**

## best-practice-iam

- sử dụng group để gán quyền cho các user, không gán riêng lẻ
- cấp quyền vừa đủ cho user, không cấp thừa hay thiếu
- chú yếu các deny rule tránh conflict
- Luôn setup mfa cho user (không bật mfa => miễn tương tác với resource)
- Không share access/secret key giữa các member/team của 1 dự án
