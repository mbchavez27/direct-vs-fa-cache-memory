# Direct-Mapped vs. Fully Associative Cache Memory Simulator (Machine 8)

**Group WDA** — Bantillo, Airon Matthew F. · Chavez, Max Benedict B. · Chiu, Kristopher Lance A. · Ponce, Jean Rondel R. · Santiago, Juan Ramon B.

---

An interactive cache memory simulator developed for **Machine 8** of the Cache Memory Machines project. This system compares the performance and behavior of a **Direct-Mapped Cache** against a **Fully Associative Cache using the MRU (Most Recently Used) replacement policy**.

The simulator provides cache visualization, execution tracing, memory access statistics, and performance analysis under different memory access patterns.

---

# Features

- Configurable cache parameters
    - Block size
    - Number of cache blocks
    - Read policy
- Supports two cache organizations:
    - Direct-Mapped Cache
    - Fully Associative Cache with MRU replacement
- Fixed main memory size of **1024 blocks**
- Memory access sequence generators:
    - Sequential access
    - Mid-repeat access
    - Random access
- Cache memory visualization
- Step-by-step animated execution
- Final cache state snapshot
- Detailed cache trace logs
- Performance statistics calculation

---

# Machine Configuration

| Parameter            | Configuration                   |
| -------------------- | ------------------------------- |
| Machine              | 8                               |
| Cache Organization 1 | Direct-Mapped Cache             |
| Cache Organization 2 | Fully Associative Cache         |
| Replacement Policy   | MRU (Most Recently Used)        |
| Main Memory Size     | 1024 Blocks                     |
| Block Size           | Parameterized                   |
| Cache Blocks         | Parameterized                   |
| Read Policy          | Load-through / Non-load-through |

---

# Cache Parameters

The simulator supports configurable cache settings.

| Parameter              | Description                                  |
| ---------------------- | -------------------------------------------- |
| Block Size             | Minimum of 2 words and must be a power of 2  |
| Number of Cache Blocks | Minimum of 4 blocks and must be a power of 2 |
| Main Memory            | Fixed at 1024 blocks                         |
| Read Policy            | Load-through or Non-load-through             |

---

# Cache Implementations

## Direct-Mapped Cache

A Direct-Mapped Cache assigns every memory block to exactly one possible cache location.

### Mapping Formula

```
Cache Index = Memory Block Address mod Number of Cache Blocks
```

### Advantages

- Simple hardware implementation
- Fast cache lookup
- Low implementation complexity

### Disadvantages

- High conflict miss rate
- Multiple memory blocks may compete for the same cache location

---

## Fully Associative Cache (MRU)

A Fully Associative Cache allows any memory block to be stored in any cache location.

When the cache is full, the simulator applies the **MRU (Most Recently Used)** replacement policy.

### MRU Replacement

The cache block that was accessed most recently is removed when a new block needs to be inserted.

### Advantages

- Eliminates conflict misses
- Flexible block placement
- Better cache utilization

### Disadvantages

- More complex searching
- Higher hardware cost
- MRU may perform poorly for some access patterns

---

# Memory Access Test Cases

Let:

```
n = Number of Cache Blocks
```

---

## Test Case 1 — Sequential Access

The simulator accesses up to **2n cache blocks** and repeats the sequence twice.

Example:

For n = 4

```
0,1,2,3,4,5,6,7,
0,1,2,3,4,5,6,7
```

### Objective

- Observe cache filling behavior
- Measure repeated access performance
- Compare conflict handling between cache organizations

---

# Test Case 2 — Mid-Repeat Access

The simulator starts with blocks 0 to n-1, repeats up to 2n-1, and then reverses the access pattern.

Example:

For n = 4

```
0,1,2,3,

0,1,2,3,4,5,6,7,

0,1,2,3,4,5,6,7,

3,2,1,0,

7,6,5,4,3,2,1,0,

7,6,5,4,3,2,1,0
```

### Objective

