interface SwirlProps {
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
	/** Reveal style */
	revealStyle?: 'interpolate' | 'scramble' | 'lock' | 'none';
	/** Lock chance (for reveal style 0-1) */
	lockChance?: number;
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
	/** Lerp function */
	lerp?: (a: number, b: number, t: number) => number;
	/** Clamp function */
	clamp?: (val: number, min: number, max: number) => number;
	/** Ease function */
	easeInOutCirc?: (x: number) => number;
}

export {
	type SwirlProps
}