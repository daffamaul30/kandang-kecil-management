# PRD — Kandang Kecil

**Versi:** 1.0 (draft untuk implementasi)  
**Produk:** Kandang Kecil  
**Jenis:** Personal web application untuk manajemen kandang ayam dan feeder otomatis

## 1. Tujuan

Kandang Kecil adalah aplikasi web personal untuk mencatat dan mengelola koloni ayam, produksi telur, biaya operasional per siklus, laporan, serta monitoring dan kontrol feeder otomatis berbasis ESP32 di masa mendatang. Aplikasi harus mudah digunakan dari desktop maupun mobile.

## 2. Pengguna dan akses

- Single-user: pemilik/pengguna pribadi.
- Login menggunakan username dan password.
- Username awal: `kandangkecil`.
- Password awal dikonfigurasi saat deployment/setup; jangan dicantumkan di dokumen, source code, atau database sebagai plaintext.
- Tidak ada registrasi publik atau manajemen multi-user.
- Persistent session: pengguna tidak harus login ulang setiap membuka aplikasi selama sesi valid.
- Logout tersedia; sesi yang dicabut/kedaluwarsa mengharuskan login ulang.
- Autentikasi dan authorization wajib diperiksa server-side untuk endpoint dan data.

## 3. Brand dan desain

- Nama aplikasi: **Kandang Kecil**.
- Gunakan logo ayam dalam lingkaran hasil edit yang telah dipilih pengguna, tanpa teks di dalam/di bawah logo pada versi ikon.
- Jangan mengganti logo dengan logo referensi atau logo generik.
- Arah warna: burnt orange dan cokelat kemerahan yang diturunkan dari logo, dipadukan dengan background warm-neutral yang terang.
- UI minimalis, bersih, fungsional, responsif untuk desktop dan mobile, berbahasa Indonesia.

## 4. Tech stack

- Next.js sebagai framework utama (frontend dan backend/API dalam satu aplikasi pada tahap awal).
- TypeScript.
- Tailwind CSS.
- MongoDB sebagai database; MongoDB Atlas sebagai opsi deployment database cloud.
- Hosting online; Vercel merupakan kandidat.
- ESP32 untuk feeder otomatis di fase integrasi hardware.
- MQTT merupakan kandidat komunikasi IoT, belum menjadi keputusan final.
- Hindari microservices dan kompleksitas infra yang tidak diperlukan pada versi pertama.

## 5. Struktur navigasi

1. Dashboard
2. Koloni
3. Produksi Telur
4. Biaya
5. Siklus
6. Automatic Feeder
7. Reports
8. Pengaturan

## 6. Modul koloni

- CRUD koloni (buat, lihat, edit, dan nonaktifkan/hapus dengan perlindungan data yang sesuai).
- Setiap koloni memiliki nama/identitas.
- Catat dan edit jumlah ayam jantan dan betina.
- Total populasi dihitung otomatis.
- Populasi dapat diedit langsung; perubahan populasi tidak wajib memiliki event-log khusus pada v1.
- Aplikasi tidak boleh mengasumsikan jumlah koloni tetap dua. Feeder pada rencana awal ditujukan untuk dua koloni.

## 7. Modul produksi telur

- Catat total telur per koloni per tanggal.
- Tidak ada klasifikasi telur berdasarkan kualitas, grade, atau kondisi.
- Catatan produksi dapat diedit untuk koreksi.
- Total per hari, per koloni, dan akumulasi siklus dihitung otomatis.
- Data produksi terhubung dengan siklus yang aktif ketika catatan dibuat.

## 8. Modul biaya

Biaya bersifat global dan tidak dialokasikan ke koloni.

### 8.1 Pembelian pakan

- Catat transaksi pembelian pakan.
- Data transaksi setidaknya mencakup tanggal, nama barang, jumlah/satuan (detail satuan UX dapat ditentukan saat implementasi), nilai transaksi, dan catatan opsional.

### 8.2 Add-on

- Catat biaya vitamin, suplemen, dan kebutuhan tambahan.
- Data transaksi mencakup tanggal, nama/kategori barang, nilai, dan catatan opsional.

