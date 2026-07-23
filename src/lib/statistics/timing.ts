import type { ReadPolicy } from '../cache/types';

export function getAccessTime(
    isHit: boolean,
    readPolicy: ReadPolicy,
    cacheAccessTimeNs: number,
    memoryAccessTimeNs: number
): number {
    // TODO: Implement timing calculation
    // Hit: cacheAccessTimeNs
    // Load-through Miss: cacheAccessTimeNs + memoryAccessTimeNs
    // Non-load-through Miss: cacheAccessTimeNs + memoryAccessTimeNs + cacheAccessTimeNs
    return 0;
}
