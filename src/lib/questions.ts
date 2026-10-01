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
  initialCode: string;
  testCases: TestCase[];
}

export const questions: Question[] = [
  {
    id: '1',
    title: 'Penjumlahan Dua Angka',
    difficulty: 'Mudah',
    description: 'Buatlah fungsi `add(a, b)` yang menerima dua parameter berupa angka dan mengembalikan hasil penjumlahan keduanya.\n\nFungsi ini harus bisa menangani angka positif, negatif, dan nol. Pastikan kamu menggunakan kata kunci `return` untuk mengembalikan nilai.',
    initialCode: `function add(a, b) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'add(2, 3)', expectedOutput: '5' },
      { id: 2, input: 'add(-1, 5)', expectedOutput: '4' },
      { id: 3, input: 'add(0, 0)', expectedOutput: '0' },
    ],
  },
  {
    id: '2',
    title: 'Cek Angka Genap atau Ganjil',
    difficulty: 'Mudah',
    description: 'Buatlah fungsi `isEven(n)` yang menerima sebuah angka bilangan bulat dan mengembalikan nilai boolean:\n- `true` jika angka tersebut adalah angka **genap**\n- `false` jika angka tersebut adalah angka **ganjil**\n\nIngat bahwa angka 0 termasuk angka genap.',
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
    description: 'Buatlah fungsi `reverseString(str)` yang menerima sebuah string dan mengembalikan string tersebut dalam urutan karakter yang terbalik.\n\nContoh: `"hello"` menjadi `"olleh"`, `"PensMate"` menjadi `"etaMsneP"`.\n\nFungsi ini harus bekerja pada string dengan panjang berapapun, termasuk string yang hanya berisi satu karakter.',
    initialCode: `function reverseString(str) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'reverseString("hello")', expectedOutput: '"olleh"' },
      { id: 2, input: 'reverseString("PensMate")', expectedOutput: '"etaMsneP"' },
      { id: 3, input: 'reverseString("a")', expectedOutput: '"a"' },
    ],
  },
  {
    id: '4',
    title: 'Cari Nilai Terbesar dalam Array',
    difficulty: 'Mudah',
    description: 'Buatlah fungsi `findMax(arr)` yang menerima sebuah array berisi angka-angka dan mengembalikan **angka dengan nilai terbesar** di antara semua elemen dalam array tersebut.\n\nKamu tidak boleh mengubah isi array aslinya. Anggap array selalu berisi minimal satu elemen dan semua elemennya adalah angka valid.',
    initialCode: `function findMax(arr) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'findMax([1, 5, 3, 9, 2])', expectedOutput: '9' },
      { id: 2, input: 'findMax([-10, -3, -50])', expectedOutput: '-3' },
      { id: 3, input: 'findMax([100])', expectedOutput: '100' },
    ],
  },
  {
    id: '5',
    title: 'Hitung Jumlah Huruf Vokal',
    difficulty: 'Sedang',
    description: 'Buatlah fungsi `countVowels(str)` yang menghitung dan mengembalikan **jumlah huruf vokal** (a, e, i, o, u) yang ada dalam sebuah string.\n\nFungsi ini harus bersifat **case-insensitive** (tidak membedakan huruf besar/kecil), sehingga huruf `"A"` dan `"a"` sama-sama dihitung sebagai vokal. Karakter non-huruf (angka, spasi, dll) diabaikan.',
    initialCode: `function countVowels(str) {\n  // Tulis kode kamu di sini\n  \n}`,
    testCases: [
      { id: 1, input: 'countVowels("Javascript")', expectedOutput: '3' },
      { id: 2, input: 'countVowels("PENS")', expectedOutput: '1' },
      { id: 3, input: 'countVowels("xyz")', expectedOutput: '0' },
    ],
  },
  {
    id: '6',
    title: 'Cek Kata Palindrom',
    difficulty: 'Sedang',
    description: 'Buatlah fungsi `isPalindrome(str)` yang mengecek apakah sebuah string merupakan **palindrom** — yaitu teks yang dibaca sama dari depan maupun dari belakang.\n\nAturan:\n- **Case-insensitive**: `"Katak"` dan `"katak"` dianggap palindrom\n- **Abaikan spasi**: `"Kasur rusak"` dianggap palindrom\n- Kembalikan `true` jika palindrom, `false` jika tidak',
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
    description: 'Buatlah fungsi `fizzBuzz(n)` dengan aturan berikut:\n- Jika `n` habis dibagi **3 dan 5**, kembalikan string `"FizzBuzz"`\n- Jika `n` habis dibagi **3 saja**, kembalikan string `"Fizz"`\n- Jika `n` habis dibagi **5 saja**, kembalikan string `"Buzz"`\n- Selain itu, kembalikan angka `n` itu sendiri (bertipe **number**, bukan string)\n\nUrutan pengecekan kondisi sangat penting!',
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
    title: 'Filter Angka Genap dari Array',
    difficulty: 'Mudah',
    description: 'Buatlah fungsi `filterEven(arr)` yang menerima sebuah array berisi angka-angka dan mengembalikan **array baru** yang hanya berisi **angka-angka genap** saja.\n\nArray asli tidak boleh diubah. Jika tidak ada angka genap sama sekali, kembalikan array kosong `[]`.',
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
    description: 'Buatlah fungsi `factorial(n)` yang menghitung dan mengembalikan nilai **faktorial** dari bilangan bulat non-negatif `n`.\n\nDefinisi faktorial:\n- `0! = 1` (base case)\n- `n! = n × (n-1) × ... × 2 × 1`\n\nContoh: `5! = 5 × 4 × 3 × 2 × 1 = 120`\n\nKamu bisa menggunakan pendekatan iteratif (loop) maupun rekursif.',
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
    description: 'Buatlah fungsi `mostFrequentChar(str)` yang menerima sebuah string dan mengembalikan **karakter yang paling sering muncul** di dalamnya.\n\nAturan:\n- Hitung frekuensi kemunculan setiap karakter\n- Kembalikan karakter dengan frekuensi tertinggi\n- Jika ada dua karakter dengan frekuensi sama, kembalikan yang **pertama muncul** dalam string\n- String dijamin tidak kosong',
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
