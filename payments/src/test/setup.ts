import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';
import jwt from 'jsonwebtoken';

// Telling TS that this exists. You could just make a new file 
// with the helper function. 
declare global {
  var signin: (id?: string) => string[];
}

jest.mock('../nats-wrapper');

//IDEALLY you should set this stripe API Key as an environment variable.
process.env.STRIPE_KEY = 'sk_test_51KbzEcDbI5EnspV4gSRTn9ctgeL0a2k1kTsxsb2trg1va9rIMk5mVGulxLQvgcl0C3K2Q3ec6bgJQiLCWjpYRxdU00BK8WUdgK'

let mongo: any;

beforeAll ( async () => {
process.env.JWT_KEY = 'asdfasdf';

  mongo = new MongoMemoryServer();
  await mongo.start();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, 
    // {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true 
    // }
  );
});

beforeEach( async ()=> {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for ( let collection of collections) {
    await collection.deleteMany({});
  }
})

afterAll( async () =>{
  await mongo.stop();
  await mongoose.connection.close();
})

//GLOBAL SCOPE for ease of use. You could create into a file
// And import that then into wherever you need it.
//
//Optionally passing in an ID to use for testing. If present use it, otherwise use random generated ID.
global.signin = (id?: string) => {
  //Build a JWT payload. { id, email }
  const payload = {
    //creating a new user every time it signs in
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: "test@test.com"
  }
  //Create the JWT! 
  const token = jwt.sign(payload,process.env.JWT_KEY!);

  //Build a session Object. { jwt: MY_JWT } 
  const session = {jwt: token}

  //Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // Return a string that is the cookie with encoded data.
  return [`session=${base64}`];

}