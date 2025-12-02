# Manual de Usuario - Sistema de Gestión de Relleno Sanitario "Gravio"

## 1. Introducción
Bienvenido al manual de operación del sistema **Gravio**. Este sistema ha sido diseñado para controlar el flujo de entrada y salida de residuos en el relleno sanitario, gestionando pesajes, tickets y sincronización de datos en la nube.

El sistema opera bajo una filosofía **"Offline-First"**, garantizando que la operación nunca se detenga, incluso sin conexión a internet.

---

## 2. Acceso al Sistema

### Pantalla de Login
Al iniciar la aplicación, se presentará el panel de autenticación.
- **Credenciales**: Ingrese su correo electrónico y contraseña asignados.
- **PIN de Acceso**: Si su usuario tiene habilitado el acceso rápido, puede usar su PIN numérico.
- **Recuperación**: En caso de olvidar sus credenciales, contacte al administrador del sistema.

> **Nota Importante**: El sistema descarga la base de datos de usuarios al iniciar sesión por primera vez. Los inicios de sesión subsecuentes pueden realizarse sin internet.

---

## 3. Panel de Pesaje (Operación Principal)

El módulo de pesaje es la pantalla principal y se divide en tres áreas clave:

### A. Indicador de Báscula
Ubicado en la parte superior o lateral, muestra el peso en tiempo real.
- **Color Verde**: Báscula estable y lista para capturar.
- **Color Amarillo/Rojo**: Báscula inestable o desconectada.
- **Lectura**: Se obtiene directamente del puerto COM (Mettler Toledo). No es editable manualmente para garantizar la integridad.

### B. Formulario de Registro
Para registrar un pesaje, debe completar los siguientes campos obligatorios. El sistema cuenta con autocompletado predictivo:

1.  **Empresa**: Seleccione la empresa recolectora (ej. "Municipio de Centro").
2.  **Ruta**: Indique la ruta de recolección (ej. "Ruta 15 - Centro").
3.  **Vehículo**: Busque por **Placas** o **Número Económico**. Al seleccionar un vehículo, el sistema mostrará su tara histórica referencial.
4.  **Operador**: Nombre del conductor del camión.
5.  **Concepto**: Tipo de residuo (ej. "Residuos Sólidos Urbanos").
6.  **Observaciones**: Campo opcional para notas relevantes (ej. "Camión con falla mecánica").

### C. Botones de Acción
- **Registrar Entrada**: Habilita el botón solo cuando el peso es mayor a 0 y estable. Genera un folio de entrada y guarda el "Peso Bruto".
- **Cancelar**: Limpia el formulario.

---

## 4. Gestión de Salidas (Vehículos en Relleno)

Cuando un camión regresa de descargar, no se crea un nuevo registro desde cero, sino que se cierra el ciclo del registro anterior.

1.  Ubique el panel **"Vehículos Pendientes"** (generalmente a la derecha).
2.  Verá una lista de tarjetas con los vehículos que ingresaron pero no han salido.
3.  Identifique el vehículo por su **Número Económico** o **Placa**.
4.  Haga clic en la tarjeta del vehículo.
5.  El sistema cargará automáticamente los datos del viaje de entrada.
6.  Verifique que el camión esté en la báscula (ahora vacío).
7.  El sistema capturará el **Peso de Salida (Tara)**.
8.  Se calculará automáticamente el **Peso Neto** (Entrada - Salida).
9.  Haga clic en **"Finalizar y Cerrar"**.
10. Se imprimirá el **Ticket Final** con el desglose de pesos.

---

## 5. Historial de Registros

El módulo de historial permite auditar todas las transacciones.

### Columnas de Información
- **Folio**: Identificador único (ej. `GRAV-000123`).
- **Vehículo**: Placas y No. Económico.
- **Empresa/Ruta**: Datos de origen.
- **Pesos**: Entrada, Salida y Neto.
- **Fechas**: Hora exacta de entrada y salida.
- **Estado**: 
    - 🟢 Completado (Ciclo cerrado).
    - 🟡 Pendiente (Solo entrada).

### Herramientas
- **Buscador**: Filtre por folio, placa o nombre de conductor escribiendo en la barra superior.
- **Reimpresión**: Haga clic en cualquier fila para ver los detalles y presione el botón **"Reimprimir Ticket"** si necesita una copia física.

---

## 6. Configuración del Sistema

Acceda mediante el ícono de engranaje ⚙️ en la barra superior.

### Conectividad (Hardware)
- **Puerto Serial (Báscula)**:
    - Seleccione el puerto COM correspondiente (ej. `COM1`, `COM3`).
    - **Velocidad**: 2400 baudios (Estándar Mettler Toledo).
    - Botón **"Probar Conexión"**: Verifica si la PC recibe datos de la báscula.
- **Impresora Térmica**:
    - Seleccione la impresora instalada en Windows.
    - **Impresión Automática**: Active esta casilla para que el ticket salga sin preguntar al finalizar un pesaje.
    - Botón **"Probar Impresión"**: Envía un ticket de prueba para verificar márgenes y corte.

### Actualizaciones
El sistema busca actualizaciones automáticamente.
- Si ve el mensaje **"Actualización lista"**, haga clic en "Instalar y Reiniciar" para aplicar las mejoras más recientes.

---

## 7. Solución de Problemas (Troubleshooting)

| Problema | Causa Probable | Solución |
| :--- | :--- | :--- |
| **"Báscula Desconectada"** | Cable desconectado o puerto incorrecto | 1. Revise el cable físico.<br>2. Vaya a Configuración y cambie el puerto COM.<br>3. Presione "Probar Conexión". |
| **Peso Inestable** | Movimiento en la báscula | Espere a que el camión se detenga totalmente. El indicador debe ponerse verde. |
| **No imprime ticket** | Impresora apagada o sin papel | 1. Verifique luz de encendido y papel.<br>2. En Configuración, haga clic en "Probar Impresión". |
| **Datos no sincronizan** | Sin internet | No haga nada. El sistema guarda todo localmente y subirá los datos en cuanto regrese el internet automáticamente. |
| **Error de Login** | Credenciales incorrectas | Verifique mayúsculas/minúsculas. Si persiste, contacte a soporte para resetear contraseña. |

---

**Soporte Técnico**: `soporte@gravio.com`
**Versión del Manual**: 1.1
