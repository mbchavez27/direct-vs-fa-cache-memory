const CUSTOM_SEQUENCE_FORMAT = /^\d+(?:(?:\s+|\s*,\s*)\d+)*$/;
const MIN_MEMORY_BLOCK = 0;
const MAX_MEMORY_BLOCK = 1023;

export function parseCustomSequence(input: string): number[] {
	const trimmedInput = input.trim();

	if (trimmedInput.length === 0) {
		throw new Error('Custom sequence must contain at least one memory block.');
	}

	if (!CUSTOM_SEQUENCE_FORMAT.test(trimmedInput)) {
		throw new Error(
			'Custom sequence must contain only comma- or whitespace-separated integers from 0 to 1023.'
		);
	}

	const sequence = trimmedInput.split(/[\s,]+/).map(Number);

	for (const memoryBlock of sequence) {
		if (
			!Number.isSafeInteger(memoryBlock) ||
			memoryBlock < MIN_MEMORY_BLOCK ||
			memoryBlock > MAX_MEMORY_BLOCK
		) {
			throw new RangeError('Each memory block must be an integer from 0 to 1023.');
		}
	}

	return sequence;
}
