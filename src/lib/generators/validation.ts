export function validateCacheBlockCount(cacheBlockCount: number): void {
	if (
		!Number.isSafeInteger(cacheBlockCount) ||
		cacheBlockCount < 4 ||
		Math.log2(cacheBlockCount) % 1 !== 0
	) {
		throw new RangeError('Cache block count must be a power-of-two integer of at least 4.');
	}
}
