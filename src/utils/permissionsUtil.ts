import { BluetoothSerial } from "@awesome-cordova-plugins/bluetooth-serial";

/**
 * Utilitário para verificar e solicitar permissões relacionadas ao Bluetooth
 */
export class PermissionsUtil {
  /**
   * Verifica se o Bluetooth está habilitado e pede para ativar caso não esteja
   * @returns Promise<boolean> indicando se o Bluetooth está habilitado
   */
  static async checkBluetoothEnabled(): Promise<boolean> {
    try {
      const isEnabled = await BluetoothSerial.isEnabled();
      return true;
    } catch (error) {
      console.log("Bluetooth não está habilitado, tentando habilitar");
      try {
        await BluetoothSerial.enable();
        return true;
      } catch (enableError) {
        console.error("Não foi possível habilitar o Bluetooth", enableError);
        return false;
      }
    }
  }

  /**
   * Verifica se o Bluetooth está disponível no dispositivo
   * @returns Promise<boolean> indicando se o Bluetooth está disponível
   */
  static async isBluetoothAvailable(): Promise<boolean> {
    try {
      await BluetoothSerial.isEnabled();
      return true;
    } catch (error) {
      try {
        // Tenta habilitar para ver se o dispositivo tem Bluetooth
        await BluetoothSerial.enable();
        return true;
      } catch (enableError) {
        // Se não conseguiu habilitar, verifica se foi por falta de hardware
        if (
          typeof enableError === "string" &&
          enableError.includes("bluetooth_unsupported")
        ) {
          return false;
        }
        // Em outros casos, pode ser apenas que o usuário recusou a permissão
        return true;
      }
    }
  }

  /**
   * Verifica se todas as permissões necessárias para o Bluetooth estão concedidas
   * Esta função é específica para Android e iOS
   */
  static async checkAllBluetoothPermissions(): Promise<boolean> {
    // Aqui você usaria uma biblioteca como @capacitor/permissions para verificar
    // as permissões no iOS e Android. Como simplificação, estamos apenas verificando
    // se o Bluetooth está disponível e pode ser ativado.

    return await this.isBluetoothAvailable();
  }
}
