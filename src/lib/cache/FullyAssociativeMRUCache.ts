import type { AccessResult, CacheConfig, CacheLine, CacheSnapshot } from './types';
import { getAccessTime } from '../statistics/timing';

export class FullyAssociativeMRUCache {
    private config: CacheConfig;
    private lines: CacheLine[];
    private currentStep: number = 0;

    constructor(config: CacheConfig) {
        this.config = config;
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
        
        let targetLineIndex = -1;
        let isHit = false;

        // Search for a hit
        for (let i = 0; i < this.lines.length; i++) {
            if (this.lines[i].valid && this.lines[i].memoryBlock === memoryBlock) {
                targetLineIndex = i;
                isHit = true;
                break;
            }
        }

        let evictedMemoryBlock: number | null = null;
        let replacementOccurred = false;
        let actionDescription = "";

        if (isHit) {
            this.lines[targetLineIndex].lastUsedStep = this.currentStep;
            actionDescription = `Block ${memoryBlock} found in fully associative cache line ${targetLineIndex}.`;
        } else {
            // Miss: find lowest-index invalid line
            let emptyLineIndex = -1;
            for (let i = 0; i < this.lines.length; i++) {
                if (!this.lines[i].valid) {
                    emptyLineIndex = i;
                    break; // Deterministic tie-breaking: lowest index first
                }
            }

            if (emptyLineIndex !== -1) {
                targetLineIndex = emptyLineIndex;
                actionDescription = `Miss. Placed block ${memoryBlock} in empty line ${targetLineIndex}.`;
            } else {
                // Cache is full, apply MRU replacement (highest lastUsedStep)
                let mruLineIndex = 0;
                let maxLastUsed = this.lines[0].lastUsedStep;

                for (let i = 1; i < this.lines.length; i++) {
                    // In a tie (which shouldn't happen with strict incrementing steps), lowest index wins natively by using > instead of >=
                    if (this.lines[i].lastUsedStep > maxLastUsed) {
                        maxLastUsed = this.lines[i].lastUsedStep;
                        mruLineIndex = i;
                    }
                }

                targetLineIndex = mruLineIndex;
                evictedMemoryBlock = this.lines[targetLineIndex].memoryBlock;
                replacementOccurred = true;
                actionDescription = `Miss. MRU replacement. Evicted most recently used block ${evictedMemoryBlock} from line ${targetLineIndex} and inserted block ${memoryBlock}.`;
            }

            // Update line
            this.lines[targetLineIndex].valid = true;
            this.lines[targetLineIndex].memoryBlock = memoryBlock;
            this.lines[targetLineIndex].tag = memoryBlock; // Use memory block as tag for FA cache
            this.lines[targetLineIndex].lastUsedStep = this.currentStep;
        }

        const accessTimeNs = getAccessTime(isHit, this.config.readPolicy, this.config.cacheAccessTimeNs, this.config.memoryAccessTimeNs);

        return {
            step: this.currentStep,
            memoryBlock,
            hit: isHit,
            miss: !isHit,
            cacheLineIndex: targetLineIndex,
            tag: memoryBlock,
            evictedMemoryBlock,
            replacementOccurred,
            actionDescription,
            snapshot: this.getSnapshot(),
            accessTimeNs
        };
    }

    public getSnapshot(): CacheSnapshot {
        return {
            lines: this.lines.map(line => ({ ...line }))
        };
    }
}
