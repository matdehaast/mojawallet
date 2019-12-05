import { AccountsAppContext } from '../index'
import { requestResponseApi } from '../apis/requestResponses'

export async function create (ctx: AccountsAppContext): Promise<void> {
  const { transactionRequests } = ctx
  const { body } = ctx.request

  try {

    await transactionRequests.create(body)
    requestResponseApi.putResponse({
      transactionRequestState: 'RECEIVED'
    }, body.transactionRequestId)
    ctx.status = 200
  } catch (error) {
    requestResponseApi.putErrorResponse({
      errorInformation: {
        errorCode: '3100',
        errorDescription: 'Invalid transaction request',
        extensionList: []
      }
    }, body.transactionRequestId)
    ctx.status = 400
  }
}