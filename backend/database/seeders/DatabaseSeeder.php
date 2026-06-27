<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Seed langsung dari SQL file
        // Atau jalankan: mysql -u root orderlink < ../database/orderlink.sql

        // Quick seed via PHP:
        User::firstOrCreate(['email' => 'admin@orderlink.com'], [
            'name' => 'Admin Distributor',
            'password' => Hash::make('password'),
            'role' => 'distributor',
            'phone' => '081234567890',
            'company_name' => 'PT OrderLink Indonesia',
            'is_active' => true,
        ]);

        User::firstOrCreate(['email' => 'retailer@orderlink.com'], [
            'name' => 'Toko Maju Jaya',
            'password' => Hash::make('password'),
            'role' => 'retailer',
            'phone' => '082345678901',
            'company_name' => 'Toko Maju Jaya',
            'is_active' => true,
        ]);

        User::firstOrCreate(['email' => 'driver@orderlink.com'], [
            'name' => 'Budi Santoso',
            'password' => Hash::make('password'),
            'role' => 'driver',
            'phone' => '083456789012',
            'is_active' => true,
        ]);

        // Produk & kategori sudah di-seed via database/orderlink.sql
        // Jalankan: mysql -u root orderlink < ../database/orderlink.sql
    }
}
