import type { CacheConfig, CacheOrganization, CacheSnapshot, SimulationResult, SimulationStatistics, TraceEntry } from '../cache/types';
import { DirectMappedCache } from '../cache/DirectMappedCache';
import { FullyAssociativeMRUCache } from '../cache/FullyAssociativeMRUCache';
import { calculateMetrics } from '../statistics/metrics';

export class CacheSimulator {
    private config: CacheConfig;
    private organization: CacheOrganization;
    
    // TODO: Define private state variables (cache instance, sequence, trace, metrics)

    constructor(organization: CacheOrganization, config: CacheConfig) {
        this.organization = organization;
        this.config = config;
        this.reset();
    }

    public loadSequence(sequence: number[]) {
        // TODO: Load sequence and reset state
    }

    public reset() {
        // TODO: Initialize/Reset cache instance based on organization and config
        // TODO: Reset all metrics and sequence position
    }

    public step(): boolean {
        // TODO: Process one memory access step
        // - Get current memory block
        // - Access cache
        // - Update metrics
        // - Push TraceEntry to trace
        // - Increment step index
        return false;
    }

    public runToEnd() {
        // TODO: Step until sequence is finished
    }

    public isFinished(): boolean {
        // TODO: Return true if all sequence elements are processed
        return true;
    }

    public getCurrentStep(): number {
        // TODO: Return current step index
        return 0;
    }

    public getCurrentSnapshot(): CacheSnapshot {
        // TODO: Return current snapshot from cache
        return { lines: [] };
    }

    public getTrace(): TraceEntry[] {
        // TODO: Return full trace
        return [];
    }

    public getStatistics(): SimulationStatistics {
        // TODO: Return calculateMetrics result
        return calculateMetrics(0, 0, 0, 0);
    }
    
    public getSimulationResult(): SimulationResult {
        return {
            organization: this.organization,
            config: this.config,
            trace: this.getTrace(),
            statistics: this.getStatistics(),
            finalSnapshot: this.getCurrentSnapshot()
        };
    }
}
