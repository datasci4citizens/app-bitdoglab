from machine import UART
import time

# Configura UART para modo AT (38400 baud)
uart = UART(0, baudrate=38400)
uart.init(38400, bits=8, parity=None, stop=1)

def send_at_command(command):
    """Envia um comando AT e imprime a resposta"""
    print(f"Enviando: {command}")
    uart.write(command + '\r\n')
    time.sleep(1)  # Espera pela resposta
    
    if uart.any():
        response = uart.read().decode('utf-8')
        print(f"Resposta: {response}")
        return response
    return None

def configure_hc05(new_name="BitDogLab"):
    """Configura o módulo HC-05"""
    print("\nIniciando configuração do HC-05...")
    print("Certifique-se que o módulo está em modo AT (LED piscando lentamente)")
    
    # Testa comunicação
    if not send_at_command("AT"):
        print("❌ Erro: Módulo não respondeu. Verifique se está em modo AT")
        return False
    
    # Configura o nome
    if not send_at_command(f"AT+NAME={new_name}"):
        print("❌ Erro: Falha ao configurar nome")
        return False
    
    print("\n✅ Configuração concluída!")
    print(f"Nome configurado para: {new_name}")
    print("\nAgora você pode:")
    print("1. Desligar a placa")
    print("2. Reconectar o HC-05 normalmente (sem o modo AT)")
    print("3. O módulo deve aparecer com o novo nome")
    
    return True

# Executa a configuração
if __name__ == '__main__':
    # Você pode mudar o nome aqui
    configure_hc05("BitDogLab")
