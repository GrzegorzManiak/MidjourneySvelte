<script lang="ts">
	import {onDestroy} from 'svelte';
	import {cn} from "$lib/utils";

	const defaultSourceLines = Array.from({ length: 30 }, (_, i) =>
		Math.random().toString(36).substring(2).padEnd(80, 'abcdefghijklmnopqrstuvwxyz0123456789').repeat(2).slice(0, 80 + (i % 10))
	);

	let {
		logoCharacterGrid = [' Logo ' ],
        logoTopRow = -1,
        logoLeftCol = -1,
        sourceTextLines = defaultSourceLines,
        scrambleSourceSet = '!_+{}":<>M?][p][\'\;l\'/,abcdefghijklmnopqrstuvwxyz0123456789     ',
        interpolate = false,
        fillWhiteSpace = true,
        numRows = 100,
        maxColumns = 150,
        fontSize = 14,
        lineHeight = '1.2',
        fillColor = 'rgba(0, 255, 0, 0.8)',
        frameThrottleMs = 42,
        revealDelaySec = 1.0,
        revealDurationSec = 2.0,
        style = '',
	}: {
        /** 2D array representing the target logo characters */
        logoCharacterGrid?: string[];
        /** Y-coordinate (row index) of the logo's top edge */
        logoTopRow?: number;
        /** X-coordinate (column index) of the logo's left edge */
        logoLeftCol?: number;
        /** Array of strings used as the source for scrambling characters */
        sourceTextLines?: string[];
		/** Scramble text set to display */
		scrambleSourceSet?: string;
        /** Interpolate between characters */
        interpolate?: boolean;
		/** Fill blanks with spiral */
		fillWhiteSpace?: boolean;
        /** Total number of rows to display */
        numRows?: number;
        /** Maximum character width of a line (columns) */
        maxColumns?: number;
        /** Font size for calculating positioning */
        fontSize?: number;
        /** Line height factor (e.g., 1.2) or fixed pixel value */
        lineHeight?: number | string;
        /** Fill color for the text */
        fillColor?: string;
        /** Throttle frame updates (milliseconds) */
        frameThrottleMs?: number;
        /** Delay before logo reveal starts (seconds) */
        revealDelaySec?: number;
        /** Duration of the logo reveal animation (seconds) */
        revealDurationSec?: number;
        /** Additional styles for the SVG Parent element */
        style?: string;
	} = $props();

	// - Calculate center logo position if not provided
	if (logoTopRow < 0 || logoTopRow < 0) {
        const logoHeight = logoCharacterGrid.length;
        const logoWidth = logoCharacterGrid[0]?.length ?? 0;
        logoTopRow = Math.floor((numRows - logoHeight) / 2);
        logoLeftCol = Math.floor((maxColumns - logoWidth) / 2);
    }

	// - State for background text lines abd logo text lines (text content and opacity)
	let allTextLines = $state<string[]>(Array(numRows).fill(''));

	// --- Constants and Derived Values ---
	const numSourceRows = sourceTextLines.length;
	const logoHeight = logoCharacterGrid.length;
	const logoWidth = logoCharacterGrid[0]?.length ?? 0;
	const lineHeightPx = (() => {
		if (typeof lineHeight === 'number') return fontSize * lineHeight;
		if (lineHeight.endsWith('px')) return parseFloat(lineHeight);
        return fontSize * (parseFloat(lineHeight) || 1.2);
	})();

	// --- Helper Functions ---
	const lerp = (a: number, b: number, t: number): number => a * (1 - t) + b * t;
	const clamp = (val: number, min: number, max: number): number => Math.max(min, Math.min(val, max));
	const easeInOutCirc = (x: number): number => {
		return x < 0.5
			? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
			: (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
	};

	// --- Animation Effect ---
	$effect(() => {
		let animationFrameId: number | null = null;
		let animationStartTime: number | null = null;
		let lastFrameTime: number | null = null;
		let isVisible = true;
		let fullyScrambled = false;

		const handleVisibilityChange = () => {
			isVisible = document.visibilityState === 'visible';
			if (!isVisible) lastFrameTime = null;
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);

		const animate = (currentTimeMillis: number) => {
			animationFrameId = requestAnimationFrame(animate);

			// - Initialize animation start time
			if (!animationStartTime) animationStartTime = currentTimeMillis * 0.001;
			if (!lastFrameTime) lastFrameTime = currentTimeMillis;

			// - Throttle frame updates
			if (!isVisible || currentTimeMillis - lastFrameTime < frameThrottleMs) return;
			lastFrameTime = currentTimeMillis;
			const elapsedSeconds = currentTimeMillis * 0.001 - animationStartTime;

			// - Calculate reveal progress (0 to 1)
			const rawProgress = (elapsedSeconds - revealDelaySec) / revealDurationSec;
			const clampedProgress = clamp(rawProgress, 0, 1);
			const revealProgress = easeInOutCirc(clampedProgress);

			// - Create temporary arrays to batch updates
			const nextAllTextLines: string[] = [];

			for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
				let currentLineOutput = '';
				let currentLogoLineOutput = ''; // Only used if this row is part of the logo area

				for (let columnIndex = 0; columnIndex < maxColumns; columnIndex++) {
					// --- Coordinate Transformation ---
					const normalizedRow = 1 - (2 * rowIndex) / numRows;
					const normalizedCol = (2 * columnIndex) / maxColumns - 1;

					const distanceFromCenter = Math.sqrt(normalizedCol * normalizedCol + normalizedRow * normalizedRow);
					const rotationAngle = 0.1 * elapsedSeconds / Math.max(0.1, distanceFromCenter);

					const sinAngle = Math.sin(rotationAngle);
					const cosAngle = Math.cos(rotationAngle);

					const transformedX = normalizedCol * cosAngle + normalizedRow * sinAngle;
					const transformedY = -normalizedCol * sinAngle + normalizedRow * cosAngle;

					const sourceColIndex = Math.round(((transformedX + 1) / 2) * maxColumns);
					const sourceRowIndex = Math.round(((transformedY + 1) / 2) * numSourceRows) % numSourceRows;

					// --- Fetch Scrambled Character ---
					let scrambledChar = ' ';
					if (sourceRowIndex >= 0 &&
                        sourceRowIndex < numSourceRows &&
                        sourceColIndex >= 0 && sourceColIndex < maxColumns &&
                        sourceTextLines[sourceRowIndex]) scrambledChar = sourceTextLines[sourceRowIndex][sourceColIndex] || ' ';

					// --- Logo Area Logic ---
					const isInsideLogoY = rowIndex > logoTopRow && rowIndex <= logoTopRow + logoHeight;
					const isInsideLogoX = columnIndex > logoLeftCol && columnIndex <= logoLeftCol + logoWidth;

					if (!isInsideLogoY || !isInsideLogoX) {
						currentLineOutput += scrambledChar;
						continue;
					}

					const logoRelativeRow = rowIndex - logoTopRow - 1;
					const logoRelativeCol = columnIndex - logoLeftCol - 1;

					if (
						logoRelativeRow < 0 ||
						logoRelativeRow >= logoHeight ||
						logoRelativeCol < 0 ||
						logoRelativeCol >= logoWidth
					) {
						currentLineOutput += scrambledChar;
						continue;
					}

					if (!fullyScrambled) {
						const targetLogoChar = logoCharacterGrid[logoRelativeRow]?.[logoRelativeCol] || ' ';
						const hasLeftNeighbor = logoRelativeCol > 0 && logoCharacterGrid[logoRelativeRow][logoRelativeCol - 1] !== ' ';
						const hasRightNeighbor = logoRelativeCol < logoWidth - 1 && logoCharacterGrid[logoRelativeRow][logoRelativeCol + 1] !== ' ';

						if (targetLogoChar === ' ' || !hasLeftNeighbor || !hasRightNeighbor) {
							const interpolatedChar = interpolate ? String.fromCharCode(Math.round(lerp(
								scrambledChar.charCodeAt(0),
								targetLogoChar.charCodeAt(0),
								revealProgress
							))) : scrambleSourceSet[Math.floor(Math.random() * scrambleSourceSet.length)];

							// - Update background character based on reveal completion
							if (revealProgress > 0.98) { scrambledChar = ' '; fullyScrambled = true; }
							else scrambledChar = interpolatedChar;
						}
					}

					// - Add the logo character to the output, blank if no character
					else if (!fillWhiteSpace) {
						scrambledChar = logoCharacterGrid[logoRelativeRow]?.[logoRelativeCol] || ' ';
                    }

					// - Instead of blank char, pass the spiral character
					else {
						const tempChar = logoCharacterGrid[logoRelativeRow]?.[logoRelativeCol] || ' ';
						if (tempChar !== ' ') scrambledChar = tempChar;
					}

					currentLineOutput += scrambledChar;
				} // - End Column Loop

                // - Update the state for this specific line
				nextAllTextLines.push(currentLineOutput);

			} // - End Row Loop

			// - Update the state variable, Svelte handles DOM diffing
			allTextLines = nextAllTextLines;

		}; // - End animate function

		// - Start the animation
		animationFrameId = requestAnimationFrame(animate);

		// - Return a cleanup function
        return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	});

	onDestroy(() => {
	});
</script>

<div class={cn(style, "flex justify-center items-center")}>
    <svg
            width={maxColumns * fontSize * 0.6} height={numRows * lineHeightPx}
            font-family="monospace"
            font-size={fontSize}
            fill={fillColor}
    >
        {#each allTextLines as line, i}
            <text x="0" y={(i + 1) * lineHeightPx} dominant-baseline="auto">
                {line}
            </text>
        {/each}

    </svg>
</div>

<style>
    /* Optional: Add specific styles here if needed */
    svg {
        display: block; /* Prevents extra space below */
    }
    /* Ensure consistent width */
    text {
        white-space: pre;
    }
</style>