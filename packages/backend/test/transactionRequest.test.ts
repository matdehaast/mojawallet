import axios from 'axios'
import { TransactionRequest } from '../src/services/transaction-request-service'
jest.mock('../src/services/mojaResponseService', () => ({
  mojaResponseService: {
    putResponse: jest.fn(),
    putErrorResponse: jest.fn(),
    quoteResponse: jest.fn()
  }
}))
import { mojaResponseService } from '../src/services/mojaResponseService'
import { createTestApp, TestAppContainer } from './utils/app'


describe('Transaction Request Test', () => {

  let appContainer: TestAppContainer
  let validRequest: TransactionRequest
  let invalidRequest: TransactionRequest

  beforeAll(async () => {
    appContainer = createTestApp()

    validRequest = {
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
    }
    invalidRequest = {
      transactionRequestId: 'ca919568-e559-42a8763-1be22179decc',
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
    }
  })

  beforeEach(async () => {
    await appContainer.knex.migrate.latest()
  })

  afterEach(async () => {
    await appContainer.knex.migrate.rollback()
  })

  afterAll(() => {
    appContainer.server.close()
    appContainer.knex.destroy()
  })

  describe('Handling a transaction request post', () => {
    test('Can store a valid transaction request and returns 200', async () => {
      const response = await axios.post(`http://localhost:${appContainer.port}/transactionRequests`, validRequest)
      const storedRequest = await appContainer.transactionRequestService.getByRequestId(validRequest.transactionRequestId)

      if (storedRequest) {
        expect(response.status).toEqual(200)
        expect(storedRequest.transactionRequestId).toEqual(validRequest.transactionRequestId)
        expect(mojaResponseService.putResponse).toHaveBeenCalledWith({
          transactionRequestState: 'RECEIVED'
        }, validRequest.transactionRequestId)
      } else {
        fail('Transaction Request not found')
      }
    })

    test('An invalid transaction request does not store data and returns 400', async () => {
      await axios.post(`http://localhost:${appContainer.port}/transactionRequests`, invalidRequest)
      .then( resp => {
        expect(true).toEqual(false)
      })
      .catch( async error => {
        const storedRequest = await appContainer.transactionRequestService.getByRequestId(invalidRequest.transactionRequestId)
        expect(storedRequest).toBeUndefined()
        expect(error.response.status).toEqual(400)
        expect(mojaResponseService.putErrorResponse).toHaveBeenCalledWith({
          errorInformation: {
            errorCode: '3100',
            errorDescription: 'Invalid transaction request',
            extensionList: []
          }
        }, invalidRequest.transactionRequestId)
      })
    })
  })

})
