import { toMicropython } from "../product/toMicropython";

export class LedRGBController {
	private sendCommand: (command: string) => Promise<void>;
	constructor(sendCommand: (command: string) => Promise<void>) {
		this.sendCommand = sendCommand;
	}

	async setupLedRGB() {
		const setupCommands = [
			"\x03\r\n",
			"from machine import Pin, PWM",
			"pinR = Pin(13)",
			"pinG = Pin(11)",
			"pinB = Pin(12)",
			"pwmR = PWM(pinR)",
			"pwmG = PWM(pinG)",
			"pwmB = PWM(pinB)",
			"pwmR = PWM(pinR)",
			"pwmG = PWM(pinG)",
			"pwmB = PWM(pinB)",
			"pwmR.duty_u16(0)",
			"pwmG.duty_u16(0)",
			"pwmB.duty_u16(0)",
			"print('LedRGB inicializado')",
		];

		for (const cmd of setupCommands) {
			await this.sendCommand(cmd);
			await new Promise((resolve) => setTimeout(resolve, 100));
		}
	}

	async sendLEDConfigurations(json: string) {
		try {
			// Setup inicial
			await this.setupLedRGB();

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
