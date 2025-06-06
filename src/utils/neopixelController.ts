import { toMicropython } from "../json/toMicropython";

export interface NeopixelData {
  pos: string;
  cor: string;
}

export class NeopixelController {
  private sendCommand: (command: string) => Promise<void>;
  constructor(sendCommand: (command: string) => Promise<void>) {
    this.sendCommand = sendCommand;
  }

  async setupNeopixel() {
    const setupCommands = [
      "\x03\r\n", // Creio que isso  deva rodar assim que iniciarmos a placa
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

  async sendLEDConfigurations(leds: NodeListOf<Element>) {
    const dados: NeopixelData[] = [];

    leds.forEach((svg) => {
      const pos = svg.getAttribute("id");
      const ledRect = svg.querySelector("#led");

      if (ledRect && ledRect.getAttribute("text") == "on") {
        const cor = ledRect.getAttribute("fill");
        dados.push({ pos: pos!, cor: cor! });
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

      console.log("Comandos enviados com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar comandos:", error);
      throw error;
    }
  }
}
