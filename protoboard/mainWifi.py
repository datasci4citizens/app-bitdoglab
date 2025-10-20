# Pico W - Servidor TCP simples para receber comandos
SSID = "DoceDeLeite" # Nome da rede
PASSWORD = "leiteninho19" # Senha da rede

import network
import socket
import time
import gc
from micropython import const
import neopixel
import math
import random
from machine import PWM, Pin,I2C, Timer, ADC
from ssd1306 import SSD1306_I2C

# Configurações
TCP_PORT = 8080

# LED onboard para feedback visual
led = Pin("LED", Pin.OUT)

# --- CONFIGURAÇÃO DOS COMPONENTES BITDOGLAB ---

# global variables
SCREEN_WIDTH = 128
SCREEN_HEIGHT = 64

SEGMENT_WIDTH = 8
SEGMENT_PIXELS = int(SCREEN_HEIGHT/SEGMENT_WIDTH)
SEGMENTS_HIGH = int(SCREEN_HEIGHT/SEGMENT_WIDTH)
SEGMENTS_WIDE = int(SCREEN_WIDTH/SEGMENT_WIDTH)
VALID_RANGE = [[int(i /SEGMENTS_HIGH), i % SEGMENTS_HIGH] for i in range(SEGMENTS_WIDE * SEGMENTS_HIGH -1)]

is_game_running = False

# Configuração do OLED
i2c = I2C(1, sda=Pin(2), scl=Pin(3), freq=400000)
oled = SSD1306_I2C(SCREEN_WIDTH, SCREEN_HEIGHT, i2c)

# Botão pressionável do joystick
joystick_button = Pin(22, Pin.IN, Pin.PULL_UP) 

# Número de LEDs na sua matriz 5x5
NUM_LEDS = 25

# Inicializar a matriz de NeoPixels no GPIO7
np = neopixel.NeoPixel(Pin(7), NUM_LEDS)

# Definindo a matriz de LEDs
LED_MATRIX = [
    [24, 23, 22, 21, 20],
    [15, 16, 17, 18, 19],
    [14, 13, 12, 11, 10],
    [5, 6, 7, 8, 9],
    [4, 3, 2, 1, 0]
]

# Inicializar ADC para os pinos VRx (GPIO26) e VRy (GPIO27)
adc_vrx = ADC(Pin(26))
adc_vry = ADC(Pin(27))

def map_value(value, in_min, in_max, out_min, out_max):
    return (value - in_min) * (out_max - out_min) // (in_max - in_min) + out_min

def update_oled(lines):
    oled.fill(0)
    for i, line in enumerate(lines):
        oled.text(line, 0, i * 8)
    oled.show()

# Configurando o LED RGB
led_r = PWM(Pin(12))
led_g = PWM(Pin(13))
led_b = PWM(Pin(11))

led_r.freq(1000)
led_g.freq(1000)
led_b.freq(1000)

# Configuração do NeoPixel
NUM_LEDS = 25
np = neopixel.NeoPixel(Pin(7), NUM_LEDS)

# Configuração dos botões
button_a = Pin(5, Pin.IN, Pin.PULL_UP)
button_b = Pin(6, Pin.IN, Pin.PULL_UP)

# Configuração do Buzzer
buzzer = PWM(Pin(21))
buzzer2 = PWM(Pin(10))

# Essencial pro snake
game_timer = Timer()
player = None
food = None

def connect_wifi():
    """Conecta ao WiFi e retorna o IP"""
    print("🔌 Conectando ao WiFi...")
    
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    
    if wlan.isconnected():
        ip = wlan.ifconfig()[0]
        print(f"✅ Já conectado! IP: {ip}")
        led.on()
        return ip
    
    print(f"📡 Conectando a '{SSID}'...")
    wlan.connect(SSID, PASSWORD)
    
    # Aguarda conexão
    timeout = 15
    start = time.time()
    while not wlan.isconnected():
        if time.time() - start > timeout:
            print("❌ Timeout na conexão WiFi")
            return None
        
        led.toggle()  # Pisca enquanto conecta
        time.sleep(0.3)
    
    # Conectado com sucesso
    led.on()
    config = wlan.ifconfig()
    ip = config[0]
    
    print(f"✅ WiFi conectado!")
    print(f"   IP: {ip}")
    print(f"   Gateway: {config[2]}")
    
    return ip

