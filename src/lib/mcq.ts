// src/lib/mcq.ts

export interface MCQ {
  id: number;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctAnswer: number; // Index dari opsi yang benar (0-3)
}

export const mcqQuestions: MCQ[] = [
  {
    id: 1,
    question: "Jika nilai A = 5 dan B = 10, lalu kita jalankan perintah: A = B; B = A; Berapakah nilai akhir A dan B?",
    options: ["A = 5, B = 10", "A = 10, B = 5", "A = 10, B = 10", "A = 5, B = 5"],
    correctAnswer: 2
  },
  {
    id: 2,
    question: "Apa output dari operasi logika berikut: (True AND False) OR True?",
    options: ["True", "False", "Error", "Null"],
    correctAnswer: 0
  },
  {
    id: 3,
    question: "Perhatikan potongan pseudo-code berikut. Berapa kali kata 'PensMate' akan dicetak?",
    codeSnippet: "FOR i = 1 TO 5\n  IF i % 2 == 0 THEN\n    PRINT 'PensMate'\n  END IF\nEND FOR",
    options: ["2 kali", "3 kali", "4 kali", "5 kali"],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "Struktur data apa yang menggunakan prinsip LIFO (Last In First Out)?",
    options: ["Queue", "Array", "Stack", "Linked List"],
    correctAnswer: 2
  },
  {
    id: 5,
    question: "Apa hasil dari operasi tipe data campuran berikut di JavaScript: \"5\" + 5?",
    options: ["10", "\"10\"", "\"55\"", "Error"],
    correctAnswer: 2
  },
  {
    id: 6,
    question: "Jika sebuah array memiliki 10 elemen, berapakah indeks dari elemen terakhir?",
    options: ["10", "9", "11", "0"],
    correctAnswer: 1
  },
  {
    id: 7,
    question: "Dalam pemrograman, apa fungsi utama dari kondisi 'Base Case' pada sebuah fungsi Rekursif?",
    options: ["Mempercepat eksekusi program", "Menghentikan pemanggilan fungsi agar tidak infinite loop", "Mengembalikan nilai string", "Mendeklarasikan variabel baru"],
    correctAnswer: 1
  },
  {
    id: 8,
    question: "Apa output dari perhitungan sisa bagi (modulo) berikut: 17 % 4?",
    options: ["4", "1", "3", "0"],
    correctAnswer: 1
  },
  {
    id: 9,
    question: "Kondisi mana yang akan bernilai TRUE jika X = 15?",
    options: ["X > 10 AND X < 15", "X >= 15 OR X == 10", "NOT (X == 15)", "X < 10 AND X > 20"],
    correctAnswer: 1
  },
  {
    id: 10,
    question: "Perhatikan kode berikut. Apa nilai akhir dari 'total'?",
    codeSnippet: "let total = 0;\nlet i = 0;\nWHILE i < 3 DO\n  total = total + i;\n  i = i + 1;\nEND WHILE",
    options: ["3", "6", "2", "0"],
    correctAnswer: 0 // i=0(0), i=1(1), i=2(3). 0+1+2 = 3
  },
  {
    id: 11,
    question: "Tipe error apa yang terjadi ketika program mencoba mengakses indeks array yang tidak ada?",
    options: ["Syntax Error", "Logic Error", "Runtime Error / Out of Bounds", "Compilation Error"],
    correctAnswer: 2
  },
  {
    id: 12,
    question: "Sebuah algoritma membagi data menjadi dua bagian setiap kali proses pencarian. Algoritma apa ini?",
    options: ["Linear Search", "Bubble Sort", "Binary Search", "Selection Sort"],
    correctAnswer: 2
  },
  {
    id: 13,
    question: "Perhatikan fungsi logika berikut. Apa output dari fungsi ini jika diinputkan kata 'KASUR'?",
    codeSnippet: "FUNCTION cek(kata)\n  RETURN kata == REVERSE(kata)\nEND FUNCTION",
    options: ["True", "False", "KASURRUSAK", "Error"],
    correctAnswer: 1 // KASUR direverse jadi RUSAK. KASUR != RUSAK
  },
  {
    id: 14,
    question: "Dalam konsep OOP, kemampuan suatu fungsi untuk memiliki nama yang sama namun perilaku berbeda tergantung parameter disebut?",
    options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
    correctAnswer: 1
  },
  {
    id: 15,
    question: "Jika program terjebak dalam perulangan yang tidak pernah berhenti, masalah tersebut disebut?",
    options: ["Syntax Loop", "Deadlock", "Infinite Loop", "Memory Leak"],
    correctAnswer: 2
  }
];