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

const calculateBoundedCropArea = (top, left, width, height, initialWidth, initialHeight, fullImageWidth, fullImageHeight) => {
	const adjustedLeft = left - ((width - initialWidth) / 2)
	const adjustedTop = top - ((height - initialHeight) / 2)

	const boundedLeft = Math.max(0, adjustedLeft);
	const boundedTop = Math.max(0, adjustedTop);

	const boundedWidth = clamp(width + (adjustedLeft - boundedLeft), 0, fullImageWidth - boundedLeft);
	const boundedHeight = clamp(height + (adjustedTop - boundedTop), 0, fullImageHeight - boundedTop)	

	return  {
		top: Math.round(boundedTop),
		left: Math.round(boundedLeft),
		width: Math.round(boundedWidth),
		height: Math.round(boundedHeight),
		initialWidth,
		initialHeight
	};
}

const addHighlight = async (original, highlight) => {
	let { top, left, width, height } = highlight;
	const { width: fullImageWidth, height: fullImageHeight } = await original.metadata();

	top = Math.round((fullImageHeight / 100) * top);
	left = Math.round((fullImageWidth / 100) * left);
	width = Math.round((fullImageWidth / 100) * width);
	height = Math.round((fullImageHeight / 100) * height);

	return Array(5).fill(1).map((_, i) => {
		const stepIndex = i + 1;
		let widthAfterGrow = Math.round(width + (width * 4 / stepIndex))
		let heightAfterGrow = Math.round(height + (height * 4 / stepIndex))
		widthAfterGrow = widthAfterGrow % 2 === 0 ? widthAfterGrow : widthAfterGrow + 1;
		heightAfterGrow = heightAfterGrow % 2 === 0 ? heightAfterGrow : heightAfterGrow + 1;

		return {
			...calculateBoundedCropArea(top, left, widthAfterGrow, heightAfterGrow, width, height, fullImageWidth, fullImageHeight),
			stepIndex,
		}
	});
}

const BACKGROUND_SIZE = 4;
const STEPS = 2;

const extractRegion = async (highlight, originalImage) => {
	const crop = originalImage.clone().extract(highlight);

	const { left, width, top, height } = highlight;
	return {
		left,
		top,
		input: await crop.toBuffer(),
	}
}

const percentageToAbsolute = (imageWidth, imageHeight, { width, height, left, top }) => ({
	width: Math.floor((width / 100) * imageWidth),
	height: Math.floor((height / 100) * imageHeight),
	left: Math.floor((left / 100) * imageWidth),
	top: Math.floor((top / 100) * imageHeight),
})

const createStaggeredHighlights = (imageWidth, imageHeight, { width, height, left, top }) => {
	return Array(STEPS).fill(1).map((_, index) => {
		const newWidth = width + (imageWidth * ((1 / STEPS) * index));
		const newHeight = height + (imageHeight * ((1 / STEPS) * index));

		const newLeft = left - ((newWidth - width) / 2);
		const newTop = top - ((newHeight - height) / 2);

		const boundedLeft = Math.max(newLeft, 0);
		const boundedTop = Math.max(newTop, 0);
	
		const boundedWidth = newWidth + (boundedLeft - newLeft)
		const boundedHeight = newHeight + (boundedTop - newTop)

		return {
			index,
			width: Math.floor(boundedLeft),
			height: Math.floor(boundedTop),
			left: Math.floor(boundedWidth),
			top: Math.floor(boundedHeight),
		}
	})
}

const resizeImage = async (originalImage, highlights) => {
	const { width, height } = await originalImage.metadata();
	const background = await blowOut(originalImage.clone(), BACKGROUND_SIZE, width);

	const absoluteHighlights = highlights.map(highlight => percentageToAbsolute(width, height, highlight));
	const staggeredHighlights = absoluteHighlights.map(highlight => createStaggeredHighlights(width, height, highlight));
	const extractionRegions = await Promise.all(staggeredHighlights[0].map(async highlight => extractRegion(highlight, originalImage)));

	background.composite(extractionRegions);
	return background;
}

module.exports = resizeImage;