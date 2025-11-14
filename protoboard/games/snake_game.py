# snake_game.py
# Jogo da Cobrinha para BitDogLab

import random
import time
from machine import Timer

# Importa constantes e hardware
from hardware import (
    SCREEN_WIDTH, SCREEN_HEIGHT, SEGMENT_WIDTH, SEGMENT_PIXELS,
    SEGMENTS_HIGH, SEGMENTS_WIDE, VALID_RANGE,
    oled, joystick_button, buzzer,
    joy_up, joy_down, joy_left, joy_right
)

# === VARIÁVEIS GLOBAIS DO JOGO ===
is_game_running = False
game_timer = Timer()
player = None
food = None

class Snake:
    """
    Classe que representa a cobra
    Controla movimento, direção, colisões e crescimento
    """
    
    # Constantes de direção
    up = 0
    down = 1
    left = 2
    right = 3
    
    def __init__(self, x=None, y=None):
        """
        Inicializa a cobra no centro da tela
        x, y: posição inicial (opcional)
        """
        if x is None:
            x = int(SEGMENTS_WIDE / 2)
        if y is None:
            y = int(SEGMENTS_HIGH / 2) + 1
            
        self.segments = [[x, y]]
        self.x = x
        self.y = y
        self.dir = random.randint(0, 3)  # Direção inicial aleatória
        self.state = True  # True = viva, False = morta
    
    def reset(self, x=None, y=None):
        """
        Reseta a cobra para começar um novo jogo
        """
        if x is None:
            x = int(SEGMENTS_WIDE / 2)
        if y is None:
            y = int(SEGMENTS_HIGH / 2) + 1
            
        self.segments = [[x, y]]
        self.x = x
        self.y = y
        self.dir = random.randint(0, 3)
        self.state = True
    
    def move(self):
        """
        Move a cobra na direção atual
        Implementa wrap-around (atravessa as bordas da tela)
        """
        new_x = self.x
        new_y = self.y
        
        # Calcula nova posição baseada na direção
        if self.dir == Snake.up:
            new_y -= 1
        elif self.dir == Snake.down:
            new_y += 1
        elif self.dir == Snake.left:
            new_x -= 1
        elif self.dir == Snake.right:
            new_x += 1
        
        # Wrap-around: atravessa as bordas
        if new_x < 0:
            new_x = SEGMENTS_WIDE - 1
        elif new_x >= SEGMENTS_WIDE:
            new_x = 0
        
        if new_y < 0:
            new_y = SEGMENTS_HIGH - 1
        elif new_y >= SEGMENTS_HIGH:
            new_y = 0
        
        # Move todos os segmentos (cada um vai para posição do próximo)
        for i in range(len(self.segments) - 1):
            self.segments[i][0] = self.segments[i + 1][0]
            self.segments[i][1] = self.segments[i + 1][1]
        
        # Verifica colisão com próprio corpo
        if self._check_crash(new_x, new_y):
            if self.state:
                # Toca som de morte
                buzzer.freq(200)
                buzzer.duty_u16(2000)
                time.sleep(0.5)
                buzzer.duty_u16(0)
            self.state = False
        
        # Atualiza posição da cabeça
        self.x = new_x
        self.y = new_y
        self.segments[-1][0] = self.x
        self.segments[-1][1] = self.y
    
    def eat(self):
        """
        Cobra come a comida e cresce
        """
        # Desenha o novo segmento
        oled.fill_rect(
            self.x * SEGMENT_PIXELS,
            self.y * SEGMENT_PIXELS,
            SEGMENT_PIXELS,
            SEGMENT_PIXELS,
            0
        )
        oled.rect(
            self.x * SEGMENT_PIXELS,
            self.y * SEGMENT_PIXELS,
            SEGMENT_PIXELS,
            SEGMENT_PIXELS,
            1
        )
        
        # Adiciona novo segmento
        self.segments.append([self.x, self.y])
        
        # Toca som de comer
        buzzer.freq(1000)
        buzzer.duty_u16(2000)
        time.sleep(0.1)
        buzzer.duty_u16(0)
    
    def change_dir(self, new_dir):
        """
        Muda a direção da cobra
        Impede que a cobra vire 180° (volte sobre si mesma)
        """
        # Não pode ir para trás
        if new_dir == Snake.down and self.dir == Snake.up:
            return False
        elif new_dir == Snake.up and self.dir == Snake.down:
            return False
        elif new_dir == Snake.right and self.dir == Snake.left:
            return False
        elif new_dir == Snake.left and self.dir == Snake.right:
            return False
        
        self.dir = new_dir
        return True
    
    def _check_crash(self, new_x, new_y):
        """
        Verifica se a nova posição colide com o corpo da cobra
        """
        return [new_x, new_y] in self.segments
    
    def draw(self):
        """
        Desenha a cabeça da cobra na tela
        """
        oled.rect(
            self.segments[-1][0] * SEGMENT_PIXELS,
            self.segments[-1][1] * SEGMENT_PIXELS,
            SEGMENT_PIXELS,
            SEGMENT_PIXELS,
            1
        )

