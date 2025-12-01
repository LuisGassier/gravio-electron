# 🚀 Sistema de Actualizaciones Automáticas con GitHub Releases

## ✅ Configuración Completada

Tu aplicación ahora está configurada para usar **GitHub Releases** como sistema de distribución y actualizaciones automáticas con **electron-updater**.

## 📦 Cómo Funciona

1. **GitHub Actions** compila tu app automáticamente cuando creas un tag
2. Sube el instalador (`.exe`) a **GitHub Releases** (gratis, hasta 2 GB por archivo)
3. `electron-updater` verifica automáticamente si hay nuevas versiones
4. Los usuarios reciben una notificación dentro de la app
5. Pueden descargar e instalar con un solo clic

---

## 📝 Cómo Publicar una Actualización

### 1. **Actualizar la versión en `package.json`**

```json
{
  "version": "1.1.0"  // Incrementa la versión
}
```

### 2. **Commit y push de tus cambios**

```bash
git add .
git commit -m "feat: Nueva funcionalidad X"
git push origin main
```

### 3. **Crear un tag de versión**

```bash
# Crear tag (debe coincidir con la versión del package.json)
git tag v1.1.0

# Subir el tag a GitHub
git push origin v1.1.0
```

### 4. **GitHub Actions hace el resto automáticamente:**

- ✅ Compila la aplicación
- ✅ Genera el instalador `.exe`
- ✅ Crea un Release en GitHub
- ✅ Sube el instalador al Release
- ✅ Los usuarios recibirán la notificación automáticamente

---

## 🔧 Workflow de GitHub Actions

**Archivo:** `.github/workflows/release.yml`

Se ejecuta automáticamente cuando:
- Haces push de un tag que empiece con `v` (ejemplo: `v1.0.0`, `v2.1.3`)

**Qué hace:**
1. Instala dependencias
2. Compila TypeScript y React
3. Genera el instalador con `electron-builder`
4. Publica en GitHub Releases usando `GH_TOKEN` automático

---

## 📱 Experiencia del Usuario

### Primera Instalación
1. Descarga `Gravio-Setup-1.0.0.exe` desde GitHub Releases
2. Ejecuta el instalador
3. La app se instala en `C:\Program Files\Gravio`

### Cuando hay Actualización
1. Al abrir la app, verifica actualizaciones (5 segundos después del inicio)
2. Si hay una nueva versión, muestra un diálogo:
   ```
   ┌─────────────────────────────────────┐
   │ 📥 Actualización Disponible         │
   │                                      │
   │ Nueva versión 1.1.0                 │
   │                                      │
   │ [Más tarde]  [Descargar]            │
   └─────────────────────────────────────┘
   ```
3. Al hacer clic en "Descargar", muestra progreso
4. Una vez descargada: `[Instalar y Reiniciar]`
5. La app se cierra, instala la actualización y se vuelve a abrir

---

## 🎯 Ventajas de GitHub Releases

| Característica | GitHub Releases |
|---|---|
| **Costo** | ✅ Gratis |
| **Límite de archivo** | 2 GB (suficiente - tu app: 90 MB) |
| **Ancho de banda** | Ilimitado |
| **Integración** | Nativa con `electron-updater` |
| **Versionado** | Automático con Git tags |
| **Historial** | Todas las versiones disponibles |
| **Confianza** | Infraestructura de GitHub |

---

## 🔐 Configuración de Permisos (Ya Configurado)

El workflow usa `GITHUB_TOKEN` automático que GitHub proporciona:
- ✅ No necesitas crear tokens manualmente
- ✅ Tiene permisos para crear Releases
- ✅ Se renueva automáticamente

---

## 📋 Comandos Útiles

### Desarrollo Local
```bash
npm run dev                # Modo desarrollo
npm run build              # Compilar React + TypeScript
npm run build:electron     # Generar instalador local
```

### Publicación Manual (alternativa)
```bash
# Si quieres publicar sin usar GitHub Actions
GH_TOKEN=tu_token_aqui npm run publish:github
```

---

## 🐛 Troubleshooting

### El auto-updater no encuentra actualizaciones
- Verifica que el tag empiece con `v` (ejemplo: `v1.0.0`)
- Confirma que GitHub Actions completó exitosamente
- Revisa que el Release sea público (no draft)

### Error al compilar en GitHub Actions
- Verifica que `package.json` tenga el `repository` correcto
- Asegúrate que `GITHUB_TOKEN` tenga permisos de escritura

### Los usuarios no ven la notificación
- El auto-updater solo funciona en producción (`.exe` instalado)
- En desarrollo (`npm run dev`) no verifica actualizaciones

---

## 📊 Monitoreo

### Ver Releases publicados
```
https://github.com/LuisGassier/gravio-electron/releases
```

### Ver Workflows ejecutándose
```
https://github.com/LuisGassier/gravio-electron/actions
```

---

## 🎉 Próximos Pasos

1. **Haz tu primer release:**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Espera a que GitHub Actions complete** (~5-10 minutos)

3. **Descarga el instalador** desde Releases y prueba

4. **Haz una actualización de prueba:**
   - Cambia `version` a `1.0.1`
   - Haz cambios visibles en la app
   - Crea tag `v1.0.1`
   - Los usuarios instalados verán la notificación

---

## 📖 Recursos

- [electron-updater docs](https://www.electron.build/auto-update)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
- [GitHub Actions](https://docs.github.com/en/actions)

---

## 💡 Tips

- **Versión semántica:** Usa `MAJOR.MINOR.PATCH` (1.0.0, 1.1.0, 2.0.0)
- **Release notes:** Agrega notas en el Release de GitHub para informar cambios
- **Beta testing:** Usa `prerelease` en GitHub para versiones de prueba
- **Rollback:** Si algo falla, los usuarios pueden descargar versiones anteriores desde Releases

---

**¡Tu sistema de actualizaciones está listo! 🎊**

Cada vez que hagas un `git push origin v1.x.x`, GitHub compilará y publicará automáticamente.
