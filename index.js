const express = require('express');
const AWS = require('aws-sdk');
const app = express();
app.use(express.json());

const dynamoDB = new AWS.DynamoDB({ region: 'your_region' }); // Replace 'your_region' with your AWS region
const tableName = 'eager-jade-sweatsuitCyclicDB'; // Replace with your DynamoDB table name

const saveConfigToDynamoDB = async (appid, data) => {
  const params = {
    TableName: tableName,
    Item: {
      AppID: { S: appid },
      Data: { S: JSON.stringify(data) },
    },
  };

  try {
    await dynamoDB.putItem(params).promise();
    return true;
  } catch (error) {
    console.error('Unable to save config to DynamoDB', error);
    return false;
  }
};

const getConfigFromDynamoDB = async (appid) => {
  const params = {
    TableName: tableName,
    Key: {
      AppID: { S: appid },
    },
  };

  try {
    const result = await dynamoDB.getItem(params).promise();
    if (result.Item && result.Item.Data) {
      return JSON.parse(result.Item.Data.S);
    }
    throw new Error('Config not found');
  } catch (error) {
    console.error('Error getting config from DynamoDB', error);
    throw error;
  }
};

// Save config JSON to DynamoDB
app.post('/DeployAppConfig/:appid', async (req, res) => {
  const { appid } = req.params;
  const { DATA } = req.body;

  try {
    const success = await saveConfigToDynamoDB(appid, DATA);
    if (success) {
      res.status(200).send('Config saved successfully');
    } else {
      res.status(500).send('Unable to save config');
    }
  } catch (error) {
    res.status(500).send('Error saving config');
  }
});

// Get config JSON using appid from DynamoDB
app.get('/GetAppConfig/:appid', async (req, res) => {
  const { appid } = req.params;

  try {
    const configData = await getConfigFromDynamoDB(appid);
    res.json(configData);
  } catch (error) {
    res.status(404).send('Config not found');
  }
});

app.all('/', (req, res) => {
  res.send('NexGuard API!');
});

app.listen(process.env.PORT || 3000);
