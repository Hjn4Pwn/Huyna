# Artisan Command

- **php artisan config:cache**

- **php artisan migrate**

- **php artisan make:migration create_admins_table --create=admins**

- **php artisan migrate:rollback**

*php artisan make:migration add_payment_province_district_ward_to_users_table --create=users*

- **php artisan make:controller Admin/DashboardController**

- **php artisan make:request AdminAuthRequest**

- **php artisan make:model Admin -mrc**  : model - controller (-r for resource controller) - migration

- **php artisan db:seed**
- **php artisan make:factory AdminFactory --model=Admin**

- **php artisan make:middleware AdminAuthMiddleware**

<!-- Create service -->
- **composer require getsolaris/laravel-make-service --dev**
- **php artisan make:service UserService --i**  <!-- interface -->

- **php artisan make:controller UserController --model=User --resource --requests**

- **php artisan storage:link**
