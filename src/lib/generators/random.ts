const UINT32_RANGE = 0x1_0000_0000;
const ACCESS_COUNT = 64;
const MEMORY_BLOCK_COUNT = 1024;

export class SeededRandom {
	private seed: number;

	constructor(seed: number = Date.now()) {
		if (!Number.isSafeInteger(seed)) {
			throw new TypeError('Random seed must be an integer.');
		}

		this.seed = seed >>> 0;
	}

	public next(): number {
		this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0;
		return this.seed / UINT32_RANGE;
	}
}

export function generateRandom(seed: number | null = null): number[] {
	const random = new SeededRandom(seed ?? Date.now());

	return Array.from({ length: ACCESS_COUNT }, () =>
		Math.floor(random.next() * MEMORY_BLOCK_COUNT)
	);
}
