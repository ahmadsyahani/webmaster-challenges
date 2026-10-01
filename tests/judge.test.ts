import { test } from 'node:test';
import assert from 'node:assert/strict';
import { judge } from '../src/lib/server/judge';
import { casesFor } from '../src/lib/server/test-cases';

test('all ten reference solutions pass public and hidden cases', async () => {
  const solutions = [
    'function add(a,b){return a+b}', 'function isEven(n){return n%2===0}',
    'function reverseString(s){return s.split("").reverse().join("")}',
    'function findMax(a){return Math.max(...a)}',
    'function countVowels(s){return (s.match(/[aeiou]/gi)||[]).length}',
    'function isPalindrome(s){s=s.toLowerCase().replace(/\\s/g, "");return s===s.split("").reverse().join("")}',
    'function fizzBuzz(n){return n%15===0?"FizzBuzz":n%3===0?"Fizz":n%5===0?"Buzz":n}',
    'function filterEven(a){return a.filter(n=>n%2===0)}',
    'function factorial(n){return n===0?1:n*factorial(n-1)}',
    'function mostFrequentChar(s){const f={};for(const c of s)f[c]=(f[c]||0)+1;let best=s[0];for(const c of s)if(f[c]>f[best])best=c;return best}',
  ];
  for (const [i, code] of solutions.entries()) {
    const result = await judge(code, casesFor(String(i+1),true));
    assert.ok(result.results.every(r => r.passed), JSON.stringify({ question: i+1, result }));
  }
});
test('candidate code cannot access server capabilities', async () => {
  const result = await judge('', [{ id: 1, input: '[typeof process,typeof require,typeof fetch,typeof console]', expectedOutput: '["undefined","undefined","undefined","undefined"]' }]);
  assert.equal(result.results[0].passed,true);
});
test('infinite loops stop, and a subsequent correct submission still works', async () => {
  const started = Date.now();
  assert.equal((await judge('while(true){}', casesFor('1',false))).results.every(r => !r.passed),true);
  assert.ok(Date.now()-started < 6000);
  assert.ok((await judge('function add(a,b){return a+b}', casesFor('1',false))).results.every(r => r.passed));
});
test('overriding JSON.stringify cannot forge a passing result', async () => {
  const result = await judge('JSON.stringify=()=>"5"; function add(){return -999}', casesFor('1',false));
  assert.ok(result.results.every(r => !r.passed));
});
test('passing examples alone does not satisfy hidden cases', async () => {
  const code = 'function add(a,b){return a===2?5:a===-1?4:0}';
  assert.ok((await judge(code,casesFor('1',false))).results.every(r=>r.passed));
  assert.ok((await judge(code,casesFor('1',true))).results.some(r=>!r.passed));
});
test('memory exhaustion, syntax errors and recursive loops cannot crash the host', async () => {
  for (const code of ['const x=[];while(true){x.push("x".repeat(100000))}', 'function add( {', 'function add(){return add()}']) {
    assert.ok((await judge(code,casesFor('1',false))).results.every(r=>!r.passed));
  }
});
