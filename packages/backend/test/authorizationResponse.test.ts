import axios from 'axios'
import { TestAppContainer, createTestApp } from './utils/app'

describe('Authorization Response', () => {

  let appContainer: TestAppContainer

  beforeAll(async () => {
    appContainer = createTestApp()
  })

  beforeEach(async () => {
    await appContainer.knex.migrate.latest()
  })

  afterEach(async () => {
    jest.clearAllMocks()
    await appContainer.knex.migrate.rollback()
  })

  afterAll(async () => {
    await appContainer.knex.destroy()
    appContainer.server.close()
  })

  describe('Handling PUT to "/authorizations/{ID}"', () => {

    test('Can handle getting an authorization PUT request', async () => {

      const response = await axios.put(`http://localhost:${appContainer.port}/authorizations/${123}`, {
        authenticationInfo: {
          authentication: 'OTP',
          authenticationValue: '1234'
        },
        responseType: 'ENTERED'
      })

      expect(response.status).toBe(200)
    })

    test('If authorization is valid transfer is initiated', async () => {
      // TODO create an valid OTP
      appContainer.mojaloopService.initiateTransfer = jest.fn()

      const transactionRequest = await appContainer.transactionRequestService.create({
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
      }, 1)

      const response = await axios.put(`http://localhost:${appContainer.port}/authorizations/ca919568-e559-42a8-b763-1be22179decc`, {
        authenticationInfo: {
          authentication: 'OTP',
          authenticationValue: '1234'
        },
        responseType: 'ENTERED'
      })

      expect(appContainer.mojaloopService.initiateTransfer).toBeCalledWith('ca919568-e559-42a8-b763-1be22179decc')
      expect(response.status).toBe(200)
    })
  })
})
