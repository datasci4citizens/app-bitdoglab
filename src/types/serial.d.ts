interface SerialPort {
  readable: ReadableStream;
  writable: WritableStream;
  open: (options: SerialOptions) => Promise<void>;
  close: () => Promise<void>;
}

interface SerialOptions {
  baudRate: number;
  dataBits?: number;
  stopBits?: number;
  parity?: string;
  bufferSize?: number;
  flowControl?: string;
}

interface Navigator {
  serial: {
    requestPort: () => Promise<SerialPort>;
    getPorts: () => Promise<SerialPort[]>;
  };
}
