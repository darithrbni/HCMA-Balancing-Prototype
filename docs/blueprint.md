# Blueprint Arsitektur & UI Flow — Hiyori VTuber Life-Sim Balancing Prototype

hcma-balancing-prototype/
├── docs/
│   ├── blueprint.md          # Arsitektur UI, wireframe layout, state & cutscene flow
│   ├── game-rules.md         # Rumus matematis, aturan stat, validasi & edge-cases
│   └── csv-schema.md         # Spesifikasi format CSV (header, urutan baris, parser rules)
├── public/
│   └── audio/
│       └── ui-click.mp3      # 1 file SFX universal saat klik elemen UI interaktif
└── src/                      # (Akan di-generate oleh OpenCode)

## 1. Tujuan & Batasan Desain Visual
- **Tujuan:** Aplikasi web single-page untuk mensimulasikan dan mem-balancing variabel angka game life-sim VTuber *Hiyori* (target 1.000.000 subscribers).
- **Gaya Visual (Strict Low-Fidelity Wireframe):**
  - **DILARANG** menambahkan dekorasi visual menarik, ilustrasi, ikon grafis kompleks, gradien, shadow tebal, atau palet warna warni.
  - Gunakan **kotak UI ber-border tegas (`1px` atau `2px solid`)**, sudut membulat tipis (`border-radius: 4px` / `6px`), latar polos kontras tinggi (monokromatik / high-contrast wireframe), dan tipografi monospace/sans-serif bersih.
  - Fokus 100% pada keterbacaan angka, indikator status, dan kecepatan iterasi balancing.

## 2. Spesifikasi Audio (SFX)
- **File Audio:** `ui-click.mp3` (format `.mp3` atau `.wav`, durasi pendek < 150ms).
- **Lokasi Folder:** `public/audio/ui-click.mp3` (diakses via path `/audio/ui-click.mp3`).
- **Trigger:** Diputar setiap kali pengguna menekan elemen interaktif (tombol aktivitas, pilihan sub-aktivitas, tab mode config, tombol simpan/reset, maupun klik skip pada cutscene).
- **Fallback Wajib:** Bungkus pemutaran audio dalam helper `playClickSfx()` dengan `try/catch` atau `.catch(() => {})` (serta fallback Web Audio API beep singkat opsional jika file belum ditaruh di folder) agar aplikasi tidak pernah crash saat file fisik belum tersedia.

## 3. Arsitektur State (Local vs Global)
Aplikasi memisahkan state menjadi dua lapisan memori yang ketat:

### A. Local Variables (`balancingConfig` — Persisten)
- Diatur melalui **Modal Konfigurasi Awal** (dan bisa dibuka ulang via tombol `[Edit Config]` di layar utama).
- **Tetap bertahan (tidak pernah reset)** saat berganti hari, berganti sub-aktivitas, berganti Phase, maupun berganti Cycle.
- Mencakup:
  1. Delta stat (`+`, `-`, `0`) untuk seluruh aktivitas tunggal dan sub-aktivitas (default awal: `0`).
  2. `cycleMultipliers[1..8]`: Bonus pengali follower untuk Cycle 1 hingga Cycle 8 (default awal: `1`).
  3. `moneyMultiplier`: Pengali pendapatan uang saat streaming (default awal: `0`).
  4. `monetizationThreshold`: Batas minimum `Follower` untuk membuka pendapatan uang streaming (default awal: `10000`).

### B. Global Variables (`gameState` — Dinamis Lintas Waktu)
- Berubah sesuai aksi harian pemain.
- **Aturan Reset Ketat:**
  - **JANGAN** mereset variabel global saat berganti hari, berganti aktivitas, maupun berganti Cycle.
  - **HANYA `Energy`** yang di-reset kembali ke nilai penuh **`100`** setiap kali **pergantian Phase** (setelah Day 7 selesai).
  - Seluruh stat lainnya (`Follower`, `Money`, `Motivation`, `Communication`, `Gaming Skill`, `Artistry`, `Musical`) terus terakumulasi dan hanya dibatasi oleh nilai minimum & maksimum masing-masing.

