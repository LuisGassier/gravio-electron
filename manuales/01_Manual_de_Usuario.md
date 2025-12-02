# Manual de Usuario - Sistema de Gestión de Relleno Sanitario "Gravio"

## 1. Introducción
Bienvenido al manual de operación del sistema **Gravio**. Este software está diseñado para controlar rigurosamente el flujo de residuos que ingresan al relleno sanitario, asegurando la trazabilidad mediante pesajes precisos y documentación automática.

El sistema opera bajo una filosofía **"Offline-First"**, lo que significa que su base de datos principal reside en su computadora. Esto garantiza que la operación de pesaje **nunca se detiene**, incluso si se corta el internet o se cae el servidor central.

---

## 2. Acceso al Sistema

### 2.1. Pantalla de Inicio de Sesión
Al iniciar la aplicación, verá el panel de autenticación.

#### Credenciales Requeridas
1.  **Correo Electrónico**: Ingrese su email corporativo asignado (ej. `operador@municipio.gob.mx`).
2.  **Contraseña**: Ingrese su clave personal.
    *   *Importante*: El sistema distingue entre mayúsculas y minúsculas.

#### PIN de Acceso Rápido
Si usted ya ha iniciado sesión previamente en la computadora, el sistema recordará su usuario de forma segura y le permitirá ingresar usando solo un **PIN de 4 dígitos**.
*   Esto está diseñado para cambios de turno rápidos.
*   Si olvida su PIN, puede hacer clic en "Ingresar con contraseña" para volver al método tradicional.

> **Nota de Seguridad**: Nunca comparta su contraseña ni su PIN. Cada registro de pesaje queda ligado a su usuario para fines de auditoría.

---

## 3. Interfaz Principal (Dashboard)

Una vez dentro, verá el panel de control dividido en tres secciones principales, diseñadas para seguir el flujo natural de trabajo de izquierda a derecha.

### 3.1. Panel Izquierdo: Estado y Conectividad
Aquí puede ver la salud del sistema de un vistazo.
*   **Estado de Red**: 
    *   🟢 **Online**: Conectado a internet y sincronizando.
    *   ⚪ **Offline**: Sin internet. Trabajando en modo local.
*   **Última Sincronización**: Muestra hace cuánto tiempo se enviaron los datos a la nube (ej. "Hace 2 minutos").
*   **Botón de Sincronización Manual**: Un botón circular con flechas que permite forzar el envío de datos si detecta que hay internet pero no se ha actualizado.
*   **Estadísticas del Día**: Resumen rápido de cuántos camiones han entrado hoy.

### 3.2. Panel Central: Módulo de Pesaje
Esta es el área de trabajo principal.

#### A. Indicador de Peso (Báscula)
Ubicado en la parte superior, muestra la lectura en tiempo real.
*   **Dígitos Grandes**: Peso en Kilogramos (kg).
*   **Semáforo de Estabilidad**:
    *   🟢 **Verde**: Báscula estable. Listo para pesar.
    *   🟡 **Amarillo**: Movimiento detectado. El sistema bloqueará el registro hasta que se estabilice.
    *   🔴 **Rojo**: Desconexión. Revise el cable serial.

#### B. Formulario de Registro
Los campos cuentan con "Búsqueda Inteligente": escriba 3 letras para buscar en el catálogo.

1.  **Ruta**: Origen de los residuos (ej. "Ruta 15", "Centro", "Mercado").
    *   *Opción "Nuevo"*: Si la ruta no existe, puede seleccionar "Nuevo (sin registrar)".
2.  **Vehículo**: Identificación de la unidad.
    *   Puede buscar por **Placas** (ej. "VP-123") o **Número Económico** (ej. "ECO-05").
    *   **Tara Histórica**: Al seleccionar un vehículo, aparecerá un texto pequeño indicando su peso vacío promedio. Úselo para detectar anomalías (ej. si el camión pesa mucho menos que su tara histórica, podría ser un error).
3.  **Concepto**: Tipo de material (ej. "RSU", "RME", "Escombros").
4.  **Operador**: Nombre del conductor.
5.  **Observaciones**: Campo de texto libre para anotar incidencias (ej. "Trae lodos", "Lona rota").

#### C. Botones de Acción
*   **"Registrar Entrada"**: Botón primario. Se habilita solo cuando:
    *   Peso > 0.
    *   Báscula estable.
    *   Campos obligatorios llenos.
*   **"Cancelar"**: Limpia el formulario si se equivocó de camión.

### 3.3. Panel Derecho: Vehículos Pendientes
Muestra los camiones que están **dentro** del relleno sanitario (ya pesaron entrada pero no salida).
*   **Tarjetas**: Cada camión aparece como una tarjeta con su Placa, Hora de Entrada y Peso Inicial.
*   **Contador**: Número total de vehículos dentro del recinto.

---

## 4. Operación Paso a Paso

### 4.1. Registro de Entrada (Primer Pesaje)
El camión llega cargado al relleno.

