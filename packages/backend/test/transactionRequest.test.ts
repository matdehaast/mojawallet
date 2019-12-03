import { TransactionRequest, TransactionRequestService } from '../src/services/transaction-request-service'

describe('Transaction Request Tests', () => {

  describe('Validate a transaction request', () => {

    it('Should identify a valid transaction request', async () => {
      const validRequest: TransactionRequest = {
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

      const myRequest = new TransactionRequestService(validRequest)
      expect(myRequest.getValidStatus()).toEqual(true)
    })

    it('Should identify an invalid transaction request', async () => {
      const invalidRequest: TransactionRequest = {
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
          currency: 'bad currency',
          amount: '20'
        },
        transactionType: {
          scenario: 'DEPOSIT' ,
          initiator: 'PAYER',
          initiatorType: 'CONSUMER'
        }
      }

      const myRequest = new TransactionRequestService(invalidRequest)
      expect(myRequest.getValidStatus()).toEqual(false)
    })
  })

  describe('Receiving a transaction request', () => {

    it('Should serialize and write to mojatransaction_request table', async () => {
    })
  })

  describe('Responding to a transaction request', () => {

    it('Should put a response to the client to inform that the request was received', async () => {
    })
  })
})
