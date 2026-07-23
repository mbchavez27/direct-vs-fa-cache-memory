// A simple seeded random number generator (Linear Congruential Generator)
export class SeededRandom {
    private seed: number;

    constructor(seed: number = Date.now()) {
        this.seed = seed;
    }

    public next(): number {
        // TODO: Implement LCG random generation
        return 0;
    }
}

export function generateRandom(seed: number | null = null): number[] {
    // TODO: Generate exactly 64 accesses, integers from 0 through 1023
    return [];
}
