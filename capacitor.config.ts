import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.unicamp.ic.bitdoglab",
  appName: "bitdoglab",
  webDir: "dist",
  plugins: {
    BluetoothLe: {
      displayStrings: {
        scanning: "Procurando...",
        cancel: "Cancelar",
        availableDevices: "Dispositivos disponíveis",
        noDeviceFound: "Nenhum dispositivo encontrado",
      },
    },
  },
};

export default config;
