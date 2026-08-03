import type { CacheConfig, CacheLine, ComparisonResult, SimulationResult, SimulationStatistics, TraceEntry } from '../cache/types';

const SEPARATOR = '='.repeat(78);
const THIN_SEPARATOR = '-'.repeat(78);

function padEnd(str: string, length: number): string {
    return str.padEnd(length, ' ');
}

function padStart(str: string, length: number): string {
    return str.padStart(length, ' ');
}

function formatConfigBlock(config: CacheConfig, organization?: string): string {
    const lines = [
        `BLOCK SIZE (WORDS)  : ${config.blockSizeWords}`,
        `CACHE BLOCKS        : ${config.cacheBlockCount}`,
        `MAIN MEMORY BLOCKS  : ${config.mainMemoryBlockCount}`,
        `READ POLICY         : ${config.readPolicy}`,
        `CACHE ACCESS (NS)   : ${config.cacheAccessTimeNs}`,
        `MEMORY ACCESS (NS)  : ${config.memoryAccessTimeNs}`,
    ];
    if (organization !== undefined) {
        lines.unshift(`ORGANIZATION        : ${organization}`);
    }
    return lines.join('\n');
}

function formatTraceTable(trace: TraceEntry[]): string {
    if (trace.length === 0) {
        return 'No accesses recorded.';
    }

    const header = [
        padEnd('Step', 5),
        padEnd('Block', 6),
        padEnd('Line', 6),
        padEnd('Tag', 5),
        padEnd('Result', 7),
        padEnd('Evicted', 8),
        'Action',
    ].join('|');
    const separator = THIN_SEPARATOR;

    const rows = trace.map((entry) => {
        return [
            padStart(String(entry.step + 1), 5),
            padStart(String(entry.memoryBlock), 6),
            padStart(String(entry.cacheLineIndex), 6),
            padStart(entry.tag !== null ? String(entry.tag) : '-', 5),
            padStart(entry.isHit ? 'HIT' : 'MISS', 7),
            padStart(entry.evictedBlock !== null ? String(entry.evictedBlock) : '-', 8),
            entry.explanation,
        ].join('|');
    });

    return [header, separator, ...rows].join('\n');
}

function formatStatistics(stats: SimulationStatistics): string {
    return [
        `Total Accesses      : ${stats.totalAccesses}`,
        `Cache Hits          : ${stats.hits}`,
        `Cache Misses        : ${stats.misses}`,
        `Hit Rate            : ${(stats.hitRate * 100).toFixed(2)}%`,
        `Miss Rate           : ${(stats.missRate * 100).toFixed(2)}%`,
        `Average Access Time : ${stats.averageMemoryAccessTimeNs.toFixed(2)} ns`,
        `Total Access Time   : ${stats.totalMemoryAccessTimeNs.toFixed(2)} ns`,
    ].join('\n');
}

function formatCacheState(lines: CacheLine[]): string {
    const header = [
        padEnd('Line', 5),
        padEnd('Valid', 6),
        padEnd('Tag', 5),
        'Block',
    ].join(' | ');
    const separator = THIN_SEPARATOR;

    const rows = lines.map((line) => {
        return [
            padStart(String(line.lineIndex), 5),
            padStart(line.valid ? '1' : '0', 6),
            padStart(line.tag !== null ? String(line.tag) : '-', 5),
            line.memoryBlock !== null ? String(line.memoryBlock) : '-',
        ].join(' | ');
    });

    return [header, separator, ...rows].join('\n');
}

function formatSequence(sequence: number[]): string {
    if (sequence.length === 0) {
        return 'No accesses recorded.';
    }

    const lines: string[] = [];
    for (let i = 0; i < sequence.length; i += 16) {
        lines.push(sequence.slice(i, i + 16).join(', '));
    }
    return lines.join('\n');
}

