# PRD – Sistem Manajemen Kebun (MVP)

Aplikasi digitalisasi perkebunan desa · Ionic + React · PWA

Versi 0.1 · Status: Draft

## 1. Ringkasan

**Sistem Manajemen Kebun** adalah aplikasi PWA yang membantu pemilik kebun di desa mencatat dan memantau kebunnya secara digital: mulai dari membuat kebun, mengelola katalog tanaman, mencatat hasil panen, mencatat masalah tanaman, hingga melihat perkembangan tanaman lewat grafik.

Pada tahap MVP, aplikasi berjalan **sepenuhnya offline di satu perangkat** (tanpa backend, tanpa sinkronisasi) dan hanya digunakan oleh **pemilik kebun**.

## 2. Latar Belakang dan Masalah

Banyak pemilik kebun di desa masih mencatat data secara manual atau mengandalkan ingatan. Akibatnya:

- Riwayat panen tidak tercatat rapi sehingga sulit dibandingkan antar musim.
- Masalah tanaman (hama, penyakit, kekurangan air/nutrisi) tidak terdokumentasi, sehingga kejadian berulang tidak terdeteksi.
- Tidak ada gambaran yang jelas tentang perkembangan tanaman dari waktu ke waktu.
- Konektivitas internet di desa tidak selalu stabil, sehingga aplikasi yang bergantung pada server kurang cocok.

## 3. Tujuan dan Metrik Keberhasilan

### Tujuan MVP

1. Pemilik kebun dapat mendigitalkan data dasar kebunnya dalam waktu singkat.
2. Seluruh fitur inti dapat digunakan tanpa internet.
3. Antarmuka sederhana sehingga dapat dipakai oleh pengguna dengan literasi digital rendah.
4. Menjadi MVP yang layak didemokan dan dinilai dalam perlombaan.

### Metrik Keberhasilan

| Metrik | Target MVP |
| --- | --- |
| Waktu dari buka aplikasi hingga kebun pertama terbuat | < 2 menit |
| Waktu mencatat satu panen | < 1 menit |
| Seluruh fitur inti berfungsi dalam mode pesawat | 100% |
| Skor Lighthouse (PWA, Performance, Accessibility) | ≥ 90 |
| Penyelesaian skenario utama oleh penguji tanpa bantuan | ≥ 80% |

## 4. Pengguna

### Persona Utama: Pemilik Kebun

- Mengelola satu atau beberapa kebun sayuran di desa.
- Menggunakan ponsel Android dengan spesifikasi menengah ke bawah.
- Koneksi internet terbatas dan tidak stabil.
- Menginginkan pencatatan yang cepat dan mudah dipahami, dengan sedikit pengetikan.

### Di Luar Cakupan Pengguna (MVP)

Pekerja kebun, penyuluh, pengurus desa, dan pembeli belum didukung. Tidak ada akun, login, atau peran pengguna.

## 5. Ruang Lingkup MVP

### Termasuk (In Scope)

1. Membuat dan mengelola kebun.
2. CRUD katalog tanaman dalam satu kebun.
3. Pencatatan panen berdasarkan satu tanaman katalog.
4. Pencatatan masalah tanaman pada tanggal yang dipilih.
5. Grafik perkembangan tanaman berdasarkan kebun yang dipilih.
6. Penyimpanan data lokal (offline) dan instalasi sebagai PWA.

### Tidak Termasuk (Out of Scope)

- Backend, akun, login, dan sinkronisasi antar perangkat.
- Multi-pengguna dan kolaborasi.
- Pengingat dan notifikasi push.
- Analitik penggunaan.
- Modul sampah organik, pembibitan, dan lahan tidur (direncanakan untuk fase 2, hanya jika MVP memenangkan perlombaan).
- Panduan budidaya dan konten edukasi yang kompleks (konten dibuat in-house, di luar fitur inti MVP).

## 6. Kebutuhan Fungsional

### FR-1 Manajemen Kebun

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-1.1 | Pengguna dapat membuat kebun dengan data: nama (wajib), lokasi/keterangan (opsional), luas dan satuan (opsional), tanggal mulai (opsional). | Must |
| FR-1.2 | Pengguna dapat melihat daftar kebun dan memilih satu kebun aktif. | Must |
| FR-1.3 | Pengguna dapat mengubah dan menghapus kebun. Penghapusan menampilkan konfirmasi dan ikut menghapus data turunannya. | Should |
| FR-1.4 | Kebun aktif yang terakhir dipilih diingat saat aplikasi dibuka kembali. | Should |

### FR-2 Katalog Tanaman (CRUD per Kebun)

