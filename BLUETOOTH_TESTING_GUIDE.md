# Guia de Testes para BitDogLab com Bluetooth

Este documento fornece orientações detalhadas para testar a implementação Bluetooth do BitDogLab com dispositivos reais.

## Equipamentos Necessários

- Dispositivo Android ou iOS com o app BitDogLab instalado
- Raspberry Pi (3, 4 ou Zero W)
- Módulo Bluetooth HC-05
- LEDs Neopixel (WS2812B)
- Cabos jumper
- Resistor de 300-500 Ohm (para proteger o primeiro LED)
- Fonte de alimentação externa para os LEDs (5V)

## Configuração do Hardware

### Conexões do HC-05 ao Raspberry Pi

| HC-05 | Raspberry Pi  |
| ----- | ------------- |
| VCC   | 5V            |
| GND   | GND           |
| TXD   | GPIO 15 (RXD) |
| RXD   | GPIO 14 (TXD) |

### Conexões do LED Neopixel

| Neopixel | Raspberry Pi | Fonte Externa |
| -------- | ------------ | ------------- |
| VCC      | -            | 5V            |
| GND      | GND          | GND           |
| DIN      | GPIO 18      | -             |

**Nota:** Conecte um resistor de 300-500 Ohm entre o GPIO 18 e o pino DIN do primeiro LED para proteção.

## Preparação do Raspberry Pi

1. Instale as dependências necessárias:

```bash
sudo apt update
sudo apt install -y python3-pip bluetooth bluez rfcomm
pip3 install pyserial rpi_ws281x adafruit-circuitpython-neopixel
```

2. Configure as permissões para o dispositivo Bluetooth:

```bash
sudo usermod -a -G dialout $USER
sudo chmod 777 /dev/rfcomm0
```

3. Teste o hardware dos LEDs com um script simples (opcional):

```python
import board
import neopixel
import time

pixels = neopixel.NeoPixel(board.D18, 25, brightness=0.2)

# Teste básico - acender todos em vermelho
pixels.fill((255, 0, 0))
pixels.show()
time.sleep(1)
# Limpar
pixels.fill((0, 0, 0))
pixels.show()
```

## Procedimento de Teste

### Teste 1: Conexão Básica

1. Execute o bootstrap no Raspberry Pi:

   ```bash
   python3 raspberry_bootstrap.py
   ```

2. Abra o app BitDogLab no dispositivo móvel.

3. Na tela de Conexão, toque em "Conectar via Bluetooth".

4. Selecione o dispositivo HC-05 na lista.

5. **Resultado esperado:** Status de conexão deve mudar para "Conectado via Bluetooth".

### Teste 2: Envio de Código

1. Com a conexão Bluetooth estabelecida, toque em "Enviar Código para Raspberry Pi".

2. Observe a interface de progresso.

3. **Resultado esperado:**

   - Barra de progresso deve aumentar até 100%
   - Status deve mudar para "Aguardando dispositivo"
   - Finalmente deve mostrar "Envio concluído"

4. No terminal do Raspberry Pi, verifique se há mensagens confirmando o recebimento:
   ```
   Código Python recebido completamente.
   Código Python salvo em /tmp/bitdoglab_code.py
   Executando código recebido...
   ```

### Teste 3: Controle de LEDs

1. Após enviar o código com sucesso, navegue até a seção Neopixel no app.

2. Configure alguns LEDs com cores diferentes.

3. Toque em "Enviar" para transmitir os comandos.

4. **Resultado esperado:** Os LEDs físicos conectados ao Raspberry Pi devem acender com as cores configuradas no app.

### Teste 4: Tempo de Resposta

1. No app, mude rapidamente as cores de vários LEDs.

2. **Resultado esperado:** O tempo de resposta entre mudanças no app e nos LEDs físicos deve ser inferior a 1 segundo.

### Teste 5: Estabilidade da Conexão

1. Deixe o app conectado por pelo menos 10 minutos, enviando comandos periodicamente.

2. **Resultado esperado:** A conexão deve permanecer estável e os comandos devem ser executados corretamente.

## Resolução de Problemas

### LED não Acende

- Verifique a alimentação do LED (deve ser 5V)
- Confirme que o pino de dados está conectado ao GPIO 18
- Verifique se o script está sendo executado corretamente

### Problemas de Conexão Bluetooth

- Verifique se o HC-05 está corretamente pareado com o Raspberry Pi
- Execute `sudo rfcomm bind 0 XX:XX:XX:XX:XX:XX` para vincular a porta serial
- Verifique se o app tem permissões de Bluetooth ativadas

### Erros no Envio de Código

- Verifique o tamanho do código enviado (pode ser muito grande)
- Aumente o tempo de espera entre os chunks enviados
- Verifique logs no app e no console do Raspberry Pi

## Registro de Resultados

| Teste # | Resultado | Observações |
| ------- | --------- | ----------- |
| 1       |           |             |
| 2       |           |             |
| 3       |           |             |
| 4       |           |             |
| 5       |           |             |

Preencha a tabela acima durante os testes para documentar o comportamento do sistema.
