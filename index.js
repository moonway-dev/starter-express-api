const express = require('express')
const app = express()
app.all('/', (req, res) => {
    console.log("Just got a request!")
    res.send('Yo!')
})

app.get('/api/data', (req, res) => {
  const data = {
    message: 'Hello from your API!',
    timestamp: new Date().toISOString()
  };
  res.json(data);
});

app.listen(process.env.PORT || 3000)
