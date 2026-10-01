// src/lib/mcq.ts

export interface MCQ {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
}

export type MCQQuestion = MCQ;

export function getMCQById(id: string | number): MCQ | undefined {
  return mcqQuestions.find((q) => String(q.id) === String(id));
}

export const mcqQuestions: MCQ[] = [
  {
    id: 1,
    question: "Jika nilai A = 5 dan B = 10, lalu kita jalankan perintah: A = B; B = A; Berapakah nilai akhir A dan B?",
    options: ["A = 5, B = 10", "A = 10, B = 5", "A = 10, B = 10", "A = 5, B = 5"],
  },
  {
    id: 2,
    question: "Apa output dari operasi logika berikut: (True AND False) OR True?",
    options: ["True", "False", "Error", "Null"],
  },
  {
    id: 3,
    question: "Perhatikan potongan pseudo-code berikut. Berapa kali kata 'PensMate' akan dicetak?",
    codeSnippet: "FOR i = 1 TO 5\n  IF i % 2 == 0 THEN\n    PRINT 'PensMate'\n  END IF\nEND FOR",
    options: ["2 kali", "3 kali", "4 kali", "5 kali"],
  },
  {
    id: 4,
    question: "Struktur data apa yang menggunakan prinsip LIFO (Last In First Out)?",
    options: ["Queue", "Array", "Stack", "Linked List"],
  },
  {
    id: 5,
    question: "Apa hasil dari operasi tipe data campuran berikut di JavaScript: \"5\" + 5?",
    options: ["10", "\"10\"", "\"55\"", "Error"],
  },
  {
    id: 6,
    question: "Jika sebuah array memiliki 10 elemen, berapakah indeks dari elemen terakhir?",
    options: ["10", "9", "11", "0"],
  },
  {
    id: 7,
    question: "Dalam pemrograman, apa fungsi utama dari kondisi 'Base Case' pada sebuah fungsi Rekursif?",
    options: ["Mempercepat eksekusi program", "Menghentikan pemanggilan fungsi agar tidak infinite loop", "Mengembalikan nilai string", "Mendeklarasikan variabel baru"],
  },
  {
    id: 8,
    question: "Apa output dari perhitungan sisa bagi (modulo) berikut: 17 % 4?",
    options: ["4", "1", "3", "0"],
  },
  {
    id: 9,
    question: "Kondisi mana yang akan bernilai TRUE jika X = 15?",
    options: ["X > 10 AND X < 15", "X >= 15 OR X == 10", "NOT (X == 15)", "X < 10 AND X > 20"],
  },
  {
    id: 10,
    question: "Perhatikan kode berikut. Apa nilai akhir dari 'total'?",
    codeSnippet: "let total = 0;\nlet i = 0;\nWHILE i < 3 DO\n  total = total + i;\n  i = i + 1;\nEND WHILE",
    options: ["3", "6", "2", "0"],
  },
  {
    id: 11,
    question: "Pada bahasa yang memeriksa batas array (misalnya Java), tipe error apa yang terjadi ketika program mengakses indeks di luar batas array?",
    options: ["Syntax Error", "Logic Error", "Runtime Error / Out of Bounds", "Compilation Error"],
  },
  {
    id: 12,
    question: "Sebuah algoritma membagi data menjadi dua bagian setiap kali proses pencarian. Algoritma apa ini?",
    options: ["Linear Search", "Bubble Sort", "Binary Search", "Selection Sort"],
  },
  {
    id: 13,
    question: "Perhatikan fungsi logika berikut. Apa output dari fungsi ini jika diinputkan kata 'KASUR'?",
    codeSnippet: "FUNCTION cek(kata)\n  RETURN kata == REVERSE(kata)\nEND FUNCTION",
    options: ["True", "False", "KASURRUSAK", "Error"],
  },
  {
    id: 14,
    question: "Dalam konsep OOP, kemampuan suatu fungsi untuk memiliki nama yang sama namun perilaku berbeda tergantung parameter disebut?",
    options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
  },
  {
    id: 15,
    question: "Jika program terjebak dalam perulangan yang tidak pernah berhenti, masalah tersebut disebut?",
    options: ["Syntax Loop", "Deadlock", "Infinite Loop", "Memory Leak"],
  },
  {
    id: 16,
    question: "Apa output dari kode JavaScript berikut?",
    codeSnippet: "const angka = [2, 4, 6];\nconst hasil = angka.map(n => n / 2);\nconsole.log(hasil[1]);",
    options: ["2", "4", "6", "undefined"],
  },
  {
    id: 17,
    question: "Apa hasil dari perbandingan JavaScript berikut: \"5\" === 5?",
    options: ["true, karena nilainya sama", "false, karena tipenya berbeda", "5", "Error"],
  },
  {
    id: 18,
    question: "Perhatikan pseudo-code berikut. Angka mana yang dicetak?",
    codeSnippet: "FOR i = 1 TO 4\n  IF i == 3 THEN CONTINUE\n  PRINT i\nEND FOR",
    options: ["1, 2, 3, 4", "1, 2, 4", "3 saja", "1, 2, 3"],
  },
  {
    id: 19,
    question: "Jika data sudah terurut, berapa kompleksitas waktu pencarian binary search pada n elemen?",
    options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
  },
  {
    id: 20,
    question: "Perhatikan dua perulangan bersarang berikut. Berapa kali PRINT dijalankan?",
    codeSnippet: "FOR i = 1 TO 3\n  FOR j = 1 TO 2\n    PRINT 'PensMate'\n  END FOR\nEND FOR",
    options: ["2 kali", "3 kali", "5 kali", "6 kali"],
  }
];
