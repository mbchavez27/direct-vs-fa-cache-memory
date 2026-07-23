import { describe, it, expect } from 'vitest';
import { DirectMappedCache } from './DirectMappedCache';
import type { CacheConfig } from './types';

describe('DirectMappedCache', () => {
    const config: CacheConfig = {
        blockSizeWords: 4,
        cacheBlockCount: 4,
        mainMemoryBlockCount: 1024,
        readPolicy: 'load-through',
        cacheAccessTimeNs: 1,
        memoryAccessTimeNs: 10
    };

    it.todo('calculates index and tag correctly');
    it.todo('hits on second access to same block');
    it.todo('handles conflict replacement');
});
