# Implementação da Conexão Bluetooth

Este documento descreve as mudanças feitas para implementar a conexão Bluetooth usando Capacitor no aplicativo BitDogLab.

## Arquivos Modificados

1. **ConnectionContext.tsx**

   - Adicionado suporte para conexões Bluetooth e Serial
   - Criado enum para tipos de conexão
   - Implementada lógica para gerenciar diferentes tipos de dispositivos

2. **Connection.tsx**

   - Interface atualizada para mostrar opções de conexão via cabo ou Bluetooth
   - Botões separados para cada tipo de conexão

3. **ConnectionStatus.tsx**

   - Exibe informações mais detalhadas sobre o tipo de conexão e dispositivo conectado

4. **neopixelController.ts**

   - Modificado para funcionar com ambos os tipos de conexão
   - Lógica separada para envio de comandos por Serial ou Bluetooth

5. **Neopixel.tsx**

   - Atualizado para usar o controlador correto dependendo do tipo de conexão

6. **Configurações Nativas**
   - Adicionadas permissões de Bluetooth no AndroidManifest.xml
   - Adicionadas descrições de uso e configurações no Info.plist para iOS

## Novos Arquivos

1. **bluetoothService.ts**

   - Implementa a comunicação com dispositivos Bluetooth específicos para o controle de LEDs
   - Gerencia o envio de dados para os LEDs via Bluetooth

2. **raspberryCodeSender.ts**

   - Implementa a funcionalidade de enviar código Python para o Raspberry Pi via Bluetooth
   - Gerencia o envio em chunks e acompanhamento do progresso

3. **CodeSendProgress.tsx**

   - Interface de usuário para mostrar o progresso do envio de código para o Raspberry Pi
   - Fornece feedback visual e informações de status para o usuário

4. **raspberry_bootstrap.py**

   - Script mínimo para ser instalado no Raspberry Pi
   - Recebe código via Bluetooth e o executa dinamicamente

5. **raspberry_hc05_neopixel.py**

   - Implementação do controle de LEDs Neopixel para Raspberry Pi
   - Este código é enviado pelo app para o Raspberry Pi

6. **setup-bluetooth.sh**
   - Script para preparar o ambiente e facilitar a execução do app

## Como Usar

### Configuração do Raspberry Pi

1. Instale o script bootstrap no Raspberry Pi:

   ```bash
   # No Raspberry Pi
   curl -O https://raw.githubusercontent.com/your-repo/app-bitdoglab/main/raspberry_bootstrap.py
   chmod +x raspberry_bootstrap.py
   ```

2. Emparelhe o módulo HC-05 com o Raspberry Pi:

   ```bash
   sudo bluetoothctl
   # Dentro do bluetoothctl
   scan on
   # Anote o endereço do HC-05 (formato XX:XX:XX:XX:XX:XX)
   pair XX:XX:XX:XX:XX:XX
   # Digite o código PIN (geralmente 1234)
   trust XX:XX:XX:XX:XX:XX
   quit
   ```

3. Configure a conexão RFCOMM:

   ```bash
   sudo rfcomm bind 0 XX:XX:XX:XX:XX:XX
   ```

4. Execute o script bootstrap:

   ```bash
   python3 raspberry_bootstrap.py
   ```

### Configuração do App

1. Execute o script de configuração:

   ```bash
   ./setup-bluetooth.sh
   ```

2. Siga as instruções para executar o aplicativo na plataforma desejada.

### No Aplicativo

1. Na tela de conexão, escolha entre:

   - "Conectar via Cabo" - para usar a conexão Serial existente
   - "Conectar via Bluetooth" - para usar Bluetooth

2. Ao selecionar Bluetooth, aparecerá um diálogo para escolher o dispositivo Bluetooth.

3. Após conectar, você verá um botão adicional: "Enviar Código para Raspberry Pi"

4. Clique neste botão para enviar o código Python para controle de LEDs Neopixel para o Raspberry Pi.

5. Uma interface de progresso será exibida, mostrando o status do envio e confirmação.

6. Após o envio bem-sucedido, todas as funcionalidades existentes continuarão funcionando, agora via Bluetooth.

## Fluxo de Operação

1. Instale o script bootstrap mínimo no Raspberry Pi
2. No app, conecte-se ao HC-05 via Bluetooth
3. Envie o código Python completo para o Raspberry Pi
4. O script bootstrap recebe e executa dinamicamente o código recebido
5. O Raspberry Pi agora pode controlar os LEDs Neopixel conforme comandado pelo app

## Considerações Técnicas

- O Capacitor Bluetooth LE é usado para comunicação Bluetooth
- O código é enviado em pequenos chunks para evitar problemas de buffer
- O script bootstrap no Raspberry Pi é a única parte que precisa ser pré-instalada
- Todo o código de controle de LEDs é enviado dinamicamente do app para o Raspberry Pi
- As permissões necessárias para Android e iOS foram configuradas

## Próximos Passos

1. Testar a solução em dispositivos reais (Android, iOS e Raspberry Pi)
2. Estender a funcionalidade para outros componentes além do Neopixel
3. Adicionar mais opções de configuração de dispositivos Bluetooth
4. Implementar reconexão automática com dispositivos Bluetooth conhecidos
5. Adicionar suporte para outros modelos de módulos Bluetooth além do HC-05
