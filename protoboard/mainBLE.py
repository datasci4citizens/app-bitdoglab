import bluetooth
from micropython import const
import neopixel
import time
import math
import random
from machine import PWM, Pin,I2C, Timer, ADC
from ssd1306 import SSD1306_I2C

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

# --- CONSTANTES DE EVENTOS BLE ---
_IRQ_CENTRAL_CONNECT = const(1) # percebe conexão
_IRQ_CENTRAL_DISCONNECT = const(2) # percebe desconexão
_IRQ_GATTS_WRITE = const(3) # percebe escrita

# --- NOSSOS UUIDs CUSTOMIZADOS ---
_PICO_SERVICE_UUID = bluetooth.UUID("71153466-1910-4388-A310-000B17D061AB") # serviço geral
_COMMAND_CHAR_UUID = bluetooth.UUID("834E4EDC-2012-42AB-B3D7-001B17D061AB") # caracterítica de escrita

# --- CARACTERÍSTICA "GRAVÁVEL" ---
# Criamos a característica e dizemos que ela suporta escrita (FLAG_WRITE)
command_characteristic = (
    _COMMAND_CHAR_UUID,
    bluetooth.FLAG_WRITE,
)

# --- SERVIÇO ---
pico_service = (
    _PICO_SERVICE_UUID,
    (command_characteristic,), # Agrupamos a característica dentro do serviço
)

_command_buffer = ""
_command_to_run = None

class PicoBLE:
    def __init__(self, name="BitDogLab Pico2W"):
        self._ble = bluetooth.BLE()
        self._ble.active(True)
        self._ble.irq(self.ble_irq) # Registra o handler de eventos

        # Registra o serviço e as características no servidor GATT
        # Isso cria o "arquivo" onde o app pode escrever
        ((self._handle_command,),) = self._ble.gatts_register_services((pico_service,))
        
        self._connections = set()
        self._name = name
        self.advertise()
    # O que controla todos os eventos BLE
    def ble_irq(self, event, data):	
        global _command_buffer
        global _command_to_run
        # Se um dispositivo se conectar à placa
        if event == _IRQ_CENTRAL_CONNECT:
            conn_handle, _, _ = data
            self._connections.add(conn_handle)
            print("Dispositivo Conectado!")

        # Se o dispositivo se desconectar
        elif event == _IRQ_CENTRAL_DISCONNECT:
            conn_handle, _, _ = data
            self._connections.remove(conn_handle)
            print("Dispositivo Desconectado!")
            _command_buffer = ""
            # Começa a anunciar de novo para ser encontrado por outros
            self.advertise()
        
        # Se o dispostivo conectado mandar algum comando
        elif event == _IRQ_GATTS_WRITE:
            conn_handle, value_handle = data
            
            if conn_handle in self._connections and value_handle == self._handle_command:
                received_chunk = self._ble.gatts_read(self._handle_command)
                
                if received_chunk == b'_EOT_':
                    command_received = _command_buffer
                    _command_buffer = "" # Limpa o buffer imediatamente

                    # ------ LÓGICA HÍBRIDA ------
                    # Se o comando for para parar o jogo, execute-o AGORA.
                    if command_received == "snake_stop()":
                        print("Comando de parada recebido. Executando imediatamente.")
                        try:
                            snake_stop()
                        except Exception as e:
                            print(f"Erro ao executar snake_stop(): {e}")
                    else:
                        # Para todos os outros comandos, use a fila.
                        print(f"Comando '{command_received}' recebido e enfileirado.")
                        _command_to_run = command_received
                    # -----------------------------

                else:
                    _command_buffer += received_chunk.decode()
                    print(f"Pedaço recebido. Buffer agora com {len(_command_buffer)} bytes.")

    def advertise(self):
        print(f"Anunciando como '{self._name}'...")
        # Anuncia o nome do dispositivo
        self._ble.gap_advertise(100000, adv_data=bytes(self._name, 'UTF-8'))


led = Pin("LED", Pin.OUT)



# Inicia o servidor BLE
pico_server = PicoBLE()