Katalog bersifat per kebun: setiap tanaman hanya tergolong pada satu kebun.

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-2.1 | **Create**: tambah tanaman dengan data: nama (wajib), kategori (mis. sayuran daun, buah, umbi), tanggal tanam, jumlah/populasi, catatan, dan foto (opsional). | Must |
| FR-2.2 | **Read**: lihat daftar tanaman dalam kebun terpilih, dengan pencarian sederhana dan halaman detail. | Must |
| FR-2.3 | **Update**: ubah data tanaman. | Must |
| FR-2.4 | **Delete**: hapus tanaman dengan konfirmasi. Riwayat panen dan masalah terkait ikut terhapus (atau pengguna diberi peringatan jelas). | Must |
| FR-2.5 | Katalog awal berfokus pada sayuran (cabai, selada, dll.) dengan jenis tanaman lain dapat ditambahkan secara bebas oleh pengguna. | Should |

### FR-3 Pencatatan Panen

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-3.1 | Pengguna mencatat panen dari halaman detail satu tanaman katalog. | Must |
| FR-3.2 | Data panen: tanggal panen (default hari ini), jumlah, satuan (kg, ikat, buah, dll.), kualitas/grade (opsional), catatan (opsional). | Must |
| FR-3.3 | Pengguna dapat melihat riwayat panen per tanaman, serta mengubah dan menghapus catatan panen. | Must |
| FR-3.4 | Total panen per tanaman ditampilkan pada halaman detail. | Should |

### FR-4 Pencatatan Masalah Tanaman

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-4.1 | Pengguna mencatat masalah pada tanaman tertentu dengan **memilih tanggal** kejadian (date picker). | Must |
| FR-4.2 | Data masalah: tanggal, jenis (hama, penyakit, cuaca, kekurangan air/nutrisi, lainnya), tingkat keparahan (ringan/sedang/berat), deskripsi, foto (opsional), tindakan yang dilakukan (opsional). | Must |
| FR-4.3 | Status masalah: aktif atau teratasi, yang dapat diubah pengguna. | Should |
| FR-4.4 | Riwayat masalah ditampilkan berurutan per tanggal dan dapat difilter per tanaman. | Must |
| FR-4.5 | Ubah dan hapus catatan masalah. | Must |

### FR-5 Grafik Perkembangan Tanaman

Grafik ditampilkan berdasarkan **kebun yang dipilih**.

| ID | Kebutuhan | Prioritas |
| --- | --- | --- |
| FR-5.1 | Grafik tren panen dari waktu ke waktu (garis/batang) untuk seluruh tanaman di kebun terpilih. | Must |
| FR-5.2 | Pengguna dapat memfilter grafik berdasarkan tanaman dan rentang waktu (7 hari, 30 hari, 3 bulan, semua). | Must |
| FR-5.3 | Grafik jumlah masalah tanaman per periode, dapat dipecah menurut jenis atau tingkat keparahan. | Should |
| FR-5.4 | Ringkasan angka: total panen, jumlah tanaman, dan jumlah masalah aktif. | Should |
| FR-5.5 | Keadaan kosong (empty state) yang ramah saat data belum cukup. | Must |

> **Catatan keputusan:** "perkembangan tanaman" pada MVP didefinisikan sebagai gabungan tren panen dan tren masalah, karena belum ada pencatatan pertumbuhan (tinggi, jumlah daun, dll.). Jika dibutuhkan, pencatatan pertumbuhan dapat menjadi pengembangan lanjutan.

## 7. Alur Pengguna Utama

1. **Onboarding:** buka aplikasi → penjelasan singkat → buat kebun pertama.
2. **Siapkan katalog:** pilih kebun → tambah tanaman (mis. cabai, selada).
3. **Catat panen:** buka tanaman → tambah panen → simpan.
4. **Catat masalah:** buka tanaman → tambah masalah → pilih tanggal → simpan.
5. **Pantau:** buka tab Grafik → pilih kebun → lihat tren panen dan masalah.

## 8. Model Data (Garis Besar)

- **Kebun**: id, nama, lokasi, luas, satuan\_luas, tanggal\_mulai, dibuat\_pada, diubah\_pada
- **Tanaman**: id, kebun\_id, nama, kategori, tanggal\_tanam, jumlah, catatan, foto, dibuat\_pada, diubah\_pada
- **Panen**: id, tanaman\_id, tanggal, jumlah, satuan, kualitas, catatan
- **Masalah**: id, tanaman\_id, tanggal, jenis, keparahan, deskripsi, tindakan, status, foto

Relasi: Kebun 1—N Tanaman, Tanaman 1—N Panen, Tanaman 1—N Masalah. Penghapusan bersifat cascade dengan konfirmasi.

## 9. Kebutuhan Non-Fungsional

