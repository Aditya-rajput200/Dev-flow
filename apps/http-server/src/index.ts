import express from 'express';
import authRouter from './routes/auth';
import prisma from './db';
import dotenv from 'dotenv';

dotenv.config();


const app = express();
app.use(express.json());

app.use('/api/auth', authRouter)

const port = 9000;



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});