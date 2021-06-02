var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');

const cors = require('cors');
const sharp = require('sharp');
const resizeImage = require('./resizer');
const fs = require('fs');

const UPLOADS_FOLDER = __dirname + '/uploads';
const PREVIEWS_FOLDER = __dirname + '/previews';

if (!fs.existsSync(UPLOADS_FOLDER)){
	fs.mkdirSync(UPLOADS_FOLDER)
}

if (!fs.existsSync(PREVIEWS_FOLDER)){
	fs.mkdirSync(PREVIEWS_FOLDER)
}

app.use(cors());

app.use(fileUpload({
    createParentPath: true
}));

app.use(express.static('dist'))

app.post('/upload', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            const { image: upload } = req.files;
			const { name } = upload;

			const image = await sharp(upload.data).resize(1080, 1080, {
				fit: 'cover',
				withoutEnlargement: false,
			})

			const buffer = await image.toBuffer();
			await sharp(buffer).toFile(`${UPLOADS_FOLDER}/${name}`)

			res.status(200).send();
        }
    } catch (err) {
		console.log(err)
        res.status(500).send(err);
    }
});

const generateAnimation = async (res, filename, shapes) => {
	const input = sharp(`${UPLOADS_FOLDER}/${filename}`);
		const image = shapes.length > 0 ? await resizeImage(input, shapes) : input;
		res.status(200);
		res.contentType('image/jpeg');
		return res.send(await image.toBuffer());
}

const generateStatic = async (res, filename, shapes) => {
	const input = sharp(`${UPLOADS_FOLDER}/${filename}`);
	const image = shapes.length > 0 ? await resizeImage(input, shapes) : input;
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
	const isAnimation = req.query?.isAnimation ?? false;
	
	try {
		validateShapes(shapes);

		if (isAnimation) {
			generateAnimation(res, req.params.filename, shapes);
			return;
		}

		generateStatic(res, req.params.filename, shapes);
	} catch (error) {
		next(error)
	}
};

app.use('/image/:filename', async (req, res, next) => generateImage(req, res, next));

app.use('/original/:filename', async (req, res) => {
	const image = sharp(`${UPLOADS_FOLDER}/${req.params.filename}`);
	res.status(200);
	res.contentType('image/jpeg');
	return res.send(await image.toBuffer());
});

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('Server launched on port', port));