def process_command(command, client_socket):
    """Executa comando Python e envia resposta"""
    command = command.strip()
    
    if not command:
        return
    
    print(f"⚡ Executando: '{command}'")
    
    try:
        # Tenta executar o comando
        exec(command)
        
        # Resposta de sucesso
        response = "OK\n"
        client_socket.send(response.encode())
        print(f"✅ Sucesso: {command}")
        
    except Exception as e:
        # Resposta de erro
        error_msg = f"ERRO: {str(e)}\n"
        try:
            client_socket.send(error_msg.encode())
            print(f"❌ Erro executando '{command}': {e}")
        except:
            print(f"❌ Erro duplo: comando falhou e não conseguiu enviar erro")

def tcp_server(ip):
    """Servidor TCP principal"""
    print(f"🚀 Iniciando servidor TCP em {ip}:{TCP_PORT}")
    
    # Criar socket TCP
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((ip, TCP_PORT))
    server_socket.listen(1)
    
    print(f"👂 Servidor TCP ouvindo em {ip}:{TCP_PORT}")
    print("📱 Pronto para receber conexões do app!")
    
    while True:
        try:
            print("⏳ Aguardando conexão...")
            client_socket, client_address = server_socket.accept()
            
            print(f"📲 Cliente conectado: {client_address}")
            
            # Pisca LED para indicar conexão
            for _ in range(2):
                led.off()
                time.sleep(0.1)
                led.on()
                time.sleep(0.1)
            
            # Configurar timeout para o cliente
            client_socket.settimeout(30)  # 30 segundos timeout
            
            # Buffer para acumular dados recebidos
            buffer = ""
            
            try:
                while True:
                    # Receber dados
                    data = client_socket.recv(1024)
                    
                    if not data:
                        print("🔌 Cliente desconectou")
                        break
                    
                    # Decodificar dados recebidos
                    text = data.decode('utf-8', 'ignore')
                    print(f"📨 Dados recebidos: '{text}' ({len(text)} chars)")
                    
                    # Processar caractere por caractere
                    for char in text:
                        if char == '\n' or char == '\r':
                            # Fim de comando - executar se não estiver vazio
                            if buffer.strip():
                                process_command(buffer, client_socket)
                            buffer = ""  # Limpar buffer
                        else:
                            buffer += char
            
            except socket.timeout:
                print("⏰ Timeout na conexão com cliente")
            except Exception as e:
                print(f"❌ Erro na comunicação: {e}")
            finally:
                # Fechar conexão com cliente
                client_socket.close()
                print(f"🔌 Conexão fechada: {client_address}")
                
                # Pisca LED para indicar desconexão
                for _ in range(3):
                    led.off()
                    time.sleep(0.2)
                    led.on()
                    time.sleep(0.2)
                
                # Limpeza de memória
                gc.collect()
                
        except KeyboardInterrupt:
            print("🛑 Servidor interrompido pelo usuário")
            break
        except Exception as e:
            print(f"❌ Erro no servidor: {e}")
            time.sleep(1)  # Pausa antes de tentar novamente

def main():
    """Função principal"""
    print("=" * 40)
    print("🤖 PICO W - SERVIDOR TCP SIMPLES")
    print("=" * 40)
    
    # Conectar ao WiFi
    ip = connect_wifi()
    if not ip:
        print("💀 Falha crítica: não foi possível conectar ao WiFi")
        return
    
    print(f"🌐 Configuração final:")
    print(f"   WiFi: {SSID}")
    print(f"   IP: {ip}")
    print(f"   Porta TCP: {TCP_PORT}")
    print(f"   LED: Pin('LED')")
    print("=" * 40)
    
    try:
        # Iniciar servidor TCP
        tcp_server(ip)
    except Exception as e:
        print(f"💀 Erro fatal: {e}")
        
        # LED de erro - pisca rapidamente
        for _ in range(10):
            led.toggle()
            time.sleep(0.1)

# Executar se for o programa principal
if __name__ == "__main__":
    main()
