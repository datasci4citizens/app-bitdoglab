export { interpreterNeopixel }

function interpreterNeopixel(instructions: { pos: string, cor: string }[]): string[] {
	const res: string[] = [];
	instructions.forEach(dict => {
		const rgbMatch: string[] = dict.cor.match(/\d+/g) as string[];
		const rgb: string = rgbMatch.join(', ');
		const pos: number = mapNumbers(parseInt(dict.pos));
		res.push(`np[` + pos + `] = (${rgb})`);
	});
	res.push(`np.write()`);
	return res;
}

// This is needed on the BitDogLab version 7,
//  probably won't be used in the future or in other hardware
function mapNumbers(num: number): number {
	const swapMap: Record<number, number> = {
		0: 4, 4: 0,
		1: 3, 3: 1,
		10: 14, 14: 10,
		11: 13, 13: 11,
		20: 24, 24: 20,
		21: 23, 23: 21
	};

	return swapMap[num] ?? num;
}
