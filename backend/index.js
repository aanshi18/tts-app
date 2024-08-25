const express = require('express');
const cors = require('cors');
const fs = require('fs');
const util = require('util');
const {v4: uuidv4} = require('uuid'); // to generate audio files with unique names
const textToSpeech = require('@google-cloud/text-to-speech');

const app = express();
app.use(cors());
app.use(express.json());

const client = new textToSpeech.TextToSpeechClient();

app.post('/api/convert', async(req, res)=>{
    const {text, voice, languageCode} = req.body;

    const request = {
        input: {text},
        voice: {languageCode, name: voice},
        audioConfig: {audioEncoding: 'MP3'},
    };

    try{
        const filename = `output_${uuidv4()}.mp3`;
        const [response] = await client.synthesizeSpeech(request);
        const writeFile = util.promisify(fs.writeFile);
        await writeFile(filename, response.audioContent, 'binary');

        res.json({audioUrl: `http://localhost:8080/${filename}`});
    }catch(error){
        console.error('Error during text-to-speech conversion - ', error);
        res.status(500).json({error: 'Text-to-speech conversion failed.'});
    }
});

app.use(express.static(__dirname)); //to serve files from the current directory

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));