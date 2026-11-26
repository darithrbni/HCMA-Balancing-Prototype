# Spesifikasi Aturan Mekanik & Kalkulasi Stat — Hiyori Life-Sim

## 1. Daftar Entitas Aktivitas & Kode Inisial
| Kategori Aktivitas | Inisial | Tipe | Sub-Aktivitas |
| :--- | :---: | :--- | :--- |
| **Streaming** | `S` | Multi | `Chill Talk`, `Playing Game`, `Drawing`, `Singing` |
| **Entertainment** | `E` | Multi | `Chit Chat`, `Gaming` |
| **Practice** | `P` | Multi | `Vocal Training`, `Sketching` |
| **Take a Stroll** | `TS` | Tunggal | *(Langsung dieksekusi)* |
| **Social Media** | `SM` | Multi | `Post`, `Read Comment`, `Doomscroll` |
| **Rest & Relax** | `R` | Tunggal | *(Langsung dieksekusi)* |
| **Part-Time Job** | `PT` | Tunggal | *(Langsung dieksekusi)* |

## 2. Batasan Nilai (Constraints) Variabel Global
Setiap kali perhitungan stat selesai dilakukan pada akhir aktivitas, nilai wajib di-clamp agar tidak keluar dari rentang berikut:
- `Follower`: Min `0` — Max `9.999.999` (Default awal: `0`)
- `Energy`: Min `0` — Max `100` (Default awal: `100`, di-reset ke `100` setiap ganti Phase)
- `Motivation`: Min `0` — Max `100` (Default awal: `0`)
- `Money`: Min `0` — Max `9.999.999` (Default awal: `0`)
- `Communication`: Min `0` — Max `100` (Default awal: `0`)
- `Gaming Skill`: Min `0` — Max `100` (Default awal: `0`)
- `Artistry`: Min `0` — Max `100` (Default awal: `0`)
- `Musical`: Min `0` — Max `100` (Default awal: `0`)

## 3. Aturan Validasi Kelayakan Aksi (Anti-Negatif)
Sebuah aktivitas atau sub-aktivitas **TIDAK BOLEH BISA DIKLIK (`disabled`)** apabila memenuhi salah satu kondisi berikut:
1. Untuk setiap stat yang memiliki konfigurasi pengurangan (`delta < 0`): jika `currentStat + delta < 0`, maka aksi terkunci.
2. **Khusus Kategori `Streaming` (semua sub-aktivitas):**
   - Wajib memiliki `Motivation > 0` saat ini. Jika `Motivation === 0`, seluruh sub-aktivitas Streaming terkunci.
3. **Khusus Sub-Aktivitas `Social Media -> Post`:**
   - Karena hasil motivasi bisa negatif, cek `Motivation - Math.abs(ΔMotivation_config) >= 0` (serta delta stat negatif lainnya) agar `currentStat` tidak menjadi negatif apabila terkena hasil 50/50 buruk.
   - `Social Media -> Read Comment` kembali memakai validasi standar (delta `Motivation` apa adanya).

## 4. Formula Kalkulasi per Tipe Aktivitas

### A. Aktivitas Standar (Entertainment, Practice, Take a Stroll, Rest & Relax, Part-Time Job, Social Media: Read Comment & Doomscroll)
- Untuk setiap stat $S \in \{\text{Follower}, \text{Energy}, \text{Motivation}, \text{Money}, \text{Communication}, \text{Gaming Skill}, \text{Artistry}, \text{Musical}\}$:
  $$S_{\text{baru}} = \text{clamp}(S_{\text{lama}} + \Delta S_{\text{config}}, \text{Min}_S, \text{Max}_S)$$

### B. Mekanik Khusus: `Streaming` (`Chill Talk`, `Playing Game`, `Drawing`, `Singing`)
Pada prototipe ini, mini-game streaming tidak dimainkan secara manual melainkan disimulasikan dengan aturan berikut:
1. Simpan nilai motivasi sebelum stream:
   $$M_{\text{awal}} = \text{Motivation}_{\text{lama}}$$
2. `Motivation` langsung terkuras habis menjadi `0`:
   $$\text{Motivation}_{\text{baru}} = 0$$
