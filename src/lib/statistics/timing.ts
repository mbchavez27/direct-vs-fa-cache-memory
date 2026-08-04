import type { ReadPolicy } from "../cache/types";

export function getAccessTime(
    isHit: boolean,
    readPolicy: ReadPolicy,
    cacheAccessTimeNs: number,
    memoryAccessTimeNs: number,
    blockSize: number,
): number {
    if (isHit) {
        return cacheAccessTimeNs;
    }

    // Miss penalty
    if (readPolicy === "load-through") {
        return cacheAccessTimeNs + memoryAccessTimeNs;
    }
    // Non-load-through
    return (
        cacheAccessTimeNs + memoryAccessTimeNs * blockSize + cacheAccessTimeNs
    );
}
