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
            const { image } = req.files;
			await image.mv(`${UPLOADS_FOLDER}/${image.name}`);
			console.log('Start')
			await sharp(`${UPLOADS_FOLDER}/${image.name}`)
				.resize(1024, 1024, {
					fit: 'inside'
				})
				.toFile(`${PREVIEWS_FOLDER}/${image.name}`)
			console.log('here')
			res.status(200).send();
        }
    } catch (err) {
        res.status(500).send(err);
    }
});


const generateImage = async (isPreview, req, res, next) => {
	const folder = isPreview ? PREVIEWS_FOLDER : UPLOADS_FOLDER;
	const shapes = req.query?.shapes ? JSON.parse(req.query?.shapes) : [];
	const input = sharp(`${folder}/${req.params.filename}`);
	try {
		const image = shapes.length > 0 ? await resizeImage(input, shapes) : input;
		res.status(200);
		res.contentType('image/jpeg');
		return res.send(await image.toBuffer());
	} catch (error) {
		next(error)
	}
};

app.use('/preview/:filename', async (req, res, next) => generateImage(true, req, res, next));
app.use('/final/:filename', async (req, res, next) => generateImage(false, req, res, next));

app.use('/original', async (req, res) => {
	const image = sharp('./R011def.jpg');
	res.status(200);
	res.contentType('image/jpeg');
	return res.send(await image.toBuffer());
});

app.listen(process.env.PORT);