# Game code
class Snake:
    up = 0
    down = 1
    left = 2
    right = 3
    
    def __init__(self, x=int(SEGMENTS_WIDE/2), y=int(SEGMENTS_HIGH/2) + 1):
        self.segments = [[x, y]]
        self.x = x
        self.y = y
        self.dir = random.randint(0,3)
        self.state = True
        
    def reset(self, x=int(SEGMENTS_WIDE/2), y=int(SEGMENTS_HIGH/2) + 1):
        self.segments = [[x, y]]
        self.x = x
        self.y = y
        self.dir = random.randint(0,3)
        self.state = True
        
    def move(self):
        new_x = self.x
        new_y = self.y
        
        if self.dir == Snake.up:
            new_y -= 1
        elif self.dir == Snake.down:
            new_y += 1
        elif self.dir == Snake.left:
            new_x -= 1
        elif self.dir == Snake.right:
            new_x += 1
            
        # --- NOVO: Lógica para atravessar a tela ---
        if new_x < 0:
            new_x = SEGMENTS_WIDE - 1
        elif new_x >= SEGMENTS_WIDE:
            new_x = 0
        
        if new_y < 0:
            new_y = SEGMENTS_HIGH - 1
        elif new_y >= SEGMENTS_HIGH:
            new_y = 0
        
        # --- FIM DA MODIFICAÇÃO ---

        for i, _ in enumerate(self.segments):
            if i != len(self.segments) - 1:
                self.segments[i][0] = self.segments[i+1][0]
                self.segments[i][1] = self.segments[i+1][1]
        
        if self._check_crash(new_x, new_y):
            # Oh no, we killed the snake :C
            if self.state == True:
                # play an ugly sound
                buzzer.freq(200)
                buzzer.duty_u16(2000)
                time.sleep(0.5)
                buzzer.duty_u16(0)
            self.state = False
        
        self.x = new_x
        self.y = new_y
        
        self.segments[-1][0] = self.x
        self.segments[-1][1] = self.y
        
    def eat(self):
        oled.fill_rect(self.x * SEGMENT_PIXELS, self.y * SEGMENT_PIXELS, SEGMENT_PIXELS, SEGMENT_PIXELS, 0)
        oled.rect(self.x * SEGMENT_PIXELS, self.y * SEGMENT_PIXELS, SEGMENT_PIXELS, SEGMENT_PIXELS, 1)
        self.segments.append([self.x, self.y])
        # Make a sound
        buzzer.freq(1000)
        buzzer.duty_u16(2000)
        time.sleep(0.100)
        buzzer.duty_u16(0)
        
    def change_dir(self, dir):
        if  dir == Snake.down and self.dir == Snake.up:
            return False
        
        elif dir == Snake.up and self.dir == Snake.down:
            return False
        
        elif dir == Snake.right and self.dir == Snake.left:
            return False
        
        elif dir == Snake.left and self.dir == Snake.right:
            return False
        
        self.dir = dir
        
    def _check_crash(self, new_x, new_y):
        # --- NOVO: Verifica colisão apenas com a própria cobra ---
        if [new_x, new_y] in self.segments:
            return True
        else:
            return False
    
    def draw(self):
        oled.rect(self.segments[-1][0] * SEGMENT_PIXELS, self.segments[-1][1] * SEGMENT_PIXELS, SEGMENT_PIXELS, SEGMENT_PIXELS, 1)

