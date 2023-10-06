const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const https = require('https');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/downloaded-documents', express.static(path.join(__dirname, 'downloaded_documents')));
app.use(express.static('public', { extensions: ['html', 'css'] }));

const baseUrl = 'https://patents.tvornica.net/api';
const loginUrl = `${baseUrl}/login/`;

const accessTokenDirectory = path.join(__dirname, 'login_responses');
const accessTokenFilePath = path.join(accessTokenDirectory, 'login_response.json');

if (!fs.existsSync(accessTokenDirectory)) {
    fs.mkdirSync(accessTokenDirectory, { recursive: true });
}
const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
};

function readAccessToken() {
    try {
        const loginResponse = JSON.parse(fs.readFileSync(accessTokenFilePath, 'utf-8'));
        return loginResponse.access;
    } catch (error) {
        console.error('Error reading access token:', error.message);
        return null;
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// app.post('/trigger-app-js', async (req, res) => {
//     try {
//         const { patentNumber, documentCodes } = req.body;

//         // Check if you can see the received data in your server logs
//         console.log('Received patentNumber:', patentNumber);
//         console.log('Received documentCodes:', documentCodes);

//         // Implement the logic to trigger app.js and process the selected document codes here

//         // Respond with a success message if everything is okay
//         res.status(200).send('Triggered app.js successfully.');
//     } catch (error) {
//         console.error('Error:', error.message);
//         res.status(500).send(`Error: ${error.message}`);
//     }
// });

app.post('/trigger-app-js', async (req, res) => {
    try {
        const { patentNumber, documentCodes } = req.body;

        const response = await axios.post(loginUrl, {
            email: 'swagger_patents@dev-morgancode.com',
            password: 'QppuycgwcHa9pYmpoZZe',
        });

        if (response.status === 200) {
            const accessToken = response.data.access;
            console.log('Login successful. Access token:', accessToken);

            const requestData = {
                numbers: patentNumber,
                date_from: '1990-10-05',
                date_to: '2023-10-05',
                document_code: documentCodes,
                desired_apps_extended_info: false,
            };

            headers.Authorization = `Bearer ${accessToken}`;

            const downloadResponse = await axios.post(`${baseUrl}/download-available-documents/`, requestData, { headers });

            if (downloadResponse.status === 200) {
                const downloadUrl = downloadResponse.data.results.download_all_documents_as_zip.url;
                const zipFolder = path.join(__dirname, 'downloaded_documents');
                const zipFilePath = path.join(zipFolder, 'downloaded.zip');

                if (!fs.existsSync(zipFolder)) {
                    fs.mkdirSync(zipFolder);
                }

                const writer = fs.createWriteStream(zipFilePath);
                const responseStream = await axios({
                    method: 'GET',
                    url: downloadUrl,
                    responseType: 'stream',
                    httpsAgent: new https.Agent({ rejectUnauthorized: false }),
                });

                responseStream.data.pipe(writer);

                await new Promise((resolve, reject) => {
                    writer.on('finish', resolve);
                    writer.on('error', reject);
                });

                console.log('Zip file downloaded successfully.');

                // Send the file path in the response
                res.status(200).json({ filePath: zipFilePath });
            } else {
                console.error('Failed to retrieve documents.');
                res.status(500).send('Failed to retrieve the document.');
            }
        } else {
            console.error('Failed to fetch access token.');
            res.status(500).send('Failed to fetch access token.');
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send(`Error: ${error.message}`);
    }
});
app.post('/fetch-application-documents', async (req, res) => {
    try {
        const { patentNumber, documentCodes } = req.body;

        // Construct the file path for the downloaded application documents
        const zipFilePath = path.join(__dirname, 'downloaded_documents', 'downloaded.zip');

        // Send the file path in the response
        res.status(200).json({ filePath: zipFilePath });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).send(`Error: ${error.message}`);
    }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
