import serial
import time
import argparse
import sys
import random

def simulate_scale(port, baudrate, interval, weight_val=None):
    try:
        ser = serial.Serial(
            port=port,
            baudrate=baudrate,
            bytesize=serial.EIGHTBITS,
            parity=serial.PARITY_NONE,
            stopbits=serial.STOPBITS_ONE,
            timeout=1
        )
        print(f"✅ Simulación iniciada en {port} a {baudrate} baudios")
        print(f"📡 Enviando datos cada {interval} segundos. Presiona Ctrl+C para detener.")
        
        while True:
            # Si no se especifica peso fijo, generar uno aleatorio cercano a 2120
            if weight_val is None:
                current_weight = 2120 + random.uniform(-5, 5)
                # Formato: )0   2120    00
                # Parte entera: 4 dígitos (padding con espacios si es necesario, aunque el ejemplo tiene espacios fijos)
                # Parte decimal: 2 dígitos
                
                integer_part = int(current_weight)
                decimal_part = int((current_weight - integer_part) * 100)
                
                # Construir string simulando el formato Mettler Toledo
                # )0   2120    00
                # Nota: El formato exacto depende de la báscula, aquí replicamos el ejemplo del usuario
                # )0 [espacios] [entero] [espacios] [decimal]
                
                data = f")0   {integer_part}    {decimal_part:02d}\r"
            else:
                # Usar el valor fijo proporcionado
                # Asumimos que el usuario quiere probar exactamente este string o variaciones
                data = f")0   {weight_val}    00\r"

            ser.write(data.encode('ascii'))
            # Usar \r en el print para simular la actualización en línea en la consola también
            print(f"📤 Enviado: {data.strip()}   ", end='\r', flush=True)
            time.sleep(interval)
            
    except serial.SerialException as e:
        print(f"❌ Error de puerto serial: {e}")
        print("Asegúrate de que el puerto existe y no está en uso.")
        print("Si estás en Windows, necesitas un par de puertos virtuales (ej. com0com) para conectar este simulador con la aplicación.")
    except KeyboardInterrupt:
        print("\n🛑 Simulación detenida por el usuario")
    finally:
        if 'ser' in locals() and ser.is_open:
            ser.close()
            print("🔌 Puerto cerrado")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Simulador de Báscula Mettler Toledo')
    parser.add_argument('--port', default='COM1', help='Puerto COM para enviar datos (default: COM1)')
    parser.add_argument('--baud', type=int, default=2400, help='Baud rate (default: 2400)')
    parser.add_argument('--interval', type=float, default=0.5, help='Intervalo en segundos entre envíos (default: 0.5)')
    parser.add_argument('--weight', type=str, help='Valor de peso fijo (parte entera). Si no se especifica, varía aleatoriamente alrededor de 2120.')

    args = parser.parse_args()
    
    simulate_scale(args.port, args.baud, args.interval, args.weight)