def pico_snake_main():
    global player, food, is_game_running
    
    # O loop principal agora depende da nossa variável de estado
    while is_game_running:
        # --- INICIALIZAÇÃO DE UMA PARTIDA ---
        player = Snake()
        food = random.choice([coord for coord in VALID_RANGE if coord not in player.segments])
        
        oled.fill(0)
        oled.fill_rect(food[0] * SEGMENT_PIXELS , food[1] * SEGMENT_PIXELS, SEGMENT_PIXELS, SEGMENT_PIXELS, 1)
        
        game_timer.init(freq=5, mode=Timer.PERIODIC, callback=update_game)
        
        # Definições do Joystick (mantidas dentro para escopo local)
        adc_vrx = ADC(Pin(26))
        adc_vry = ADC(Pin(27))
        def down(): return adc_vrx.read_u16() > 49152
        def up(): return adc_vrx.read_u16() < 16384
        def left(): return adc_vry.read_u16() > 49152
        def right(): return adc_vry.read_u16() < 16384

        # --- LOOP DO JOGO EM EXECUÇÃO (UMA PARTIDA) ---
        while player.state == True:
            # VERIFICAÇÃO DE PARADA: Se o estado mudou para False, saia do loop interno
            if not is_game_running:
                break

            if up(): player.change_dir(Snake.up)
            elif right(): player.change_dir(Snake.right)
            elif left(): player.change_dir(Snake.left)
            elif down(): player.change_dir(Snake.down)
            
            time.sleep(0.01)

        # --- FIM DE PARTIDA ---
        game_timer.deinit()

        # VERIFICAÇÃO DE PARADA: Se o jogo foi interrompido externamente, saia do loop principal
        if not is_game_running:
            break

        # --- TELA DE GAME OVER ---
        oled.fill(0)
        oled.text("Game Over!" , int(SCREEN_WIDTH/2) - int(len("Game Over!")/2 * 8), int(SCREEN_HEIGHT/2) - 16)
        oled.text("Score:" + str(len(player.segments)) , int(SCREEN_WIDTH/2) - int(len("Score:" + str(len(player.segments))) /2 * 8), int(SCREEN_HEIGHT/2))
        oled.text("Press joy to rst", 0, SCREEN_HEIGHT - 8)
        oled.show()
        
        time.sleep(0.5)
        # Aguarda o botão do joystick OU o comando de parada
        while joystick_button.value() != 0:
            if not is_game_running:
                break
            time.sleep(0.01)

    # --- LIMPEZA FINAL ---
    # Este código só será executado quando 'is_game_running' se tornar False
    game_timer.deinit() # Garante que o timer está parado
    oled.fill(0)
    oled.show()
    print("Jogo finalizado e tela limpa.")
    
def update_game(timer):
    global food
    global player
    
    # Remove a cauda anterior da cobra (mais eficiente do que limpar a tela inteira)
    oled.fill_rect(player.segments[0][0] * SEGMENT_PIXELS, player.segments[0][1] * SEGMENT_PIXELS, SEGMENT_PIXELS, SEGMENT_PIXELS, 0)
    
    # Move a cobra
    player.move()
    
    if player.state == True:
        # A cobra ainda está viva e se movendo
        if food[0] == player.x and food[1] == player.y:
            # A cobra alcançou a comida
            player.eat()
            if len(player.segments) < (SEGMENTS_WIDE * SEGMENTS_HIGH):
                food = random.choice([coord for coord in VALID_RANGE if coord not in player.segments])
                oled.fill_rect(food[0] * SEGMENT_PIXELS , food[1] * SEGMENT_PIXELS, SEGMENT_PIXELS, SEGMENT_PIXELS, 1)
            else: # Vitória!
                player.state = False

        player.draw()
        
    # Mostra o novo frame
    oled.show()

def snake_start():
    global is_game_running
    # Apenas inicia o jogo se ele não estiver rodando
    if not is_game_running:
        is_game_running = True
        print("Iniciando o jogo Snake...")
        try:
            pico_snake_main()
        except Exception as e:
            print(f"Game crashed: {e}")
            oled.fill(0)
            oled.text("Game Error", 0, 0)
            oled.show()
        # Garante que o estado seja False ao sair, por qualquer motivo
        is_game_running = False

def snake_stop():
    global is_game_running
    if is_game_running:
        print("Recebido comando para parar o jogo. Parando imediatamente.")
        is_game_running = False
        game_timer.deinit()
        oled.fill(0)
        oled.show()
        
# O loop principal agora é o nosso processador de comandos.
while True:
    # Há um novo comando para executar?
    if _command_to_run:
        print(f"Executando comando enfileirado: {_command_to_run}")
        
        # Copia o comando para uma variável local e limpa a global
        # Isso evita que o comando seja executado várias vezes.
        command = _command_to_run
        _command_to_run = None
        
        try:
            # Executa o comando no loop principal, que é um local seguro.
            exec(command)
        except Exception as e:
            print(f"Erro ao executar comando '{command}': {e}")
            
    # Uma pequena pausa para não sobrecarregar o processador
    time.sleep(0.1)
