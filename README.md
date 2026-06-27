# 🔗 OrderLink - Platform Distribusi & Pengiriman B2B

![OrderLink Banner](https://raw.githubusercontent.com/imbran776/orderlink-repo/main/banner.png) <!-- placeholder, update this later -->

Platform pemesanan grosir end-to-end yang efisien, dengan pelacakan pengiriman real-time, portal multi-role untuk Distributor, Retailer, dan Driver, serta REST API terintegrasi. Dirancang untuk meningkatkan efisiensi operasional dan visibilitas rantai pasok.

---

## 🚀 Demo Aplikasi

**Link Demo Live:** [Belum Tersedia, Akan Diupdate Setelah Deployment]

### Akun Demo (Login untuk Eksplorasi)

Anda dapat login dengan berbagai peran untuk mencoba fungsionalitas aplikasi:

| Peran       | Email                      | Password   |
| :---------- | :------------------------- | :--------- |
| **Admin**   | `admin@example.com`        | `password` |
| **Distributor** | `distributor@example.com`  | `password` |
| **Retailer**| `retailer@example.com`     | `password` |
| **Driver**  | `driver@example.com`       | `password` |

### Gambaran Fungsionalitas Tiap Peran:

#### 🧑‍💼 Sebagai Distributor
- **Dashboard Overview:** Lihat metrik penjualan, order pending, stok menipis, dan armada aktif.
- **Manajemen Produk:** Tambah, edit, hapus produk dan kategori.
- **Manajemen Order:** Konfirmasi order dari retailer, lacak status pengiriman.
- **Manajemen Stok:** Pantau pergerakan stok, lakukan penyesuaian.
- **Manajemen Pengguna:** Kelola akun retailer dan driver.
- **Laporan:** Akses laporan penjualan dan performa.

#### 🛍️ Sebagai Retailer
- **Katalog Produk:** Jelajahi produk, tambahkan ke keranjang, buat order baru.
- **Order Saya:** Lacak status order yang telah dibuat, lihat riwayat.
- **Notifikasi:** Dapatkan update real-time tentang status order dan promosi.

#### 🚚 Sebagai Driver
- **Tugas Pengiriman:** Terima dan kelola daftar pengiriman yang ditugaskan.
- **Update Status:** Perbarui status pengiriman (on-the-way, delivered).
- **Bukti Pengiriman:** Unggah foto bukti pengiriman.

---

## ✨ Fitur Unggulan

Lihat detail fitur lengkap yang ditawarkan OrderLink di [`FEATURES.md`](./FEATURES.md).

---

## 🛠️ Tech Stack

OrderLink dibangun menggunakan teknologi modern untuk performa dan skalabilitas:

-   **Frontend:** React.js, Vite, Tailwind CSS, React Query
-   **Backend (API):** Laravel 11, PHP 8.3, Laravel Sanctum, MySQL
-   **Realtime:** Node.js, Socket.IO
-   **Database:** MySQL
-   **Package Manager:** Composer (PHP), NPM (JavaScript)
-   **Linter & Formatter:** Laravel Pint (PHP), ESLint, Prettier (JavaScript)
-   **Testing:** PHPUnit (PHP), Vitest (JavaScript)
-   **CI/CD:** GitHub Actions (Integrasi, Linting, Testing, Build Otomatis)

---

## ⚙️ Panduan Instalasi Lokal

Ikuti langkah-langkah berikut untuk menjalankan OrderLink di lingkungan lokal Anda.

### **Persyaratan Sistem:**

-   PHP >= 8.2
-   Node.js >= 18
-   Composer
-   MySQL >= 8.0 (atau SQLite untuk pengembangan)
-   Git

### **Langkah-langkah Instalasi:**

1.  **Clone Repositori:**
    ```bash
    git clone https://github.com/imbran776/orderlink-repo.git # Ganti dengan repo Anda nanti
    cd orderlink-repo
    ```

2.  **Konfigurasi Backend (Laravel):**
    ```bash
    cd backend
    cp .env.example .env
    composer install
    php artisan key:generate
    php artisan migrate:fresh --seed # Membuat tabel dan mengisi data dummy
    php artisan serve # Jalankan backend
    ```
    -   **Edit `.env`:** Sesuaikan konfigurasi database (DB_DATABASE, DB_USERNAME, DB_PASSWORD).

3.  **Konfigurasi Frontend (React + Vite):**
    ```bash
    cd ../frontend
    cp .env.example .env
    npm install
    npm run dev # Jalankan frontend
    ```
    -   **Edit `.env`:**
        ```
        VITE_API_URL=http://localhost:8000/api
        VITE_SOCKET_URL=http://localhost:3001
        ```

4.  **Konfigurasi Realtime (Node.js + Socket.IO):**
    ```bash
    cd ../realtime
    npm install
    npm start # Jalankan server realtime
    ```

5.  **Akses Aplikasi:**
    -   Buka browser Anda dan akses `http://localhost:5173` (port default Vite).

---

## 🤝 Kontribusi

Tertarik untuk berkontribusi? Silakan buka issue atau ajukan Pull Request.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](https://opensource.org/licenses/MIT).

---

## 👨‍💻 Dikembangkan oleh

[Imbran Darwis](https://www.instagram.com/ranzxyz77)

```