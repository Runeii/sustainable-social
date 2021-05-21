var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');

const cors = require('cors');
const sharp = require('sharp');
const resizeImage = require('./resizer');
const fs = require('fs');

const PREVIEWS_FOLDER = __dirname + '/previews';
if (!fs.existsSync(PREVIEWS_FOLDER)){
	fs.mkdirSync(PREVIEWS_FOLDER)
}

app.use(cors());

app.use(fileUpload({
    createParentPath: true
}));

app.post('/upload', async (req, res) => {
    try {
        if(!req.files) {
            res.send({
                status: false,
                message: 'No file uploaded'
            });
        } else {
            const { image } = req.files;
			image.mv(`./uploads/${image.name}`);
			await sharp('./R011def.jpg')
				.resize(1024, 1024, {
					fit: 'inside'
				})
				.toFile(`${PREVIEWS_FOLDER}/${image.name}`)
			res.status(200).send();
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

app.use('/preview/:filename', async (req, res, next) => {
	const shapes = req.query?.shapes ? JSON.parse(req.query?.shapes) : [];
	const input = sharp(`${PREVIEWS_FOLDER}/${req.params.filename}`);
	try {
		const image = shapes.length > 0 ? await resizeImage(input, shapes) : input;
		res.status(200);
		res.contentType('image/jpeg');
		return res.send(await image.toBuffer());
	} catch (error) {
		next(error)
	}
});

app.use('/original', async (req, res) => {
	const image = sharp('./R011def.jpg');
	res.status(200);
	res.contentType('image/jpeg');
	return res.send(await image.toBuffer());
});

//app.use('/', async (req, res) => {
//	const input = sharp('./R011def.jpg');
//	const image = await resizeImage(input);
//	res.status(200);
//	res.contentType('image/jpeg');
//	return res.send(await image.toBuffer());
//});

app.listen(3001, function() { console.log('listening'); });
