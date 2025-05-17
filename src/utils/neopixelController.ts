// filepath: /Users/caio.prado/Downloads/app-bitdoglab/src/utils/neopixelController.ts
import { toMicropython } from "../json/toMicropython";
import { BluetoothController } from "./bluetoothController";

export interface NeopixelData {
  pos: string;
  cor: string;
}

export class NeopixelController {
  private sendCommand: (command: string) => Promise<void>;
  private connectionType: 'cable' | 'bluetooth' | null;

  constructor(
    sendCommand: (command: string) => Promise<void>,
    connectionType: 'cable' | 'bluetooth' | null = null
  ) {
    this.sendCommand = sendCommand;
    this.connectionType = connectionType;
  }

  async setupNeopixel() {
    const setupCommands = [
      "\x03\r\n", // Interrompe qualquer execução atual
      "from machine import Pin",
      "import neopixel",
      "np = neopixel.NeoPixel(Pin(7), 25)",
      "print('NeoPixel inicializado')",
    ];

    if (this.connectionType === 'bluetooth') {
      // Para conexão Bluetooth, usamos o BluetoothController que gerencia o REPL melhor
      try {
        // Vamos enviar todos os comandos como um único bloco de código
        const setupCode = setupCommands.slice(1).join('\n');
        await BluetoothController.uploadPythonCode(setupCode);
      } catch (error) {
        console.error("Erro ao configurar NeoPixel via Bluetooth:", error);
        throw error;
      }
    } else {
      // Comportamento original para conexão via cabo
      for (const cmd of setupCommands) {
        await this.sendCommand(cmd);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }
  }

  async sendLEDConfigurations(leds: NodeListOf<Element>) {
    const dados: NeopixelData[] = [];

    leds.forEach((svg) => {
      const pos = svg.getAttribute("id");
      const ledRect = svg.querySelector("#led");
      
      if (ledRect && ledRect.getAttribute("text") === "on") {
        const cor = ledRect.getAttribute("fill");
        dados.push({ pos: pos!, cor: cor! });
      }
    });

    const json = JSON.stringify({ neopixel: dados }, null, 3);

    try {
      // Setup inicial
      await this.setupNeopixel();

      // Obter comandos de micropython a serem enviados
      const micropythonCommands = toMicropython(json);

      if (this.connectionType === 'bluetooth') {
        // Para Bluetooth, enviamos tudo de uma vez para evitar fragmentação
        const commandsAsCode = micropythonCommands.join('\n');
        await BluetoothController.uploadPythonCode(commandsAsCode);
      } else {
        // Comportamento original para conexão via cabo
        for (const command of micropythonCommands) {
          await this.sendCommand(command);
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }

      console.log("Comandos enviados com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar comandos:", error);
      throw error;
    }
  }
}