## 4. Alur Layar & Transisi (Screen Flow)

### Layar 1: Modal Konfigurasi Awal (Centered Box)
Muncul pertama kali saat website dibuka, berada di tengah layar:
- Memiliki **3 tab/mode input** yang saling tersinkronisasi ke state `balancingConfig` yang sama:
  1. **Manual Input Field:** Form tabel berisi input angka untuk seluruh variabel lokal.
  2. **Copy-Paste CSV:** `<textarea>` untuk menempel teks CSV + tombol `[Parse & Terapkan CSV]` + tombol `[Generate dari State Saat Ini]` untuk mempermudah copy template.
  3. **Upload File `.csv`:** `<input type="file" accept=".csv">` untuk membaca file CSV lokal + tombol `[Download Template .csv]`.
- Tombol utama: **`[Mulai Simulasi]`** untuk menutup modal dan masuk ke Layar Wireframe Utama.

### Layar 2: Wireframe Game Utama
Terbagi menjadi 3 zona utama dalam satu viewport bersih:
1. **Kiri Atas — Panel Aktivitas:**
   - Daftar 7 kategori aktivitas utama dalam bentuk kotak tombol vertikal:
     1. `Streaming` *(memiliki sub-aktivitas)*
     2. `Entertainment` *(memiliki sub-aktivitas)*
     3. `Practice` *(memiliki sub-aktivitas)*
     4. `Take a Stroll` *(aktivitas tunggal)*
     5. `Social Media` *(memiliki sub-aktivitas)*
     6. `Rest & Relax` *(aktivitas tunggal)*
     7. `Part-Time Job` *(aktivitas tunggal)*
   - **Keterangan Aktivitas Tunggal:** Untuk `Take a Stroll`, `Rest & Relax`, dan `Part-Time Job`, tampilkan label teks kecil `Δ: ...` berisi stat yang bertambah (`+X`) dan berkurang (`-X`) beserta nilainya.
   - **Keterangan Kategori Bersub-aktivitas:** Untuk `Streaming`, `Entertainment`, `Practice`, dan `Social Media`, keterangan kotak kategori berupa daftar nama sub-aktivitas saja, misalnya `Sub-aktivitas: Chill Talk, Playing Game, Drawing, Singing`. Rentang angka `Δ: ...` tidak ditampilkan di kotak kategori.
   - **Visual Disabled State:** Jika stat global tidak mencukupi syarat aktivitas (atau akan menyebabkan stat global `< 0`), tombol aktivitas/sub-aktivitas tampil dalam kondisi `disabled` (redup/terkunci) dan tidak dapat diklik.
   - Tombol utilitas kecil di header panel: `[Buka Config]` dan `[Reset Simulasi]`.
2. **Kanan Atas — Panel Variabel Global (Real-Time Stats):**
   - Menampilkan nilai angka terkini dan batas maks untuk:
     - **Main Stat:** `Follower` (0–9.999.999), `Energy` (0–100), `Motivation` (0–100), `Money` (0–9.999.999).
     - **Personal Stat:** `Communication` (0–100), `Gaming Skill` (0–100), `Artistry` (0–100), `Musical` (0–100).
   - Indikator status tambahan: Status Monetisasi (`Locked < [Threshold]` / `Unlocked`) dan Pengali Follower Cycle aktif (`x[Multiplier]`).
3. **Bagian Bawah — Tracker Waktu & To-Do List 7 Hari:**
   - Header indikator: **`Cycle ke-[X] (dari 8)`** | **`Phase ke-[Y] (dari 4)`** | **`Day [Z] / 7`**.
   - **7 Kotak Hari (Day 1 – Day 7):** Ditampilkan horizontal seperti kotak *to-do list*.
     - Hari yang belum dijalani: kotak kosong dengan label `Day X`.
     - Hari aktif saat ini: kotak dengan border highlight.
     - Hari yang sudah selesai: terisi kode inisial aktivitas yang dilakukan (`S`, `E`, `P`, `TS`, `SM`, `R`, `PT`) beserta nama singkat sub-aktivitasnya.

