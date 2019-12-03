import Koa from 'koa'
import axios from 'axios'
import bcrypt from 'bcrypt'
import createLogger from 'pino'
import { Server } from 'http'
import { User } from '../src/models/user'
import { KnexAccountService } from '../src/services/accounts-service'
import { KnexTransactionService } from '../src/services/transactions-service'
import { createApp } from '../src/app'
import { HydraApi, TokenInfo } from '../src/apis/hydra'
import { TokenService } from '../src/services/token-service'
import Knex = require('knex')

describe('Users Service', function () {
  let server: Server
  let port: number
  let app: Koa
  let knex: Knex
  let accountsService: KnexAccountService
  let transactionsService: KnexTransactionService
  let hydraApi: HydraApi
  let tokenService: TokenService

  beforeAll(async () => {
    knex = Knex({
      client: 'sqlite3',
      connection: {
        filename: ':memory:'
      }
    })
    accountsService = new KnexAccountService(knex)
    transactionsService = new KnexTransactionService(knex)
    tokenService = new TokenService({
      clientId: process.env.OAUTH_CLIENT_ID || 'wallet-users-service',
      clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
      issuerUrl: process.env.OAUTH_ISSUER_URL || 'https://auth.rafiki.money',
      tokenRefreshTime: 0
    })
    hydraApi = {
      introspectToken: async (token) => {
        if (token === 'user1token') {
          return {
            sub: '1',
            active: true
          } as TokenInfo
        } else if (token === 'user2token') {
          return {
            sub: '2',
            active: true
          } as TokenInfo
        } else if (token === 'usersServiceToken') {
          return {
            sub: 'users-service',
            active: true
          } as TokenInfo
        } else {
          throw new Error('Getting Token failed')
        }
      }
    } as HydraApi

    app = createApp({
      accountsService,
      transactionsService,
      logger: createLogger(),
      tokenService,
      hydraApi
    })
    server = app.listen(0)
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    port = server.address().port
  })

  beforeEach(async () => {
    await knex.migrate.latest()
  })

  afterEach(async () => {
    await knex.migrate.rollback()
  })

  afterAll(() => {
    server.close()
    knex.destroy()
  })

  describe('create', function () {
    test('creates a user', async () => {
      const { data } = await axios.post<User>(`http://localhost:${port}/users`, { username: 'alice', password: 'test' })

      const retrievedUser = await User.query().where('userName', 'alice').first()
      expect(retrievedUser).toBeInstanceOf(User)
      expect(retrievedUser!.username).toEqual('alice')

      expect(data.username).toEqual('alice')
    })

    test('does not return password', async () => {
      const { data } = await axios.post<User>(`http://localhost:${port}/users`, { username: 'alice', password: 'test' })

      expect(data.password).toBeUndefined()
    })

    test('hashes the password', async () => {
      const { data } = await axios.post<User>(`http://localhost:${port}/users`, { username: 'alice', password: 'test' })

      expect(data.password).not.toEqual('test')
    })

    test('userName is required', async () => {
      try {
        await axios.post<User>(`http://localhost:${port}/users`, { password: 'test' })
      } catch (error) {
        expect(error.response.status).toEqual(400)
        expect(error.response.data).toEqual('child "username" fails because ["username" is required]')
        return
      }

      fail()
    })

    test('password is required', async () => {
      try {
        await axios.post<User>(`http://localhost:${port}/users`, { username: 'bob' })
      } catch (error) {
        expect(error.response.status).toEqual(400)
        expect(error.response.data).toEqual('child "password" fails because ["password" is required]')
        return
      }

      fail()
    })

    test('userName must be unique', async () => {
      await User.query().insert({ username: 'alice' })

      try {
        await axios.post<User>(`http://localhost:${port}/users`, { username: 'alice', password: 'test' })
      } catch (error) {
        expect(error.response.status).toEqual(400)
        expect(error.response.data).toEqual('Username is already taken.')
        return
      }

      fail()
    })
  })

  describe('Edit', function () {
    test('hashes the new password', async () => {
      const user = await User.query().insertAndFetch({ username: 'alice', password: 'oldPassword' })

      await axios.patch(`http://localhost:${port}/users/${user.id}`, { password: 'newPassword' })

      const updatedUser = await user.$query()
      expect(updatedUser.password).not.toEqual('oldPassword')
      expect(updatedUser.password).not.toEqual('newPassword')
      expect(bcrypt.compare('newPassword', updatedUser.password)).toBeTruthy()
    })

    test('can set the default account id', async () => {
      const user = await User.query().insertAndFetch({ username: 'alice', password: 'oldPassword' })

      await axios.patch(`http://localhost:${port}/users/${user.id}`, { defaultAccountId: '1' })

      const updatedUser = await user.$query()
      expect(updatedUser.defaultAccountId).toEqual('1')
      expect(bcrypt.compare('oldPassword', updatedUser.password)).toBeTruthy()
    })
  })

  describe('Show', function () {
    test('returns user if there token is valid', async () => {
      const user = await User.query().insertAndFetch({ username: 'alice' })
      hydraApi.introspectToken = jest.fn().mockImplementation(async (token: string) => {
        if (token === 'validToken') {
          return {
            active: true,
            scope: 'offline openid',
            sub: user.id.toString(),
            token_type: 'access_token'
          }
        }

        return {
          active: false
        }
      })

      const { data } = await axios.get(`http://localhost:${port}/users/me`, { headers: { authorization: 'Bearer validToken' } })

      expect(data).toEqual(user.$formatJson())
      expect(data.password).toBeUndefined()
    })

    test('returns 401 if there is no token', async () => {
      hydraApi.introspectToken = jest.fn().mockImplementation(async (token: string) => {
        if (token === 'validToken') {
          return {
            active: true,
            scope: 'offline openid',
            sub: '1',
            token_type: 'access_token'
          }
        }

        return {
          active: false
        }
      })

      try {
        await axios.get(`http://localhost:${port}/users/me`)
      } catch (error) {
        expect(error.response.status).toEqual(401)
        return
      }

      fail()
    })

    test('returns 401 if token is invalid', async () => {
      hydraApi.introspectToken = jest.fn().mockImplementation(async (token: string) => {
        if (token === 'validToken') {
          return {
            active: true,
            scope: 'offline openid',
            sub: '1',
            token_type: 'access_token'
          }
        }

        return {
          active: false
        }
      })

      try {
        await axios.get(`http://localhost:${port}/users/me`, { headers: { authorization: 'Bearer invalidToken' } })
      } catch (error) {
        expect(error.response.status).toEqual(401)
        return
      }

      fail()
    })
  })
})
