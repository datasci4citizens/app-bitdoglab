import { BleClient } from "@capacitor-community/bluetooth-le";

// UUID do serviço SPP para HC-05 (Bluetooth Clássico)
export const HC05_SPP_SERVICE_UUID = "00001101-0000-1000-8000-00805F9B34FB";
// HC-05 não utiliza características separadas como BLE, mas vamos definir uma
// para manter a consistência com a API BLE
export const HC05_CHARACTERISTIC_UUID = "00001102-0000-1000-8000-00805F9B34FB";

export interface NeopixelLed {
  position: number;
  red: number;
  green: number;
  blue: number;
}

export class BluetoothService {
  /**
   * Send LED data to the device via Bluetooth
   * @param deviceId The ID of the connected Bluetooth device
   * @param leds Array of LED data to send
   */
  public static async sendLedData(
    deviceId: string,
    leds: NeopixelLed[]
  ): Promise<void> {
    try {
      if (!deviceId) {
        throw new Error("No device connected");
      }

      // Para HC-05, vamos enviar um comando formatado como string
      // Formato: "LED:posição,r,g,b;"
      for (const led of leds) {
        // Convertemos para um formato que o Raspberry Pi pode processar facilmente
        const commandString = `LED:${led.position},${led.red},${led.green},${led.blue};`;
        const encoder = new TextEncoder();
        const data = encoder.encode(commandString);

        // Convertemos para DataView para compatibilidade com a API BleClient
        const dataView = new DataView(data.buffer);

        try {
          // Tentamos enviar usando o serviço SPP
          await BleClient.write(
            deviceId,
            HC05_SPP_SERVICE_UUID,
            HC05_CHARACTERISTIC_UUID,
            dataView
          );
        } catch (error) {
          console.log("Erro no serviço SPP, tentando método alternativo...");

          // Se falhar, tentamos enviar para qualquer serviço disponível
          // Isso é necessário porque o HC-05 pode não anunciar o serviço SPP corretamente
          const services = await BleClient.getServices(deviceId);
          if (services && services.length > 0) {
            const service = services[0];
            if (
              service &&
              service.characteristics &&
              service.characteristics.length > 0
            ) {
              const characteristic = service.characteristics.find(
                (c) => c.properties.write
              );
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

        // Pequeno atraso para evitar sobrecarga
        await new Promise((resolve) => setTimeout(resolve, 20));
      }

      console.log(`Enviados ${leds.length} atualizações de LED via Bluetooth`);
    } catch (error) {
      console.error("Falha ao enviar dados de LED via Bluetooth:", error);
      throw error;
    }
  }

  /**
   * Clear all LEDs (set them to black)
   * @param deviceId The ID of the connected Bluetooth device
   */
  public static async clearAllLeds(deviceId: string): Promise<void> {
    try {
      if (!deviceId) {
        throw new Error("No device connected");
      }

      const commandString = "CLEAR_ALL;";
      const encoder = new TextEncoder();
      const data = encoder.encode(commandString);
      const dataView = new DataView(data.buffer);

      try {
        // Tentamos enviar usando o serviço SPP
        await BleClient.write(
          deviceId,
          HC05_SPP_SERVICE_UUID,
          HC05_CHARACTERISTIC_UUID,
          dataView
        );
      } catch (error) {
        console.log(
          "Erro no serviço SPP para limpar LEDs, tentando método alternativo..."
        );

        // Se falhar, tentamos enviar para qualquer serviço disponível
        const services = await BleClient.getServices(deviceId);
        if (services && services.length > 0) {
          const service = services[0];
          if (
            service &&
            service.characteristics &&
            service.characteristics.length > 0
          ) {
            const characteristic = service.characteristics.find(
              (c) => c.properties.write
            );
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

      console.log("Todos os LEDs foram limpos via Bluetooth");
    } catch (error) {
      console.error("Falha ao limpar LEDs via Bluetooth:", error);
      throw error;
    }
  }
}
