import type { CacheConfig } from './types';

export function isPowerOfTwo(n: number): boolean {
    // TODO: Implement power of two check
    return true;
}

export function validateConfiguration(config: CacheConfig): string[] {
    const errors: string[] = [];
    
    // TODO: Implement configuration validation
    // Check block size (integer, >= 2, power of 2)
    // Check cache block count (integer, >= 4, power of 2)
    // Check main memory count (must be exactly 1024)
    // Check read policy
    // Check timing values (> 0)

    return errors;
}

export function validateMemoryBlock(memoryBlock: number, mainMemoryBlockCount: number = 1024): string | null {
    // TODO: Implement individual memory block validation
    return null;
}

export function validateAccessSequence(sequence: number[], mainMemoryBlockCount: number = 1024): string[] {
    const errors: string[] = [];
    
    // TODO: Implement sequence validation
    
    return errors;
}