- Evaluate temporal locality
- Observe replacement behavior
- Compare Direct-Mapped mapping conflicts against Fully Associative MRU replacement

---

# Test Case 3 — Random Access

The simulator generates:

```
64 random memory accesses
```

Constraints:

- Memory block range: 0–1023
- Randomly generated access pattern

### Objective

- Simulate unpredictable workloads
- Compare cache efficiency under random memory access

---

# System Outputs

## Cache Memory Visualization

The simulator displays:

- Cache block contents
- Memory block mapping
- Valid state
- Tags
- Current cache state after each operation

---

# Execution Modes

## Step-by-Step Mode

Displays every memory access operation.

Information shown:

- Current memory block
- Cache location
- Hit or miss status
- Replacement operation
- Updated cache state

---

## Final Snapshot Mode

Displays only the final cache memory state after the complete simulation.

---

# Cache Trace Log

Every simulation generates a detailed text log containing:

```
Memory Access
Cache Location
Tag
Hit/Miss Result
Replacement Action
Cache State
```

The trace log is generated regardless of the selected visualization mode.

---

# Performance Statistics

The simulator calculates:

| Statistic                  | Description                         |
| -------------------------- | ----------------------------------- |
| Total Memory Access Count  | Number of memory accesses performed |
| Cache Hit Count            | Number of successful cache accesses |
| Cache Miss Count           | Number of failed cache accesses     |
| Cache Hit Rate             | Hits / Total Accesses               |
| Cache Miss Rate            | Misses / Total Accesses             |
| Average Memory Access Time | Average time per memory access      |
| Total Memory Access Time   | Overall execution access time       |

---

# Analysis

In this section, we will analyze the two cache operations (Direct-mapped and Fully Associative MRU) based on their performance on the three aforementioned test cases. In this analysis, we will focus on the **non-load-through** read policy to stress test the machines and get the worst case access time.

For all three test cases, we will use the following configuration:
| Configuration | Value |
| ------------------------------ | ------------------- |
| Cache Access Time (CAT) | 1 ns |
| Main Memory Access Time (MAT) | 10 ns |
| Block Size (B) | 4 words |
| Miss Penalty (CAT + MAT\*B + CAT) | 42 ns |
| Cache Blocks (n) | 64 blocks |
| Main Memory | 1024 blocks (fixed) |
| Read Policy | Non-load-through |

## Test Case 1 — Sequential Access

With n = 64, this test case accesses blocks 0 through 127 (2n-1), then repeats the same 128-block sequence a second time, for 256 total memory accesses.

### Direct-Mapped Cache

| Statistic                  | Value       |
| -------------------------- | ----------- |
| Total Memory Access Count  | 256         |
| Hit Count                  | 0           |
| Miss Count                 | 256         |
| Hit Rate                   | 0.0%        |
| Miss Rate                  | 100.0%      |
| Average Memory Access Time | 42.00 ns    |
| Total Memory Access Time   | 10572.00 ns |

For sequential access, the Direct-mapped cache produced a 100% miss rate. This is the expected worst-case outcome for direct mapping given this access pattern: since the cache index is computed as `memory block mod 64`, block _b_ and block _b + 64_ always map to the exact same cache line, The idea is that blocks 0 to 63 are initially loaded into cache. However, blocks 64 to 127 evict blocks 0 to 63 from the cache since the second half of the blocks aliases to the same line as the first half. By the time the sequence repeats, every line now holds a "second-half" block, so re-accessing blocks 0 to 127 misses as each access again evicts whatever tag currently occupies that line. This one-to-one mapping pattern provides no opportunity to retain any useful data resulting in a miss rate of 100%.

### Fully Associative Cache (MRU)

| Statistic                  | Value      |
| -------------------------- | ---------- |
| Total Memory Access Count  | 256        |
| Hit Count                  | 64         |
| Miss Count                 | 192        |
| Hit Rate                   | 25.0%      |
| Miss Rate                  | 75.0%      |
| Average Memory Access Time | 31.75 ns   |
| Total Memory Access Time   | 8128.00 ns |

