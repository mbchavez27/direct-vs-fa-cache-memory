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

        this.currentStep++;

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
        } else if (this.config.readPolicy === "load-through") {
            if (line.valid) {
                evictedMemoryBlock = line.memoryBlock;
                replacementOccurred = true;
                actionDescription = `Miss. Replaced block ${evictedMemoryBlock} in line ${cacheLineIndex} with block ${memoryBlock}.`;
            } else {
                actionDescription = `Miss. Placed block ${memoryBlock} in empty line ${cacheLineIndex}.`;
            }

            line.valid = true;
            line.memoryBlock = memoryBlock;
            line.tag = tag;
            line.lastUsedStep = this.currentStep;
        } else {
            actionDescription = `Miss. Non-load-through policy left cache line ${cacheLineIndex} unchanged.`;
        }

        return {
            step: this.currentStep,
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
