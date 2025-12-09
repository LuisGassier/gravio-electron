// Simulador local para validar distribución y promedios
// Ejecutar con: `npx ts-node scripts/simulate_ooslmp_generator.ts`

function sampleTruncatedNormal(mean: number, std: number, min: number, max: number) {
  for (let i = 0; i < 100; i++) {
    const u1 = Math.random()
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    const v = mean + z * std
    if (v >= min && v <= max) return v
  }
  return Math.max(min, Math.min(max, mean))
}

function simulateMonth(days = 30, targetKg = 380000, targetDailyMean = 10) {
  const variation = (Math.random() * 2 - 1) * 10000
  const monthlyTarget = targetKg + variation
  const totalRuns = days * targetDailyMean
  const perRunKg = monthlyTarget / totalRuns

  const records: number[] = []
  let totalKg = 0
  for (let d = 0; d < days; d++) {
    const dailyCount = Math.max(0, Math.round(sampleTruncatedNormal(targetDailyMean, 1.0, 9, 11)))
    let dailyKg = 0
    for (let i = 0; i < dailyCount; i++) {
      const mean = Math.max(perRunKg, 500)
      const std = Math.max(mean * 0.15, 50)
      const w = Math.round(sampleTruncatedNormal(mean, std, Math.max(200, mean * 0.5), mean * 2))
      dailyKg += w
      totalKg += w
    }
    records.push(dailyCount)
  }
  const avgDaily = records.reduce((a,b)=>a+b,0)/records.length
  return { monthlyTarget, totalKg, avgDaily }
}

function runTrials(trials = 1000) {
  const results = []
  for (let i = 0; i < trials; i++) {
    results.push(simulateMonth(30, 380000, 10))
  }
  const avgTotalKg = results.reduce((s,r)=>s + r.totalKg,0)/trials
  const avgDailyRecords = results.reduce((s,r)=>s + r.avgDaily,0)/trials
  console.log('Simulación (', trials, 'trials):')
  console.log('kg total promedio:', Math.round(avgTotalKg))
  console.log('registros diarios promedio:', (avgDailyRecords).toFixed(2))
}

runTrials(200)
