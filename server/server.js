var express = require('express');
var app = express();
const fileUpload = require('express-fileupload');

const cors = require('cors');
const sharp = require('sharp');
const fs = require('fs');
const generateImage = require('./handler');
const { UPLOADS_FOLDER } = require('./CONSTANTS.js');

if (!fs.existsSync(UPLOADS_FOLDER)){
	fs.mkdirSync(UPLOADS_FOLDER)
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


app.use('/image/:filename', async (req, res, next) => generateImage(req, res, next));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log('Server launched on port', port));
