const { createCompressedAnimation, createCompressedImage } = require("./compressor");
const sharp = require('sharp');
const { UPLOADS_FOLDER } = require('./CONSTANTS.js');

const generateAnimation = async (res, filename, shapes) => {
	const filepath = `${UPLOADS_FOLDER}/${filename}`;
	const original = filepath.split('.').slice(0, filepath.split('.').length - 1).join('.');
	let input;
	try {
		input = sharp(original);
		// Test is valid image	
		await input.toBuffer()
	} catch (error) {
		return res.send('File has been deleted');
	}
	res.status(200);
	createCompressedAnimation(filepath, input, shapes, res);
}

const generateStatic = async (res, filename, shapes) => {
	let input;
	try {
		input = sharp(`${UPLOADS_FOLDER}/${filename}`);
		// Test is valid image	
		await input.toBuffer()
	} catch (error) {
		return res.send('File has been deleted');
	}
	const image = shapes.length > 0 ? await createCompressedImage(input, shapes) : input;
	res.status(200);
	res.contentType('image/jpeg');
	return res.send(await image.toBuffer());
}

const validateShapes = shapes => shapes.map(({ height, width, left, top }) => {
	if (height > 0 && width > 0 && left >= 0 && top >= 0) {
		return true;
	}
	throw new Error('Invalid shape received')
})

const generateImage = async (req, res, next) => {
	const shapes = req.query?.shapes ? JSON.parse(req.query?.shapes) : [];
	const isAnimation = (req.query?.isAnimation ?? false) === 'true';

	try {
		validateShapes(shapes);
		if (isAnimation) {
			generateAnimation(res, req.params.filename, shapes);
			return;
		}

		generateStatic(res, req.params.filename, shapes);
		return;
	} catch (error) {
		next(error)
	}
};

module.exports = generateImage;