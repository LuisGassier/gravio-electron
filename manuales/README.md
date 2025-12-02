# Manuales del Sistema Gravio

Este directorio contiene la documentación oficial del sistema Gravio.

## Archivos Disponibles

1. **01_Manual_de_Usuario.md**: Guía para los operadores del sistema (pesaje, reportes, uso diario).
2. **02_Manual_de_Instalacion.md**: Guía para técnicos de instalación (setup de hardware, instalación de software).
3. **03_Manual_Tecnico.md**: Documentación para desarrolladores y mantenimiento (arquitectura, base de datos).

## Generación de PDF

Se ha incluido un script para convertir estos manuales a formato PDF automáticamente.

### Requisitos
Es necesario tener Node.js instalado y la librería `md-to-pdf`.

```bash
npm install md-to-pdf --no-save
```

### Cómo generar los PDFs
Ejecute el siguiente comando desde la raíz del proyecto:

```bash
node scripts/convert_manuals_to_pdf.js
```

Los archivos PDF se generarán en la carpeta `manuales/pdf/`.
