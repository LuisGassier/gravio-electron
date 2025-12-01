# Clean Architecture - Sistema de Pesajes

## 📁 Estructura Implementada

```
src/
├── domain/                         # Capa de Dominio (independiente)
│   ├── shared/
│   │   ├── Result.ts              # Result pattern para manejo de errores
│   │   └── ValueObject.ts         # Base para value objects
│   ├── entities/
│   │   ├── Registro.ts            # Entidad principal con lógica de negocio
│   │   ├── Vehiculo.ts
│   │   ├── Operador.ts
│   │   ├── Ruta.ts
│   │   └── Empresa.ts
│   ├── repositories/              # Interfaces (contratos)
│   │   ├── IRegistroRepository.ts
│   │   ├── IVehiculoRepository.ts
│   │   ├── IOperadorRepository.ts
│   │   ├── IRutaRepository.ts
│   │   └── IEmpresaRepository.ts
│   ├── use-cases/                 # Casos de uso (lógica de aplicación)
│   │   ├── registro/
│   │   │   ├── CreateEntrada.ts
│   │   │   ├── CompleteWithSalida.ts
│   │   │   └── FindPendingRegistros.ts
│   │   └── sync/
│   │       └── SyncRegistros.ts
│   ├── hardware/
│   │   └── IWeightReader.ts       # Interface para básculas
│   └── index.ts                   # Barrel exports
│
├── infrastructure/                # Frameworks & Drivers
│   ├── database/
│   │   ├── SQLiteRegistroRepository.ts    # Implementación SQLite
│   │   └── SupabaseRegistroRepository.ts  # Implementación Supabase
│   ├── hardware/
│   │   └── MettlerToledoScale.ts  # Implementación báscula
│   └── index.ts
│
├── application/                   # Interface Adapters
│   ├── services/
│   │   ├── PesajeService.ts      # Orquestación de pesajes
│   │   └── SyncService.ts        # Sincronización mejorada
│   ├── DIContainer.ts            # Inyección de dependencias
│   └── index.ts
│
└── presentation/                  # UI (React components)
    └── components/
```

## 🎯 Uso de la Arquitectura

### 1. Inicialización en `main.tsx`

```typescript
import { container } from './application';

// Al iniciar la app
container.initialize().then(() => {
  console.log('App inicializada con clean architecture');
});

// Al cerrar la app
window.addEventListener('beforeunload', () => {
  container.cleanup();
});
```

### 2. Registrar Entrada de Pesaje

```typescript
import { container } from '@/application';

const pesajeService = container.pesajeService;

// Registrar entrada
const result = await pesajeService.registrarEntrada({
  claveRuta: 901,
  ruta: 'San Andrés Cholula',
  placaVehiculo: 'SP30173',
  numeroEconomico: '7',
  claveOperador: 365,
  operador: 'Juan Pérez',
  claveEmpresa: 7,
  claveConcepto: 1,
  conceptoId: '2ff384aa-a4d2-4dce-9005-f051b40095d2',
  observaciones: 'Pesaje normal',
});

if (result.success) {
  const registro = result.value;
  console.log('✅ Entrada registrada:', registro.folio);
  console.log('Peso entrada:', registro.pesoEntrada, 'kg');
} else {
  console.error('❌ Error:', result.error.message);
  toast.error(result.error.message);
}
```

### 3. Registrar Salida de Pesaje

```typescript
import { container } from '@/application';

const pesajeService = container.pesajeService;

// Registrar salida
const result = await pesajeService.registrarSalida(
  'SP30173',
  'Salida normal'
);

if (result.success) {
  const registro = result.value;
  console.log('✅ Salida registrada:', registro.folio);
  console.log('Peso entrada:', registro.pesoEntrada, 'kg');
  console.log('Peso salida:', registro.pesoSalida, 'kg');
  console.log('Peso neto:', registro.getPesoNeto(), 'kg');
} else {
  console.error('❌ Error:', result.error.message);
}
```

### 4. Sincronización Manual

```typescript
import { container } from '@/application';

const syncService = container.syncService;

// Sincronizar ahora
const result = await syncService.syncNow();

console.log(`Sincronizados: ${result.synced}`);
console.log(`Fallidos: ${result.failed}`);

if (result.errors.length > 0) {
  result.errors.forEach((error) => {
    console.error(`- ${error.registroId}: ${error.error}`);
  });
}
```

### 5. Monitorear Peso en Tiempo Real

```typescript
import { container } from '@/application';

const pesajeService = container.pesajeService;

// Registrar callback para actualizaciones
pesajeService.onPesoActualizado((peso) => {
  console.log('Peso actual:', peso, 'kg');
  // Actualizar UI
  setPeso(peso);
});

// Obtener peso actual
const pesoActual = pesajeService.getPesoActual();
console.log('Peso:', pesoActual);

// Verificar conexión
if (pesajeService.isBasculaConectada()) {
  console.log('✅ Báscula conectada');
} else {
  console.log('❌ Báscula no conectada');
}
```

### 6. Buscar Registros Pendientes

