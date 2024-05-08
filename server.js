const express = require('express');
const path = require('path');
const busboy = require('busboy');
const AWS = require('aws-sdk');
const {v4: uuidv4} = require('uuid');
const bodyParser = require('body-parser');
const { log, error } = require('console');
require('dotenv').config();
const PORT = process.env.PORT || 5500;


const app = express();

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_ACCESS_SECRET,
    region: process.env.AWS_REGION
});

const s3 = new AWS.S3();

app.use(bodyParser.urlencoded({extended: true}));

app.post('/upload', (req, res) => {
    const busboyInstance = busboy({headers: req.headers});

    let key = "";

    busboyInstance.on('file', (fieldname, file, filename, encoding, mimetype) => {
        const key = `uploads/${Math.random()}_${filename}`;

        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key,
            Body: file
        }

        s3.upload(params, (err, data) => {
            if(err){
                console.log('Err uploading', err);
                res.status(500).json({error: 'Internal Server Err'});
            }else{
                console.log('File uploaded to', data.Location);
                res.status(200).json({message: 'File upload done', location: data.Location});
            }
        });
    });

    // Pipe req
    req.pipe(busboyInstance);
});

app.listen(PORT, () => {
    console.log('Server running at port', PORT);
})