### 8.3 Perhitungan

- Total biaya pakan, total add-on, dan total biaya siklus dihitung otomatis.
- Akumulasi biaya terikat ke siklus berjalan.
- Histori biaya tiap siklus tetap tersedia.
- Tidak ada tracking konsumsi pakan harian pada v1.

## 9. Modul siklus

- Hanya satu siklus aktif pada satu waktu.
- Siklus memiliki tanggal mulai, status, tanggal penutupan, dan data terkait produksi serta biaya.
- Siklus aktif mengakumulasi produksi telur dan biaya.
- Tombol **Stok pakan habis** digunakan untuk menutup siklus dan memulai siklus baru.
- Tampilkan konfirmasi sebelum penutupan.
- Penutupan siklus tidak menghapus data lama.
- Siklus baru memulai akumulasi biaya dan produksi siklus dari nol.
- Siklus lama disimpan dan dapat dibuka.
- Histori siklus menampilkan tanggal, produksi, biaya pakan, biaya add-on, total biaya, dan simulasi margin.

## 10. Dashboard

Dashboard berfokus pada gambaran keseluruhan **siklus berjalan saja**. Analisis rentang tanggal lain berada pada Reports.

### 10.1 KPI utama

- Total telur kumulatif pada siklus aktif.
- Total populasi saat ini dari semua koloni.
- Margin simulasi berdasarkan harga Rp2.500/butir.
- Margin simulasi berdasarkan harga Rp3.000/butir.

Nilai produksi simulasi dihitung sebagai jumlah telur kumulatif dikalikan harga acuan. Margin simulasi = nilai produksi simulasi dikurangi total biaya siklus. Ini adalah simulasi sederhana, bukan laba bersih akuntansi.

### 10.2 Bagian dashboard

- KPI utama.
- Grafik tren produksi telur harian sepanjang siklus aktif.
- Perbandingan produksi per koloni selama siklus aktif.
- Ringkasan biaya pakan, add-on, dan total biaya; biaya tidak menjadi KPI dominan.
- Ringkasan automatic feeder: sisa pakan (%), status perangkat, dan aktivitas terbaru.
- Aktivitas terbaru: catatan produksi, transaksi biaya, dan aktivitas feeder.

Tidak perlu filter periode pada dashboard.

## 11. Modul Reports

- Halaman terpisah dari dashboard.
- Filter tanggal mulai dan tanggal akhir; rentang dapat melintasi siklus.
- Laporan produksi: total, tren harian, dan per koloni.
- Laporan biaya: pakan, add-on, dan total.
- Laporan margin simulasi menggunakan acuan Rp2.500 dan Rp3.000 per butir.
- Ringkasan dan detail histori siklus.
- Perbandingan periode jika didukung data yang relevan.
- Data populasi historis tidak dapat diasumsikan lengkap karena v1 tidak mewajibkan log perubahan populasi.

## 12. Automatic feeder (modul web + integrasi hardware)

Hardware belum dibuat. Web app perlu memiliki modul dan integrasi yang dirancang agar bisa dipasangkan dengan ESP32 nantinya.

### 12.1 Perangkat

- Dua wadah/feeder, masing-masing ditujukan untuk koloni yang berbeda.
- ESP32 sebagai controller.
- Monitoring sisa pakan dalam persentase saja (tidak perlu kg/gram pada UI).
- Monitoring online/offline dan status operasional.
- Kontrol manual untuk tiap feeder secara individual.
- Jadwal feeding yang bisa dibuat, diedit, diaktifkan, dan dinonaktifkan dari web.
- Log aktivitas.

### 12.2 Log

Catat aktivitas yang relevan, termasuk manual atau terjadwal, waktu, feeder, status eksekusi, dan kegagalan bila terjadi.

### 12.3 Belum ditentukan

- Sensor dan cara pengukuran level pakan.
- Mekanisme dispenser dan motor.
- Parameter kuantitas/durasi feeding.
- Protokol komunikasi final (MQTT adalah kandidat).
- Perilaku jadwal saat perangkat offline atau restart.
- Detail keselamatan dan interlock firmware.

