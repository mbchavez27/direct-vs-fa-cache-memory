import { describe, it, expect } from 'vitest';
import { isPowerOfTwo, validateConfiguration, validateMemoryBlock, validateAccessSequence } from './validation';
import type { CacheConfig } from './types';

describe('Validation', () => {
    it.todo('isPowerOfTwo works correctly');
    it.todo('validateConfiguration catches invalid block sizes and cache counts');
    it.todo('validateMemoryBlock catches invalid memory blocks');
    it.todo('validateAccessSequence catches empty or invalid sequences');
});
