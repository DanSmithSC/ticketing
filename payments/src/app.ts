import express from 'express'
import 'express-async-errors';
import { json } from 'body-parser'
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@denziktickets/common';
import { createChargeRouter } from './routes/new';


const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    // secure: process.env.NODE_ENV !== 'test' // if it's test environment set false... if it's not test... set true.
    secure: false
  }
)) 
app.use(currentUser);

app.use(createChargeRouter);

// Catch All Error - If it's anything we don't know - then it's a 404.
app.all('*', async (req, res) => {
  throw new NotFoundError();
})

app.use(errorHandler)

export { app };