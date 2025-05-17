#!/usr/bin/env python3
"""
Bootstrap script para Raspberry Pi que recebe código via Bluetooth e o executa
Este é um script inicial mínimo que deve ser instalado no Raspberry Pi
"""

import time
import serial
import os
import subprocess
import signal
import sys
import threading

# Configuração da porta serial para o HC-05
# Nota: O dispositivo pode variar, verifique com 'ls /dev/tty*' no Raspberry Pi
SERIAL_PORT = '/dev/rfcomm0'  # Ou pode ser /dev/ttyAMA0, /dev/ttyS0, etc.
BAUD_RATE = 9600

# Arquivo temporário para armazenar o código recebido
TEMP_CODE_FILE = '/tmp/bitdoglab_code.py'

# Flag para controle do loop principal
running = True
code_received = False
child_process = None

def signal_handler(sig, frame):
    """Manipulador de sinais para encerrar o programa adequadamente"""
    global running
    print("Sinal recebido, encerrando...")
    running = False
    if child_process:
        child_process.terminate()
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)
signal.signal(signal.SIGTERM, signal_handler)

def execute_received_code():
    """Executa o código Python recebido"""
    global child_process
    
    try:
        print(f"Executando código recebido de {TEMP_CODE_FILE}")
        # Dê permissão de execução ao arquivo
        os.chmod(TEMP_CODE_FILE, 0o755)
        
        # Execute o script em um processo separado
        child_process = subprocess.Popen(
            ['python3', TEMP_CODE_FILE],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        
        # Encaminhe a saída do processo filho para o console
        for line in iter(child_process.stdout.readline, ''):
            print("SCRIPT:", line.strip())
        
        child_process.wait()
        print(f"Processo do script encerrado com código {child_process.returncode}")
    except Exception as e:
        print(f"Erro ao executar código recebido: {e}")
    finally:
        child_process = None

def bluetooth_receiver():
    """Thread principal para recebimento do código via Bluetooth"""
    global running, code_received
    
    try:
        # Inicializa a porta serial
        with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as ser:
            print(f"Conexão Bluetooth estabelecida em {SERIAL_PORT}")
            print("Aguardando código Python via Bluetooth...")
            
            # Código para receber o script Python
            code_buffer = ""
            start_marker_received = False
            end_marker_received = False
            
            while running and not end_marker_received:
                if ser.in_waiting > 0:
                    data = ser.read(ser.in_waiting).decode('utf-8', errors='ignore')
                    
                    # Verifique o marcador de início do código
                    if "###START_PYTHON_CODE###" in data and not start_marker_received:
                        start_marker_received = True
                        print("Recebendo código Python...")
                        # Remova o marcador e guarde apenas o código após ele
                        _, data = data.split("###START_PYTHON_CODE###", 1)
                    
                    if start_marker_received:
                        # Verifique o marcador de fim do código
                        if "###END_PYTHON_CODE###" in data:
                            end_marker_received = True
                            code_part, _ = data.split("###END_PYTHON_CODE###", 1)
                            code_buffer += code_part
                            print("Código Python recebido completamente.")
                        else:
                            code_buffer += data
                
                time.sleep(0.01)
            
            # Se recebeu o código completo, salve-o em um arquivo
            if start_marker_received and end_marker_received:
                with open(TEMP_CODE_FILE, 'w') as f:
                    f.write("#!/usr/bin/env python3\n")
                    f.write(code_buffer)
                print(f"Código Python salvo em {TEMP_CODE_FILE}")
                code_received = True
                
                # Confirme ao remetente que o código foi recebido
                ser.write("###CODE_RECEIVED###\n".encode())
                
                # Execute o código recebido em uma nova thread
                exec_thread = threading.Thread(target=execute_received_code)
                exec_thread.daemon = True
                exec_thread.start()
                
                # Continue monitorando a porta serial para comandos adicionais
                while running:
                    time.sleep(0.1)
    
    except KeyboardInterrupt:
        print("Interrupção de teclado recebida. Finalizando...")
    except Exception as e:
        print(f"Erro: {e}")
    finally:
        running = False
        print("Thread de recebimento Bluetooth encerrada")

def main():
    """Função principal"""
    global running
    
    print("Iniciando receptor de código Python via HC-05...")
    
    # Inicia a thread de recebimento Bluetooth
    bt_thread = threading.Thread(target=bluetooth_receiver)
    bt_thread.daemon = True
    bt_thread.start()
    
    try:
        # Mantém o programa principal em execução
        while running:
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\nEncerrando programa...")
    finally:
        running = False
        if child_process:
            child_process.terminate()
        time.sleep(1)  # Permite que a thread seja encerrada corretamente
        print("Programa finalizado")

if __name__ == "__main__":
    main()
