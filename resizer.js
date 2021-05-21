const { clamp, zip } = require('lodash');
const sharp = require('sharp');

const BACKGROUND_SIZE = 4;
const STEPS = 5;

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

	return Array(STEPS).fill(1).map((_, i) => {
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


const resizeImage = async (input, highlights) => {
	const { width, height } = await input.metadata();
	const background = await blowOut(input.clone(), BACKGROUND_SIZE, width);
	console.log(highlights)
	//background.composite(imagesForCompositing);
	return background;
}

module.exports = resizeImage;