function formatComparisonSummary(comparison: ComparisonResult): string {
    const dm = comparison.directMapped.statistics;
    const fa = comparison.fullyAssociative.statistics;

    const header = [
        padEnd('Metric', 24),
        padEnd('Direct-Mapped', 16),
        'Fully Associative (MRU)',
    ].join('|');
    const separator = THIN_SEPARATOR;

    const rows = [
        ['Total Accesses', String(dm.totalAccesses), String(fa.totalAccesses)],
        ['Cache Hits', String(dm.hits), String(fa.hits)],
        ['Cache Misses', String(dm.misses), String(fa.misses)],
        ['Hit Rate', `${(dm.hitRate * 100).toFixed(2)}%`, `${(fa.hitRate * 100).toFixed(2)}%`],
        ['Miss Rate', `${(dm.missRate * 100).toFixed(2)}%`, `${(fa.missRate * 100).toFixed(2)}%`],
        ['Average Access Time', `${dm.averageMemoryAccessTimeNs.toFixed(2)} ns`, `${fa.averageMemoryAccessTimeNs.toFixed(2)} ns`],
        ['Total Access Time', `${dm.totalMemoryAccessTimeNs.toFixed(2)} ns`, `${fa.totalMemoryAccessTimeNs.toFixed(2)} ns`],
    ].map(([metric, dmValue, faValue]) =>
        [padEnd(metric, 24), padStart(dmValue, 16), faValue].join('|'),
    );

    return [header, separator, ...rows].join('\n');
}

export function formatTraceToText(result: SimulationResult): string {
    const sections: string[] = [
        SEPARATOR,
        'CACHE MEMORY SIMULATOR - ACCESS TRACE REPORT',
        SEPARATOR,
        '',
        formatConfigBlock(result.config, result.organization),
        '',
        'TRACE LOG',
        THIN_SEPARATOR,
        formatTraceTable(result.trace),
        '',
        'STATISTICS',
        THIN_SEPARATOR,
        formatStatistics(result.statistics),
        '',
        'FINAL CACHE STATE',
        THIN_SEPARATOR,
        formatCacheState(result.finalSnapshot.lines),
    ];

    return sections.join('\n');
}

export function formatComparisonToText(comparison: ComparisonResult): string {
    const dm = comparison.directMapped;
    const fa = comparison.fullyAssociative;
    const sequence = dm.trace.map((entry) => entry.memoryBlock);

    const sections: string[] = [
        SEPARATOR,
        'CACHE MEMORY SIMULATOR - DIRECT-MAPPED vs FULLY ASSOCIATIVE (MRU) REPORT',
        SEPARATOR,
        '',
        'CONFIGURATION',
        THIN_SEPARATOR,
        formatConfigBlock(dm.config),
        '',
        `MEMORY ACCESS SEQUENCE (${sequence.length} accesses)`,
        THIN_SEPARATOR,
        formatSequence(sequence),
        '',
        SEPARATOR,
        'CACHE 1: DIRECT-MAPPED',
        SEPARATOR,
        '',
        'TRACE LOG',
        THIN_SEPARATOR,
        formatTraceTable(dm.trace),
        '',
        'STATISTICS',
        THIN_SEPARATOR,
        formatStatistics(dm.statistics),
        '',
        'FINAL CACHE STATE',
        THIN_SEPARATOR,
        formatCacheState(dm.finalSnapshot.lines),
        '',
        SEPARATOR,
        'CACHE 2: FULLY ASSOCIATIVE (MRU)',
        SEPARATOR,
        '',
        'TRACE LOG',
        THIN_SEPARATOR,
        formatTraceTable(fa.trace),
        '',
        'STATISTICS',
        THIN_SEPARATOR,
        formatStatistics(fa.statistics),
        '',
        'FINAL CACHE STATE',
        THIN_SEPARATOR,
        formatCacheState(fa.finalSnapshot.lines),
        '',
        SEPARATOR,
        'COMPARISON SUMMARY',
        SEPARATOR,
        formatComparisonSummary(comparison),
    ];

    return sections.join('\n');
}