```typescript
import { container } from '@/application';

const pesajeService = container.pesajeService;

// Buscar registros pendientes por placa
const result = await pesajeService.buscarPendientes('SP30173');

if (result.success) {
  const pendientes = result.value;
  
  if (pendientes.length > 0) {
    console.log(`⚠️ Hay ${pendientes.length} registros pendientes:`);
    pendientes.forEach((reg) => {
      console.log(`- Entrada: ${reg.fechaEntrada}, Peso: ${reg.pesoEntrada} kg`);
    });
  } else {
    console.log('✅ No hay registros pendientes');
  }
}
```

## 🏗️ Principios Aplicados

### SOLID

✅ **Single Responsibility (SRP)**
- `CreateEntradaUseCase`: Solo crear entradas
- `CompleteWithSalidaUseCase`: Solo completar salidas
- `SyncRegistrosUseCase`: Solo sincronizar
- Cada clase tiene una única razón para cambiar

✅ **Open/Closed (OCP)**
- `IWeightReader`: Interface abierta para extensión
- Podemos agregar `GenericScale`, `SimulatorScale` sin modificar código existente
- `IRegistroRepository`: Múltiples implementaciones sin cambiar use cases

✅ **Liskov Substitution (LSP)**
- `SQLiteRegistroRepository` y `SupabaseRegistroRepository` son intercambiables
- Cualquier implementación de `IWeightReader` funciona igual

✅ **Interface Segregation (ISP)**
- Interfaces específicas por responsabilidad
- No obligamos a implementar métodos innecesarios

✅ **Dependency Inversion (DIP)**
- Use cases dependen de interfaces, no de implementaciones concretas
- `CreateEntradaUseCase` recibe `IRegistroRepository`, no SQLite directamente

### Clean Architecture Layers

1. **Domain (Núcleo)**
   - No depende de nada externo
   - Entidades con lógica de negocio
   - Interfaces de repositorios
   - Use cases independientes

2. **Infrastructure (Frameworks)**
   - SQLite, Supabase, Serial Port
   - Implementa interfaces del dominio
   - Puede cambiar sin afectar el dominio

3. **Application (Adaptadores)**
   - Servicios que orquestan use cases
   - Dependency Injection Container
   - Puente entre UI y dominio

4. **Presentation (UI)**
   - React components
   - Usa servicios de aplicación
   - No conoce detalles de infraestructura

## 🔧 Ventajas de esta Arquitectura

1. **Testeable**: Cada capa se puede testear independientemente con mocks
2. **Mantenible**: Cambios en UI no afectan lógica de negocio
3. **Escalable**: Fácil agregar nuevas funcionalidades
4. **Flexible**: Cambiar SQLite por otra DB no requiere cambiar use cases
5. **Clara**: Separación de responsabilidades obvia

## 📝 Próximos Pasos

- [ ] Implementar `IVehiculoRepository` con SQLite/Supabase
- [ ] Implementar `IOperadorRepository` con SQLite/Supabase
- [ ] Implementar `IRutaRepository` con SQLite/Supabase
- [ ] Implementar `IEmpresaRepository` con SQLite/Supabase
- [ ] Crear Use Case para buscar registros por fecha
- [ ] Crear Use Case para reportes
- [ ] Agregar eventos de dominio (DomainEvent pattern)
- [ ] Agregar validaciones con especificaciones (Specification pattern)
- [ ] Tests unitarios para entidades y use cases
- [ ] Tests de integración para repositories

## 🔄 Flujo de Sincronización

```
┌─────────────────────────────────────────────────────────────┐
│                         Flujo de Datos                      │
└─────────────────────────────────────────────────────────────┘

1. Usuario registra entrada
   ↓
2. PesajeService.registrarEntrada()
   ↓
3. CreateEntradaUseCase.execute()
   ↓
4. SQLiteRegistroRepository.saveEntrada()
   ↓ (sincronizado = false)
5. Registro guardado en SQLite local

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6. SyncService ejecuta cada 5 minutos
   ↓
7. SyncRegistrosUseCase.execute()
   ↓
8. SQLiteRegistroRepository.findUnsynchronized()
   ↓
9. Para cada registro:
   a. SupabaseRegistroRepository.saveEntrada()
   b. Trigger generar_folio() en Supabase
   c. SQLiteRegistroRepository.markAsSynced()
   ↓
10. Registro sincronizado (sincronizado = true)
```

## 🎓 Conceptos Clave

### Result Pattern
Evita excepciones y hace explícito el manejo de errores:

```typescript
// ❌ Mal (excepciones)
try {
  const registro = await createRegistro();
} catch (error) {
  // Error oculto en el tipo
}

// ✅ Bien (Result)
const result = await createRegistro();
if (result.success) {
  const registro = result.value; // Tipo seguro
} else {
  console.error(result.error); // Error explícito
}
```

### Repository Pattern
Abstrae la persistencia:

```typescript
// El use case no sabe SI es SQLite o Supabase
class CreateEntradaUseCase {
  constructor(private repo: IRegistroRepository) {}
  
  async execute(input) {
    // Mismo código para cualquier implementación
    return this.repo.saveEntrada(registro);
  }
}
```

### Dependency Injection
Desacopla componentes:

```typescript
// ❌ Mal (acoplamiento)
class Service {
  private repo = new SQLiteRepo(); // Acoplado
}

// ✅ Bien (inyección)
class Service {
  constructor(private repo: IRepo) {} // Desacoplado
}
```
