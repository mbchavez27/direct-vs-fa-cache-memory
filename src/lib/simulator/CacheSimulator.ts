import type {
    CacheConfig,
    CacheOrganization,
    CacheSnapshot,
    SimulationResult,
    SimulationStatistics,
    TraceEntry,
} from "../cache/types";
import { DirectMappedCache } from "../cache/DirectMappedCache";
import { FullyAssociativeMRUCache } from "../cache/FullyAssociativeMRUCache";
import { calculateMetrics } from "../statistics/metrics";
import { validateAccessSequence } from "$lib/cache/validation";

export class CacheSimulator {
    private config: CacheConfig;
    private organization: CacheOrganization;

    // State variables
    private cacheMemory: DirectMappedCache | FullyAssociativeMRUCache;
    private simulationStatistics: SimulationStatistics;
    private sequence: number[];
    private currentStepIndex: number;
    private traceEntries: TraceEntry[];

    constructor(organization: CacheOrganization, config: CacheConfig) {
        this.organization = organization;
        this.config = config;

        if (this.organization === "Direct-Mapped") {
            this.cacheMemory = new DirectMappedCache(this.config);
        } else {
            // Full Associative (MRU)
            this.cacheMemory = new FullyAssociativeMRUCache(this.config);
        }

        this.simulationStatistics = {
            totalAccesses: 0,
            hits: 0,
            misses: 0,
            hitRate: 0,
            missRate: 0,
            averageMemoryAccessTimeNs: 0,
            totalMemoryAccessTimeNs: 0,
        };
        this.currentStepIndex = 0;
        this.traceEntries = [];
        this.sequence = [];
    }

    public loadSequence(sequence: number[]) {
        const errors = validateAccessSequence(sequence);
        if (errors.length > 0) {
            throw new Error(`Invalid sequence: ${errors.join(" ")}`);
        }

        this.sequence = sequence;
        this.reset();
    }

    public reset() {
        if (this.organization === "Direct-Mapped") {
            this.cacheMemory = new DirectMappedCache(this.config);
        } else {
            // Full Associative (MRU)
            this.cacheMemory = new FullyAssociativeMRUCache(this.config);
        }
        this.simulationStatistics = {
            totalAccesses: 0,
            hits: 0,
            misses: 0,
            hitRate: 0,
            missRate: 0,
            averageMemoryAccessTimeNs: 0,
            totalMemoryAccessTimeNs: 0,
        };
        this.currentStepIndex = 0;
        this.traceEntries = [];
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
        return this.currentStepIndex >= this.sequence.length;
    }

    public getCurrentStep(): number {
        return this.currentStepIndex;
    }

    public getCurrentSnapshot(): CacheSnapshot {
        const snapshot = this.cacheMemory.getSnapshot();
        return { lines: snapshot.lines };
    }

    public getTrace(): TraceEntry[] {
        return [...this.traceEntries];
    }

    public getStatistics(): SimulationStatistics {
        this.simulationStatistics = calculateMetrics(
            this.config,
            this.simulationStatistics.totalAccesses,
            this.simulationStatistics.hits,
            this.simulationStatistics.misses,
            this.simulationStatistics.totalMemoryAccessTimeNs,
        );
        return this.simulationStatistics;
    }

    public getSimulationResult(): SimulationResult {
        return {
            organization: this.organization,
            config: this.config,
            trace: this.getTrace(),
            statistics: this.getStatistics(),
            finalSnapshot: this.getCurrentSnapshot(),
        };
    }
}
