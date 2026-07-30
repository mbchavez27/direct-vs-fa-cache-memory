import type { ReadPolicy } from '../cache/types';

export function getAccessTime(
	isHit: boolean,
	readPolicy: ReadPolicy,
	cacheAccessTimeNs: number,
	memoryAccessTimeNs: number
): number {
	if (isHit) {
		return cacheAccessTimeNs;
	}

	if (readPolicy === 'load-through') {
		return cacheAccessTimeNs + memoryAccessTimeNs;
	}

	return cacheAccessTimeNs + memoryAccessTimeNs + cacheAccessTimeNs;
}
