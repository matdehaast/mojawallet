import { KnexAccountService } from './services/accounts-service'
import { Logger } from 'pino'
import { KnexTransactionService } from './services/transactions-service'
import Koa from 'koa'
import Router from '@koa/router'
import bodyParser from 'koa-bodyparser'
import { create as createFaucet } from './controllers/faucet'
import { create as createTransaction, index as indexTransactions } from './controllers/transactions'
import { create as createAccount, update as updateAccount, show as showAccount, index as indexAccount } from './controllers/accounts'
import { show as showUser, store as storeUser, update as updateUser } from './controllers/user'
import { show as showLogin, store as storeLogin } from './controllers/login'
import { store as storeLogout } from './controllers/logout'
import { create as createTransactionRequest } from './controllers/transactionRequest'
import { show as showConsent, store as storeConsent } from './controllers/consent'
import { quoteResponse } from './controllers/quoteResponse'
import { AccountsAppContext } from './index'
import { HydraApi } from './apis/hydra'
import { createAuthMiddleware } from './middleware/auth'
import cors from '@koa/cors'
import { KnexUserService } from './services/user-service'
import { KnexTransactionRequestService } from './services/transaction-request-service'
import { KnexQuoteService } from './services/quote-service'
import { MojaloopRequests } from '@mojaloop/sdk-standard-components'
import Knex from 'knex'
import { authorizationResponse } from './controllers/authorizationResponse'
import { MojaloopService } from './services/mojaloop-service'

export type AppConfig = {
  logger: Logger;
  accountsService: KnexAccountService;
  transactionsService: KnexTransactionService;
  transactionRequestService: KnexTransactionRequestService;
  quoteService: KnexQuoteService;
  hydraApi: HydraApi;
  userService: KnexUserService;
  mojaloopRequests: MojaloopRequests;
  mojaloopService: MojaloopService;
  knex: Knex
}

export function createApp (appConfig: AppConfig): Koa<any, AccountsAppContext> {
  const app = new Koa<any, AccountsAppContext>()
  const privateRouter = new Router<any, AccountsAppContext>()
  const publicRouter = new Router<any, AccountsAppContext>()

  app.use(cors())
  app.use(bodyParser())
  app.use(async (ctx, next) => {
    ctx.knex = appConfig.knex
    ctx.accounts = appConfig.accountsService
    ctx.transactions = appConfig.transactionsService
    ctx.logger = appConfig.logger
    ctx.users = appConfig.userService
    ctx.transactionRequests = appConfig.transactionRequestService
    ctx.quotes = appConfig.quoteService
    ctx.hydraApi = appConfig.hydraApi
    ctx.mojaloopRequests = appConfig.mojaloopRequests
    ctx.mojaloopService = appConfig.mojaloopService
    await next()
  })

  // Health Endpoint
  publicRouter.get('/healthz', (ctx) => {
    ctx.status = 200
  })

  privateRouter.use(createAuthMiddleware(appConfig.hydraApi))
  privateRouter.get('/accounts/:id', showAccount)
  privateRouter.get('/accounts', indexAccount)
  privateRouter.post('/accounts', createAccount)
  privateRouter.patch('/accounts/:id', updateAccount)
  privateRouter.delete('/accounts/:id', createAccount)

  privateRouter.get('/transactions', indexTransactions)
  privateRouter.post('/transactions', createTransaction)

  privateRouter.post('/faucet', createFaucet)

  publicRouter.post('/users', storeUser)
  privateRouter.patch('/users', updateUser)
  privateRouter.get('/users/me', showUser)

  publicRouter.get('/login', showLogin)
  publicRouter.post('/login', storeLogin)

  publicRouter.post('/logout', storeLogout)

  publicRouter.get('/consent', showConsent)
  publicRouter.post('/consent', storeConsent)

  publicRouter.post('/transactionRequests', createTransactionRequest)
  publicRouter.put('/quotes/:id', quoteResponse)

  publicRouter.put('/authorizations/:id', authorizationResponse)

  app.use(publicRouter.routes())
  app.use(privateRouter.routes())

  return app
}
