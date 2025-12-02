# Manual de Instalación y Configuración - Gravio

## 1. Requisitos del Sistema

Antes de proceder con la instalación, verifique que el equipo cumpla con los siguientes requisitos mínimos.

### Hardware
- **Procesador**: Intel Core i3 (8va Gen) o superior / AMD Ryzen 3.
- **Memoria RAM**: 8 GB recomendados (4 GB mínimo).
- **Almacenamiento**: 1 GB libre en disco duro (para base de datos local y logs).
- **Puertos**:
  - 1 Puerto Serial RS-232 (DB9) nativo o adaptador USB-a-Serial certificado (chipset FTDI recomendado).
  - 1 Puerto USB para la impresora térmica.
- **Pantalla**: Resolución mínima de 1366x768 (Optimizado para 1920x1080 y pantallas táctiles).

### Software
- **Sistema Operativo**: Windows 10 o Windows 11 (64 bits).
- **Drivers**:
  - Driver del adaptador USB-Serial (si aplica).
  - Driver de la impresora térmica (Epson APD o genérico ESC/POS).

---

## 2. Instalación de Periféricos

### Paso 1: Conexión de la Báscula
1.  Conecte el cable serial desde el indicador Mettler Toledo al puerto de la PC.
2.  Si usa un adaptador USB, conéctelo y espere a que Windows lo reconozca.
3.  Abra el "Administrador de Dispositivos" de Windows (`devmgmt.msc`).
4.  Despliegue la sección **"Puertos (COM y LPT)"**.
5.  Identifique el número de puerto asignado (ej. `USB Serial Port (COM3)`). **Anote este número**.

### Paso 2: Conexión de la Impresora
1.  Conecte la impresora por USB.
2.  Instale los controladores del fabricante.
3.  Vaya a "Impresoras y escáneres" en Windows.
4.  Imprima una **Página de Prueba** desde Windows para confirmar que el driver funciona correctamente.

---

## 3. Instalación del Software Gravio

1.  Obtenga el instalador `Gravio-Setup-1.x.x.exe`.
2.  Ejecute el archivo como Administrador (Click derecho -> Ejecutar como administrador).
3.  El asistente instalará la aplicación en `%LOCALAPPDATA%\Programs\gravio-electron`.
4.  Se creará un acceso directo en el escritorio.
5.  Al finalizar, la aplicación se abrirá automáticamente.

---

## 4. Configuración Inicial

Una vez abierta la aplicación, siga estos pasos obligatorios para dejar el sistema operativo.

### 4.1. Inicio de Sesión
Ingrese con las credenciales de administrador proporcionadas. Esto es necesario para acceder al menú de configuración.

### 4.2. Configuración de Báscula
1.  Haga clic en el ícono de **Engranaje ⚙️** (esquina superior derecha).
2.  Localice la sección **"Puerto Serial"**.
3.  En la lista desplegable, seleccione el puerto COM que identificó en el paso 2 (ej. `COM3`).
    - *Si no aparece, haga clic en el botón de refrescar o reinicie la app.*
4.  Verifique los parámetros de comunicación (estándar Mettler Toledo):
    - **Baud Rate**: `2400`
    - **Data Bits**: `8`
    - **Stop Bits**: `1`
    - **Parity**: `None`
5.  Haga clic en **"Probar Conexión"**.
    - **Éxito**: Verá un mensaje verde "Conexión exitosa" y podrá ver el peso en vivo en el panel de fondo.
    - **Error**: Verifique que ningún otro software (HyperTerminal, Putty) esté usando el puerto.

### 4.3. Configuración de Impresora
1.  En el mismo panel de configuración, busque **"Impresora Térmica"**.
2.  Seleccione su impresora de la lista.
3.  Active **"Impresión Automática"** si el cliente lo requiere.
4.  Haga clic en **"Probar Impresión"**. La impresora debería emitir un ticket pequeño de prueba.
5.  Haga clic en **"Guardar"** al final del panel.

---

## 5. Verificación de Sincronización

1.  Asegúrese de que la PC tenga internet.
2.  En el **Panel de Estado** (ícono de señal en la barra superior o widget en dashboard):
    - El estado debe decir **"Online"** (verde).
    - La cola de sincronización debe estar en **0**.
3.  Si el estado es "Offline" pero tiene internet, verifique que el firewall de Windows no esté bloqueando la aplicación `Gravio`.

---

## 6. Mantenimiento Básico

- **Limpieza de Caché**: Si la aplicación presenta errores visuales, vaya al menú "Ayuda" (si disponible) o borre la carpeta `%APPDATA%\gravio-electron`.
- **Actualizaciones**: El sistema buscará actualizaciones cada vez que se abra. Si hay una disponible, notifique al usuario para que permita la instalación.

---

**Contacto de Soporte de Instalación**: `infraestructura@gravio.com`
