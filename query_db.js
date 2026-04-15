import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key) env[key.trim()] = vals.join('=').trim();
});

const supabase = createClient(env['VITE_SUPABASE_URL'], env['VITE_SUPABASE_ANON_KEY']);

async function check() {
  const { data: cols } = await supabase.rpc('get_column_names', { table_name: 'app_subjects' });
  // Se o RPC não existir, vamos tentar um select simples
  const { data, error } = await supabase.from('app_subjects').select('*').eq('slug', 'geociencias').single();
  console.log("Geosciences Subject:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}

check();
