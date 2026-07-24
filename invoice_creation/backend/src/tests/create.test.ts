import request from 'supertest';
import { port, url } from './config.json';
import fs from 'fs';
import { convertJsonToUbl } from '../create';

// const SERVER_URL = `${url}:${port}`

// const request = require('supertest')
const app = require('../server')

describe('(/alive) Success Tests', () => {
  test('Server is Alive', async () => {
    const response = await request(app).get('/alive')

    expect(response.status).toEqual(200)
    expect(response.body).toEqual({
      status: 'alive',
      data: expect.any(String)
    })
  })
})

// describe('(/alive) Success Tests', () => {
//   test('Server is Alive', async () => {
//     const response = await request(SERVER_URL).get('/alive')

//     expect(response.status).toEqual(200)
//     expect(response.body).toEqual({
//       status: 'alive',
//       data: expect.any(String)
//     })
//   })
// })

// describe('Testing route: /alive', function () {
//   it('Server is Alive', function (done) {
//     request(app)
//     // Route
//       .get('/alive')
//     // Status Code
//       .expect(200)
//     // Regex for checking content type to ignore charset
//       .expect('Content-Type', /application\/json/)
//     // Expected JSON body
//       .expect({
//         status: 'alive',
//         data: 'CTRL Freaks invoice creation API is alive'
//       })
//     // Call done
//       .end(done)
//   })
// })

// Assuming csvToJsonFnc() will be changed to csvToJsonFnc(filepath)
// describe('csvToJsonFnc Fail Tests', () => {

// test('Invalid File Type', async () => {
//     const response = await csvToJsonFnc();
//     const response = await csvToJsonFnc('src/tests/trialFiles/wrong.txt');

//     expect(response.status).toBe(400);
//     expect(response.body).toEqual({
//         status: 'error',
//         data: 'Invalid File Type'
//     });
// });

// test('Invalid File Type', async () => {
//     const response = await csvToJsonFnc();
//     const response = await csvToJsonFnc('src/tests/trialFiles/wrong.txt');

//     expect(response.status).toBe(400);
//     expect(response.body).toEqual({
//         status: 'error',
//         data: 'Invalid File Type'
//     });
// });
// })

// describe('convertJsonToUbl Fail Tests', () => {

// });
