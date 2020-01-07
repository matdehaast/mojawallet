import Knex from 'knex'
import { MojaloopRequests, PostTransferBody } from '@mojaloop/sdk-standard-components'

export interface MojaloopService {
  getAuthorization: (transactionRequestId: string) => Promise<void>
  validateTransactionOTP: (transactionRequestId: string, OTP: string) => Promise<boolean>
  initiateTransfer: (transactionRequestId: string) => Promise<void>
}

export class KnexMojaloopService implements MojaloopService {
  private _knex: Knex
  private _mojaloopRequests: MojaloopRequests

  constructor(knex: Knex, mojaloopRequests: MojaloopRequests) {
    this._knex = knex
    this._mojaloopRequests = mojaloopRequests
  }

  // Initiate the GET request to the Mojaloop Switch
  async getAuthorization (transactionRequestId: string): Promise<void> {
    return
  }

  async validateTransactionOTP (transactionRequestId: string, OTP: string): Promise<boolean> {
    return true
  }

  async initiateTransfer(transactionRequestId: string) : Promise<void> {

    // Get the quote object first based on transferId?
    const transferBody: PostTransferBody = {
      amount: {
        amount: '',
        currency: ''
      },
      condition: '',
      expiration: '',
      ilpPacket: '',
      payeeFsp: '',
      payerFsp: '',
      transferId: ''
    }

    await this._mojaloopRequests.postTransfers(transferBody, transferBody.payerFsp)
    return
  }

}
