const GIFEncoder = require('gifencoder');

const { clamp, zip } = require('lodash');
const sharp = require('sharp');
const { createCanvas } = require('canvas');
const fs = require('fs');
const { Canvas, Image } = require('node-canvas');

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
	
		const boundedWidth = Math.min(newWidth + (boundedLeft - newLeft), imageWidth - boundedLeft - 2);
		const boundedHeight = Math.min(newHeight + (boundedTop - newTop), imageHeight - boundedTop - 2);
	
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


const calculateCompressionStacks = async (originalImage, highlights) => {
	const { width, height } = await originalImage.metadata();
	const absoluteHighlights = highlights.map(highlight => percentageToAbsolute(width, height, highlight));
	const staggeredHighlights = absoluteHighlights.map(highlight => createStaggeredHighlights(width, height, highlight));
	const highlightStack = zip(...staggeredHighlights).reverse().flat();
	return highlightStack;
}

const createImage = buffer => new Promise(async (resolve) => {
	const img = new Image;
	
	var b64encoded = buffer.toString('base64');

	img.onload = () => {
		resolve(img);
	}
	img.onerror = (error) => {
		console.log(error)
	}

	img.src = "data:image/jpg;base64," + b64encoded;
});

const createCompressedAnimation = async (filepath, originalImage, highlights, res) => {
	const { width: oWidth } = await originalImage.metadata();
	const background = await blowOut(originalImage.clone(), BACKGROUND_SIZE, oWidth);
	const highlightStack = await calculateCompressionStacks(originalImage, highlights);
	
	const size = 1080;  
	const encoder = new GIFEncoder(size, size);
	encoder.createReadStream().pipe(res);
	
	encoder.start();
	encoder.setRepeat(0);
	encoder.setDelay(125);
	encoder.setQuality(10);

	const canvas = new Canvas(size, size);
	const context = canvas.getContext('2d');
	context.drawImage(await createImage(await background.toFormat('jpg').toBuffer()), 0, 0, size, size);
	encoder.addFrame(context);

	let cumulativeRegions = [];
	for await (const highlight of highlightStack) {
		cumulativeRegions.push(await extractRegion(highlight, originalImage));
		const buffer = await background.composite(cumulativeRegions).toBuffer();
		context.drawImage(await createImage(buffer), 0, 0, size, size);
		encoder.addFrame(context);
	}

	encoder.finish();
}

const createCompressedImage = async (originalImage, highlights) => {
	const { width, height } = await originalImage.metadata();
	const background = await blowOut(originalImage.clone(), BACKGROUND_SIZE, width);
	const highlightStack = await calculateCompressionStacks(originalImage, highlights);
	const extractionRegions = await Promise.all(highlightStack.map(async highlight => extractRegion(highlight, originalImage)));
	background.composite(extractionRegions);
	return background;
}

module.exports = {
	calculateCompressionStacks,
	createCompressedAnimation,
	createCompressedImage
}