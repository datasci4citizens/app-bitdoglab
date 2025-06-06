# Sistema de Monitoramento de Conexão via Heartbeat

## Resumo

Sistema implementado para monitorar continuamente a conexão entre a aplicação React e a placa microcontrolador, usando protocolo de heartbeat com detecção automática de falhas.

## Configurações do Sistema

### Parâmetros do Heartbeat

- **Intervalo**: 3 segundos entre verificações
- **Comando enviado**: `HB_PING`
- **Resposta esperada**: `HB_PONG`
- **Tolerância a falhas**: 2 tentativas consecutivas falhadas = conexão perdida
- **Timeout por tentativa**: 3 segundos

## Arquivos Modificados

### 1. ConnectionContext.tsx

**Novos Estados Adicionados:**

- `heartbeatInterval`: Timer do setInterval
- `failedAttempts`: Contador de tentativas falhadas
- `connectionHealth`: Status da conexão ('healthy' | 'checking' | 'lost')
- `awaitingPong`: Flag para controlar se está aguardando resposta

**Novas Funções:**

- `parseMessage()`: Parser centralizado que identifica mensagens HB\_\*
- `startHeartbeat()`: Inicia o sistema de heartbeat
- `stopHeartbeat()`: Para o sistema e reseta contadores
- `sendHeartbeatPing()`: Envia comando HB_PING
- `handleHeartbeatResponse()`: Processa resposta HB_PONG
- `handleHeartbeatTimeout()`: Trata timeouts e conta falhas

**Modificações nas Funções Existentes:**

- `readFromSerial()`: Agora usa `parseMessage()` em vez de console.log
- `connectBluetooth()`: Callback do subscribe usa `parseMessage()`
- `connectCable()`: Chama `startHeartbeat()` após conexão
- `connectBluetooth()`: Chama `startHeartbeat()` após conexão
- `disconnect()`: Chama `stopHeartbeat()` antes de desconectar
- Provider: Exporta `connectionHealth` para componentes

### 2. main.py (Placa)

**Modificação na Função process_command:**

- Verifica se comando é `HB_PING`
- Se for, responde `HB_PONG` imediatamente
- Caso contrário, executa como comando Python normal

## Fluxo de Execução

### Cenário Normal (Conexão Saudável)

1. Usuário conecta via cabo ou Bluetooth
2. `startHeartbeat()` é chamado automaticamente
3. A cada 3 segundos:
   - Envia `HB_PING` para a placa
   - Define `connectionHealth = 'checking'`
   - Define `awaitingPong = true`
4. Placa responde `HB_PONG`
5. `parseMessage()` identifica resposta
6. `handleHeartbeatResponse()` é chamado:
   - `awaitingPong = false`
   - `failedAttempts = 0`
   - `connectionHealth = 'healthy'`

### Cenário de Falha (Perda de Conexão)

1. `HB_PING` é enviado
2. Após 3 segundos sem resposta:
   - `handleHeartbeatTimeout()` é executado
   - Verifica se ainda está `awaitingPong`
   - Incrementa `failedAttempts`
3. Se `failedAttempts >= 2`:
   - `connectionHealth = 'lost'`
   - `stopHeartbeat()` é chamado
   - Estados de conexão são limpos
   - Navega automaticamente para `/connection`

## Estados da Conexão

### connectionHealth

- **'healthy'**: Conexão funcionando normalmente
- **'checking'**: Enviou ping, aguardando resposta
- **'lost'**: Conexão perdida, redirecionando

## Compatibilidade

### Com Código Existente

- Sistema não interfere com comandos Python normais
- Parser processa apenas mensagens que começam com 'HB\_'
- Todas as funcionalidades existentes mantidas
- Redirecionamento automático para tela de reconexão

### Com Plataformas

- Funciona tanto com conexão via cabo (Serial API)
- Funciona com conexão via Bluetooth
- Compatible com HC-05 e outros módulos Bluetooth

## Detecção de Falhas

### Cenários Detectados

- Cabo USB desconectado
- Placa desligada
- Módulo Bluetooth fora de alcance
- Interferência na comunicação
- Falha na placa/firmware

### Tempo de Detecção

- **Mínimo**: 3 segundos (1 falha)
- **Máximo**: 6 segundos (2 falhas consecutivas)
- **Ação**: Redirecionamento automático

## Uso nos Componentes

### ConnectionStatus.tsx

O componente já existente automaticamente reflete o novo estado `connectionHealth` através de `isConnected`.

### Outros Componentes

Podem acessar `connectionHealth` via `useConnection()` se precisarem de feedback visual mais detalhado:

```tsx
const { connectionHealth } = useConnection();

// Usar connectionHealth para mostrar status específico
```

## Testing & Debugging

### Logs do Console

- "Recebido do Bluetooth/Serial": Todas as mensagens (apenas heartbeat agora)
- "Erro ao enviar heartbeat": Falhas na comunicação
- Estados internos podem ser inspecionados via React DevTools

### Simulação de Falhas

- Desconectar cabo USB durante uso
- Desligar placa durante uso
- Simular interferência Bluetooth

## Manutenção

### Ajustar Parâmetros

Para modificar configurações, edite as constantes em `ConnectionContext.tsx`:

- Intervalo do heartbeat: linha do `setInterval(3000)`
- Timeout: linha do `setTimeout(3000)`
- Tolerância a falhas: condição `>= 2` em `handleHeartbeatTimeout`

### Desabilitar Sistema

Para desabilitar temporariamente, comente as chamadas `startHeartbeat()` nas funções de conexão.
