# Direct-Mapped vs. Fully Associative Cache Memory Simulator (Machine 8)

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

## Test Case 1 — Sequential Access

### Direct-Mapped Cache

_Add analysis results here._

### Fully Associative Cache (MRU)

_Add analysis results here._

### Comparison

_Add comparison between Direct-Mapped and Fully Associative MRU._

---

## Test Case 2 — Mid-Repeat Access

### Direct-Mapped Cache

_Add analysis results here._

### Fully Associative Cache (MRU)

_Add analysis results here._

### Comparison

_Add comparison between Direct-Mapped and Fully Associative MRU._

---

## Test Case 3 — Random Access

### Direct-Mapped Cache

_Add analysis results here._

### Fully Associative Cache (MRU)

_Add analysis results here._

### Comparison

_Add comparison between Direct-Mapped and Fully Associative MRU._

---

# Overall Comparison

| Feature             | Direct-Mapped  | Fully Associative (MRU) |
| ------------------- | -------------- | ----------------------- |
| Block Placement     | Fixed location | Any cache block         |
| Lookup Complexity   | Low            | Higher                  |
| Hardware Complexity | Simple         | Complex                 |
| Conflict Misses     | Higher         | Eliminated              |
| Replacement Policy  | None           | MRU                     |
| Access Speed        | Faster         | Slower                  |
| Flexibility         | Lower          | Higher                  |

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

Developed as part of the **Case Study 1**.
