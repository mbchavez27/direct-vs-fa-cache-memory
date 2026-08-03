import { describe, it, expect } from 'vitest';
import { CacheSimulator } from './CacheSimulator';
import { compareCaches } from './compareCaches';
import { formatComparisonToText, formatTraceToText } from './traceFormatter';
import type { CacheConfig } from '../cache/types';

const config: CacheConfig = {
    blockSizeWords: 2,
    cacheBlockCount: 4,
    mainMemoryBlockCount: 1024,
    readPolicy: 'non-load-through',
    cacheAccessTimeNs: 1,
    memoryAccessTimeNs: 10,
};

const sequence = [1, 17, 2, 1023, 3, 19, 1, 1];

describe('traceFormatter', () => {
    it('formatTraceToText includes config, trace log, statistics, and final cache state', () => {
        const sim = new CacheSimulator('Direct-Mapped', config);
        sim.loadSequence(sequence);
        sim.runToEnd();

        const text = formatTraceToText(sim.getSimulationResult());

        expect(text).toContain('Direct-Mapped');
        expect(text).toContain('BLOCK SIZE (WORDS)  : 2');
        expect(text).toContain('CACHE BLOCKS        : 4');
        expect(text).toContain('TRACE LOG');
        expect(text).toContain('HIT');
        expect(text).toContain('MISS');
        expect(text).toContain('Total Accesses      : 8');
        expect(text).toContain('FINAL CACHE STATE');
    });

    it('formatTraceToText handles an empty trace', () => {
        const sim = new CacheSimulator('Direct-Mapped', config);
        sim.loadSequence(sequence);

        const text = formatTraceToText(sim.getSimulationResult());

        expect(text).toContain('TRACE LOG');
        expect(text).toContain('No accesses recorded.');
    });

    it('formatComparisonToText includes both caches and a comparison summary', () => {
        const comparison = compareCaches(config, sequence);

        const text = formatComparisonToText(comparison);

        expect(text).toContain('CACHE 1: DIRECT-MAPPED');
        expect(text).toContain('CACHE 2: FULLY ASSOCIATIVE (MRU)');
        expect(text).toContain('MEMORY ACCESS SEQUENCE (8 accesses)');
        expect(text).toContain('COMPARISON SUMMARY');
        expect(text).toContain('Direct-Mapped');
        expect(text).toContain('Fully Associative (MRU)');
    });
});
