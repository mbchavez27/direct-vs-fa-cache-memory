import type { SimulationStatistics } from "../cache/types";

export function calculateMetrics(
    totalAccesses: number,
    hits: number,
    misses: number,
    cacheAccessTimeNs: number,
    memoryAccessTimeNs: number,
    totalMemoryAccessTimeNs: number,
): SimulationStatistics {
    // TODO: Calculate hitRate, missRate, and averageMemoryAccessTimeNs

    let hitRate = 0;
    let missRate = 0;
    // Prevent undefined results
    if (totalAccesses !== 0) {
        hitRate = hits / totalAccesses;
        missRate = misses / totalAccesses;
    }

    // T_avg = hC + (1-h)*M
    let averageMemoryAccessTimeNs =
        hitRate * cacheAccessTimeNs + missRate * memoryAccessTimeNs;

    return {
        totalAccesses,
        hits,
        misses,
        hitRate,
        missRate,
        averageMemoryAccessTimeNs,
        totalMemoryAccessTimeNs,
    };
}
