import serial.tools.list_ports

def list_ports():
    ports = serial.tools.list_ports.comports()
    if not ports:
        print("❌ No se encontraron puertos COM disponibles.")
        return

    print("✅ Puertos COM encontrados:")
    for port in ports:
        print(f"   - {port.device}: {port.description} [{port.hwid}]")

if __name__ == "__main__":
    list_ports()
