import Koa from 'koa'
import axios from 'axios'
import { createApp } from '../src/app'
import { Server } from 'http'
import { KnexAccountService } from '../src/services/accounts-service'
import { KnexTransactionService } from '../src/services/transactions-service'
import { KnexUserService } from '../src/services/user-service'
import { KnexTransactionRequestService, TransactionRequest } from '../src/services/transaction-request-service'
import { KnexQuoteService, Quote, MojaQuoteObj } from '../src/services/quote-service'
import { QuoteResponse } from '../src/services/quoteResponse-service'
import { HydraApi, TokenInfo } from '../src/apis/hydra'
import createLogger from 'pino'
import { authorizeQuote } from '../src/services/authorization-service'
import Knex = require('knex')
import uuid from 'uuid'
import { MojaloopRequests } from '@mojaloop/sdk-standard-components'

describe('Authorization Response', () => {
  let server: Server
  let port: number
  let app: Koa
  let knex: Knex
  let accountsService: KnexAccountService
  let transactionsService: KnexTransactionService
  let userService: KnexUserService
  let transactionRequestService: KnexTransactionRequestService
  let quoteService: KnexQuoteService
  let hydraApi: HydraApi
  const mojaloopRequests = new MojaloopRequests({
    dfspId: 'mojawallet',
    jwsSign: false,
    jwsSigningKey: 'test',
    logger: console,
    peerEndpoint: '',
    tls: {outbound: {mutualTLS: {enabled: false}}}
  })

  beforeAll(async () => {
    knex = Knex({
      client: 'sqlite3',
      connection: {
        filename: ':memory:'
      }
    })
    accountsService = new KnexAccountService(knex)
    transactionsService = new KnexTransactionService(knex)
    userService = new KnexUserService(knex)
    transactionRequestService = new KnexTransactionRequestService(knex)
    quoteService = new KnexQuoteService(knex)
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
        } else if (token === 'user3token') {
          return {
            sub: '3',
            active: false
          } as TokenInfo
        } else {
          throw new Error('Getting Token failed')
        }
      }
    } as HydraApi

    app = createApp({
      knex,
      accountsService,
      transactionsService,
      transactionRequestService,
      logger: createLogger(),
      hydraApi,
      userService,
      quoteService,
      mojaloopRequests
    })
    server = app.listen(0)
    // @ts-ignore
    port = server.address().port

  })

  beforeEach(async () => {
    await knex.migrate.latest()
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await knex.migrate.rollback()
  })

  afterAll(async () => {
    await knex.destroy()
    server.close()
  })

  describe('Handling PUT to "/authorizations/{ID}"', () => {

    test('Can handle getting an authorization PUT request', async () => {

      const response = await axios.put(`http://localhost:${port}/authorizations/${123}`, {
        authenticationInfo: {
          authentication: 'OTP',
          authenticationValue: '1234'
        },
        responseType: 'ENTERED'
      })

      expect(response.status).toBe(200)
    })

    test('Valid transaction request authorization validates against', async () => {
      const transactionRequest = await transactionRequestService.create({
        transactionRequestId: 'ca919568-e559-42a8-b763-1be22179decc',
        payee: {
          partyIdInfo: {
            partyIdType: 'MSISDN',
            partyIdentifier: 'party1'
          }
        },
        payer: {
          partyIdInfo: {
            partyIdType: 'MSISDN',
            partyIdentifier: 'party2'
          }
        },
        amount: {
          currency: 'USD',
          amount: '20'
        },
        transactionType: {
          scenario: 'DEPOSIT' ,
          initiator: 'PAYER',
          initiatorType: 'CONSUMER'
        }
      })

      const response = await axios.put(`http://localhost:${port}/authorizations/ca919568-e559-42a8-b763-1be22179decc`, {
        authenticationInfo: {
          authentication: 'OTP',
          authenticationValue: '1234'
        },
        responseType: 'ENTERED'
      })

      expect(response.status).toBe(200)
    })
  })
})
