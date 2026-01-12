// Simple runner to load .env.backfill and execute the backfill script
require('dotenv').config({ path: '.env.backfill' });

// Execute the TypeScript backfill script
const { execSync } = require('child_process');

try {
  console.log('🚀 Cargando variables de entorno desde .env.backfill...');
  console.log(`   SUPABASE_URL: ${process.env.SUPABASE_URL}`);
  console.log(`   DRY_RUN: ${process.env.DRY_RUN}`);
  console.log('');

  execSync('npx ts-node scripts/backfill_ooslmp_december_2025.ts', {
    stdio: 'inherit',
    env: process.env
  });
} catch (error) {
  console.error('Error ejecutando backfill:', error.message);
  process.exit(1);
}
