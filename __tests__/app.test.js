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
  await (
    await agent.post('/api/v1/users/sessions')
  ).setEncoding({
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
    const res = await (await request(app).post('/api/v1/users')).send(dodUser);
    const { firstName, lastName, email } = dodUser;

    expect(res.body).toEqual({
      id: expect.any(String),
      firstName,
      lastName,
      email,
    });
  });

  afterAll(() => {
    pool.end();
  });
});