Rancang API/komponen dengan batas modular agar detail hardware dapat ditentukan kemudian tanpa mengubah keseluruhan aplikasi.

## 13. Pengaturan

- Pengaturan dasar aplikasi.
- Pengaturan acuan harga simulasi dashboard/report: tetap gunakan dua acuan yang disepakati, Rp2.500 dan Rp3.000 per butir, kecuali kebutuhan konfigurasi kemudian ditinjau ulang.
- Tidak memerlukan pengaturan pengguna atau role pada v1.

## 14. Konsep koleksi MongoDB

Koleksi awal yang dipertimbangkan (nama dan bentuk final mengikuti desain data saat implementasi):

- `colonies`
- `eggProductions`
- `feedPurchases`
- `addonExpenses`
- `cycles`
- `feeders`
- `feederLogs`
- `feederSchedules`
- `settings`
- koleksi atau mekanisme untuk autentikasi/session

## 15. Non-functional requirements

- Responsive dan nyaman dipakai di mobile serta desktop.
- Validasi input pada client dan server.
- API/data dilindungi autentikasi dan authorization server-side.
- Password di-hash; jangan disimpan atau ditanam sebagai plaintext.
- Gunakan HTTPS pada deployment.
- Error handling yang jelas dan mencegah data duplikat/inkonsisten.
- Penutupan siklus harus aman, transaksional atau menggunakan pendekatan yang menjaga konsistensi data.
- Backup dan strategi pemulihan database harus direncanakan untuk deployment.
- Data historis siklus tidak boleh dihapus saat siklus baru dimulai.
- UI menampilkan keadaan kosong, loading, error, dan sukses dengan jelas.

## 16. Acceptance criteria utama

- Pengguna dapat login dengan credential yang dikonfigurasi dan sesi persisten.
- Pengguna dapat membuat/mengubah koloni dan populasi.
- Pengguna dapat mencatat serta mengoreksi produksi telur per koloni/tanggal.
- Pengguna dapat mencatat pembelian pakan dan biaya add-on.
- Aplikasi menghitung total produksi dan biaya siklus secara benar.
- Penutupan siklus membuat siklus baru tanpa menghilangkan histori.
- Dashboard menampilkan KPI, grafik, perbandingan koloni, ringkasan biaya, feeder, dan aktivitas untuk siklus aktif.
- Margin simulasi menampilkan dua skenario harga Rp2.500 dan Rp3.000 per telur.
- Reports dapat menampilkan data dalam rentang tanggal yang dipilih.
- Modul feeder memiliki UI monitoring/control/schedule/log yang siap diintegrasikan; status nyata hanya ditampilkan bila data perangkat tersedia, bukan disimulasikan sebagai live.
- UI responsive dan semua aksi utama memiliki validasi serta feedback.

## 17. Cara pengerjaan

Pengguna menginginkan pembangunan aplikasi secara **sekali jalan/menyeluruh**, bukan delivery fitur bertahap. Implementasi dapat dikerjakan sebagai satu proyek terpadu dengan seluruh modul yang telah disepakati, diikuti pengujian end-to-end, perbaikan, dan validasi. Tahapan internal pengerjaan boleh digunakan untuk menjaga kualitas, tetapi tidak menjadikan hasil akhir berupa aplikasi parsial yang harus menunggu modul berikutnya.

## 18. Batasan dan asumsi

- Feeder merupakan modul yang dirancang dan disiapkan pada aplikasi; integrasi perangkat nyata bergantung pada hardware yang belum dibuat.
- Jangan mengklaim monitoring/control hardware live sebelum ESP32 dan sensor terintegrasi serta teruji.
- Detail kuantitas feeding, sensor, dan protokol final ditentukan kemudian.
- Dashboard fokus pada siklus aktif; laporan periode historis di halaman Reports.
- Data populasi v1 tidak memiliki riwayat event perubahan khusus.
- Harga simulasi adalah dua acuan pasar, bukan transaksi penjualan aktual.
