const AWS = require('aws-sdk');
const express = require('express');
const app = express();
app.use(express.json());

// AWS configuration
AWS.config.update({
  region: 'eu-central-1', // Replace with your AWS region
  accessKeyId: 'ASIA5LT6JNUMO62IQ56G', // Replace with your access key ID
  secretAccessKey: 'yGXn8i0PfQkgXtksm1O6+/OHjYAWxGWnNMCOviIx', // Replace with your secret access key
  sessionToken: 'IQoJb3JpZ2luX2VjEGsaCXVzLWVhc3QtMiJGMEQCIH4ri487T8/W64BfnzajUnLJJrkGSnnckzc1Rk+No3QhAiAWxzygtZju/O9gpQ2AXLDoJU50CL5A/+t1gX74FL8k0yq3Agi0//////////8BEAAaDDkxODMxNDExODQyNCIM3KrfzAE/Mm8wHVv2KosCn71aD8H3jSWNtW+HnlKpB/EwTdVeM5GdsdLecWAtaoVisi6xP7M73gcRKGsJ+rs4hq+6tATD5y+ZJ3BkUYeX74OuDeh8z1FcdwPJflwn0kSRB5OgP0jIXCOTyJZo50qflIScRcRj9EP8F/BZmqrS11aAvgM73gjNUFVsz142qFIGBDAeN4RhQbDVhqsO9eRv7rLmzSdae9fbIeeSHCutGgPktDlu5kkJOlmz9dv929ObfyqEGAeLVAwiYsK1w8z3u/3E6vbSssSs3eMmxO+ONYdP4sIoSCEGRXUb3KefkI7p27ZxcVqB9V692TgRVe+Qh1QSrhnatULcdRmlUEOMgE0BcREdt+VsnriXMNjU4KoGOp4Bn4U7SqeWCb17i3iJZ80OPS88mZZqgGODoGYjyuxe8ANgk0j77ZyFPkvrX4hYpk6Fr1C6RsxdmiL7iBm1kNmlKszgIp8hCdSHLe9O3By0pEcPYwOLEcm6jEnVsjIshakOSfYdUIJDsQitG3AiauHDzP2ecXb9EF38VSoKnRLzuzu2Hn6G2y0eYl2JC0QkX1709Y0hHALE9eYxEYM2Tos=' // Replace with your session token if applicable
});

const dynamoDB = new AWS.DynamoDB();
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
