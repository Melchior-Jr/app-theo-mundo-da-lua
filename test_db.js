import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key) env[key.trim()] = vals.join('=').trim();
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function testInsert() {
  const authLogin = await supabase.auth.signInWithPassword({
    email: 'admin@theo.com', // Let's not guess, wait... I don't know the email.
    password: 'password'
  });
  console.log("Auth:", authLogin.error);
}

testInsert();
