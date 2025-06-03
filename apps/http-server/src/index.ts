import express from 'express';

const app = express();
const port = 9000;

app.get('/', (req, res) => {
  res.send('Hello Welcome back this is a simple HTTP server! by Aditya');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});