def update_game(timer):
    """
    Função chamada pelo timer a cada frame do jogo
    Atualiza posição da cobra e verifica colisões com comida
    """
    global food, player
    
    # Apaga a cauda anterior (otimização)
    oled.fill_rect(
        player.segments[0][0] * SEGMENT_PIXELS,
        player.segments[0][1] * SEGMENT_PIXELS,
        SEGMENT_PIXELS,
        SEGMENT_PIXELS,
        0
    )
    
    # Move a cobra
    player.move()
    
    if player.state:
        # Cobra ainda está viva
        
        # Verifica se comeu a comida
        if food[0] == player.x and food[1] == player.y:
            player.eat()
            
            # Gera nova comida (se ainda há espaço)
            if len(player.segments) < (SEGMENTS_WIDE * SEGMENTS_HIGH):
                food = random.choice([
                    coord for coord in VALID_RANGE
                    if coord not in player.segments
                ])
                oled.fill_rect(
                    food[0] * SEGMENT_PIXELS,
                    food[1] * SEGMENT_PIXELS,
                    SEGMENT_PIXELS,
                    SEGMENT_PIXELS,
                    1
                )
            else:
                # Vitória! Preencheu toda a tela
                player.state = False
        
        # Desenha a cobra
        player.draw()
    
    # Atualiza a tela
    oled.show()

def snake_start():
    """
    Inicia o jogo da cobrinha
    Chamado pelo app ou pelo menu
    """
    global is_game_running, player, food
    
    # Só inicia se não estiver rodando
    if is_game_running:
        print("⚠️ Jogo já está rodando!")
        return
    
    is_game_running = True
    print("🐍 Iniciando jogo Snake...")
    
    try:
        pico_snake_main()
    except Exception as e:
        print(f"❌ Erro no jogo: {e}")
        oled.fill(0)
        oled.text("Game Error", 0, 0)
        oled.text(str(e)[:16], 0, 10)
        oled.show()
        time.sleep(3)
    finally:
        # Garante que o estado seja resetado
        is_game_running = False

def snake_stop():
    """
    Para o jogo da cobrinha imediatamente
    Chamado pelo app ou pelo botão B
    """
    global is_game_running
    
    if is_game_running:
        print("⏹️ Parando o jogo...")
        is_game_running = False
        game_timer.deinit()
        oled.fill(0)
        oled.show()
        buzzer.duty_u16(0)

def pico_snake_main():
    """
    Loop principal do jogo
    Gerencia partidas e tela de game over
    """
    global player, food, is_game_running
    
    while is_game_running:
        # === INICIALIZAÇÃO DE UMA PARTIDA ===
        player = Snake()
        food = random.choice([
            coord for coord in VALID_RANGE
            if coord not in player.segments
        ])
        
        # Limpa tela e desenha comida inicial
        oled.fill(0)
        oled.fill_rect(
            food[0] * SEGMENT_PIXELS,
            food[1] * SEGMENT_PIXELS,
            SEGMENT_PIXELS,
            SEGMENT_PIXELS,
            1
        )
        
        # Inicia o timer do jogo (5 FPS)
        game_timer.init(freq=5, mode=Timer.PERIODIC, callback=update_game)
        
        # === LOOP DA PARTIDA ===
        while player.state and is_game_running:
            # Lê controles do joystick
            if joy_up():
                player.change_dir(Snake.up)
            elif joy_right():
                player.change_dir(Snake.right)
            elif joy_left():
                player.change_dir(Snake.left)
            elif joy_down():
                player.change_dir(Snake.down)
            
            time.sleep(0.01)
        
        # Para o timer
        game_timer.deinit()
        
        # Se o jogo foi interrompido externamente, sai
        if not is_game_running:
            break
        
        # === TELA DE GAME OVER ===
        oled.fill(0)
        
        # Calcula pontuação
        score = len(player.segments)
        score_text = f"Score: {score}"
        
        # Centraliza textos
        oled.text(
            "Game Over!",
            int(SCREEN_WIDTH / 2) - int(len("Game Over!") / 2 * 8),
            int(SCREEN_HEIGHT / 2) - 16
        )
        oled.text(
            score_text,
            int(SCREEN_WIDTH / 2) - int(len(score_text) / 2 * 8),
            int(SCREEN_HEIGHT / 2)
        )
        oled.text("Press joy to rst", 0, SCREEN_HEIGHT - 8)
        oled.show()
        
        time.sleep(0.5)
        
        # Aguarda botão do joystick para reiniciar
        while joystick_button.value() != 0:
            if not is_game_running:
                break
            time.sleep(0.01)
    
    # === LIMPEZA FINAL ===
    game_timer.deinit()
    oled.fill(0)
    oled.show()
    buzzer.duty_u16(0)
    print("🏁 Jogo finalizado")

print("✓ snake_game.py carregado")
