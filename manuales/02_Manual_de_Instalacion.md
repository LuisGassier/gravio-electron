# Manual de Instalación y Configuración Técnica - Gravio

## 1. Introducción
Este documento está dirigido al **Personal de TI e Infraestructura**. Describe el proceso técnico completo para desplegar el sistema Gravio en una estación de pesaje, incluyendo la configuración de hardware (básculas seriales, impresoras térmicas), variables de entorno y resolución de problemas de red.

---

## 2. Requisitos del Sistema (Estación de Trabajo)

Para garantizar la estabilidad operativa 24/7, la PC debe cumplir con lo siguiente:

### 2.1. Hardware
*   **Procesador**: Intel Core i3 (8va Gen) o superior / AMD Ryzen 3.
*   **RAM**: 8 GB mínimo (Recomendado 16 GB si se usa para otras tareas).
*   **Almacenamiento**: SSD con al menos 10 GB libres. (La base de datos local crece aprox. 100MB por año).
*   **Puertos**:
    *   1x Puerto USB para Impresora Térmica.
    *   1x Puerto Serial DB9 (Nativo) o USB (Adaptador).
*   **Monitor**: Resolución mínima 1366x768 (Optimizado para 1920x1080).

### 2.2. Adaptadores USB-Serial (Crítico)
Si la PC no tiene puerto serial nativo, **NO use adaptadores genéricos** (chipset CH340). Estos causan desconexiones aleatorias y "congelamiento" del peso.
*   ✅ **Certificados**: Chipset **FTDI** o **Prolific PL2303**.
*   ❌ **Evitar**: Cables azules translúcidos genéricos sin marca.

### 2.3. Software
*   **SO**: Windows 10 o Windows 11 (64 bits).
*   **Dependencias**:
    *   .NET Framework 4.6.2 o superior.
    *   Visual C++ Redistributable 2015-2022 (x64).

---

## 3. Instalación del Software

