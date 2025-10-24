export { interpreterLedRGB }

function interpreterLedRGB(instructions: string): string[] {
	const res: string[] = [];
	const rgbMatch: string[] = instructions.match(/\d+/g) as string[];
	const corR: number = parseInt(rgbMatch.at(0) as string) << 8;
	const corG: number = parseInt(rgbMatch.at(1) as string) << 8;
	const corB: number = parseInt(rgbMatch.at(2) as string) << 8;
	res.push(`pwmR.duty_u16(${corR})`);
	res.push(`pwmG.duty_u16(${corG})`);
	res.push(`pwmB.duty_u16(${corB})`);
	return res;
}
