
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.backfill') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteFebruaryRecords() {
  console.log('🗑️ Deleting all records for February 2026...');

  // ISO Dates for February 2026
  const startDate = '2026-02-01T00:00:00.000Z';
  const endDate = '2026-03-01T00:00:00.000Z';

  const { error, count } = await supabase
    .from('registros')
    .delete({ count: 'exact' })
    .gte('fecha_entrada', startDate)
    .lt('fecha_entrada', endDate);

  if (error) {
    console.error('❌ Error deleting records:', error);
    return;
  }

  console.log(`✅ Successfully deleted ${count} records from Feb 2026.`);
}

deleteFebruaryRecords();