1.  Indique al chofer que suba a la báscula y apague el motor si hay mucha vibración.
2.  Espere a que el semáforo de peso cambie a **Verde**.
3.  Pregunte el **Número Económico** y búsquelo en el campo "Vehículo".
4.  Verifique que la **Empresa** y **Operador** se llenen automáticamente. Si no, complételos manualmente.
5.  Haga clic en **Registrar Entrada**.
6.  El sistema:
    *   Generará un folio único (ej. `GRAV-005201`).
    *   Imprimirá el **Ticket de Entrada** (si la impresión automática está activa).
    *   Agregará el camión a la lista de "Pendientes" en el panel derecho.

### 4.2. Registro de Salida (Segundo Pesaje)
El camión regresa vacío después de tirar la basura. **IMPORTANTE: NO cree un nuevo registro en el panel central.**

1.  El camión sube a la báscula (vacío).
2.  Diríjase al **Panel Derecho (Vehículos Pendientes)**.
3.  Localice la tarjeta del camión. Puede usar el buscador si hay muchos.
4.  **Haga clic sobre la tarjeta**.
5.  El sistema cargará los datos en el panel central en **Modo Salida** (Borde naranja).
6.  Verifique los datos:
    *   Peso Entrada (guardado previamente).
    *   Peso Salida (lectura actual de la báscula).
    *   **Peso Neto** (Cálculo automático: Entrada - Salida).
7.  Haga clic en **"Finalizar y Cerrar"**.
8.  Aparecerá una ventana de confirmación ("Pesaje Completado") y se imprimirá el **Ticket Final**.

### 4.3. Cancelación o Salida sin Descarga
Si un camión entró pero debe salir sin descargar (falla mecánica, error de ruta):
1.  Selecciónelo en "Pendientes".
2.  En el campo "Observaciones" escriba: "Salida sin descarga".
3.  Registre la salida normalmente.
4.  El Peso Neto será cercano a 0 kg. Esto es correcto para mantener la trazabilidad del folio.

---

## 5. Historial y Reportes

Acceda haciendo clic en el menú de usuario (arriba a la derecha) -> **"Historial de Registros"**.

### Funciones de la Tabla
*   **Buscador Global**: La barra de búsqueda filtra en tiempo real por Folio, Placa, Operador o Ruta.
*   **Estados**:
    *   🟢 **Completado**: Ciclo cerrado (Entrada + Salida).
    *   🟡 **Pendiente**: Solo tiene entrada.
*   **Detalles**: Haga clic en cualquier fila para ver la ficha completa del pesaje.

### Reimpresión de Tickets
1.  Abra el detalle del registro desde el Historial.
2.  Haga clic en el botón **"Reimprimir Ticket"** (icono de impresora).
3.  Saldrá una copia fiel del ticket original.

---

## 6. Configuración del Sistema

Acceda desde el botón de engranaje ⚙️ en la barra superior.

### 6.1. Hardware (Báscula)
*   **Puerto Serial**: Seleccione el puerto COM donde está conectado el indicador (ej. COM3).
*   **Velocidad (Baud Rate)**: Por defecto **2400** para Mettler Toledo.
*   **Botón "Probar Conexión"**: Úselo si sospecha que la báscula no comunica. Debe mostrar números crudos (ej. `)0 1500 000`).

### 6.2. Impresora
*   **Selección**: Elija la impresora térmica instalada en Windows.
*   **Impresión Automática**:
    *   ✅ **Activado**: El ticket sale solo al guardar. (Recomendado para agilidad).
    *   ⬜ **Desactivado**: El sistema preguntará "¿Desea imprimir?" cada vez.

### 6.3. Actualizaciones
El sistema busca mejoras automáticamente cada vez que se abre.
*   Si ve un botón verde **"Actualización lista"** en el panel de configuración, haga clic en "Instalar". La aplicación se reiniciará en unos segundos.

---

## 7. Solución de Problemas Frecuentes

| Síntoma | Causa Probable | Solución |
| :--- | :--- | :--- |
| **La báscula marca 0.00 y el semáforo está rojo** | Cable desconectado o puerto incorrecto | 1. Revise el cable físico.<br>2. Vaya a Configuración -> Hardware y verifique el puerto COM.<br>3. Presione "Probar Conexión". |
| **El peso "baila" y no se pone verde** | Viento fuerte o motor encendido | Pida al chofer que apague el motor. Espere 3 segundos. |
| **No aparece el vehículo en "Pendientes"** | Se registró mal o ya se le dio salida | Busque en el Historial por placas para ver qué pasó con ese folio. |
| **Ticket en blanco** | Rollo de papel invertido | Gire el rollo de papel. La parte que se raya con la uña debe ir hacia el cabezal térmico. |
| **"Error de Sincronización"** | Sin internet | No haga nada. Siga trabajando. El sistema reintentará automáticamente cuando regrese la señal. |

---

## 8. Glosario de Términos

*   **Tara**: Peso del vehículo vacío.
*   **Peso Bruto**: Peso del vehículo cargado.
*   **Peso Neto**: Peso real de la basura (Bruto - Tara).
*   **Folio**: Código único irrepetible que identifica cada viaje (ej. GRAV-001).
*   **Offline**: Modo de trabajo sin conexión a internet.

---


**Versión del Manual**: 2.0 (Actualizado Diciembre 2025)
