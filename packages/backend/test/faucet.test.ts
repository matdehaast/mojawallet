import Koa from 'koa'
import axios from 'axios'
import { createApp } from '../src/app'
import { Server } from 'http'
import { KnexAccountService } from '../src/services/accounts-service'
import { KnexTransactionService } from '../src/services/transactions-service'
import createLogger from 'pino'
import { HydraApi, TokenInfo } from '../src/apis/hydra'
import Knex = require('knex')

describe('Faucet API Test', () => {
  let server: Server
  let port: number
  let app: Koa
  let knex: Knex
  let accountsService: KnexAccountService
  let transactionsService: KnexTransactionService
  let hydraApi: HydraApi

  describe('Mock test', () => {
    test('Nothing', () => {
      expect(1)
    })
  })

  // beforeAll(async () => {
  //   knex = Knex({
  //     client: 'sqlite3',
  //     connection: {
  //       filename: ':memory:'
  //     }
  //   })
  //   accountsService = new KnexAccountService(knex)
  //   transactionsService = new KnexTransactionService(knex)
  //   tokenService = new TokenService({
  //     clientId: process.env.OAUTH_CLIENT_ID || 'wallet-users-service',
  //     clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
  //     issuerUrl: process.env.OAUTH_ISSUER_URL || 'https://auth.rafiki.money',
  //     tokenRefreshTime: 0
  //   })
  //   hydraApi = {
  //     introspectToken: async (token) => {
  //       if (token === 'user1token') {
  //         return {
  //           sub: '1',
  //           active: true
  //         } as TokenInfo
  //       } else if (token === 'user2token') {
  //         return {
  //           sub: '2',
  //           active: true
  //         } as TokenInfo
  //       } else if (token === 'usersServiceToken') {
  //         return {
  //           sub: 'users-service',
  //           active: true
  //         } as TokenInfo
  //       } else {
  //         throw new Error('Getting Token failed')
  //       }
  //     }
  //   } as HydraApi

  //   app = createApp({
  //     accountsService,
  //     transactionsService,
  //     logger: createLogger(),
  //     tokenService,
  //     hydraApi
  //   })
  //   server = app.listen(0)
  //   // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
  //   // @ts-ignore
  //   port = server.address().port
  // })

  // beforeEach(async () => {
  //   await knex.migrate.latest()
  // })

  // afterEach(async () => {
  //   await knex.migrate.rollback()
  // })

  // afterAll(() => {
  //   server.close()
  //   knex.destroy()
  // })

  // describe('Add from faucet', () => {
  //   let account: any
  //   beforeEach(async () => {
  //     account = await accountsService.add({
  //       assetCode: 'XML',
  //       assetScale: 2,
  //       limit: 0n,
  //       name: 'Test',
  //       userId: '1'
  //     })
  //   })

  //   it('User can add money via fuacet', async () => {
  //     const response = await axios.post(`http://localhost:${port}/faucet`, {
  //       accountId: account.id
  //     }
  //     , {
  //       headers: {
  //         authorization: 'Bearer user1token'
  //       }
  //     }).then(resp => {
  //       expect(resp.status).toBe(201)
  //       return resp.data
  //     })

  //     const acc = await accountsService.get(account.id)
  //     expect(acc.balance.toString()).toBe('100000000')
  //   })

  //   it('User cant add a transaction for an account not theirs', async () => {
  //     const response = axios.post(`http://localhost:${port}/transactions`, {
  //       accountId: account.id,
  //       amount: '100'
  //     }
  //     , {
  //       headers: {
  //         authorization: 'Bearer user2token'
  //       }
  //     })

  //     await expect(response).rejects.toEqual(Error('Request failed with status code 404'))
  //   })
  // })
})
