import { Party, Money, TransactionType, GeoCode, Note, DateTime, ExtensionList } from './transaction-request-service'
import Knex = require('knex')

export type Quote = {
  quoteId: string;
  transactionId: string;
  transactionRequestId?: string;
  payee: Party;
  payer: Party;
  amountType: 'SEND' | 'RECEIVE';
  amount: Money;
  fees?: Money;
  transactionType: TransactionType;
  geoCode?: GeoCode;
  note?: Note;
  expiration?: DateTime;
  extensionList?: ExtensionList;
}

export type MojaQuoteObj = {
  id: number;
  quoteId: string;
  transactionId: string;
  serializedQuote: string;
}

export class KnexQuoteService {
  private _knex: Knex
  constructor (knex: Knex) {
    this._knex = knex
  }

  async add (quote: Quote): Promise<MojaQuoteObj> {
    const insertedQuote = await this._knex<MojaQuoteObj>('mojaquote').insert({
      quoteId: quote.quoteId,
      transactionId: quote.transactionId,
      serializedQuote: JSON.stringify(quote)
    }).returning(['id', 'quoteId', 'transactionId', 'serializedQuote'])
    return (insertedQuote[0])
  }

  async get (quoteId: string) {
    const retirevedQuote = await this._knex<MojaQuoteObj>('mojaquote')
      .where({quoteId})
      .first()
    return (retirevedQuote)
  }
}