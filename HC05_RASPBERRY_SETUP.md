# Guia de Configuração: HC-05 com Raspberry Pi para Controle de Neopixel

Este guia explica como configurar o módulo Bluetooth HC-05 com um Raspberry Pi para controlar LEDs Neopixel a partir do aplicativo BitDogLab.

## Requisitos de Hardware

- Raspberry Pi (qualquer modelo com Bluetooth ou adaptador USB Bluetooth)
- Módulo Bluetooth HC-05
- LEDs Neopixel (WS2812B ou similares)
- Fonte de alimentação 5V adequada para os LEDs
- Resistor 470 ohm (para a linha de dados do Neopixel)
- Cabos jumper

## Conexões do Hardware

### HC-05 para Raspberry Pi

| HC-05 | Raspberry Pi              |
| ----- | ------------------------- |
| VCC   | 5V (pino 2 ou 4)          |
| GND   | GND (pino 6, 9, 14, etc.) |
| TXD   | GPIO15/RXD (pino 10)      |
| RXD   | GPIO14/TXD (pino 8)       |

### Neopixel para Raspberry Pi

| Neopixel | Raspberry Pi                                      |
| -------- | ------------------------------------------------- |
| VCC      | Fonte externa 5V\*                                |
| GND      | GND (conectado ao GND da fonte e do Raspberry Pi) |
| DIN      | GPIO18 (pino 12) via resistor de 470 ohm          |

\*Nota: Para mais de alguns LEDs, use uma fonte de alimentação externa de 5V. Não tente alimentar muitos LEDs diretamente do Raspberry Pi.

## Configuração do Software no Raspberry Pi

1. Instale as dependências necessárias:

```bash
sudo apt update
sudo apt install python3-pip bluetooth bluez blueman python3-serial -y
sudo pip3 install adafruit-circuitpython-neopixel rpi_ws281x
```

2. Configure o módulo Bluetooth HC-05:

```bash
# Emparelhar o HC-05
sudo bluetoothctl
[bluetooth]# power on
[bluetooth]# agent on
[bluetooth]# scan on
# Procure pelo endereço MAC do seu HC-05 (normalmente começa com algo como "98:D3:...")
[bluetooth]# pair XX:XX:XX:XX:XX:XX
[bluetooth]# trust XX:XX:XX:XX:XX:XX
[bluetooth]# quit
```

3. Crie uma porta serial para o dispositivo Bluetooth:

```bash
sudo rfcomm bind 0 XX:XX:XX:XX:XX:XX
```

Isto criará um dispositivo em `/dev/rfcomm0` que será usado pelo script Python.

4. Copie o script `raspberry_hc05_neopixel.py` para o Raspberry Pi.

5. Torne o script executável e configure para iniciar automaticamente:

```bash
chmod +x raspberry_hc05_neopixel.py
```

Para iniciar automaticamente na inicialização, adicione ao crontab:

```bash
crontab -e
```

E adicione esta linha:

```
@reboot /caminho/para/raspberry_hc05_neopixel.py > /home/pi/neopixel_log.txt 2>&1
```

## Teste e Solução de Problemas

### Teste Manual

Você pode testar manualmente enviando comandos através da porta serial:

```bash
echo -e 'LED:0,255,0,0;' > /dev/rfcomm0  # Define o LED 0 para vermelho
echo -e 'CLEAR_ALL;' > /dev/rfcomm0      # Limpa todos os LEDs
```

### Problemas Comuns

1. **O HC-05 não conecta**

   - Verifique se o módulo tem energia (LED piscando)
   - Certifique-se de que o pin code padrão é "1234" ou "0000"

2. **Os LEDs não respondem**

   - Verifique as conexões do pino de dados e GND
   - Certifique-se de que a fonte de alimentação é adequada
   - Verifique se o script está em execução (`ps aux | grep neopixel`)

3. **Erros no script**
   - Verifique os logs em `/home/pi/neopixel_log.txt`
   - Ajuste a porta serial em `raspberry_hc05_neopixel.py` se necessário

## Adaptação do Firmware do HC-05 (Opcional)

Se você é um usuário avançado, pode reprogramar o firmware do HC-05 para usar um nome personalizado:

```bash
# Entre no modo AT (normalmente conectando o pino KEY ao VCC durante a inicialização)
# Conecte via serial e envie os comandos AT:
AT+NAME=BitDogLab
AT+UART=9600,0,0
```

## Referências

- [Documentação CircuitPython NeoPixel](https://learn.adafruit.com/neopixels-on-raspberry-pi/python-usage)
- [Configuração do HC-05 com Raspberry Pi](https://www.electronicwings.com/raspberry-pi/raspberry-pi-bluetooth-communication-using-hc-05-module)