Unlike Direct-Mapped, the FSA MRU is not constrained to a fixed line-per-block mapping, so it can retain earlier blocks even while later blocks are still being inserted. For this test case, a fully associative cache has a hit rate of 25%. Blocks 0 to 63 are initially loaded into cache in the first pass. Since a Most Recently Used (MRU) replacement algorithm is followed, when blocks 64 to 127 are accessed, only the last cache block ever gets replaced since that is the most recently used block without touching the first 63 cache blocks. Blocks 0 to 62 are retained in cache, so as a result, when these blocks are accessed a second time, all of these accesses result in a cache hit producing a non-zero hit rate.

### Comparison

For this specific test case, FSA MRU performs better than Direct-mapped with a lower average memory access time of 31.75 ns. That of direct-mapped is just the miss penalty of 42 ns since the miss rate is 100% Direct-mapped will always have a hit rate of 0% for this test case since memory blocks 0 to n-1 are overwritten before they could be accessed a second time. The same thing happens for blocks n to 2n-1. Although they are accessed and loaded into cache in the first pass, they are overwritten by the second pass of accessing blocks 0 to n-1. For fully associative, a subset of blocks are retained before the second pass resulting in a cache hit for these blocks in the second pass that direct-mapped fails to demonstrate. Direct-mapped cache suffers total thrashing (0% hit rate) due to its rigid mapping mechanism. FSA’s total memory access time (8128 ns) is roughly 23.1% lower than Direct-Mapped's (10752 ns) across the same 256 accesses despite FA-MRU's greater lookup complexity, the elimination of conflict misses more than compensates for this workload.

---

## Test Case 2 — Mid-Repeat Access

With n = 64, this test case produces a 640-access sequence: an initial pass through blocks 0-63, two repeats of blocks 0-127, a reversed pass through blocks 63-0, and two repeats of the reversed sequence 127-0.

### Direct-Mapped Cache

| Statistic                  | Value       |
| -------------------------- | ----------- |
| Total Memory Access Count  | 640         |
| Hit Count                  | 64          |
| Miss Count                 | 576         |
| Hit Rate                   | 10.0%       |
| Miss Rate                  | 90.0%       |
| Average Memory Access Time | 37.90 ns    |
| Total Memory Access Time   | 24256.00 ns |

Because the cache index is `memory block mod 64`, blocks 0 to 63 and blocks 64 to 127 alias to the same 64 cache lines, distinguished only by tag. The only hits in this entire test case occur during the first repeat of the 0 to 127 block, when blocks 0 to 63 are re-accessed immediately after being loaded in the initial pass (64 hits). Every access afterward requires a line that was just evicted by the previous segment. This produces total thrashing for the remaining 576 accesses, yielding a 10% hit rate overall, since the repeated back-and-forth between the segments still manages to produce a small window of retained data before thrashing resumes.

### Fully Associative Cache (MRU)

| Statistic                  | Value       |
| -------------------------- | ----------- |
| Total Memory Access Count  | 640         |
| Hit Count                  | 317         |
| Miss Count                 | 323         |
| Hit Rate                   | 49.5%       |
| Miss Rate                  | 50.5%       |
| Average Memory Access Time | 21.69 ns    |
| Total Memory Access Time   | 13883.00 ns |

The FSA MRU is not constrained by a fixed block-to-line mapping, so it can retain blocks across the repeated and reversed passes far more effectively than Direct-Mapped. The mid-repeat pattern's structure plays to MRU's strengths: each new miss evicts only the single most recently inserted block rather than disturbing a whole conflicting range, letting a large portion of the working set stay resident across repeats. This results in roughly half of all accesses hitting (49.5%), nearly five times the hit rate of Direct-Mapped on the same sequence.

### Comparison

