#!/usr/bin/env python3
"""
Script para Raspberry Pi que controla LEDs Neopixel via Bluetooth HC-05
Este script deve ser executado no Raspberry Pi conectado ao HC-05 e aos LEDs Neopixel
"""

import time
import serial
import board
import neopixel
import re
import threading

# Configuração do Neopixel
PIXEL_PIN = board.D18  # O pino GPIO ao qual o Neopixel está conectado
NUM_PIXELS = 25       # Número de LEDs no strip
ORDER = neopixel.GRB  # A ordem de cores (pode ser diferente dependendo do seu strip)

# Inicializa os pixels
pixels = neopixel.NeoPixel(
    PIXEL_PIN, NUM_PIXELS, brightness=0.2, auto_write=False, pixel_order=ORDER
)

# Configuração da porta serial para o HC-05
# Nota: O dispositivo pode variar, verifique com 'ls /dev/tty*' no Raspberry Pi
SERIAL_PORT = '/dev/rfcomm0'  # Ou pode ser /dev/ttyAMA0, /dev/ttyS0, etc.
BAUD_RATE = 9600

# Padrões regex para analisar os comandos
LED_PATTERN = re.compile(r'LED:(\d+),(\d+),(\d+),(\d+);')
CLEAR_PATTERN = re.compile(r'CLEAR_ALL;')

# Flag para controle do loop principal
running = True

def process_led_command(position, r, g, b):
    """Processa um comando de LED individual"""
    position = int(position)
    r = int(r)
    g = int(g)
    b = int(b)
    
    if 0 <= position < NUM_PIXELS:
        pixels[position] = (r, g, b)
        pixels.show()
        print(f"LED {position} definido para RGB({r}, {g}, {b})")
    else:
        print(f"Posição inválida: {position}")

def clear_all_leds():
    """Limpa todos os LEDs (define para preto)"""
    pixels.fill((0, 0, 0))
    pixels.show()
    print("Todos os LEDs foram apagados")

def bluetooth_receiver():
    """Thread principal para recebimento de dados Bluetooth"""
    global running
    
    try:
        # Inicializa a porta serial
        with serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1) as ser:
            print(f"Conexão Bluetooth estabelecida em {SERIAL_PORT}")
            buffer = ""
            
            while running:
                if ser.in_waiting > 0:
                    data = ser.read(ser.in_waiting).decode('utf-8')
                    buffer += data
                    
                    # Processa comandos completos no buffer
                    while ';' in buffer:
                        command, buffer = buffer.split(';', 1)
                        command += ';'  # Adiciona o delimitador de volta
                        
                        # Processa comandos LED
                        led_match = LED_PATTERN.match(command)
                        if led_match:
                            position, r, g, b = led_match.groups()
                            process_led_command(position, r, g, b)
                            continue
                        
                        # Processa comando de limpar
                        if CLEAR_PATTERN.match(command):
                            clear_all_leds()
                            continue
                        
                        # Comando desconhecido
                        print(f"Comando desconhecido: {command}")
                
                time.sleep(0.01)  # Pequeno delay para reduzir uso da CPU
    
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
    
    print("Iniciando controlador HC-05 para Neopixel...")
    clear_all_leds()  # Iniciar com todos os LEDs desligados
    
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
        time.sleep(1)  # Permite que a thread seja encerrada corretamente
        clear_all_leds()  # Apaga os LEDs ao sair
        print("Programa finalizado")

if __name__ == "__main__":
    main()
