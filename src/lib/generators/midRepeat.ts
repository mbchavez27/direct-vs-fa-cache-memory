import { validateCacheBlockCount } from './validation';

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
