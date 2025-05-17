import { toMicropython } from "../json/toMicropython";
import { ConnectionType } from "../contexts/ConnectionContext";
import { BluetoothService } from "./bluetoothService";
import type { NeopixelLed } from "./bluetoothService";

export interface NeopixelData {
  pos: string;
  cor: string;
}

export class NeopixelController {
  private sendCommand: (command: string) => Promise<void>;
  private connectionType: ConnectionType;
  private deviceId: string | null;

  constructor(
    sendCommand: (command: string) => Promise<void>,
    connectionType: ConnectionType = ConnectionType.SERIAL,
    deviceId: string | null = null
  ) {
    this.sendCommand = sendCommand;
    this.connectionType = connectionType;
    this.deviceId = deviceId;
  }

  async setupNeopixel() {
    if (this.connectionType === ConnectionType.BLUETOOTH) {
      // Para Bluetooth HC-05, a configuração é feita no script do Raspberry Pi
      return;
    }

    const setupCommands = [
      "\x03\r\n", // Ctrl+C para interromper qualquer execução atual
      "from machine import Pin",
      "import neopixel",
      "np = neopixel.NeoPixel(Pin(7), 25)",
      "print('NeoPixel inicializado')",
    ];

    for (const cmd of setupCommands) {
      await this.sendCommand(cmd);
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  // Parse RGB color string to individual components
  private parseRgbColor(rgbStr: string): { r: number; g: number; b: number } {
    // Parse "rgb(r, g, b)" format
    const match = rgbStr.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
    if (match && match[1] && match[2] && match[3]) {
      return {
        r: parseInt(match[1], 10),
        g: parseInt(match[2], 10),
        b: parseInt(match[3], 10),
      };
    }

    // Default to black if parsing fails
    return { r: 0, g: 0, b: 0 };
  }

  async sendLEDConfigurations(leds: NodeListOf<Element>) {
    if (this.connectionType === ConnectionType.BLUETOOTH) {
      return this.sendLEDConfigurationsBluetooth(leds);
    } else {
      return this.sendLEDConfigurationsSerial(leds);
    }
  }

  async sendLEDConfigurationsSerial(leds: NodeListOf<Element>) {
    const dados: NeopixelData[] = [];

    leds.forEach((svg) => {
      const pos = svg.getAttribute("id");
      const ledRect = svg.querySelector("#led");

      if (ledRect && ledRect.getAttribute("text") == "on") {
        const cor = ledRect.getAttribute("fill");
        if (pos && cor) {
          dados.push({ pos, cor });
        }
      }
    });

    const json = JSON.stringify({ neopixel: dados }, null, 3);

    try {
      // Setup inicial
      await this.setupNeopixel();

      // Enviar comandos dos LEDs
      const micropythonCommands = toMicropython(json);
      for (const command of micropythonCommands) {
        await this.sendCommand(command);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      console.log("Comandos enviados com sucesso via Serial!");
    } catch (error) {
      console.error("Erro ao enviar comandos via Serial:", error);
      throw error;
    }
  }

  async sendLEDConfigurationsBluetooth(leds: NodeListOf<Element>) {
    if (!this.deviceId) {
      throw new Error("Nenhum dispositivo Bluetooth fornecido");
    }

    try {
      const ledData: NeopixelLed[] = [];

      leds.forEach((svg) => {
        const pos = svg.getAttribute("id");
        const ledRect = svg.querySelector("#led");

        if (ledRect && ledRect.getAttribute("text") == "on" && pos) {
          const color = ledRect.getAttribute("fill") || "rgb(0,0,0)";
          const { r, g, b } = this.parseRgbColor(color);

          ledData.push({
            position: parseInt(pos, 10),
            red: r,
            green: g,
            blue: b,
          });
        }
      });

      // Primeiro limpa todos os LEDs
      await BluetoothService.clearAllLeds(this.deviceId);

      // Se não houver LEDs acesos, terminamos aqui
      if (ledData.length === 0) {
        console.log("Nenhum LED ativo para enviar");
        return;
      }

      // Ordena os LEDs por posição para garantir que sejam enviados em ordem
      const sortedLeds = ledData.sort((a, b) => a.position - b.position);

      // Envia as atualizações em pequenos lotes para evitar sobrecarga do buffer
      const BATCH_SIZE = 5; // Enviar 5 LEDs por vez

      for (let i = 0; i < sortedLeds.length; i += BATCH_SIZE) {
        const batch = sortedLeds.slice(i, i + BATCH_SIZE);
        await BluetoothService.sendLedData(this.deviceId, batch);

        // Pequeno atraso entre lotes para garantir que todos os comandos sejam processados
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      console.log(
        `Dados de ${ledData.length} LEDs enviados com sucesso via Bluetooth HC-05!`
      );
    } catch (error) {
      console.error("Erro ao enviar dados dos LEDs via Bluetooth:", error);
      throw error;
    }
  }
}
