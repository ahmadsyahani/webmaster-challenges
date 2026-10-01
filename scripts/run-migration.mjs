import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || 'https://eocnodljkqckrzerefjk.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvY25vZGxqa3Fja3J6ZXJlZmprIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTU2NDkxOCwiZXhwIjoyMTAxMTQwOTE4fQ.GxjH9nKMgPKY6NxfzSYztgDtDZMLZPn7_qkRF7KxW-s';

const db = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

console.log('Testing Supabase connectivity...');

// Test 1: Basic connection via submissions table
const { data: d1, error: e1 } = await db.from('submissions').select('id').limit(1);
console.log('1. submissions table:', e1 ? `ERROR - ${e1.code}: ${e1.message}` : `OK (${d1?.length} rows)`);

// Test 2: Check if assessment_attempts exists
const { data: d2, error: e2 } = await db.from('assessment_attempts').select('id').limit(1);
console.log('2. assessment_attempts:', e2 ? `MISSING - ${e2.code}: ${e2.message}` : `EXISTS (${d2?.length} rows)`);

// Test 3: Check if rate_limit function exists
const { data: d3, error: e3 } = await db.rpc('assessment_rate_limit', { p_key: 'test_check', p_max: 100, p_seconds: 60 });
console.log('3. assessment_rate_limit:', e3 ? `MISSING - ${e3.code}: ${e3.message}` : 'EXISTS');

// Test 4: Check if assessment_register function exists
const { data: d4, error: e4 } = await db.rpc('assessment_register', { p_nrp: '00000', p_nama: 'test', p_prodi: 'test', p_kelas: 'test' });
console.log('4. assessment_register:', e4 ? `MISSING/ERROR - ${e4.code}: ${e4.message}` : 'EXISTS');

console.log('\nDiagnosis complete.');
