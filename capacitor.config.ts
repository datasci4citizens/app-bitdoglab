import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "br.unicamp.ic.bitdoglab",
  appName: "bitdoglab",
  webDir: "dist",
  plugins: {
    // Permite o Serial API no Android
    CapacitorHttp: {
      enabled: true,
    },
    // Configurações para permissões
    Permissions: {
      permissions: [
        "bluetooth",
        "bluetooth_scan",
        "bluetooth_connect",
        "location",
      ],
    },
  },
  server: {
    androidScheme: "https",
  },
};

export default config;
