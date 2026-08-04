import type {
    AccessResult,
    CacheConfig,
    CacheLine,
    CacheSnapshot,
} from "./types";
import { validateConfiguration, validateMemoryBlock } from "./validation";
import { getAccessTime } from "../statistics/timing";

export class DirectMappedCache {
    private config: CacheConfig;
    private lines: CacheLine[];
    private currentStep: number = 0;

    constructor(config: CacheConfig) {
        const errors = validateConfiguration(config);
        if (errors.length > 0) {
            throw new Error(`Invalid cache configuration: ${errors.join(" ")}`);
        }

        this.config = config;
        this.lines = this.createEmptyLines();
    }

    public access(memoryBlock: number): AccessResult {
        const validationError = validateMemoryBlock(
            memoryBlock,
            this.config.mainMemoryBlockCount,
        );
        if (validationError !== null) {
            throw new RangeError(validationError);
        }

        const cacheLineIndex = memoryBlock % this.config.cacheBlockCount;
        const tag = Math.floor(memoryBlock / this.config.cacheBlockCount);
        const line = this.lines[cacheLineIndex];
        const isHit =
            line.valid && line.memoryBlock === memoryBlock && line.tag === tag;

        let evictedMemoryBlock: number | null = null;
        let replacementOccurred = false;
        let actionDescription: string;

        if (isHit) {
            line.lastUsedStep = this.currentStep;
            actionDescription = `Block ${memoryBlock} found in direct-mapped cache line ${cacheLineIndex}.`;
        } else if (this.config.readPolicy === "non-load-through") {
            if (line.valid) {
                evictedMemoryBlock = line.memoryBlock;
                replacementOccurred = true;
                actionDescription = `Miss. Replaced main memory block ${evictedMemoryBlock} in cache line ${cacheLineIndex} with main memory block ${memoryBlock}.`;
            } else {
                actionDescription = `Miss. Placed main memory block ${memoryBlock} in empty cache line ${cacheLineIndex}.`;
            }

            line.valid = true;
            line.memoryBlock = memoryBlock;
            line.tag = tag;
            line.lastUsedStep = this.currentStep;
        } else {
            actionDescription = `Miss. Load-through policy left cache line ${cacheLineIndex} unchanged.`;
        }

        this.currentStep++;

        return {
            step: this.currentStep - 1,
            memoryBlock,
            isHit: isHit,
            cacheLineIndex,
            tag,
            evictedMemoryBlock,
            replacementOccurred,
            actionDescription,
            snapshot: this.getSnapshot(),
            accessTimeNs: getAccessTime(
                isHit,
                this.config.readPolicy,
                this.config.cacheAccessTimeNs,
                this.config.memoryAccessTimeNs,
                this.config.blockSizeWords,
            ),
        };
    }

    public getSnapshot(): CacheSnapshot {
        return {
            lines: this.lines.map((line) => ({ ...line })),
        };
    }

    private createEmptyLines(): CacheLine[] {
        return Array.from(
            { length: this.config.cacheBlockCount },
            (_, lineIndex) => ({
                lineIndex,
                valid: false,
                memoryBlock: null,
                tag: null,
                lastUsedStep: 0,
            }),
        );
    }
}