3. Perolehan **Follower** dihitung dari seluruh `Motivation` yang terkuras dikalikan bonus pengali Cycle saat ini (ditambah delta stat `Follower` manual jika diisi di config):
   $$\Delta \text{Follower}_{\text{stream}} = \lfloor M_{\text{awal}} \times \text{CycleMultiplier}[\text{currentCycle}] \rfloor + \Delta \text{Follower}_{\text{config}}$$
   $$\text{Follower}_{\text{baru}} = \text{clamp}(\text{Follower}_{\text{lama}} + \Delta \text{Follower}_{\text{stream}}, 0, 9999999)$$
4. Perolehan **Money (Monetisasi)**:
   - Dicek berdasarkan kondisi apakah follower sudah mencapai batas `monetizationThreshold` (baik sebelum maupun sesudah stream; gunakan `Follower_baru >= monetizationThreshold` agar langsung terasa saat melewati ambang batas):
   - Jika `Follower_baru >= monetizationThreshold`:
     $$\Delta \text{Money}_{\text{stream}} = \lfloor \text{Follower}_{\text{baru}} \times \text{moneyMultiplier} \rfloor + \Delta \text{Money}_{\text{config}}$$
   - Jika belum mencapai threshold:
     $$\Delta \text{Money}_{\text{stream}} = \Delta \text{Money}_{\text{config}}$$
   $$\text{Money}_{\text{baru}} = \text{clamp}(\text{Money}_{\text{lama}} + \Delta \text{Money}_{\text{stream}}, 0, 9999999)$$
5. Stat lainnya (`Energy`, `Communication`, `Gaming Skill`, `Artistry`, `Musical`) menerapkan delta dari konfigurasi sub-aktivitas stream tersebut dan di-clamp sesuai batas.

### C. Mekanik Khusus: `Social Media -> Post`
- Sub-aktivitas ini hanya memakai **satu kolom `Motivation`** di konfigurasi (tanpa `Motivasi Neg` / `motivation_neg`).
- Misalkan $M_{config} = \Delta \text{Motivation}_{\text{config}}$ dan $m = |M_{config}|$ (magnitude, sehingga `10` dan `-10` sama-sama menghasilkan `m = 10`).
- Saat dieksekusi:
  - Bangkitkan angka acak `Math.random() < 0.5`:
    - Jika `true`: $\Delta \text{Motivation} = +m$
    - Jika `false`: $\Delta \text{Motivation} = -m$
  - Terapkan $\Delta \text{Motivation}$ yang **sama persis** (besar dan tanda) ke stat global Motivation, bersama delta stat lainnya, lalu lakukan clamping.
  - Cutscene hasil aktivitas menampilkan delta yang benar-benar diterapkan (`+m` atau `-m`) dan catatan hasil roll; pratinjau konfigurasi menampilkan `+m / -m (50/50)`.

## 5. Siklus Waktu (Nested Time Loop)
1. **Day (1–7):** Setiap selesai 1 aktivitas (dan cutscene aktivitas selesai/di-skip), `currentDay` bertambah 1 dan kotak hari ke-`currentDay` terisi inisial aktivitas.
2. **Phase (1–4):**
   - Setelah **Day 7** selesai:
     1. Tampilkan **Cutscene Review Hasil 1 Minggu**.
     2. Reset **hanya `Energy` menjadi `100`**.
     3. Kosongkan kembali 7 kotak hari (`Day 1–7`), set `currentDay = 1`, dan naikkan `currentPhase + 1`.
3. **Cycle (1–8):**
   - Setelah **Phase 4 Day 7** selesai:
     1. Tampilkan **Cutscene Review Hasil 1 Minggu** untuk Phase 4.
     2. Lanjutkan langsung ke **Cutscene `"Narrative #[currentCycle]"`** (contoh: akhir Cycle 1 menampilkan `"Narrative #1"`).
     3. Reset `Energy = 100`, kosongkan 7 kotak hari, set `currentPhase = 1`, `currentDay = 1`, dan naikkan `currentCycle + 1`.
   - Jika `currentCycle > 8`: Tampilkan layar/banner selesai simulasi 8 Cycle beserta statistik akhir.