### Layar 2B: Modal Pilihan Sub-Aktivitas (Centered Overlay)
- Muncul di tengah layar saat pengguna mengklik kategori yang memiliki sub-aktivitas (`Streaming`, `Entertainment`, `Practice`, `Social Media`).
- Menampilkan daftar tombol sub-aktivitas lengkap dengan **keterangan kecil delta stat (`+` / `-`)** masing-masing, status validasi (aktif/terkunci), dan tombol `[Batal]`.
- Khusus sub-aktivitas `Streaming` (`Chill Talk`, `Playing Game`, `Drawing`, `Singing`), label follower disederhanakan menjadi `++Follower` (`++Follower (+[nilai])` jika config `follower > 0`) tanpa rumus teknis `floor(M x cycleMultiplier)`. Jika monetisasi aktif (`Follower >= monetizationThreshold`), tampilkan pula `+Money` atau `+Money (+[nilai])`.
- Khusus sub-aktivitas `Social Media -> Post`, pratinjau delta ditampilkan sebagai `Motivation +|nilai| / -|nilai| (50/50)` memakai satu kolom `Motivation` saja. Tidak ada kolom/input `Motivasi Neg` di tabel konfigurasi, CSV, maupun pratinjau. `Social Media -> Read Comment` memakai delta `Motivation` standar seperti aktivitas lainnya.

### Layar 3: Full-Screen Cutscene Mode (Transisi & Skip)
- **Penggantian Layar Penuh:** Saat cutscene aktif, **seluruh elemen Layar Wireframe Utama disembunyikan sepenuhnya** (`display: none` / conditional render) sehingga tidak terlihat dan tidak bisa diklik.
- **Animasi:** Cutscene Aktivitas dan `Narrative #X` memakai transisi CSS `fade-in` (misal 400ms) $\rightarrow$ tahan $\rightarrow$ `fade-out` (misal 400ms) dengan total durasi **3.000 ms (3 detik)**. Cutscene **Review Mingguan hanya `fade-in` 400ms** dan tetap tampil sampai pengguna mengklik/mengetuk.
- **Lanjutan Otomatis & Click/Tap-to-Skip:** Cutscene Aktivitas dan `Narrative #X` berjalan otomatis selama 3.000 ms dengan teks instruksi **`Otomatis lanjut dalam 3 detik (Klik / ketuk di mana saja untuk skip)`**. Cutscene Review Mingguan **tidak auto-timeout** dan memakai teks **`Klik / ketuk di mana saja untuk melanjutkan review.`** Seluruh area layar cutscene memiliki event listener `onClick`. Jika pengguna mengklik/mengetuk di mana saja pada layar saat cutscene berlangsung:
  - Untuk cutscene otomatis, timer 3 detik dan animasi fade langsung dibatalkan/dipotong; untuk Review Mingguan, overlay tetap terbuka sampai klik/ketuk tersebut.
  - Perubahan state langsung di-commit dan aplikasi seketika kembali ke Layar Wireframe Utama atau melanjutkan antrean cutscene berikutnya.
- **3 Jenis Cutscene:**
  1. **Cutscene Aktivitas Harian:** Teks tengah layar `"Aktivitas [Nama Aktivitas / Sub-Aktivitas] sedang berlangsung..."` (plus ringkasan perubahan stat singkat).
  2. **Cutscene Akhir Phase (Setelah Day 7 selesai):** Teks tengah layar `"Review Hasil 1 Minggu (Cycle [X] - Phase [Y])"` yang merangkum daftar aktivitas 7 hari terakhir, total perubahan stat selama 1 minggu, serta info bahwa `Energy` telah dipulihkan ke `100`. Cutscene ini tetap terbuka sampai diklik/diketuk.
  3. **Cutscene Akhir Cycle (Setelah Phase 4 Day 7 selesai, muncul setelah Review Mingguan):** Teks tengah layar `"Narrative #[X]"` (dimulai dari `Narrative #1` pada akhir Cycle 1; prolog di-skip). Setelah selesai/di-skip, lanjut ke Cycle berikutnya (atau layar ringkasan akhir jika Cycle 8 selesai).