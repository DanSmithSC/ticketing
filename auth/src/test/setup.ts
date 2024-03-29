import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../app';

// Telling TS that this exists. You could just make a new file 
// with the helper function. 
declare global {
  var signin: () => Promise<string[]>;
}

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
  const collections = await mongoose.connection.db.collections();

  for ( let collection of collections) {
    await collection.deleteMany({});
  }
})

afterAll( async () =>{
  await mongo.stop()
  await mongoose.connection.close();
})

//GLOBAL SCOPE for ease of use. You could create into a file
// And import that then into wherever you need it.
global.signin = async () => {
  const email = 'test@test.com';
  const password = 'password'

  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email, password
    })
    .expect(201)

    const cookie = response.get('Set-Cookie')
    
  return cookie
}