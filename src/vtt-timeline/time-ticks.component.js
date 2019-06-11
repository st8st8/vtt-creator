import * as React from 'react';
import * as PropTypes from 'prop-types';
import muiGreys from '@material-ui/core/colors/grey';
import { makeStyles, useTheme } from '@material-ui/styles';
import { useZoom } from './zoom-container.component';
import { formatSeconds } from '../services/vtt.service';

const useStyles = makeStyles({
	root: {
		display: 'flex',
	},
});

TimeTicks.propTypes = {
	svgSize: PropTypes.number,
	height: PropTypes.number,
};

TimeTicks.defaultProps = {
	svgSize: 5000,
	height: 20,
};

export default function TimeTicks({ height, svgSize }) {
	const classes = useStyles();
	// zoom is pixels/second
	const { zoom, zoomContainerRect } = useZoom();

	// keep svgs to a reasonable size
	const numSvgs = Math.floor(zoomContainerRect.width / svgSize);
	const numTicks = Math.ceil(svgSize / zoom);

	const svgs = [];
	let elapsedPixels = 0;

	for (let i = 0; i < numSvgs; i++) {
		const tickOffset = -(elapsedPixels % zoom);
		const startTickValue = numTicks * i;
		svgs.push(
			<SvgSegment
				key={i}
				width={svgSize}
				height={height}
				startTickValue={startTickValue}
				tickOffset={tickOffset}
				pixelsPerTick={zoom}
			/>
		);
		elapsedPixels += svgSize;
	}

	const lastSvgSize = zoomContainerRect.width % svgSize;

	if (lastSvgSize) {
		const tickOffset = -(elapsedPixels % zoom);
		const startTickValue = numTicks * numSvgs;
		svgs.push(
			<SvgSegment
				key="final"
				width={lastSvgSize}
				height={height}
				startTickValue={startTickValue}
				tickOffset={tickOffset}
				pixelsPerTick={zoom}
			/>
		);
	}

	return <div className={classes.root}>{svgs}</div>;
}

function SvgSegment({ width, height, startTickValue, tickOffset, pixelsPerTick, ...props }) {
	const theme = useTheme();
	// one tick per second, and add one so it overlaps with the starting tick of the next svg
	const numTicks = Math.ceil(width / pixelsPerTick) + 1;
	const ticks = [];

	for (let i = 0; i < numTicks; i++) {
		const x = tickOffset + i * pixelsPerTick;
		ticks.push(<Tick key={i} x={x} height={height} text={formatSeconds(i + startTickValue)} />);
	}

	return (
		<svg {...props} width={width} height={height} xmlns="http://www.w3.org/2000/svg">
			<rect width="100%" height="100%" fill={theme.palette.primary.main} />
			{ticks}
		</svg>
	);
}

Tick.propTypes = {
	x: PropTypes.number.isRequired,
	height: PropTypes.number,
	text: PropTypes.string,
	fontSize: PropTypes.number,
};

Tick.defaultProps = {
	height: 20,
	fontSize: 12,
};

function Tick({ x, height, text, fontSize }) {
	const textY = (height + fontSize) / 2;
	return (
		<React.Fragment>
			<line x1={x} x2={x} y1="0" y2={height} stroke={muiGreys[300]} strokeWidth="2" />
			<text x={x + 4} y={textY} fontSize={fontSize} textAnchor="start" fill="white">
				{text}
			</text>
		</React.Fragment>
	);
}
