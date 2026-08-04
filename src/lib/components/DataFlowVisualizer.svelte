<script lang="ts">
	import { onMount } from 'svelte';
	import type { CacheLine, TraceEntry, CacheConfig } from '$lib/cache/types';

	let { trace, cacheLines, config, label = 'Direct-Mapped', playbackSpeed = 500 }: {
		trace: TraceEntry | null;
		cacheLines: CacheLine[];
		config: CacheConfig;
		label?: string;
		playbackSpeed?: number;
	} = $props();

	// At fast speeds (<300ms), skip GSAP animations entirely for instant feedback
	const skipAnimations = $derived(playbackSpeed < 300);

	// Respect user's prefers-reduced-motion setting
	let prefersReducedMotion = $state(false);

	let svgEl: SVGSVGElement | undefined = $state(undefined);
	let layerEl: SVGGElement | undefined = $state(undefined);
	let timeline: ReturnType<typeof import('gsap').gsap.timeline> | null = null;
	let gsap: typeof import('gsap').gsap | null = null;

	const SVG_WIDTH = 900;
	const MIN_LINE_HEIGHT = 34;
	const CACHE_TOP_PADDING = 150;
	const CACHE_BOTTOM_PADDING = 100;

	const cacheBlockCount = $derived(config.cacheBlockCount);
	const lineHeight = $derived(MIN_LINE_HEIGHT);
	const CACHE = $derived({
		x: 380,
		y: CACHE_TOP_PADDING,
		w: 200,
		h: cacheBlockCount * lineHeight + 30
	});
	const SVG_HEIGHT = $derived(CACHE_TOP_PADDING + CACHE.h + CACHE_BOTTOM_PADDING);

	const CPU = $derived({ x: 50, y: CACHE.y + CACHE.h / 2 - 40, w: 130, h: 80 });
	const MEMORY = $derived({ x: 740, y: CACHE.y + CACHE.h / 2 - 40, w: 130, h: 80 });

	const cacheLinesY = $derived(
		Array.from({ length: cacheBlockCount }, (_, i) =>
			CACHE.y + 15 + i * lineHeight + lineHeight / 2
		)
	);

	onMount(async () => {
		const gsapModule = await import('gsap');
		const { MotionPathPlugin } = await import('gsap/MotionPathPlugin');
		gsapModule.default.registerPlugin(MotionPathPlugin);
		gsap = gsapModule.default;

		const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
		prefersReducedMotion = mql.matches;
		mql.addEventListener('change', (e) => { prefersReducedMotion = e.matches; });
	});

	function getCacheLineY(lineIndex: number): number {
		if (lineIndex >= 0 && lineIndex < cacheLinesY.length) {
			return cacheLinesY[lineIndex];
		}
		return CACHE.y + CACHE.h / 2;
	}

	function getMemoryCenter(): { x: number; y: number } {
		return { x: MEMORY.x + MEMORY.w / 2, y: MEMORY.y + MEMORY.h / 2 };
	}

	function getCacheEntryPoint(lineIndex: number): { x: number; y: number } {
		return { x: CACHE.x, y: getCacheLineY(lineIndex) };
	}

	function getCacheExitPoint(lineIndex: number): { x: number; y: number } {
		return { x: CACHE.x, y: getCacheLineY(lineIndex) };
	}

	function createBlock(x: number, y: number, value: number, color: string): SVGGElement {
		const ns = 'http://www.w3.org/2000/svg';
		const g = document.createElementNS(ns, 'g');

		const rect = document.createElementNS(ns, 'rect');
		rect.setAttribute('x', String(x - 28));
		rect.setAttribute('y', String(y - 17));
		rect.setAttribute('width', '56');
		rect.setAttribute('height', '34');
		rect.setAttribute('rx', '7');
		rect.setAttribute('fill', color);
		rect.setAttribute('stroke', '#374151');
		rect.setAttribute('stroke-width', '2');
		rect.setAttribute('filter', 'url(#block-glow)');
		g.appendChild(rect);

		const text = document.createElementNS(ns, 'text');
		text.setAttribute('x', String(x));
		text.setAttribute('y', String(y + 5));
		text.setAttribute('text-anchor', 'middle');
		text.setAttribute('font-size', '14');
		text.setAttribute('font-family', 'monospace');
		text.setAttribute('font-weight', 'bold');
		text.setAttribute('fill', '#1f2937');
		text.textContent = String(value);
		g.appendChild(text);

		return g;
	}

	function removeElement(el: Element | null) {
		if (el && el.parentNode) {
			el.parentNode.removeChild(el);
		}
	}

	function getLayer(): SVGGElement | null {
		return layerEl ?? null;
	}

	function cleanupAll() {
		const layer = getLayer();
		if (layer) {
			while (layer.firstChild) {
				layer.removeChild(layer.firstChild);
			}
		}
	}

	function getCPURightEdge(): { x: number; y: number } {
		return { x: CPU.x + CPU.w, y: CPU.y + CPU.h / 2 };
	}

	function createPulse(fromX: number, fromY: number, toX: number, toY: number): SVGLineElement {
		const ns = 'http://www.w3.org/2000/svg';
		const line = document.createElementNS(ns, 'line');
		line.setAttribute('x1', String(fromX));
		line.setAttribute('y1', String(fromY));
		line.setAttribute('x2', String(fromX));
		line.setAttribute('y2', String(fromY));
		line.setAttribute('stroke', '#3b82f6');
		line.setAttribute('stroke-width', '3');
		line.setAttribute('stroke-linecap', 'round');
		line.setAttribute('opacity', '0.9');
		return line;
	}

	function createTrail(x: number, y: number): SVGLineElement {
		const ns = 'http://www.w3.org/2000/svg';
		const line = document.createElementNS(ns, 'line');
		line.setAttribute('x1', String(x));
		line.setAttribute('y1', String(y));
		line.setAttribute('x2', String(x));
		line.setAttribute('y2', String(y));
		line.setAttribute('stroke', '#93c5fd');
		line.setAttribute('stroke-width', '3');
		line.setAttribute('stroke-linecap', 'round');
		line.setAttribute('opacity', '0.6');
		return line;
	}

	function flashCacheLine(lineIndex: number, color: string) {
		const layer = getLayer();
		if (!gsap || !layer || lineIndex < 0 || lineIndex >= cacheLinesY.length) return;

		const ns = 'http://www.w3.org/2000/svg';
		const y = cacheLinesY[lineIndex];
		const rect = document.createElementNS(ns, 'rect');
		rect.setAttribute('x', String(CACHE.x + 10));
		rect.setAttribute('y', String(y - lineHeight / 2 + 2));
		rect.setAttribute('width', String(CACHE.w - 20));
		rect.setAttribute('height', String(lineHeight - 4));
		rect.setAttribute('rx', '4');
		rect.setAttribute('fill', color);
		rect.setAttribute('opacity', '0.8');
		layer.appendChild(rect);

		gsap.fromTo(rect,
			{ opacity: 0.8, scale: 1, transformOrigin: 'center center' },
			{ opacity: 0, scale: 1.15, duration: 0.6, ease: 'power2.out', onComplete: () => removeElement(rect) }
		);
	}

	// Show status label, optionally with GSAP fade-in animation
	function showStatus(text: string, color: string, animate = true) {
		const layer = getLayer();
		if (!layer) return null;

		const ns = 'http://www.w3.org/2000/svg';
		const g = document.createElementNS(ns, 'g');

		const boxW = 180;
		const boxH = 44;
		const boxX = CACHE.x + CACHE.w / 2 - boxW / 2;
		const boxY = CACHE.y - 80;

		const bg = document.createElementNS(ns, 'rect');
		bg.setAttribute('x', String(boxX));
		bg.setAttribute('y', String(boxY));
		bg.setAttribute('width', String(boxW));
		bg.setAttribute('height', String(boxH));
		bg.setAttribute('rx', '10');
		bg.setAttribute('fill', 'white');
		bg.setAttribute('stroke', color);
		bg.setAttribute('stroke-width', '3');
		g.appendChild(bg);

		const textEl = document.createElementNS(ns, 'text');
		textEl.setAttribute('x', String(boxX + boxW / 2));
		textEl.setAttribute('y', String(boxY + boxH / 2 + 7));
		textEl.setAttribute('text-anchor', 'middle');
		textEl.setAttribute('font-size', '22');
		textEl.setAttribute('font-weight', 'bold');
		textEl.setAttribute('font-family', 'monospace');
		textEl.setAttribute('fill', color);
		textEl.textContent = text;
		g.appendChild(textEl);

		layer.appendChild(g);

		if (animate && gsap) {
			gsap.fromTo(g,
				{ opacity: 0, y: -10 },
				{ opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
			);
		}

		return g;
	}

	// Show two status labels side by side (e.g., EVICT → MISS)
	function showDualStatus(text1: string, color1: string, text2: string, color2: string) {
		const layer = getLayer();
		if (!layer) return;

		const ns = 'http://www.w3.org/2000/svg';
		const g = document.createElementNS(ns, 'g');

		const boxW = 260;
		const boxH = 44;
		const boxX = CACHE.x + CACHE.w / 2 - boxW / 2;
		const boxY = CACHE.y - 80;

		const bg = document.createElementNS(ns, 'rect');
		bg.setAttribute('x', String(boxX));
		bg.setAttribute('y', String(boxY));
		bg.setAttribute('width', String(boxW));
		bg.setAttribute('height', String(boxH));
		bg.setAttribute('rx', '10');
		bg.setAttribute('fill', 'white');
		bg.setAttribute('stroke', color1);
		bg.setAttribute('stroke-width', '3');
		g.appendChild(bg);

		// First label (EVICT)
		const text1El = document.createElementNS(ns, 'text');
		text1El.setAttribute('x', String(boxX + 60));
		text1El.setAttribute('y', String(boxY + boxH / 2 + 7));
		text1El.setAttribute('text-anchor', 'middle');
		text1El.setAttribute('font-size', '20');
		text1El.setAttribute('font-weight', 'bold');
		text1El.setAttribute('font-family', 'monospace');
		text1El.setAttribute('fill', color1);
		text1El.textContent = text1;
		g.appendChild(text1El);

		// Arrow
		const arrow = document.createElementNS(ns, 'text');
		arrow.setAttribute('x', String(boxX + boxW / 2));
		arrow.setAttribute('y', String(boxY + boxH / 2 + 7));
		arrow.setAttribute('text-anchor', 'middle');
		arrow.setAttribute('font-size', '18');
		arrow.setAttribute('font-weight', 'bold');
		arrow.setAttribute('font-family', 'monospace');
		arrow.setAttribute('fill', '#6b7280');
		arrow.textContent = '→';
		g.appendChild(arrow);

		// Second label (MISS)
		const text2El = document.createElementNS(ns, 'text');
		text2El.setAttribute('x', String(boxX + boxW - 60));
		text2El.setAttribute('y', String(boxY + boxH / 2 + 7));
		text2El.setAttribute('text-anchor', 'middle');
		text2El.setAttribute('font-size', '20');
		text2El.setAttribute('font-weight', 'bold');
		text2El.setAttribute('font-family', 'monospace');
		text2El.setAttribute('fill', color2);
		text2El.textContent = text2;
		g.appendChild(text2El);

		layer.appendChild(g);
	}

function animateHit(entry: TraceEntry) {
    const layer = getLayer();
    if (!gsap || !layer || !entry.isHit) return;

    const cpu = getCPURightEdge();
    const cachePt = getCacheEntryPoint(entry.cacheLineIndex);

    const pulse = createPulse(cpu.x, cpu.y, cachePt.x, cachePt.y);
    layer.appendChild(pulse);

    timeline = gsap.timeline();
    timeline
        .to(pulse, { attr: { x2: cachePt.x, y2: cachePt.y }, opacity: 0.3, duration: 0.2, ease: 'power2.out' })
        .call(() => removeElement(pulse))
        .call(() => flashCacheLine(entry.cacheLineIndex, '#86efac'))
        .call(() => { showStatus('HIT', '#16a34a'); }, undefined, '+=0.1');

    const mem = getMemoryCenter();
    const block = createBlock(mem.x, mem.y, entry.memoryBlock, '#bbf7d0');
    layer.appendChild(block);

    const pathD = `M${mem.x},${mem.y} C${(mem.x + cachePt.x) / 2},${mem.y - 60} ${(mem.x + cachePt.x) / 2},${cachePt.y + 60} ${cachePt.x},${cachePt.y}`;

    const trail = createTrail(mem.x, mem.y);
    layer.appendChild(trail);

	timeline
		.fromTo(block, { opacity: 0, scale: 0.3, transformOrigin: 'center center' }, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(1.7)' })
		.to(trail, { attr: { x2: cachePt.x, y2: cachePt.y }, opacity: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.05')
		.to(block, {
			motionPath: { path: pathD, align: pathD, alignOrigin: [0.5, 0.5] },
			duration: 0.5,
			ease: 'power3.inOut'
		}, '-=0.5')
		.call(() => {
			flashCacheLine(entry.cacheLineIndex, '#22c55e');
			removeElement(trail);
		})
		.to(block, { scale: 1.15, duration: 0.1, ease: 'power2.out', transformOrigin: 'center center' })
		.to(block, { scale: 1, duration: 0.1, ease: 'power2.in', transformOrigin: 'center center' })
		.to(block, { opacity: 0, duration: 0.25, ease: 'power2.in' })
		.call(() => {
			removeElement(block);
		});
}

	function animateMissEmpty(entry: TraceEntry) {
		const layer = getLayer();
		if (!gsap || !layer) return;

		const cpu = getCPURightEdge();
		const cachePt = getCacheEntryPoint(entry.cacheLineIndex);

		const pulse = createPulse(cpu.x, cpu.y, cachePt.x, cachePt.y);
		layer.appendChild(pulse);

		timeline = gsap.timeline();
		timeline
			.to(pulse, { attr: { x2: cachePt.x, y2: cachePt.y }, opacity: 0.3, duration: 0.2, ease: 'power2.out' })
			.call(() => removeElement(pulse))
			.call(() => { showStatus('MISS', '#dc2626'); }, undefined, '+=0.1');

		const mem = getMemoryCenter();
		const block = createBlock(mem.x, mem.y, entry.memoryBlock, '#fecaca');
		layer.appendChild(block);

		const pathD = `M${mem.x},${mem.y} C${(mem.x + cachePt.x) / 2},${mem.y - 60} ${(mem.x + cachePt.x) / 2},${cachePt.y + 60} ${cachePt.x},${cachePt.y}`;

		const trail = createTrail(mem.x, mem.y);
		layer.appendChild(trail);

		timeline
			.fromTo(block, { opacity: 0, scale: 0.3, transformOrigin: 'center center' }, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(1.7)' })
			.to(trail, { attr: { x2: cachePt.x, y2: cachePt.y }, opacity: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.05')
			.to(block, {
				motionPath: { path: pathD, align: pathD, alignOrigin: [0.5, 0.5] },
				duration: 0.5,
				ease: 'power3.inOut'
			}, '-=0.5')
			.call(() => {
				flashCacheLine(entry.cacheLineIndex, '#ef4444');
				removeElement(trail);
			})
			.to(block, { scale: 1.15, duration: 0.1, ease: 'power2.out', transformOrigin: 'center center' })
			.to(block, { scale: 1, duration: 0.1, ease: 'power2.in', transformOrigin: 'center center' })
			.to(block, { opacity: 0, duration: 0.25, ease: 'power2.in' })
			.call(() => {
				removeElement(block);
			});
	}

	function animateMissEviction(entry: TraceEntry) {
		const layer = getLayer();
		if (!gsap || !layer) return;

		const cpu = getCPURightEdge();
		const cachePt = getCacheEntryPoint(entry.cacheLineIndex);

		const pulse = createPulse(cpu.x, cpu.y, cachePt.x, cachePt.y);
		layer.appendChild(pulse);

		timeline = gsap.timeline();
		// Show combined EVICT → MISS label from the start
		timeline
			.to(pulse, { attr: { x2: cachePt.x, y2: cachePt.y }, opacity: 0.3, duration: 0.2, ease: 'power2.out' })
			.call(() => removeElement(pulse))
			.call(() => { showDualStatus('EVICT', '#d97706', 'MISS', '#dc2626'); });

		const exitPt = getCacheExitPoint(entry.cacheLineIndex);
		const oldBlock = createBlock(exitPt.x - 50, exitPt.y, entry.evictedBlock!, '#fde68a');
		layer.appendChild(oldBlock);

		const flyOutY = exitPt.y - 120;

		timeline
			.to(oldBlock, { y: flyOutY, x: exitPt.x - 100, opacity: 0, scale: 0.5, duration: 0.4, ease: 'power2.in', transformOrigin: 'center center' })
			.call(() => removeElement(oldBlock));

		const mem = getMemoryCenter();
		const newBlock = createBlock(mem.x, mem.y, entry.memoryBlock, '#fecaca');
		layer.appendChild(newBlock);

		const pathD = `M${mem.x},${mem.y} C${(mem.x + cachePt.x) / 2},${mem.y - 60} ${(mem.x + cachePt.x) / 2},${cachePt.y + 60} ${cachePt.x},${cachePt.y}`;

		const trail = createTrail(mem.x, mem.y);
		layer.appendChild(trail);

		timeline
			.fromTo(newBlock, { opacity: 0, scale: 0.3, transformOrigin: 'center center' }, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(1.7)' })
			.to(trail, { attr: { x2: cachePt.x, y2: cachePt.y }, opacity: 0, duration: 0.5, ease: 'power2.inOut' }, '-=0.05')
			.to(newBlock, {
				motionPath: { path: pathD, align: pathD, alignOrigin: [0.5, 0.5] },
				duration: 0.5,
				ease: 'power3.inOut'
			}, '-=0.5')
			.call(() => {
				flashCacheLine(entry.cacheLineIndex, '#f59e0b');
				removeElement(trail);
			})
			.to(newBlock, { scale: 1.15, duration: 0.1, ease: 'power2.out', transformOrigin: 'center center' })
			.to(newBlock, { scale: 1, duration: 0.1, ease: 'power2.in', transformOrigin: 'center center' })
			.to(newBlock, { opacity: 0, duration: 0.25, ease: 'power2.in' })
			.call(() => {
				removeElement(newBlock);
			});
	}

	function playAnimation(entry: TraceEntry) {
		if (timeline) {
			timeline.kill();
		}
		cleanupAll();

		// At fast speeds or reduced motion preference, skip GSAP animations
		if (skipAnimations || prefersReducedMotion) {
			if (entry.isHit) {
				showStatus('HIT', '#16a34a', false);
				flashCacheLine(entry.cacheLineIndex, '#22c55e');
			} else if (entry.evictedBlock !== null) {
				// Show combined EVICT → MISS label for evictions
				showDualStatus('EVICT', '#d97706', 'MISS', '#dc2626');
				flashCacheLine(entry.cacheLineIndex, '#f59e0b');
			} else {
				showStatus('MISS', '#dc2626', false);
				flashCacheLine(entry.cacheLineIndex, '#ef4444');
			}
			return;
		}

		if (entry.isHit) {
			animateHit(entry);
		} else if (entry.evictedBlock !== null) {
			animateMissEviction(entry);
		} else {
			animateMissEmpty(entry);
		}
	}

	$effect(() => {
		const currentTrace = trace;
		if (currentTrace && svgEl) {
			playAnimation(currentTrace);
		}
	});

	$effect(() => {
		if (trace === null) {
			if (timeline) {
				timeline.kill();
				timeline = null;
			}
			cleanupAll();
		}
	});
</script>

<div class="bg-white rounded-lg border border-gray-200 p-4 overflow-y-auto max-h-[600px]">
	<h3 class="text-base font-bold text-gray-800 uppercase tracking-wide mb-3">{label} — Data Flow</h3>

	<svg
		bind:this={svgEl}
		viewBox="0 -10 {SVG_WIDTH} {SVG_HEIGHT + 10}"
		class="w-full h-auto"
	>
		<defs>
			<filter id="block-glow" x="-50%" y="-50%" width="200%" height="200%">
				<feGaussianBlur stdDeviation="3" result="blur" />
				<feComposite in="SourceGraphic" in2="blur" operator="over" />
			</filter>
		</defs>

		<g bind:this={layerEl}></g>

		<!-- CPU Box -->
		<rect x={CPU.x} y={CPU.y} width={CPU.w} height={CPU.h} rx="10" fill="#dbeafe" stroke="#3b82f6" stroke-width="2.5" />
		<text x={CPU.x + CPU.w / 2} y={CPU.y + CPU.h / 2 + 5} text-anchor="middle" font-size="18" font-weight="bold" fill="#1e40af">CPU</text>

		<!-- Cache Box -->
		<rect x={CACHE.x} y={CACHE.y} width={CACHE.w} height={CACHE.h} rx="10" fill="#f0fdf4" stroke="#22c55e" stroke-width="2.5" />
		<text x={CACHE.x + CACHE.w / 2} y={CACHE.y - 110} text-anchor="middle" font-size="18" font-weight="bold" fill="#166534">Cache ({cacheBlockCount} lines)</text>

		<!-- Cache Lines -->
		{#each cacheLines as line, i}
			{#if i < cacheLinesY.length}
				{@const y = cacheLinesY[i]}
				<rect
					x={CACHE.x + 10}
					y={y - lineHeight / 2 + 2}
					width={CACHE.w - 20}
					height={lineHeight - 4}
					rx="4"
					fill={line.valid ? '#dcfce7' : '#f9fafb'}
					stroke={line.valid ? '#86efac' : '#e5e7eb'}
					stroke-width="1.5"
				/>
				<text x={CACHE.x + 18} y={y + 4} font-size="12" fill="#6b7280">L{line.lineIndex}</text>
				<text x={CACHE.x + 48} y={y + 4} font-size="12" font-family="monospace" fill={line.valid ? '#166534' : '#9ca3af'}>
					{line.valid ? `Blk ${line.memoryBlock}` : 'empty'}
				</text>
			{/if}
		{/each}

		<!-- Memory Box -->
		<rect x={MEMORY.x} y={MEMORY.y} width={MEMORY.w} height={MEMORY.h} rx="10" fill="#fef3c7" stroke="#f59e0b" stroke-width="2.5" />
		<text x={MEMORY.x + MEMORY.w / 2} y={MEMORY.y + MEMORY.h / 2 - 6} text-anchor="middle" font-size="16" font-weight="bold" fill="#92400e">Memory</text>
		<text x={MEMORY.x + MEMORY.w / 2} y={MEMORY.y + MEMORY.h / 2 + 12} text-anchor="middle" font-size="13" fill="#a16207">{config.mainMemoryBlockCount} blocks</text>

		<!-- Legend -->
		<g transform="translate(20, {SVG_HEIGHT - 90})">
			<rect x="0" y="0" width="220" height="85" rx="8" fill="#f9fafb" stroke="#e5e7eb" stroke-width="1.5" />
			<text x="12" y="20" font-size="11" font-weight="bold" fill="#374151">Legend</text>
			<rect x="12" y="28" width="14" height="14" rx="3" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5" />
			<text x="32" y="40" font-size="10" fill="#374151">Cache Hit</text>
			<rect x="12" y="48" width="14" height="14" rx="3" fill="#fecaca" stroke="#ef4444" stroke-width="1.5" />
			<text x="32" y="60" font-size="10" fill="#374151">Cache Miss</text>
			<rect x="12" y="68" width="14" height="14" rx="3" fill="#fde68a" stroke="#f59e0b" stroke-width="1.5" />
			<text x="32" y="80" font-size="10" fill="#374151">Eviction (MRU)</text>
		</g>

		<!-- Step Indicator -->
		{#if trace}
			<g transform="translate({SVG_WIDTH - 120}, {SVG_HEIGHT - 35})">
				<rect x="0" y="0" width="110" height="26" rx="6" fill="#f3f4f6" stroke="#d1d5db" stroke-width="1.5" />
				<text x="55" y="18" text-anchor="middle" font-size="11" font-family="monospace" fill="#6b7280">
					Step {trace.step + 1}
				</text>
			</g>
		{/if}
	</svg>
</div>
