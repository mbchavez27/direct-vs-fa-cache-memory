import type { CacheConfig } from './types';

export function isPowerOfTwo(value: number): boolean {
	return Number.isSafeInteger(value) && value > 0 && Math.log2(value) % 1 === 0;
}

export function validateConfiguration(config: CacheConfig): string[] {
	const errors: string[] = [];

	if (!Number.isSafeInteger(config.blockSizeWords) || config.blockSizeWords < 2) {
		errors.push('Block size must be an integer of at least 2 words.');
	} else if (!isPowerOfTwo(config.blockSizeWords)) {
		errors.push('Block size must be a power of two.');
	}

	if (!Number.isSafeInteger(config.cacheBlockCount) || config.cacheBlockCount < 4) {
		errors.push('Cache block count must be an integer of at least 4.');
	} else if (!isPowerOfTwo(config.cacheBlockCount)) {
		errors.push('Cache block count must be a power of two.');
	}

	if (config.mainMemoryBlockCount !== 1024) {
		errors.push('Main memory block count must be exactly 1024.');
	}

	if (config.readPolicy !== 'load-through' && config.readPolicy !== 'non-load-through') {
		errors.push('Read policy must be load-through or non-load-through.');
	}

	if (!Number.isFinite(config.cacheAccessTimeNs) || config.cacheAccessTimeNs <= 0) {
		errors.push('Cache access time must be greater than zero.');
	}

	if (!Number.isFinite(config.memoryAccessTimeNs) || config.memoryAccessTimeNs <= 0) {
		errors.push('Memory access time must be greater than zero.');
	}

	return errors;
}

export function validateMemoryBlock(
	memoryBlock: number,
	mainMemoryBlockCount: number = 1024
): string | null {
	if (!Number.isSafeInteger(mainMemoryBlockCount) || mainMemoryBlockCount <= 0) {
		return 'Main memory block count must be a positive integer.';
	}

	if (!Number.isSafeInteger(memoryBlock)) {
		return 'Memory block must be an integer.';
	}

	if (memoryBlock < 0 || memoryBlock >= mainMemoryBlockCount) {
		return `Memory block must be between 0 and ${mainMemoryBlockCount - 1}.`;
	}

	return null;
}

export function validateAccessSequence(
	sequence: number[],
	mainMemoryBlockCount: number = 1024
): string[] {
	if (!Array.isArray(sequence) || sequence.length === 0) {
		return ['Access sequence must contain at least one memory block.'];
	}

	const errors: string[] = [];

	for (let index = 0; index < sequence.length; index++) {
		const error = validateMemoryBlock(sequence[index], mainMemoryBlockCount);
		if (error !== null) {
			errors.push(`Access ${index + 1}: ${error}`);
		}
	}

	return errors;
}