Both cache organizations perform better on this test case than they did on pure sequential access: Direct-Mapped's hit rate rises from 0% to 10%, and Fully Associative MRU's rises from 25% to 49.5%. This makes sense given the structure of the accessing pattern which gives both organizations more opportunities to hit than a single sequential pass followed by one repeat. FSA MRU benefits far more from this added repetition, since it can protect a growing set of recently-used blocks from eviction, while Direct-Mapped's rigid mapping only briefly benefits (the one 64-hit window between the first and second pass through 0 to 127) before reverting to total thrashing for the rest of the sequence. This gap is reflected clearly in access time: Direct-Mapped's average memory access time (37.90 ns) is 74.7% higher than that of FSA MRU (21.69 ns) across the same 640 accesses, showing that FSA MRU's advantage over Direct-Mapped.

---

## Test Case 3 — Random Access

Each run consists of 64 randomly generated memory block accesses (range 0-1023). Because random sequences vary between runs, this test case was executed 10 times per cache organization and the averages of their results were taken.

### Direct-Mapped Cache

| Statistic                        | Value     |
| -------------------------------- | --------- |
| Total Memory Access Count        | 64        |
| Average Hit Count                | 1.2       |
| Average Miss Count               | 62.8      |
| Average Hit Rate                 | 1.89%     |
| Average Miss Rate                | 98.11%    |
| Average Memory Access Time       | 41.23 ns  |
| Average Total Memory Access Time | 2638.8 ns |

Across the 10 iterations, Direct-Mapped averaged 1.2 hits (1.89% hit rate). This result makes sense given the nature of random access: with 1024 possible memory blocks and only 64 accesses per run, the probability that any two accesses in a single run happen to reference the exact same block is low. Since a cache hit can only occur when a block is accessed more than once, most misses here are compulsory (cold) misses rather than conflict misses. That is the cache simply hasn't seen the block before, regardless of how well or poorly it maps to a line. The handful of hits that do occur come down to chance repeats within a given random run, which explains why the hit count fluctuates so much iteration to iteration.

### Fully Associative Cache (MRU)

| Statistic                        | Value      |
| -------------------------------- | ---------- |
| Total Memory Access Count        | 64         |
| Average Hit Count                | 1.8        |
| Average Miss Count               | 62.2       |
| Average Hit Rate                 | 2.82%      |
| Average Miss Rate                | 97.19%     |
| Average Memory Access Time       | 40.85 ns   |
| Average Total Memory Access Time | 2614.20 ns |

Fully Associative MRU performed only marginally better, averaging 1.8 hits (2.82% hit rate) across the same 10 iterations. The explanation is the same underlying cause discussed above: with 64 cache lines and only 64 accesses per run drawn from a much larger address space, the cache is rarely full enough, and blocks are rarely repeated often enough, for organization-specific behavior (conflict avoidance, MRU eviction) to matter much. Both organizations have ample capacity to hold every distinct block encountered in a run, so the small edge Fully Associative shows here is best attributed to it eliminating the possibility of conflict misses on the few repeated accesses that do occur and not to any meaningful advantage in retention strategy, since there's little repeated access for a retention strategy to act on in the first place.

### Comparison

Random access produced the lowest hit rates of all three test cases for both organizations, and the smallest gap between them (1.89% vs. 2.82%, compared to a 15-25 percentage point gap in the sequential and mid-repeat tests). This reflects a fundamentally different bottleneck: in Test Cases 1 and 2, misses were dominated by _conflict_ and _capacity_ pressure; patterns specifically constructed to stress each organization's placement and replacement strategy. In Test Case 3, misses are dominated by _compulsory_ misses driven by the sheer sparseness of the access pattern relative to the address space (64 accesses against 1024 possible blocks), a factor neither organization can do anything about. This is a useful contrast for evaluating cache architecture: Direct-Mapped's weaknesses (rigid aliasing) and Fully Associative MRU's strengths (flexible placement, conflict elimination) are only visible when the access pattern actually creates conflict or capacity pressure. Under a sparse random workload, both organizations converge toward similar, low performance, and the average memory access times reflect this (41.23 ns vs. 40.85 ns is a far narrower gap than the 42.00 ns vs. 31.75 ns seen in Test Case 1).

