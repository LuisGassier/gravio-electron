# Reglas de Backfill - Enero 2026 OOSLMP

## 📊 Meta del Mes
**Total**: 2,814,440 kg (2,814.44 toneladas de RSU)

---

## 🚛 Vehículos (9 unidades totales)

### 1. Compactadores de 2 ejes (2 unidades)

**Capacidades:**
- **Peso RSU (residuos)**: 13,000 - 14,000 kg
- **Peso del vehículo vacío**: 13,200 - 15,500 kg
- **Peso bruto total (vehículo + RSU)**: 26,200 - 29,500 kg

**Unidades:**
| Placa    | No. Económico |
|----------|---------------|
| SP85738  | 2017          |
| SP85739  | 2018          |

---

### 2. Compactadores de 1 eje (3 unidades)

**Capacidades:**
- **Peso RSU (residuos)**: 9,000 - 10,000 kg
- **Peso del vehículo vacío**: 10,200 - 11,700 kg
- **Peso bruto total (vehículo + RSU)**: 19,200 - 21,700 kg

**Unidades:**
| Placa    | No. Económico |
|----------|---------------|
| SN43215  | 2013          |
| SN46198  | 2013          |
| SM02293  | 2010          |

---

### 3. Vehículos de carga tipo volteo (4 unidades)

**Capacidades:**
- **Peso RSU (residuos)**: 5,500 - 6,500 kg
- **Peso del vehículo vacío**: 6,000 - 7,500 kg
- **Peso bruto total (vehículo + RSU)**: 11,500 - 14,000 kg

**Unidades:**
| Placa    | No. Económico |
|----------|---------------|
| SP81281  | 2015          |
| SN31022  | 2012          |
| SN31025  | 2012          |
| SN43220  | 2012          |

---

## ⏰ Horarios de Ingreso

### Lunes a Sábado (3 turnos)

| Turno | Horario | Máximo de viajes |
|-------|---------|------------------|
| **Turno Mañana** | 7:30 AM - 3:00 PM | 9 viajes |
| **Turno Tarde** | 6:00 PM - 8:00 PM | 2 viajes |
| **Turno Nocturno** | 11:00 PM - 1:00 AM | 1 viaje |

**Total máximo de viajes lun-sáb por día**: 9 + 2 + 1 = **12 viajes**

### Domingo (1 turno)

| Turno | Horario | Máximo de viajes |
|-------|---------|------------------|
| **Turno único** | 4:00 PM - 8:00 PM | 1 viaje |

---

## 🔄 Diferencias vs Diciembre 2025

| Aspecto | Diciembre 2025 | Enero 2026 |
|---------|----------------|------------|
| **Tipos de vehículos** | 2 tipos (Carga trasera, Volteo) | 3 tipos (Comp. 2 ejes, Comp. 1 eje, Volteo) |
| **Total de vehículos** | 9 vehículos | 9 vehículos |
| **Turnos lun-sáb** | 2 turnos (mañana, tarde) | 3 turnos (mañana, tarde, noche) |
| **Viajes máximos lun-sáb** | Variable (~11-15) | 12 viajes (9+2+1) |
| **Viajes domingo** | 2-3 viajes | 1 viaje |
| **Meta mensual** | 2,751.37 toneladas | 2,814.44 toneladas |
| **Horario mañana** | 7:30 AM - 11:30 AM | 7:30 AM - 3:00 PM (más largo) |
| **Horario tarde** | 11:30 AM - 3:00 PM | 6:00 PM - 8:00 PM (separado) |
| **Horario noche** | No existía | 11:00 PM - 1:00 AM (nuevo) |

---

## 📝 Notas de Implementación

### Capacidades por tipo de vehículo:
```typescript
// Compactadores 2 ejes (2 unidades)
peso_rsu: 13000-14000 kg
peso_vehiculo: 13200-15500 kg
placas: ['SP85738', 'SP85739']
economicos: ['2017', '2018']

// Compactadores 1 eje (3 unidades)
peso_rsu: 9000-10000 kg
peso_vehiculo: 10200-11700 kg
placas: ['SN43215', 'SN46198', 'SM02293']
economicos: ['2013', '2013', '2010']

// Volteos (4 unidades)
peso_rsu: 5500-6500 kg
peso_vehiculo: 6000-7500 kg
placas: ['SP81281', 'SN31022', 'SN31025', 'SN43220']
economicos: ['2015', '2012', '2012', '2012']
```

### Distribución de turnos:
- **Turno mañana (7:30 AM - 3:00 PM)**: Mayor volumen, 9 viajes máximo
- **Turno tarde (6:00 PM - 8:00 PM)**: Menor volumen, 2 viajes máximo
- **Turno noche (11:00 PM - 1:00 AM)**: Mínimo volumen, 1 viaje máximo
- **Domingo (4:00 PM - 8:00 PM)**: 1 viaje máximo

### Cálculo de capacidad diaria:
```
Lun-Sáb:
- Turno mañana: 9 viajes × 10 tons promedio = 90 tons
- Turno tarde: 2 viajes × 10 tons promedio = 20 tons
- Turno noche: 1 viaje × 10 tons promedio = 10 tons
- Total: ~120 tons/día

Domingo:
- 1 viaje × 10 tons = ~10 tons/día

Meta diaria promedio (31 días):
2,814,440 kg ÷ 31 días = ~90,788 kg/día (~91 toneladas/día)
```

---

## ✅ Estado
- [ ] Script de backfill pendiente de creación
- [ ] Validación de reglas pendiente
- [ ] Prueba con datos reales pendiente
