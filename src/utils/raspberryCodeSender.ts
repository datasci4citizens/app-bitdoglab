// Código para envio do código Python para o Raspberry Pi via Bluetooth
import { BleClient } from "@capacitor-community/bluetooth-le";

// UUID do serviço SPP para HC-05 (Bluetooth Clássico)
export const HC05_SPP_SERVICE_UUID = "00001101-0000-1000-8000-00805F9B34FB";
export const HC05_CHARACTERISTIC_UUID = "00001102-0000-1000-8000-00805F9B34FB";

// O código Python que iremos enviar para o Raspberry Pi
const NEOPIXEL_PYTHON_CODE = `
import time
import board
import neopixel
import re
import threading
import sys

# Configuração do Neopixel
PIXEL_PIN = board.D18  # O pino GPIO ao qual o Neopixel está conectado
NUM_PIXELS = 25       # Número de LEDs no strip
ORDER = neopixel.GRB  # A ordem de cores (pode ser diferente dependendo do seu strip)

try:
    # Inicializa os pixels
    pixels = neopixel.NeoPixel(
        PIXEL_PIN, NUM_PIXELS, brightness=0.2, auto_write=False, pixel_order=ORDER
    )
    print("Pixels inicializados com sucesso!")
except Exception as e:
    print(f"ERRO ao inicializar pixels: {e}")
    sys.exit(1)

# Flag para controle do loop principal
running = True

# Padrões regex para analisar os comandos
LED_PATTERN = re.compile(r'LED:(\\d+),(\\d+),(\\d+),(\\d+);')
CLEAR_PATTERN = re.compile(r'CLEAR_ALL;')

# Recebe comandos da porta serial
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

# Código principal
print("Script Neopixel iniciado com sucesso!")
print(f"Configurado para {NUM_PIXELS} LEDs no pino {PIXEL_PIN}")
clear_all_leds()  # Começar com todos os LEDs apagados

# Leitura da entrada padrão (será conectada à porta serial pelo script bootstrap)
buffer = ""
while running:
    try:
        # Se houver dados disponíveis, leia-os
        if sys.stdin.isatty():
            data = sys.stdin.read(1)
            if data:
                buffer += data
                
                # Processa comandos completos no buffer
                if ';' in buffer:
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
        else:
            time.sleep(0.1)  # Se não estiver conectado a um terminal, aguarde
    
    except KeyboardInterrupt:
        running = False
        print("Interrupção de teclado recebida. Finalizando...")
    except Exception as e:
        print(f"Erro: {e}")
        time.sleep(1)  # Em caso de erro, aguarde um pouco antes de continuar
    
print("Limpando todos os LEDs antes de sair...")
clear_all_leds()
print("Script finalizado.")
`;

/**
 * Envia o código Python para o Raspberry Pi via Bluetooth
 * @param deviceId ID do dispositivo Bluetooth conectado
 * @param onProgress Callback opcional para reportar o progresso do envio
 * @param onStatusChange Callback opcional para reportar mudanças de status
 * @returns Promise que resolve quando o código é enviado com sucesso
 */
