import axios, { AxiosResponse } from 'axios'
import { ExtensionList } from '../services/transaction-request-service'

const putBase: string = process.env.PUT_BASE_URI || 'http://localhost:8008' // base uri for testing

export type TransactionRequestResponse = {
  transactionId?: string;
  transactionRequestState: 'RECEIVED' | 'PENDING' | 'ACCEPTED' | 'REJECTED';
  extensionList?: ExtensionList;
}

export type TransactionRequestError = {
  errorInformation: {
    errorCode: string;
    errorDescription: string;
    extensionList: ExtensionList;
  }
}

export interface RequestResponses {
  putResponse: (responseObj: TransactionRequestResponse, transactionRequestId: string) => Promise<AxiosResponse>;
  putErrorResponse: (responseObj: TransactionRequestError, transactionRequestId: string) => Promise<AxiosResponse>;
}

export const requestResponseApi: RequestResponses = {
  putResponse: function (responseObj: TransactionRequestResponse, transactionRequestId: string) {
    const putUri = new URL('/transactionRequests/' + transactionRequestId, putBase)
    return axios.put(putUri.href, responseObj)
  },
  putErrorResponse: function (responseObj: TransactionRequestError, transactionRequestId: string) {
    const putUri = new URL('/transactionRequests/' + transactionRequestId + '/error', putBase)
    return axios.put(putUri.href, responseObj)
  }
}