- **Offline-first penuh:** seluruh fitur berjalan tanpa internet setelah instalasi pertama.
- **Penyimpanan lokal:** IndexedDB (mis. lewat Dexie atau localForage). Foto dikompres sebelum disimpan.
- **PWA:** web app manifest, service worker (precache app shell), dapat diinstal ke layar utama, ikon dan splash screen.
- **Performa:** waktu muat awal < 3 detik pada perangkat Android menengah ke bawah; ukuran bundle dijaga ringan.
- **Kegunaan:** bahasa Indonesia sederhana, tombol dan area sentuh besar, ikon yang jelas, form singkat dengan nilai default.
- **Aksesibilitas:** kontras warna memadai, ukuran teks dapat dibaca di bawah sinar matahari.
- **Keamanan dan privasi:** data tidak keluar dari perangkat; tidak ada pelacakan atau analitik.
- **Kompatibilitas:** Chrome Android terbaru sebagai target utama; peramban modern lain sebagai tambahan.

## 10. Arsitektur dan Teknologi

| Aspek | Pilihan |
| --- | --- |
| Framework | Ionic React (dengan Vite) |
| Bahasa | TypeScript |
| Navigasi | Tab: Kebun, Tanaman, Grafik (dan Ionic Router) |
| State | React Context atau Zustand |
| Penyimpanan | IndexedDB (Dexie) |
| Grafik | Chart.js (react-chartjs-2) atau Recharts |
| PWA | vite-plugin-pwa (Workbox) |
| Tanggal | dayjs |

### Risiko Penyimpanan Lokal

Karena data hanya ada di satu perangkat, data dapat hilang jika data peramban dihapus atau perangkat rusak. Mitigasi yang direkomendasikan: meminta *persistent storage* (`navigator.storage.persist()`), serta fitur **ekspor/impor cadangan (JSON)** sebagai tambahan ringan yang disarankan masuk MVP.

## 11. Struktur Layar

1. **Beranda / Daftar Kebun** – daftar kebun, tombol tambah.
2. **Form Kebun** – buat/ubah kebun.
3. **Katalog Tanaman** – daftar tanaman pada kebun terpilih.
4. **Form Tanaman** – tambah/ubah tanaman.
5. **Detail Tanaman** – info, total panen, riwayat panen, riwayat masalah.
6. **Form Panen** dan **Form Masalah**.
7. **Grafik** – pemilih kebun, filter, grafik, ringkasan.
8. **Pengaturan** – cadangan data, tentang aplikasi.

## 12. Kriteria Penerimaan (Contoh)

- Diberikan pengguna belum punya kebun, ketika membuat kebun dengan nama terisi, maka kebun tersimpan dan muncul di daftar.
- Diberikan perangkat dalam mode pesawat, ketika pengguna menambah panen, maka data tersimpan dan langsung tampil di riwayat dan grafik.
- Diberikan pengguna memilih tanggal kemarin pada form masalah, maka catatan tersimpan dengan tanggal tersebut dan muncul pada urutan yang benar.
- Diberikan dua kebun dengan data berbeda, ketika pengguna berganti kebun di tab Grafik, maka grafik hanya menampilkan data kebun terpilih.
- Diberikan tanaman dihapus, maka pengguna melihat konfirmasi dan data panen/masalah terkait ikut terhapus.

## 13. Rencana Rilis

| Tahap | Cakupan |
| --- | --- |
| M1 – Fondasi | Setup Ionic React, PWA, skema database lokal, navigasi |
| M2 – Kebun dan Katalog | FR-1 dan FR-2 |
| M3 – Panen dan Masalah | FR-3 dan FR-4 |
| M4 – Grafik | FR-5 |
| M5 – Penyempurnaan | Empty state, pengujian offline, optimasi performa, uji pengguna, persiapan demo |

Fase 2 (hanya jika MVP memenangkan perlombaan): sampah organik, pembibitan, pemanfaatan lahan tidur, pencatatan pertumbuhan, pengingat, serta backend dan multi-pengguna.

## 14. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Data hilang karena penyimpanan lokal | Tinggi | Persistent storage + ekspor/impor cadangan |
| Pengguna kesulitan dengan antarmuka | Sedang | Form singkat, ikon jelas, uji dengan pemilik kebun sungguhan |
| Foto memenuhi penyimpanan | Sedang | Kompresi dan batas ukuran foto |
| Grafik tidak informatif saat data sedikit | Rendah | Empty state dan data contoh untuk demo |
| Cakupan melebar sebelum perlombaan | Sedang | Disiplin pada daftar Out of Scope |

## 15. Pertanyaan Terbuka

1. Apakah satu pemilik dapat memiliki banyak kebun (diasumsikan ya)? **Ya pemilik dapat memiliki banyak kebun**
2. Satuan panen apa yang paling umum dipakai (kg, ikat, buah)? Apakah satuan dibuat tetap atau bebas? **Saat ini gunakan satuan kg**&#32;
3. Apakah ekspor/impor cadangan perlu masuk MVP? **Saat ini tidak perlu**
4. Apakah definisi "perkembangan tanaman" cukup dari tren panen dan masalah? **Ya cukup dari tren panen dan masalah**
5. Apa kriteria penilaian perlombaan yang perlu dioptimalkan (inovasi, dampak, kelengkapan, tampilan)? **Fokus pada inovasi dan dampak terlebih dahulu, serta ikuti arahan MVP**
