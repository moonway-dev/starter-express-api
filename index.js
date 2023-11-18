const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

const createDirectoryIfNotExists = (directory) => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

// Save config JSON to root/APPID/config.json
app.post('/DeployAppConfig/:appid', (req, res) => {
  const { appid } = req.params;
  const { DATA } = req.body;
  const directoryPath = `./${appid}`;
  const filePath = `${directoryPath}/config.json`;
  createDirectoryIfNotExists(directoryPath);
  const jsonData = JSON.stringify(DATA, null, 2);
  fs.writeFileSync(filePath, jsonData);

  res.status(200).send('Config saved successfully');
});

// Get config JSON using appid
app.get('/GetAppConfig/:appid', (req, res) => {
  const { appid } = req.params;
  const filePath = `./${appid}/config.json`;

  try {
    // Read config JSON file
    const data = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    res.json(jsonData);
  } catch (err) {
    res.status(404).send('Config not found');
  }
});

app.all('/', (req, res) => {
  res.send('NexGuard API!');
});

app.listen(process.env.PORT || 3000);