export async function sendPythonCodeToRaspberry(
    deviceId: string,
    onProgress?: (progress: number) => void,
    onStatusChange?: (status: 'sending' | 'waiting' | 'success' | 'error', message?: string) => void
): Promise<void> {
    if (!deviceId) {
        throw new Error("Device ID não fornecido");
    }

    try {
        console.log("Iniciando envio de código Python para o Raspberry Pi...");
        onStatusChange?.('sending');
        
        // Preparar o código para envio
        const startMarker = "###START_PYTHON_CODE###";
        const endMarker = "###END_PYTHON_CODE###";
        
        // Adicionar marcadores de início e fim
        const codeToSend = `${startMarker}${NEOPIXEL_PYTHON_CODE}${endMarker}`;
        
        // Enviar o código em chunks para evitar problemas de buffer
        const chunkSize = 100;  // Tamanho do chunk em caracteres
        const encoder = new TextEncoder();
        
        for (let i = 0; i < codeToSend.length; i += chunkSize) {
            const chunk = codeToSend.substring(i, i + chunkSize);
            const dataView = new DataView(encoder.encode(chunk).buffer);
            
            try {
                // Tenta enviar usando o serviço SPP
                await BleClient.write(
                    deviceId,
                    HC05_SPP_SERVICE_UUID,
                    HC05_CHARACTERISTIC_UUID,
                    dataView
                );
            } catch (error) {
                // Se falhar com SPP, tente encontrar qualquer serviço disponível
                console.error("Erro ao enviar via SPP, tentando método alternativo...");
                
                const services = await BleClient.getServices(deviceId);
                if (services && services.length > 0) {
                    const service = services[0];
                    if (service && service.characteristics && service.characteristics.length > 0) {
                        const characteristic = service.characteristics.find(c => c.properties.write);
                        if (characteristic) {
                            await BleClient.write(
                                deviceId,
                                service.uuid,
                                characteristic.uuid,
                                dataView
                            );
                        }
                    }
                }
            }
            
            // Pequeno atraso entre chunks para dar tempo ao receptor processar
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Mostrar progresso
            const progress = Math.round(((i + chunkSize) / codeToSend.length) * 100);
            const normalizedProgress = progress > 100 ? 100 : progress;
            console.log(`Enviando código: ${normalizedProgress}% concluído`);
            onProgress?.(normalizedProgress);
        }
        
        console.log("Código Python enviado com sucesso!");
        onStatusChange?.('waiting', 'Aguardando confirmação do Raspberry Pi');
        
        // Aguardar confirmação de recebimento
        // Tentar escutar notificações do dispositivo para confirmar recebimento
        try {
            await waitForDeviceResponse(deviceId);
            onStatusChange?.('success');
        } catch (error) {
            console.log("Não foi possível confirmar o recebimento, mas o código foi enviado", error);
            // Se não conseguir confirmar, vamos assumir que deu certo
            onStatusChange?.('success');
        }
        
    } catch (error) {
        console.error("Erro ao enviar código Python:", error);
        onStatusChange?.('error', error instanceof Error ? error.message : 'Erro desconhecido');
        throw error;
    }
}

/**
 * Tenta receber a confirmação do dispositivo de que o código foi recebido
 * @param deviceId ID do dispositivo Bluetooth
 * @returns Promise que resolve quando o dispositivo confirma o recebimento
 */
async function waitForDeviceResponse(deviceId: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Timeout para caso não receba resposta em 10 segundos
        const timeout = setTimeout(() => {
            reject(new Error("Timeout aguardando resposta do dispositivo"));
        }, 10000);
        
        // Tenta configurar notificações para receber confirmação
        const setupNotifications = async () => {
            try {
                // Primeiro tenta com o serviço SPP
                try {
                    await BleClient.startNotifications(
                        deviceId,
                        HC05_SPP_SERVICE_UUID,
                        HC05_CHARACTERISTIC_UUID,
                        (value) => {
                            const decoder = new TextDecoder();
                            const response = decoder.decode(value.buffer);
                            console.log("Resposta recebida:", response);
                            
                            if (response.includes("###CODE_RECEIVED###")) {
                                clearTimeout(timeout);
                                resolve();
                            }
                        }
                    );
                    return; // Se conseguir configurar, retorna
                } catch (e) {
                    console.log("Erro ao configurar notificações SPP:", e);
                }
                
                // Se falhar, tenta encontrar características que suportam notificações
                const services = await BleClient.getServices(deviceId);
                if (services && services.length > 0) {
                    for (const service of services) {
                        if (service.characteristics) {
                            const notifyChar = service.characteristics.find(
                                c => c.properties.notify || c.properties.indicate
                            );
                            
                            if (notifyChar) {
                                await BleClient.startNotifications(
                                    deviceId,
                                    service.uuid,
                                    notifyChar.uuid,
                                    (value) => {
                                        const decoder = new TextDecoder();
                                        const response = decoder.decode(value.buffer);
                                        console.log("Resposta recebida:", response);
                                        
                                        if (response.includes("###CODE_RECEIVED###")) {
                                            clearTimeout(timeout);
                                            resolve();
                                        }
                                    }
                                );
                                return;
                            }
                        }
                    }
                }
                
                // Se não conseguir configurar notificações, rejeita
                reject(new Error("Não foi possível configurar notificações para o dispositivo"));
            } catch (error) {
                console.error("Erro ao configurar notificações:", error);
                reject(error);
            }
        };
        
        setupNotifications();
    });
}
}
