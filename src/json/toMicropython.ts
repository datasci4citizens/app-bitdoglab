import { interpreterNeopixel } from "./interpreters/neoPixel"
import { interpreterLedRGB } from "./interpreters/ledRGB"
import { interpreterBuzzer } from "./interpreters/buzzer";
export { toMicropython }

function parse(json: string): [string, unknown] {
	const parsed: { string: unknown } = JSON.parse(json);
	const app: string = Object.keys(parsed)[0] as string;
	const instructions: unknown = Object.values(parsed)[0];
	return [app, instructions];
}

function micropython(app: string, instructions: unknown): string[] {
	switch (app) {
		case 'neopixel':
			return interpreterNeopixel(instructions as { pos: string, cor: string }[]);
		case 'ledRGB':
			return interpreterLedRGB(instructions as string);
		case 'buzzer':
			return interpreterBuzzer(instructions as { isPressed: boolean, frequency?: number, duration?: number });
		default: // isso será retirado após todos os apps serem feitos
			return ["em construcao..."]
	}
}

function toMicropython(json: string): string[] {
	const params: [string, unknown] = parse(json);
	return micropython(params[0], params[1]);
}
