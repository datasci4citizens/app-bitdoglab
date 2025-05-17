import { BluetoothSerial } from "@awesome-cordova-plugins/bluetooth-serial";

export class BluetoothController {
  /**
   * Envia um comando para o dispositivo Bluetooth e espera por uma resposta
   * @param command Comando a ser enviado
   * @param timeout Tempo máximo de espera em ms (padrão: 3000ms)
   * @returns Promise com a resposta do dispositivo
   */
  static async sendCommandWithResponse(
    command: string,
    timeout: number = 3000
  ): Promise<string> {
    // Limpa o buffer antes de enviar o comando
    await BluetoothSerial.clear();

    // Envia o comando
    await BluetoothSerial.write(command + "\r\n");

    return new Promise((resolve, reject) => {
      // Configura um timeout para a resposta
      const timer = setTimeout(() => {
        reject(
          new Error(`Timeout waiting for response to command: ${command}`)
        );
      }, timeout);

      // Escuta por uma resposta
      BluetoothSerial.subscribe("\n").subscribe(
        (data) => {
          clearTimeout(timer);
          resolve(data.trim());
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    });
  }

  /**
   * Verifica se o dispositivo Bluetooth está conectado e respondendo
   * @returns Promise<boolean> indicando se o dispositivo está respondendo
   */
  static async isDeviceResponding(): Promise<boolean> {
    try {
      const response = await this.sendCommandWithResponse("\x03\x03", 1000); // CTRL+C para interromper qualquer execução
      return true;
    } catch (error) {
      console.error("Error checking device response:", error);
      return false;
    }
  }

  /**
   * Envia um arquivo Python para o dispositivo via REPL (Read-Eval-Print Loop)
   * @param code Código Python a ser enviado
   * @returns Promise<boolean> indicando se o código foi enviado com sucesso
   */
  static async uploadPythonCode(code: string): Promise<boolean> {
    try {
      // Interrompe qualquer execução anterior com CTRL+C
      await this.sendCommandWithResponse("\x03\x03", 1000);

      // Entra no modo paste para enviar múltiplas linhas
      await this.sendCommandWithResponse("\x05", 1000); // CTRL+E

      // Divide o código em blocos para evitar overflow do buffer
      const codeLines = code.split("\n");
      const chunkSize = 20; // Enviar 20 linhas por vez

      for (let i = 0; i < codeLines.length; i += chunkSize) {
        const codeChunk = codeLines.slice(i, i + chunkSize).join("\n");
        await BluetoothSerial.write(codeChunk + "\n");

        // Pequeno delay para processamento
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Finaliza o modo paste
      await BluetoothSerial.write("\x04"); // CTRL+D

      // Espera confirmação
      await new Promise((resolve) => setTimeout(resolve, 500));

      return true;
    } catch (error) {
      console.error("Error uploading Python code:", error);
      return false;
    }
  }

  /**
   * Executa um comando Python específico na Raspberry Pi Pico
   * @param command Comando Python a ser executado
   * @returns Promise<string> com o resultado da execução
   */
  static async executePythonCommand(command: string): Promise<string> {
    try {
      // Interrompe qualquer execução anterior
      await this.sendCommandWithResponse("\x03", 1000); // CTRL+C

      // Envia o comando
      return await this.sendCommandWithResponse(command, 5000);
    } catch (error) {
      console.error("Error executing Python command:", error);
      throw error;
    }
  }

  /**
   * Reinicia o dispositivo enviando um comando soft reset
   */
  static async resetDevice(): Promise<void> {
    try {
      await this.sendCommandWithResponse("\x04", 2000); // CTRL+D para soft reset
    } catch (error) {
      console.error("Error resetting device:", error);
      throw error;
    }
  }
}