---

# Overall Comparison

| Feature                          | Direct-Mapped  | Fully Associative (MRU) |
| -------------------------------- | -------------- | ----------------------- |
| Block Placement                  | Fixed location | Any cache block         |
| Lookup Complexity                | Low            | Higher                  |
| Hardware Complexity              | Simple         | Complex                 |
| Conflict Misses                  | Higher         | Eliminated              |
| Replacement Policy               | None           | MRU                     |
| Observed Avg. Memory Access Time | Higher         | Lower                   |
| Flexibility                      | Lower          | Higher                  |

Across all three test cases, FSA MRU consistently achieved a higher hit rate and lower average memory access time than Direct-Mapped, with the size of that advantage tracking directly with how much conflict pressure each access pattern created: the gap was largest under Mid-Repeat access (49.5% vs. 10% hit rate), moderate under Sequential access (25% vs. 0%), and nearly negligible under Random access (3.6% vs. 2.35%), where most misses were compulsory rather than conflict-driven and neither organization's placement strategy had much opportunity to matter. This confirms the theoretical trade-off the two organizations are known for: Direct-Mapped's simplicity comes at the cost of conflict misses whenever multiple frequently-used blocks alias to the same line, while Fully Associative MRU's flexible placement eliminates that failure mode at the cost of higher lookup.

---

# Technology Stack

| Category   | Technology                 |
| ---------- | -------------------------- |
| Framework  | Svelte                     |
| Language   | TypeScript                 |
| Build Tool | Vite                       |
| Styling    | Tailwind CSS / Vanilla CSS |

---

# Project Structure

```
.
├── README.md
├── package.json
├── vite.config.ts
├── src/
│   ├── lib/
│   │   ├── cache/
│   │   │   ├── Cache.ts
│   │   │   ├── CacheBlock.ts
│   │   │   ├── DirectMapped.ts
│   │   │   └── FullyAssociative.ts
│   │   │
│   │   ├── policies/
│   │   │   └── MRU.ts
│   │   │
│   │   ├── generators/
│   │   │   ├── sequential.ts
│   │   │   ├── midRepeat.ts
│   │   │   └── random.ts
│   │   │
│   │   ├── statistics/
│   │   │   └── metrics.ts
│   │   │
│   │   └── simulator/
│   │       └── Simulator.ts
│   │
│   ├── components/
│   │   ├── CacheGrid.svelte
│   │   ├── StatisticsPanel.svelte
│   │   ├── TraceLog.svelte
│   │   ├── Controls.svelte
│   │   └── MemoryVisualizer.svelte
│   │
│   ├── routes/
│   │   └── +page.svelte
│   │
│   └── app.html
│
└── static/
```

---

# Future Improvements

- Add additional cache configurations:
    - Fully Associative LRU
    - 4-Way Set Associative
    - 8-Way Set Associative
- Add cache replacement policy comparison
- Export simulation reports
- Add graphical performance comparison
- Support custom user-defined memory sequences
- **Data Flow Visualization (Manim-style)**
    - Create `DataFlowVisualizer.svelte` component
    - Draw CPU, Cache (with lines), Main Memory as labeled regions
    - Animate data blocks traveling between components on each access
    - Show hit/miss visually (block reaches cache or bounces back)
    - Show eviction (old block leaves cache, new block enters)
    - Libraries needed: `fabric.js`, `GSAP`, or Canvas API
    - Complexity: ~300-500 lines

---

# Authors

Machine 8 — Cache Memory Simulator

**Group WDA** — Bantillo, Airon Matthew F. · Chavez, Max Benedict B. · Chiu, Kristopher Lance A. · Ponce, Jean Rondel R. · Santiago, Juan Ramon B.

Developed as part of the **Case Study 1**.
