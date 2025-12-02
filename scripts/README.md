# Simulador de Báscula

Este script simula una báscula Mettler Toledo enviando datos a través de un puerto serial.

## Requisitos

1. Python 3.x instalado.
2. Un par de puertos seriales virtuales conectados (Null Modem).
   - En Windows, puedes usar [com0com](http://com0com.sourceforge.net/) (Open Source) o [Virtual Serial Port Driver](https://www.eltima.com/products/vspdxp/).
   - Configura un par, por ejemplo: `COM1` <-> `COM2`.

## Instalación

Instala las dependencias:

```bash
pip install -r requirements.txt
```

## Uso

Ejecuta el simulador conectándolo a uno de los puertos del par (ej. `COM1`):

```bash
python scale_simulator.py --port COM1
```

La aplicación Electron debe estar configurada para escuchar en el otro puerto (ej. `COM2`).

### Opciones

- `--port`: Puerto COM a usar (default: COM1)
- `--baud`: Velocidad en baudios (default: 2400)
- `--interval`: Intervalo en segundos entre envíos (default: 0.5)
- `--weight`: Valor de peso fijo. Si se omite, genera valores aleatorios alrededor de 2120.

Ejemplo con peso fijo:
```bash
python scripts/scale_simulator.py --port COM4 --weight 21202
```



python scripts/scale_simulator.py --port COM4

