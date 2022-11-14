import { defineEndpoint } from '@directus/extensions-sdk';

const AWS = require('aws-sdk');

const multer = require("multer");
const upload = multer();

export default defineEndpoint((router) => {
	router.post('/upload-photo', upload.single('file'), (req, res) => {
		//Get file
		const file = req.file;
		console.log('req', file);

		//Upload file
		AWS.config.update({
			accessKeyId: process.env.STORAGE_S3_KEY,
			secretAccessKey: process.env.STORAGE_S3_SECRET,
			region: process.env.STORAGE_S3_REGION
		});
		const s3 = new AWS.S3();
		const currentDate = new Date().getTime();
		const names = file.originalname.split('.');
    const fileName = names.slice(0, -1).join('.');
    const [extension] = names.slice(-1);
		const imageRemoteName = `${fileName}-${currentDate}.${extension}`;
		s3.upload({
			Bucket: process.env.STORAGE_S3_BUCKET as string,
			Body: file.buffer,
			Key: imageRemoteName,
			ContentType: file.mimetype // important
		})
			.promise()
			.then(result => {
				console.log(`Upload succeeded - `, result);
				const photoUrl = result.Location;
				return res.send({
					data: {
						url: photoUrl
					}
				});
			})
			.catch(err => {
				console.log("Upload failed:", err);
			});
	})
});
