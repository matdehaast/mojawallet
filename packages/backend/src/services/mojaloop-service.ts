import Knex from 'knex'

export interface MojaloopService {
  getAuthorization: (transactionRequestId: string) => Promise<void>
  validateTransactionOTP: (transactionRequestId: string, OTP: string) => Promise<boolean>
}

export class KnexMojaloopService implements MojaloopService {
  private _knex: Knex

  constructor(knex: Knex) {
    this._knex = knex
  }

  // Initiate the GET request to the Mojaloop Switch
  async getAuthorization (transactionRequestId: string): Promise<void> {
    return
  }

  async validateTransactionOTP (transactionRequestId: string, OTP: string): Promise<boolean> {
    return true
  }

}
