export type CacheOrganization = 'Direct-Mapped' | 'Fully-Associative-MRU';
export type ReadPolicy = 'load-through' | 'non-load-through';
export type TestCaseType = 'Sequential' | 'Mid-repeat' | 'Random' | 'Custom';

export interface CacheConfig {
	blockSizeWords: number;
	cacheBlockCount: number;
	mainMemoryBlockCount: number;
	readPolicy: ReadPolicy;
	cacheAccessTimeNs: number;
	memoryAccessTimeNs: number;
}

export interface CacheLine {
	lineIndex: number;
	valid: boolean;
	memoryBlock: number | null;
	tag: number | null;
	lastUsedStep: number;
}

export interface CacheSnapshot {
	lines: CacheLine[];
}

export interface AccessResult {
	step: number;
	memoryBlock: number;
	hit: boolean;
	miss: boolean;
	cacheLineIndex: number;
	tag: number | null;
	evictedMemoryBlock: number | null;
	replacementOccurred: boolean;
	actionDescription: string;
	snapshot: CacheSnapshot;
	accessTimeNs: number;
}

export interface TraceEntry {
	step: number;
	organization: CacheOrganization;
	memoryBlock: number;
	cacheLineIndex: number;
	tag: number | null;
	isHit: boolean;
	evictedBlock: number | null;
	explanation: string;
	snapshot: CacheSnapshot;
	accessTimeNs: number;
}

export interface SimulationStatistics {
	totalAccesses: number;
	hits: number;
	misses: number;
	hitRate: number;
	missRate: number;
	averageMemoryAccessTimeNs: number;
	totalMemoryAccessTimeNs: number;
}

export interface SimulationResult {
	organization: CacheOrganization;
	config: CacheConfig;
	trace: TraceEntry[];
	statistics: SimulationStatistics;
	finalSnapshot: CacheSnapshot;
}

export interface ComparisonResult {
	directMapped: SimulationResult;
	fullyAssociative: SimulationResult;
}
