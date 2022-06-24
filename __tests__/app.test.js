const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const UserService = require('../lib/services/UserService');

const dodUser = {
  firstName: 'Random',
  lastName: 'User',
  email: 'RandomUser@dod.gov',
  password: '54321',
};

const signUpAndLogin = async (userProps = {}) => {
  const password = userProps.password ?? dodUser.password;

  const agent = request.agent(app);

  const user = await UserService.create({ ...dodUser, ...userProps });

  const { email } = user;
  await agent.post('/api/v1/users/sessions').send({
    email,
    password,
  });
  return [agent, user];
};

describe('backend-express-template routes', () => {
  beforeEach(() => {
    return setup(pool);
  });

  it('new user created upon sign up', async () => {
    const res = await request(app).post('/api/v1/users').send(dodUser);
    const { firstName, lastName, email } = dodUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });

  it('logs in a created user', async () => {
    const [agent, user] = await signUpAndLogin();
    const me = await agent.get('/api/v1/users/me');

    expect(me.body).toEqual({
      ...user,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });
  });

  it('should be able to logout', async () => {
    const [agent, user] = await signUpAndLogin();
    const me = await agent.get('/api/v1/users/me');

    expect(me.body).toEqual({
      ...user,
      exp: expect.any(Number),
      iat: expect.any(Number),
    });

    const resp = await request(app).delete('/api/v1/users/sessions');
    expect(resp.body.message).toEqual('Signed out!');
    expect(resp.status).toEqual(200);

    const dashboardRequest = await request.agent(app).get('/api/v1/users/me');
    expect(dashboardRequest.body.message).toEqual('Sign In to Continue');
  });

  afterAll(() => {
    pool.end();
  });
});
