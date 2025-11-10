import machine                
from machine import PWM, Pin  
import machine                
from machine import PWM, Pin  
from machine import SoftI2C, ADC
import neopixel               
import time
import math
import random                 
from ssd1306 import SSD1306_I2C 

# ======================================================================
#   LED Cátodo Comum
# ======================================================================

def controller_ledRGB(pinR, pinG, pinB, colorR, colorG, colorB):
    pwmR = PWM(pinR)
    pwmG = PWM(pinG)
    pwmB = PWM(pinB)

    pwmR.freq(1000)
    pwmG.freq(1000)
    pwmB.freq(1000)

    pwmR.duty_u16(colorR)
    pwmG.duty_u16(colorG)
    pwmB.duty_u16(colorB)


# ======================================================================
#   Buzzer A
# ======================================================================

def controller_Buzzer(pinBuzzer, freq, intensity):

    pwm = PWM(pinBuzzer)
    pwm.freq(freq)
    pwm.duty_u16(intensity)
    return pwm    # retorna objeto para desligar depois se quiser


# ======================================================================
#   Matriz de LEDs Neopixel 5x5
# ======================================================================

# Exemplo: matriz no pino 7 com 25 LEDs:
def init_matrix(pin=7, num_leds=25):
    return neopixel.NeoPixel(Pin(pin), num_leds)



# ======================================================================
#   I2c e OLED
# ======================================================================





# Função utilitária: mapeamento linear de faixa
def map_value(value, in_min, in_max, out_min, out_max):
    """
    Mapeia 'value' da faixa [in_min, in_max] para [out_min, out_max].
    Usamos // (inteiro) pois os índices de LEDs devem ser inteiros.
    """
    return (value - in_min) * (out_max - out_min) // (in_max - in_min) + out_min


def update_oled(lines):
    """
    Desenha até 8 linhas (8 px de altura cada) na tela 128x64.
    Espera uma LISTA de strings. Se você passar uma string única,
    o Python vai iterar caractere a caractere (provavelmente indesejado).
    """
    oled.fill(0)
    for i, line in enumerate(lines):
        oled.text(line, 0, i * 8)
    oled.show()

def exibir_no_oled(v_bus, corrente_mA, potencia_mW):
    """
    Mostra V (bus), I (mA com sinal) e P (mW) + Vshunt (mV, com sinal invertido para ficar "positiva").
    """
    oled.fill(0)
    oled.text("V: {:.2f}V".format(v_bus), 0, 0)
    oled.text("I: {:+.2f}mA".format(corrente_mA), 0, 16)
    oled.text("P: {:+.2f}mW".format(potencia_mW), 0, 32)
    oled.text("Shunt:{:+.3f}mV".format(ler_tensao_shunt() * -1000.0), 0, 48)
    oled.show()


for ch in (led_r, led_g, led_b):
    ch.freq(1000)

def apagar_todos():
    """Apaga os três canais do LED RGB discreto (duty=0)."""
    led_r.duty_u16(0)
    led_g.duty_u16(0)
    led_b.duty_u16(0)


buzzer = PWM(Pin(21))
buzzer.freq(50)  # valor inicial baixo apenas para inicializar

def beep(freq=1000, duration=0.2):
    """ Beep simples com frequência e duração ajustáveis. """
    buzzer.freq(freq)
    buzzer.duty_u16(5000)
    time.sleep(duration)
    buzzer.duty_u16(0)

def star_trek_beep():
    """ Três tons ascendentes rápidos (estilo efeito “sci-fi”). """
    buzzer.freq(1000); buzzer.duty_u16(40000); time.sleep(0.1); buzzer.duty_u16(0)
    time.sleep(0.05)
    buzzer.freq(1500); buzzer.duty_u16(40000); time.sleep(0.1); buzzer.duty_u16(0)
    time.sleep(0.05)
    buzzer.freq(2000); buzzer.duty_u16(40000); time.sleep(0.1); buzzer.duty_u16(0)

# ======================================================================
#  Helpers de matriz
# ======================================================================

def clear_all():
    """Apaga toda a matriz 5x5."""
    for i in range(NUM_LEDS):
        np[i] = BLACK
    np.write()

