# Spesifikasi Skema CSV & Parser — Hiyori Balancing Config

Dokumen ini menjadi kontrak tunggal untuk **3 mode input konfigurasi awal** (Manual Form, Copy-Paste Teks CSV, dan Upload File `.csv`) serta fitur **Export/Download CSV**.

## 1. Format Struktur CSV
Gunakan format **Key-Value / Tabular Seragam** dengan separator koma (`,`) agar mudah dibaca manusia saat diedit di Excel/Google Sheets maupun saat di-copy-paste sebagai teks mentah.

### Kolom Header Wajib:
`category,key,label,follower,energy,motivation,money,communication,gaming_skill,artistry,musical,value`

### Penjelasan Kolom:
- `category`: `activity` | `global_rule` | `cycle_multiplier`
- `key`: Identifier unik internal (tidak boleh diubah oleh parser).
- `label`: Nama tampilan ramah manusia untuk form manual.
- `follower` s/d `musical`: Delta angka (`+20`, `-15`, `20`, atau `0`) untuk baris bertipe `activity`.
  - Khusus baris `sm_post` (`Social Media - Post`), kolom `motivation` menyimpan **magnitude** (`Math.abs(nilai)`). Saat dieksekusi, 50% peluang memberikan `+magnitude` dan 50% peluang memberikan `-magnitude` pada stat Motivation.
  - Seluruh baris lain (termasuk `sm_read_comment`) menerapkan kolom `motivation` apa adanya sebagai delta. Tidak ada kolom `motivation_neg` / `Motivasi Neg`.
- `value`: Digunakan khusus untuk baris bertipe `global_rule` dan `cycle_multiplier` (diisi `0` pada baris `activity`).

## 2. Daftar Lengkap Key Baku (24 Baris Data)

```csv
category,key,label,follower,energy,motivation,money,communication,gaming_skill,artistry,musical,value
activity,stream_chill_talk,Streaming - Chill Talk,0,0,0,0,0,0,0,0,0
activity,stream_playing_game,Streaming - Playing Game,0,0,0,0,0,0,0,0,0
activity,stream_drawing,Streaming - Drawing,0,0,0,0,0,0,0,0,0
activity,stream_singing,Streaming - Singing,0,0,0,0,0,0,0,0,0
activity,ent_chit_chat,Entertainment - Chit Chat,0,0,0,0,0,0,0,0,0
activity,ent_gaming,Entertainment - Gaming,0,0,0,0,0,0,0,0,0
activity,prac_vocal,Practice - Vocal Training,0,0,0,0,0,0,0,0,0
activity,prac_sketching,Practice - Sketching,0,0,0,0,0,0,0,0,0
activity,stroll,Take a Stroll,0,0,0,0,0,0,0,0,0
activity,sm_post,Social Media - Post,0,0,0,0,0,0,0,0,0
activity,sm_read_comment,Social Media - Read Comment,0,0,0,0,0,0,0,0,0
activity,sm_doomscroll,Social Media - Doomscroll,0,0,0,0,0,0,0,0,0
activity,rest,Rest & Relax,0,0,0,0,0,0,0,0,0
activity,part_time,Part-Time Job,0,0,0,0,0,0,0,0,0
global_rule,monetization_threshold,Batas Follower Monetisasi,0,0,0,0,0,0,0,0,10000
global_rule,money_multiplier,Pengali Money Streaming,0,0,0,0,0,0,0,0,0
cycle_multiplier,cycle_1,Pengali Follower Cycle 1,0,0,0,0,0,0,0,0,1
cycle_multiplier,cycle_2,Pengali Follower Cycle 2,0,0,0,0,0,0,0,0,1
cycle_multiplier,cycle_3,Pengali Follower Cycle 3,0,0,0,0,0,0,0,0,1
cycle_multiplier,cycle_4,Pengali Follower Cycle 4,0,0,0,0,0,0,0,0,1
cycle_multiplier,cycle_5,Pengali Follower Cycle 5,0,0,0,0,0,0,0,0,1
cycle_multiplier,cycle_6,Pengali Follower Cycle 6,0,0,0,0,0,0,0,0,1
cycle_multiplier,cycle_7,Pengali Follower Cycle 7,0,0,0,0,0,0,0,0,1
cycle_multiplier,cycle_8,Pengali Follower Cycle 8,0,0,0,0,0,0,0,0,1
```

3. Aturan Parsing & Sanitasi Input
Toleransi Tanda Plus (+): Input string seperti "+25" maupun "25" harus di-parse menjadi number 25. Input "-15" menjadi -15. Input kosong atau tidak valid di-fallback ke 0.

Dukungan Desimal: money_multiplier dan cycle_1..8 wajib menggunakan parseFloat agar mendukung angka desimal (misal 0.05 atau 1.5).

Validasi Baris: Abaikan baris kosong (trim() === ""). Jika baris pertama diawali category,key, lewati sebagai header. Baris dengan kurang dari 12 kolom diabaikan.

Partial CSV Update: Jika pengguna menempel atau mengunggah CSV yang hanya berisi sebagian key, parser memperbarui key yang ada tanpa merusak key lainnya dari state default.

Sinkronisasi Dua Arah: Mengubah angka di tab Manual Input Field otomatis memperbarui teks saat pengguna berpindah ke tab Copy-Paste CSV atau menekan Download Template .csv, begitu pula sebaliknya.
