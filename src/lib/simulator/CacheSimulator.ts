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
    // Cache snapshots and stats at each step, enabling undo via stepBack()
    private snapshotHistory: CacheSnapshot[];
    private statsHistory: SimulationStatistics[];

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
        // Seed history with the initial empty-cache state
        this.snapshotHistory = [this.cacheMemory.getSnapshot()];
        this.statsHistory = [{ ...this.simulationStatistics }];
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
        // Reset history to initial empty state
        this.snapshotHistory = [this.cacheMemory.getSnapshot()];
        this.statsHistory = [{ ...this.simulationStatistics }];
    }

    public step(): boolean {
        if (this.sequence.length === 0) {
            throw new Error("No sequence loaded.");
        }

        if (this.isFinished()) {
            return false;
        }

        // Access cache memory block
        const memoryBlock = this.sequence[this.currentStepIndex];
        const accessResult = this.cacheMemory.access(memoryBlock);
        const accessTime = accessResult.accessTimeNs;

        // Update metrics
        this.simulationStatistics.totalAccesses++;
        if (accessResult.isHit) {
            this.simulationStatistics.hits++;
        } else {
            this.simulationStatistics.misses++;
        }
        this.simulationStatistics.totalMemoryAccessTimeNs += accessTime;

        // Trace entry
        const traceEntry: TraceEntry = {
            step: accessResult.step,
            organization: this.organization,
            memoryBlock: memoryBlock,
            cacheLineIndex: accessResult.cacheLineIndex,
            tag: accessResult.tag,
            isHit: accessResult.isHit,
            evictedBlock: accessResult.evictedMemoryBlock,
            explanation: accessResult.actionDescription,
            snapshot: accessResult.snapshot,
            accessTimeNs: accessTime,
        };
        this.traceEntries.push(traceEntry);

        // Next step
        this.currentStepIndex++;

        // Save state history for step-back support
        this.snapshotHistory.push(this.cacheMemory.getSnapshot());
        this.statsHistory.push({ ...this.simulationStatistics });

        return true;
    }

    public runToEnd() {
        while (this.step()) {}
    }

    // Returns true if there is at least one completed step to undo
    public canStepBack(): boolean {
        return this.currentStepIndex > 0;
    }

    // Undoes the last step by restoring the previous snapshot and stats
    public stepBack(): boolean {
        if (!this.canStepBack()) {
            return false;
        }

        // Pop current state from history
        this.snapshotHistory.pop();
        this.statsHistory.pop();
        this.traceEntries.pop();

        // Restore previous state
        const prevSnapshot = this.snapshotHistory[this.snapshotHistory.length - 1];
        const prevStats = this.statsHistory[this.statsHistory.length - 1];
        this.currentStepIndex--;
        this.cacheMemory.restoreFromSnapshot(prevSnapshot, this.currentStepIndex);
        this.simulationStatistics = { ...prevStats };

        return true;
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