def door_swish():
    """Efeito de “porta abrindo/fechando” varrendo frequência do buzzer."""
    for f in range(1000, 2000, 50):
        buzzer.freq(f); buzzer.duty_u16(40000); time.sleep(0.005)
    for f in range(2000, 1000, -50):
        buzzer.freq(f); buzzer.duty_u16(40000); time.sleep(0.005)
    buzzer.duty_u16(0)

def smile_face():
    """Desenha uma carinha simples (olhos e sorriso estilizados)."""
    colors = [
        BLACK, BLUE, BLUE, BLUE, BLACK,
        BLUE, BLACK, BLACK, BLACK, BLUE,
        BLACK, BLACK, BLACK, BLACK, BLACK,
        BLACK, CYAN, BLACK, CYAN, BLACK,
        BLACK, BLACK, BLACK, BLACK, BLACK
    ]
    for i, c in enumerate(colors):
        np[i] = c
    np.write()

def blink_right_eye():
    """Pisca “olho direito” com efeito sonoro."""
    # Desenho do rosto com olho direito fechado
    frame = [
        BLACK, BLUE, BLUE, BLUE, BLACK,
        BLUE, BLACK, BLACK, BLACK, BLUE,
        BLACK, BLACK, BLACK, BLACK, BLACK,
        BLACK, CYAN, BLACK, BLACK, BLACK,   # olho direito apagado
        BLACK, BLACK, BLACK, BLACK, BLACK
    ]
    for i, c in enumerate(frame):
        np[i] = c
    np.write()
    door_swish()
    time.sleep(0.2)
    # Restaura o olho direito
    np[18] = CYAN
    np.write()

def seta_Direita():
    """Desenha uma seta apontando para a direita."""
    pattern = [BLACK]*25
    for idx in (2, 8, 10,11,12,13,14,18,22):
        pattern[idx] = YELLOW
    for i, c in enumerate(pattern):
        np[i] = c
    np.write()
    buzzer.duty_u16(0)

def seta_Esquerda():
    """Desenha uma seta apontando para a esquerda."""
    pattern = [BLACK]*25
    for idx in (2,6,10,11,12,13,14,16,22):
        pattern[idx] = YELLOW
    for i, c in enumerate(pattern):
        np[i] = c
    np.write()
    buzzer.duty_u16(0)

def seta_Cima():
    """Desenha uma seta apontando para cima."""
    pattern = [BLACK]*25
    for idx in (2,7,10,12,14,16,17,18,22):
        pattern[idx] = YELLOW
    for i, c in enumerate(pattern):
        np[i] = c
    np.write()
    buzzer.duty_u16(0)


# Conjunto de “patamares” (de poucos LEDs até muitos) — repetido 2x para suavizar a rampa
patamares = [
    [2],
    [1, 2, 3],
    [7, 1, 2, 3],
    [12, 6, 7, 8, 0, 1, 2, 3, 4],
    [12, 6, 7, 8, 0, 1, 2, 3, 4, 11, 13, 17, 5, 9],
    [12, 6, 7, 8, 0, 1, 2, 3, 4, 11, 13, 17, 5, 9, 22, 16, 18, 10, 14],
    [12, 6, 7, 8, 0, 1, 2, 3, 4, 11, 13, 17, 5, 9, 22, 16, 18, 10, 14, 15, 19],
    [12, 6, 7, 8, 0, 1, 2, 3, 4, 11, 13, 17, 5, 9, 22, 16, 18, 10, 14, 15, 19, 20, 21, 23, 24]
] * 2

def determinar_cor(patamar_index):
    """Azul nos níveis baixos, vermelho nos níveis altos."""
    if patamar_index < len(patamares) / 3.5:
        return (0, 0, 85)     # Azul
    else:
        return (105, 0, 0)    # Vermelho

def acender_leds(patamar_index):
    """Desliga tudo e acende apenas os LEDs do patamar corrente."""
    cor = determinar_cor(patamar_index)
    for i in range(NUM_LEDS):
        np[i] = BLACK
    for i in patamares[patamar_index]:
        np[i] = cor
    np.write()
