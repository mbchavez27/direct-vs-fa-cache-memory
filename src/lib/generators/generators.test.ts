import { describe, it, expect } from 'vitest';
import { generateSequential } from './sequential';
import { generateMidRepeat } from './midRepeat';
import { generateRandom } from './random';
import { parseCustomSequence } from './custom';

describe('Generators', () => {
    it.todo('generateSequential produces exact sequence for n=4');
    it.todo('generateMidRepeat produces exact sequence for n=4');
    it.todo('generateRandom produces exactly 64 accesses within range');
    it.todo('generateRandom produces identical seeded sequences');
    it.todo('parseCustomSequence parses valid input correctly');
    it.todo('parseCustomSequence rejects malformed input');
});
