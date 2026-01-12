require('dotenv').config({ path: '.env.backfill' })
require('child_process').execSync('npx ts-node scripts/backfill_ooslmp_december_2025.ts', { stdio: 'inherit' })
