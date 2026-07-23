import { describe, it, expect } from 'vitest';
import { CacheSimulator } from './CacheSimulator';
import { compareCaches } from './compareCaches';
import type { CacheConfig } from '../cache/types';

describe('CacheSimulator', () => {
    it.todo('reset returns simulator to initial state');
    it.todo('snapshots are not changed by later accesses');
    it.todo('compareCaches uses same sequence for both caches');
});
