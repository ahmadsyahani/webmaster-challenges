import 'server-only';
import { questions, type TestCase } from '../questions';

// Hidden cases are never imported by client components or returned by the run API.
const hidden: Record<string, [string, unknown][]> = {
  '1': [['add(-8,-17)', -25], ['add(12.5,0.25)',12.75],['add(918,273)',1191]],
  '2': [['isEven(-12)',true],['isEven(-9)',false],['isEven(101)',false]],
  '3': [['reverseString("")',''], ['reverseString("abc 123!")','!321 cba']],
  '4': [['findMax([-8,-12,-9])',-8],['findMax([4,4,2])',4], ['(()=>{const a=[1,9,3];const n=findMax(a);return [n,a]})()',[9,[1,9,3]]]],
  '5': [['countVowels("AEIOU aeiou!123")',10], ['countVowels("")',0]],
  '6': [['isPalindrome("A man a plan a canal Panama")',true], ['isPalindrome("Ab ca")',false], ['isPalindrome("")',true]],
  '7': [['fizzBuzz(0)','FizzBuzz'],['fizzBuzz(30)','FizzBuzz'],['fizzBuzz(2)',2], ['fizzBuzz(-3)','Fizz']],
  '8': [['filterEven([])',[]], ['filterEven([-4,-3,0,2])',[-4,0,2]], ['(()=>{const a=[1,2,3];const b=filterEven(a);return [b,a,b!==a]})()',[[2],[1,2,3],true]]],
  '9': [['factorial(1)',1],['factorial(7)',5040],['factorial(10)',3628800]],
  '10': [['mostFrequentChar("baab")','b'],['mostFrequentChar("2211")','2'],['mostFrequentChar("z")','z'],['mostFrequentChar("abbbbaaaa")','a']],
};
export function casesFor(id: string, includeHidden: boolean): TestCase[] {
  const visible = questions.find(q => q.id === id)?.testCases || [];
  return [...visible, ...(includeHidden ? hidden[id] || [] : []).map(([input, value], i) => ({
    id: visible.length + i + 1, input, expectedOutput: JSON.stringify(value),
  }))];
}
