import { validateCacheBlockCount } from './validation';

export function generateSequential(cacheBlockCount: number): number[] {
	validateCacheBlockCount(cacheBlockCount);

	const ascending = Array.from({ length: 2 * cacheBlockCount }, (_, index) => index);
	return [...ascending, ...ascending];
}
