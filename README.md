# Google Flow Image Automation

Alat otomatisasi berbasis Playwright untuk menghasilkan dan mengunduh gambar dari Google Flow secara massal menggunakan file prompt `.txt`.

## Fitur Utama
- **Custom Model**: Pilih Nano Banana 2 atau Nano Banana Pro.
- **Bulk Processing**: Masukkan file `.txt` berisi banyak prompt sekaligus.
- **Native Folder Picker**: Pilih lokasi penyimpanan langsung melalui Windows Explorer.
- **Global Numbering**: Penamaan file otomatis dengan format `[Nomor]_[Prefix]_[Nama_File]_[Timestamp].jpeg`.
- **Dynamic Settings**: Atur rasio gambar (Horizontal/Vertical) dan jumlah gambar per prompt.

## Cara Instalasi
Pastikan Anda sudah menginstal **Node.js** di komputer Anda.

1. Clone repository ini atau download ZIP-nya.
2. Buka Terminal/CMD di folder proyek.
3. Jalankan perintah instalasi library:
   ```bash
   npm install
   ```
4. Jalankan perintah instalasi browser (Playwright):
   ```bash
   npx playwright install chromium
   ```

## Cara Menjalankan
Cukup jalankan perintah berikut di Terminal:
```bash
node generator.js
```
Dashboard konfigurasi akan muncul secara otomatis. Isi pengaturan Anda dan klik **Launch Automation**.

---
*Dibuat oleh Antigravity (AI Coding Assistant)*
