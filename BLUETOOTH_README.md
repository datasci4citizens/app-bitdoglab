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

2. **setup-bluetooth.sh**
   - Script para preparar o ambiente e facilitar a execução do app

## Como Usar

### Configuração

1. Execute o script de configuração:

   ```
   ./setup-bluetooth.sh
   ```

2. Siga as instruções para executar o aplicativo na plataforma desejada.

### No Aplicativo

1. Na tela de conexão, escolha entre:

   - "Conectar via Cabo" - para usar a conexão Serial existente
   - "Conectar via Bluetooth" - para usar Bluetooth

2. Ao selecionar Bluetooth, aparecerá um diálogo para escolher o dispositivo Bluetooth (mesma experiência que no caso da conexão Serial).

3. Após conectar, todas as funcionalidades existentes continuarão funcionando, agora com suporte tanto para conexão via cabo quanto via Bluetooth.

## Considerações Técnicas

- O Capacitor Bluetooth LE já estava incluído como dependência no projeto
- As permissões necessárias para Android e iOS foram configuradas
- A implementação é modular, permitindo fácil expansão para outros componentes além do Neopixel

## Próximos Passos

1. Implementar o protocolo específico para cada dispositivo Bluetooth
2. Adicionar mais opções de configuração de dispositivos Bluetooth
3. Melhorar a gestão de reconexão automática com dispositivos Bluetooth conhecidos
