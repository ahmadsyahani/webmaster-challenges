# PensMate Logic Assessment

Seleksi RnD Webmaster: pendaftaran mandiri, 20 soal penalaran, 10 soal coding JavaScript, dan 60 menit untuk kedua sesi.

## Setup sebelum dipakai

1. Untuk database baru, jalankan `supabase/migrations/20261001_secure_assessment.sql`, `supabase/migrations/20261002_self_registration.sql`, lalu `supabase/migrations/20261003_twenty_mcq.sql` di SQL Editor Supabase **secara berurutan**. Jika dua migrasi pertama sudah terpasang, cukup jalankan yang ketiga. Sesi yang sudah ada tetap 15 soal; pendaftaran baru mendapat 20 soal. Data attempt dan submission lama tetap tersimpan.
2. Lengkapi `.env.local` mengikuti `.env.example`: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET` (minimal 32 karakter), `ADMIN_PASSWORD` (minimal 16 karakter), dan `APP_ORIGIN`. Service-role key serta secret hanya berada di environment server, bukan variabel `NEXT_PUBLIC_`.
3. Generate `SESSION_SECRET` dengan `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Untuk dev, `APP_ORIGIN=http://localhost:3000`. Pada deployment, gunakan origin HTTPS persis tanpa slash terakhir.
4. Jalankan `npm install`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, kemudian `npm run test:integration`. Untuk lokal, `npm run dev`.
5. Uji satu pendaftaran dari browser dengan identitas percobaan di database staging, lanjutkan sampai bukti submit, dan periksa hasil di `/admin/dashboard` sebelum pelaksanaan asli.

Server menolak permintaan jika konfigurasi/schema belum siap. `NEXT_PUBLIC_SUPABASE_ANON_KEY` dan `RAPIDAPI_KEY` versi lama tidak dipakai lagi. Jalur pendaftaran berbasis undangan telah dipensiunkan oleh migrasi kedua; tabel undangan lama tetap ada sebagai arsip.

## Alur peserta

- Isi nama, NRP/NIM, prodi, dan kelas. Tidak ada kode akses panitia. Sesi 60 menit dimulai ketika pertama kali menekan **Mulai assessment**. NRP yang sama tidak bisa membuat percobaan kedua.
- Bila browser yang sama masih memiliki cookie sesi, tombol **Lanjutkan pengerjaan** muncul di beranda. Refresh atau membuka ulang browser yang sama tidak mengulang timer.
- Setiap jawaban penalaran tersimpan saat dipilih. Setelah semua 20 soal dijawab, peserta mengonfirmasi pindah sesi; jawaban penalaran lalu terkunci.
- Kode tersimpan otomatis sekitar satu detik setelah diedit, dan selalu disimpan sebelum pindah soal, menjalankan contoh, atau submit. Tunggu tulisan **Semua perubahan tersimpan** sebelum keluar. Draft lokal hanya cadangan dan tidak menentukan nilai.
- Run Tests menampilkan contoh yang lulus atau gagal. Skor akhir dihitung ulang di server memakai contoh dan hidden tests untuk seluruh kode yang tersimpan.
- Submit mengunci jawaban secara atomik dan memberikan nomor bukti. Submit ulang aman.
- Setelah deadline, server menolak perubahan dan mengunci snapshot terakhir. Tab yang terbuka memulai penilaian; bila tab sudah tertutup atau offline, peserta bisa membuka lagi browser yang sama atau panitia menekan **Nilai / pulihkan** di dashboard.
- Jika sesi cookie/browser hilang, peserta tidak dapat mengambil alih jawaban hanya dengan mengetahui NRP. Hubungi panitia untuk penanganan manual. Ini penting karena pendaftaran tanpa kode tambahan memang tidak membuktikan identitas seseorang.
- Gunakan satu tab. Perubahan dari dua tab yang konflik ditolak dan draft sebaiknya disalin sebelum refresh.

## Admin

Dashboard tetap memakai password server dan cookie HttpOnly. Panitia dapat melihat peserta yang mendaftar sendiri, nama/NRP/prodi/kelas, status, nilai, jawaban rinci, CSV halaman, serta menyelesaikan penilaian yang tertunda. Dashboard baru menampilkan tabel `assessment_attempts`; hasil versi lama tetap ada di `submissions` dan dapat dilihat di Supabase.

Untuk mengganti password admin, ubah `ADMIN_PASSWORD` di `.env.local` (minimal 16 karakter), lalu restart server lokal. Jika sudah di-deploy, ubah environment variable yang sama pada layanan hosting lalu redeploy/restart. Sesi admin lama otomatis tidak valid setelah password baru aktif; sesi peserta tidak terpengaruh. Jangan menaruh password di source code atau variabel `NEXT_PUBLIC_`. Pesan **Konfigurasi server belum lengkap** berarti ada variabel wajib yang belum diisi—cek langkah setup di atas, bukan hanya password yang diketik di form.

## Perlindungan dan batasan

Server menentukan deadline, fase, versi jawaban, dan skor. Browser tidak mengirim nilai atau kunci jawaban. Kode peserta berjalan dalam QuickJS WebAssembly worker dengan batas memori/waktu tanpa akses Node, environment, filesystem, atau jaringan. RLS dan grants database menutup akses anon ke sesi dan hasil. POST memeriksa Origin, ukuran dan format JSON; akses admin dicek setiap kali.

Pendaftaran empat data adalah alur yang diminta, tetapi siapa pun yang mengetahui NRP yang belum dipakai masih bisa mendaftar lebih dulu. Verifikasi identitas di tempat tetap disarankan. Aplikasi tidak dapat mendeteksi bantuan AI, kolaborasi, atau perangkat kedua. Jika butuh identitas yang lebih kuat kelak, tambahkan verifikasi kampus tanpa mengubah UI peserta secara besar.

Tidak ada scheduler eksternal. Jika semua peserta menutup tab, penilaian yang sudah dikunci bisa dipulihkan admin. Untuk skala besar, pindahkan grading ke worker/antrean tersendiri. Runtime harus Node.js dengan `worker_threads` dan WebAssembly, bukan Edge.

## Pengujian

`npm test` memakai PostgreSQL lokal melalui PGlite dan menguji migrasi berurutan, pendaftaran, NRP duplikat, fase, deadline, sandbox, session signature, CSRF, dan CSV. `npm run test:integration` menguji endpoint Next production dengan database lokal terisolasi. Keduanya tidak mengirim data ke Supabase asli.
