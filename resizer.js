const { clamp, zip } = require('lodash');
const sharp = require('sharp');


const blowOut = async (image, width, finalWidth) => {
	if (width === finalWidth) {
		return image;
	}
	
	const small = await image.resize({
		width: Math.round(width),
		kernel: 'nearest'
	}).toBuffer();

	return sharp(small).resize({
		width: finalWidth,
		kernel: 'nearest'
	});
};

const BACKGROUND_SIZE = 8;
const STEPS = 5;

const fibonacci = num => {
	let a = 1;
	let b = 0
	let temp;
  
	while (num >= 0){
	  temp = a;
	  a = a + b;
	  b = temp;
	  num--;
	}
  
	return b;
}

const TOTAL_FIBONACCI_STEPS = fibonacci(STEPS);

const extractRegion = async (highlight, originalImage) => {
	const { index, originalWidth, left, height, width, top } = highlight;
	const extract = await originalImage.clone().extract(highlight).toBuffer();

	const chunkSize = (originalWidth - BACKGROUND_SIZE) / TOTAL_FIBONACCI_STEPS;
	const shrinkWidth = index == STEPS ? width : fibonacci(index) * chunkSize;

	const crop = await blowOut(sharp(extract), shrinkWidth, width);

	console.log(`From (${top}, ${left}), spanning ${width}w ${height}h, to (${top + height}, ${left + width})`)
	return {
		left,
		top,
		input: await crop.toBuffer(),
	}
}

const createStaggeredHighlights = (imageWidth, imageHeight, { width, height, left, top }) => {
	return Array(STEPS).fill(1).map((_, index) => {
		const newWidth = width + (width / STEPS * fibonacci(index));
		const newHeight = height + (height / STEPS * fibonacci(index));

		const newLeft = left - ((newWidth - width) / 2);
		const newTop = top - ((newHeight - height) / 2);

		const boundedLeft = Math.max(newLeft, 0);
		const boundedTop = Math.max(newTop, 0);
	
		const boundedWidth = Math.min(newWidth + (boundedLeft - newLeft), imageWidth - boundedLeft - 1);
		const boundedHeight = Math.min(newHeight + (boundedTop - newTop), imageHeight - boundedTop - 1);
	
		return {
			index: STEPS - index,
			width: Math.floor(boundedWidth),
			height: Math.floor(boundedHeight),
			left: Math.floor(boundedLeft),
			top: Math.floor(boundedTop),
			originalWidth: width,
		}
	})
}

const percentageToAbsolute = (imageWidth, imageHeight, { width, height, left, top }) => ({
	width: Math.floor((width / 100) * imageWidth),
	height: Math.floor((height / 100) * imageHeight),
	left: Math.floor((left / 100) * imageWidth),
	top: Math.floor((top / 100) * imageHeight),
})


const resizeImage = async (originalImage, highlights) => {
	const { width, height } = await originalImage.metadata();
	const background = await blowOut(originalImage.clone(), BACKGROUND_SIZE, width);
	const absoluteHighlights = highlights.map(highlight => percentageToAbsolute(width, height, highlight));
	const staggeredHighlights = absoluteHighlights.map(highlight => createStaggeredHighlights(width, height, highlight));
	const extractionRegions = await Promise.all(staggeredHighlights[0].reverse().map(async highlight => extractRegion(highlight, originalImage)));
	background.composite(extractionRegions);
	return background;
}

module.exports = resizeImage;