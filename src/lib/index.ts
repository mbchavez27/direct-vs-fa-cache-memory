// place files you want to import through the `$lib` alias in this folder.

// ONLY FOR TESTING... TO BE DELETED LATER
import { CacheSimulator } from "./simulator/CacheSimulator";

const cacheSimulator = new CacheSimulator("Fully-Associative-MRU", {
    blockSizeWords: 2,
    cacheBlockCount: 4,
    mainMemoryBlockCount: 1024,
    readPolicy: "non-load-through",
    cacheAccessTimeNs: 1,
    memoryAccessTimeNs: 10,
});

cacheSimulator.loadSequence([1, 17, 2, 1023, 3, 19, 1, 1]);
cacheSimulator.runToEnd();
console.log(cacheSimulator.getCurrentSnapshot());
console.log(cacheSimulator.getSimulationResult());
