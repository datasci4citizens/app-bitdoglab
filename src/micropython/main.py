from machine import UART

# Configuração do UART para HC-05 (ajuste os pinos conforme sua conexão)
uart = UART(0, baudrate=9600)  # UART2 é geralmente TX=17, RX=16 no ESP32
uart.init(9600, bits=8, parity=None, stop=1)

def process_command(cmd):
    """Processa os comandos recebidos"""
    try:
        # Remove caracteres extras e executa
        cmd = cmd.strip()
        if cmd:
            exec(cmd)
            uart.write("OK\r\n")
    except Exception as e:
        uart.write(f"Erro: {str(e)}\r\n")

def main():
    """Loop principal"""
    print("Sistema iniciado")
    uart.write("Sistema iniciado\r\n")
    buffer = ''
    
    while True:
        if uart.any():
            try:
                char = uart.read(1).decode('utf-8')
                
                # Se encontrar uma nova linha, processa o comando
                if char in ('\n', '\r'):
                    if buffer.strip():
                        process_command(buffer)
                    buffer = ''
                else:
                    buffer += char
                    
            except Exception as e:
                uart.write(f"Erro: {str(e)}\r\n")
                buffer = ''

if __name__ == '__main__':
    main()