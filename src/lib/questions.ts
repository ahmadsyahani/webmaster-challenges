// src/lib/questions.ts

export interface TestCase {
  id: number;
  input: string;
  expectedOutput: string;
}

export interface Question {
  id: string;
  title: string;
  difficulty: 'Mudah' | 'Sedang';
  description: string;
  hint: string; // <-- Properti Hint Baru
  initialCode: string;
  testCases: TestCase[];
}

export const questions: Question[] = [
  {
    id: '1',
    title: 'Penjumlahan Dua Angka',
    difficulty: 'Mudah',
    description: 'Buatlah fungsi `add(a, b)` yang menerima dua argumen berupa angka dan mengembalikan hasil penjumlahannya.',
    hint: 'Gunakan operator aritmatika tambah (+) untuk menjumlahkan nilai `a` dan `b`, lalu gunakan keyword `return`.',
    initialCode: `function add(a, b) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'add(2, 3)', expectedOutput: '5' },
      { id: 2, input: 'add(-1, 5)', expectedOutput: '4' },
      { id: 3, input: 'add(0, 0)', expectedOutput: '0' },
    ],
  },
  {
    id: '2',
    title: 'Cek Angka Genap',
    difficulty: 'Mudah',
    description: 'Buatlah fungsi `isEven(n)` yang mengembalikan nilai boolean `true` jika angka genap, dan `false` jika ganjil.',
    hint: 'Angka genap adalah angka yang jika dibagi 2 sisa baginya adalah 0. Gunakan operator modulo (`n % 2 === 0`).',
    initialCode: `function isEven(n) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'isEven(4)', expectedOutput: 'true' },
      { id: 2, input: 'isEven(7)', expectedOutput: 'false' },
      { id: 3, input: 'isEven(0)', expectedOutput: 'true' },
    ],
  },
  {
    id: '3',
    title: 'Pembalik String (Reverse String)',
    difficulty: 'Mudah',
    description: 'Buatlah fungsi `reverseString(str)` yang menerima sebuah string dan mengembalikan string yang dibalik.',
    hint: 'Kamu bisa memecah string jadi array (`str.split("")`), membalik array (`.reverse()`), lalu menggabungkannya kembali (`.join("")`).',
    initialCode: `function reverseString(str) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'reverseString("hello")', expectedOutput: '"olleh"' },
      { id: 2, input: 'reverseString("PensMate")', expectedOutput: '"etaMsneP"' },
      { id: 3, input: 'reverseString("a")', expectedOutput: '"a"' },
    ],
  },
  {
    id: '4',
    title: 'Cari Angka Terbesar',
    difficulty: 'Mudah',
    description: 'Buatlah fungsi `findMax(arr)` yang menerima sebuah array berisi angka dan mengembalikan angka dengan nilai terbesar.',
    hint: 'Gunakan fungsi `Math.max(...arr)` dengan spread operator, atau gunakan perulangan `for` untuk membandingkan nilai.',
    initialCode: `function findMax(arr) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'findMax([1, 5, 3, 9, 2])', expectedOutput: '9' },
      { id: 2, input: 'findMax([-10, -3, -50])', expectedOutput: '-3' },
      { id: 3, input: 'findMax([100])', expectedOutput: '100' },
    ],
  },
  {
    id: '5',
    title: 'Hitung Huruf Vokal',
    difficulty: 'Sedang',
    description: 'Buatlah fungsi `countVowels(str)` yang menghitung jumlah huruf vokal (a, e, i, o, u) dalam sebuah string (abaikan kapitalisasi/case-insensitive).',
    hint: 'Ubah string ke huruf kecil terlebih dahulu dengan `.toLowerCase()`, lalu gunakan Regex `str.match(/[aeiou]/g)` atau loop mengecek tiap karakter.',
    initialCode: `function countVowels(str) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'countVowels("Javascript")', expectedOutput: '3' },
      { id: 2, input: 'countVowels("PENS")', expectedOutput: '1' },
      { id: 3, input: 'countVowels("xyz")', expectedOutput: '0' },
    ],
  },
  {
    id: '6',
    title: 'Cek Palindrom',
    difficulty: 'Sedang',
    description: 'Buatlah fungsi `isPalindrome(str)` yang mengecek apakah suatu kata bernilai sama jika dibaca dari depan maupun belakang (Case-insensitive & abaikan spasi).',
    hint: 'Bersihkan string dari spasi dan ubah ke huruf kecil (`str.toLowerCase().replace(/\\s+/g, "")`), lalu bandingkan dengan versi string terbalik.',
    initialCode: `function isPalindrome(str) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'isPalindrome("katak")', expectedOutput: 'true' },
      { id: 2, input: 'isPalindrome("Kasur rusak")', expectedOutput: 'true' },
      { id: 3, input: 'isPalindrome("PensMate")', expectedOutput: 'false' },
    ],
  },
  {
    id: '7',
    title: 'FizzBuzz Classic',
    difficulty: 'Sedang',
    description: 'Buatlah fungsi `fizzBuzz(n)`. Jika `n` habis dibagi 3 & 5 kembalikan `"FizzBuzz"`, jika habis dibagi 3 kembalikan `"Fizz"`, jika habis dibagi 5 kembalikan `"Buzz"`, selain itu kembalikan angka `n` itu sendiri (dalam tipe angka/number).',
    hint: 'Pastikan pengecekan kondisi habis dibagi 3 DAN 5 (`n % 15 === 0`) ditaruh di urutan paling atas pengkondisian `if`.',
    initialCode: `function fizzBuzz(n) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'fizzBuzz(15)', expectedOutput: '"FizzBuzz"' },
      { id: 2, input: 'fizzBuzz(9)', expectedOutput: '"Fizz"' },
      { id: 3, input: 'fizzBuzz(10)', expectedOutput: '"Buzz"' },
      { id: 4, input: 'fizzBuzz(7)', expectedOutput: '7' },
    ],
  },
  {
    id: '8',
    title: 'Filter Angka Genap',
    difficulty: 'Mudah',
    description: 'Buatlah fungsi `filterEven(arr)` yang menerima sebuah array angka dan mengembalikan array baru yang hanya berisi angka-angka genap saja.',
    hint: 'Gunakan method array bawaan JavaScript `arr.filter(num => num % 2 === 0)`.',
    initialCode: `function filterEven(arr) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'filterEven([1, 2, 3, 4, 5, 6])', expectedOutput: '[2,4,6]' },
      { id: 2, input: 'filterEven([1, 3, 5])', expectedOutput: '[]' },
      { id: 3, input: 'filterEven([10, 20])', expectedOutput: '[10,20]' },
    ],
  },
  {
    id: '9',
    title: 'Hitung Faktorial',
    difficulty: 'Sedang',
    description: 'Buatlah fungsi `factorial(n)` yang mengembalikan nilai faktorial dari angka `n` (contoh: 5! = 5*4*3*2*1 = 120). Jika `n = 0`, kembalikan `1`.',
    hint: 'Gunakan perulangan `for` mundur dari `n` ke `1` sambil mengalikan variabel penampung, atau gunakan teknik rekursif `n * factorial(n - 1)`.',
    initialCode: `function factorial(n) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'factorial(5)', expectedOutput: '120' },
      { id: 2, input: 'factorial(0)', expectedOutput: '1' },
      { id: 3, input: 'factorial(3)', expectedOutput: '6' },
    ],
  },
  {
    id: '10',
    title: 'Karakter Paling Sering Muncul',
    difficulty: 'Sedang',
    description: 'Buatlah fungsi `mostFrequentChar(str)` yang mengembalikan karakter (huruf/angka) yang paling sering muncul dalam sebuah string.',
    hint: 'Gunakan objek/hashmap untuk menyimpan frekuensi tiap karakter, lalu cari karakter dengan nilai frekuensi tertinggi.',
    initialCode: `function mostFrequentChar(str) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'mostFrequentChar("pensmate")', expectedOutput: '"e"' },
      { id: 2, input: 'mostFrequentChar("apple")', expectedOutput: '"p"' },
      { id: 3, input: 'mostFrequentChar("javascript")', expectedOutput: '"a"' },
    ],
  },
];

export function getQuestionById(id: string): Question | undefined {
  return questions.find((q) => q.id === id);
}