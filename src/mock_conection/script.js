let serialPort = null;
let reader = null;

document.getElementById("connectBtn").addEventListener("click", async () => {
  try {
    serialPort = await navigator.serial.requestPort();
    await serialPort.open({ baudRate: 115200 });
    document.getElementById("setWhiteBtn").disabled = false;
    console.log("Conectado!");

    // Configurar leitor para ver respostas do dispositivo
    readFromSerial();
  } catch (error) {
    console.error("Erro:", error);
  }
});

async function readFromSerial() {
  if (!serialPort) return;

  reader = serialPort.readable.getReader();
  const decoder = new TextDecoder();

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      console.log("Resposta:", decoder.decode(value));
    }
  } catch (error) {
    console.error("Erro de leitura:", error);
  } finally {
    reader.releaseLock();
  }
}

document.getElementById("setWhiteBtn").addEventListener("click", async () => {
  if (!serialPort) return;

  const writer = serialPort.writable.getWriter();
  const encoder = new TextEncoder();

  try {
    // Usar exatamente a sequência de inicialização do neopixel.js
    console.log("Enviando setup inicial...");

    // Reiniciar o dispositivo com Ctrl+C
    await writer.write(encoder.encode("\x03\r\n"));
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Enviar os comandos exatos do neopixel.js
    const setupCommands = [
      "from machine import Pin",
      "import neopixel",
      "np = neopixel.NeoPixel(Pin(7), 25)",
      "print('NeoPixel inicializado')",
    ];

    for (const cmd of setupCommands) {
      await writer.write(encoder.encode(cmd + "\r\n"));
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Primeiro, vamos acender apenas o primeiro LED com luz branca
    console.log("Tentando acender o primeiro LED...");

    const ledCommands = [
      // Definir o primeiro LED como branco
      "np[0] = (255, 255, 255)",
      "np.write()",
      "print('LED 0 definido como branco')",
    ];

    for (const cmd of ledCommands) {
      await writer.write(encoder.encode(cmd + "\r\n"));
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    console.log("Comandos para LED branco enviados!");
  } catch (error) {
    console.error("Erro:", error);
  } finally {
    writer.releaseLock();
  }
});
