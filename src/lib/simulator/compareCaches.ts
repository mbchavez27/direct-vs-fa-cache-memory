import type { CacheConfig, ComparisonResult } from "../cache/types";
import { CacheSimulator } from "./CacheSimulator";

// Runs both the Direct-mapped & Fully Associative cache simulators on the same sequence
export function compareCaches(
    config: CacheConfig,
    sequence: number[],
): ComparisonResult {
    const directSimulator = new CacheSimulator("Direct-Mapped", config);
    directSimulator.loadSequence(sequence);
    directSimulator.runToEnd();

    const fsaSimulator = new CacheSimulator("Fully-Associative-MRU", config);
    fsaSimulator.loadSequence(sequence);
    fsaSimulator.runToEnd();

    const comparisonResult: ComparisonResult = {
        directMapped: directSimulator.getSimulationResult(),
        fullyAssociative: fsaSimulator.getSimulationResult(),
    };

    return comparisonResult;
}
