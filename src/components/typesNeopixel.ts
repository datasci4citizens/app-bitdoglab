export type LEDState = {
  id: string;
  r: number;
  g: number;
  b: number;
  isSelected: boolean;
};

export type NeopixelState = {
  leds: LEDState[];
  currentColor: {
    r: number;
    g: number;
    b: number;
  };
};