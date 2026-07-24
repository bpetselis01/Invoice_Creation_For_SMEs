// import request from 'supertest'
import { port, url } from './config.json'

const SERVER_URL = `${url}:${port}`

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

// const supertest = require('supertest')
const request = require('supertest')
const app = require('../server')
const server = require('../server')

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

// server.close();

// How are we meant to kill the server a test it???
// describe('(/alive) Fail Tests', () => {

//   const response = requestHelper('GET', '/alive', {});
//   expect(response).toHaveProperty('statusCode', 500);

//   const responseBody = JSON.parse(response.getBody());

//   const expectedResponseBody = {
//     status: 'dead'
//   };

//   expect(responseBody).toEqual(expectedResponseBody);
// });
