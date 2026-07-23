import type { AccessResult, CacheConfig, CacheLine, CacheSnapshot } from './types';

export class DirectMappedCache {
    private config: CacheConfig;
    private lines: CacheLine[];
    private currentStep: number = 0;

    constructor(config: CacheConfig) {
        this.config = config;
        // Initialize cache lines
        this.lines = Array.from({ length: config.cacheBlockCount }, (_, i) => ({
            lineIndex: i,
            valid: false,
            memoryBlock: null,
            tag: null,
            lastUsedStep: 0
        }));
    }

    public access(memoryBlock: number): AccessResult {
        this.currentStep++;
        
        // TODO: Calculate cache index
        // TODO: Calculate tag
        // TODO: Check if it's a hit or miss
        // TODO: If miss, handle eviction and replacement
        // TODO: Update cache line properties (valid, memoryBlock, tag, lastUsedStep)
        // TODO: Calculate accessTimeNs using getAccessTime from timing.ts
        
        // Return dummy result
        return {
            step: this.currentStep,
            memoryBlock,
            hit: false,
            miss: true,
            cacheLineIndex: 0,
            tag: 0,
            evictedMemoryBlock: null,
            replacementOccurred: false,
            actionDescription: "TODO: Implement direct mapped access logic",
            snapshot: this.getSnapshot(),
            accessTimeNs: 0
        };
    }

    public getSnapshot(): CacheSnapshot {
        // Deep copy lines to prevent mutation of past history
        return {
            lines: this.lines.map(line => ({ ...line }))
        };
    }
}
