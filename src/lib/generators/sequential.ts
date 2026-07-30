export function generateSequential(cacheBlockCount: number): number[] {
	validateCacheBlockCount(cacheBlockCount);

	const ascending = Array.from({ length: 2 * cacheBlockCount }, (_, index) => index);
	return [...ascending, ...ascending];
}

function validateCacheBlockCount(cacheBlockCount: number): void {
	if (
		!Number.isSafeInteger(cacheBlockCount) ||
		cacheBlockCount < 4 ||
		cacheBlockCount > 512 ||
		Math.log2(cacheBlockCount) % 1 !== 0
	) {
		throw new RangeError('Cache block count must be a power-of-two integer between 4 and 512.');
	}
}
