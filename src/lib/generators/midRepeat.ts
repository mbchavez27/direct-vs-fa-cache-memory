export function generateMidRepeat(cacheBlockCount: number): number[] {
	validateCacheBlockCount(cacheBlockCount);

	const firstHalf = Array.from({ length: cacheBlockCount }, (_, index) => index);
	const fullRange = Array.from({ length: 2 * cacheBlockCount }, (_, index) => index);
	const reversedFirstHalf = [...firstHalf].reverse();
	const reversedFullRange = [...fullRange].reverse();

	return [
		...firstHalf,
		...fullRange,
		...fullRange,
		...reversedFirstHalf,
		...reversedFullRange,
		...reversedFullRange
	];
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
