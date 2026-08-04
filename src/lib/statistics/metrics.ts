import type {
    CacheConfig,
    ReadPolicy,
    SimulationStatistics,
} from "../cache/types";
import { getAccessTime } from "./timing";

export function calculateMetrics(
    config: CacheConfig,
    totalAccesses: number,
    hits: number,
    misses: number,
    totalMemoryAccessTimeNs: number,
): SimulationStatistics {
    let hitRate = 0;
    let missRate = 0;
    // Prevent undefined results
    if (totalAccesses !== 0) {
        hitRate = hits / totalAccesses;
        missRate = misses / totalAccesses;
    }

    let missPenalty = getAccessTime(
        false,
        config.readPolicy,
        config.cacheAccessTimeNs,
        config.memoryAccessTimeNs,
    );
    // T_avg = hC + (1-h)*M
    let averageMemoryAccessTimeNs =
        hitRate * config.cacheAccessTimeNs + missRate * missPenalty;

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