### Paso 1: Descarga y Ejecución
1.  Obtenga el instalador oficial: `Gravio-Setup-X.Y.Z.exe`.
2.  Ejecute como **Administrador**.
3.  Ruta de instalación predeterminada:
    *   `%LOCALAPPDATA%\Programs\gravio-electron\`
    *   *(No modificable por el instalador para garantizar permisos de auto-update).*

### Paso 2: Permisos de Firewall
Al abrir la aplicación por primera vez, Windows Defender solicitará acceso a la red.
1.  Marque ambas casillas: **Redes Privadas** y **Redes Públicas**.
2.  Haga clic en **Permitir acceso**.
    *   *Razón*: La aplicación necesita comunicar con Supabase (Puerto 443) y verificar actualizaciones.

### Paso 3: Ubicación de Datos Locales
El sistema crea automáticamente las siguientes carpetas críticas. **No las elimine**.
*   Base de Datos: `%APPDATA%\gravio-electron\databases\gravio.db`
*   Logs: `%APPDATA%\gravio-electron\logs\`
*   Configuración: `%APPDATA%\gravio-electron\config.json`

---

## 4. Configuración de Periféricos

Esta sección es crítica. Una mala configuración aquí impedirá el pesaje.

### 4.1. Configuración del Puerto Serial (Báscula)
El sistema usa la librería `serialport` nativa de Node.js.

1.  **Identificar el Puerto en Windows**:
    *   Abra el **Administrador de Dispositivos** (`devmgmt.msc`).
    *   Despliegue "Puertos (COM y LPT)".
    *   Conecte el cable USB-Serial. Note qué puerto aparece (ej. `COM3`).
    *   *Tip*: Si el puerto es > COM9 (ej. COM15), cámbielo en *Propiedades -> Configuración de puerto -> Opciones avanzadas* a uno libre entre **COM1 y COM9**.

2.  **Configuración en Gravio**:
    *   Abra Gravio -> **Engranaje (Configuración)**.
    *   Sección **Hardware**: Seleccione el puerto identificado.
    *   **Parámetros de Comunicación** (Estándar Mettler Toledo):
        *   Baud Rate: **2400** (Es el valor más común, aunque algunas básculas usan 9600).
        *   Data Bits: **8**
        *   Parity: **None**
        *   Stop Bits: **1**

3.  **Verificación**:
    *   Presione **"Probar Conexión"**.
    *   Debe ver la trama cruda: `)0 1200 000` (Peso estable) o `(0 1200 000` (Inestable).
    *   Si ve caracteres extraños (``), la velocidad (Baud Rate) es incorrecta.

### 4.2. Configuración de Impresora Térmica
El sistema utiliza el spooler de Windows (no comandos directos al puerto), lo que permite usar cualquier impresora instalada.

1.  **Instalación en Windows**:
    *   Instale el driver del fabricante (Epson APD, Xprinter, etc.).
    *   Configure el tamaño de papel a **80mm x 297mm** (o "Receipt").
    *   Realice una impresión de prueba desde Windows para confirmar.

2.  **Configuración en Gravio**:
    *   Vaya a **Configuración** -> **Impresora**.
    *   Seleccione la impresora de la lista desplegable.
    *   Haga clic en **"Probar Impresión"**.
    *   *Nota*: Si el ticket sale cortado a los lados, ajuste los márgenes en las "Preferencias de impresión" de Windows, no en la aplicación.

---

## 5. Configuración de Red y Variables de Entorno

La aplicación ya viene compilada con las llaves de producción, pero si necesita cambiar el entorno (ej. a Staging), puede crear un archivo de anulación.

### Archivo `.env` (Opcional)
Cree un archivo en la raíz de instalación o en `%APPDATA%\gravio-electron\.env`:

```env
# Sobrescribir conexión a nube
VITE_SUPABASE_URL=https://nueva-url.supabase.co
VITE_SUPABASE_ANON_KEY=nueva-key

# Forzar puerto por defecto
VITE_DEFAULT_COM_PORT=COM1
```

### Whitelist de Firewall
Si la red corporativa es estricta, permita el tráfico HTTPS (443) hacia:
*   `*.supabase.co` (Sincronización y Auth)
*   `github.com` (Descarga de actualizaciones)

---

## 6. Mantenimiento y Diagnóstico

### 6.1. Reinicio de Base de Datos Local
Si la base de datos local se corrompe (ej. apagón durante escritura):
1.  Cierre la aplicación completamente (verifique en Administrador de Tareas).
2.  Vaya a `%APPDATA%\gravio-electron\databases\`.
3.  Renombre `gravio.db` a `gravio.db.bak` (Backup).
4.  Inicie la aplicación.
5.  El sistema detectará la ausencia de DB, creará una nueva y **descargará automáticamente** todo el catálogo e historial desde la nube (Sync Down).

### 6.2. Logs de Depuración
Para reportar errores a desarrollo, adjunte los siguientes archivos:
*   **Main Process**: `%APPDATA%\gravio-electron\logs\main.log` (Errores de hardware/sistema).
*   **Renderer**: `%APPDATA%\gravio-electron\logs\renderer.log` (Errores de interfaz).

---

## 7. FAQ de Instalación

**P: La aplicación muestra "Error de Javascript" al iniciar.**
R: Generalmente es por falta de permisos de escritura en `%APPDATA%` o porque el puerto COM configurado ya no existe (se desconectó el cable). Borre el archivo `config.json` para resetear la configuración.

**P: La báscula funciona un rato y luego deja de enviar datos.**
R: Es un síntoma clásico de adaptadores USB-Serial baratos o configuración de "Ahorro de energía" en Windows.
*   Solución: En Administrador de Dispositivos -> Hub USB -> Propiedades -> Energía -> Desmarque "Permitir que el equipo apague este dispositivo".

**P: ¿Cómo actualizo a una versión anterior?**
R: Desinstale la versión actual desde "Agregar o quitar programas" e instale el ejecutable de la versión deseada. La base de datos local **se conserva** a menos que la borre manualmente.

---

**Versión del Manual**: 2.0
