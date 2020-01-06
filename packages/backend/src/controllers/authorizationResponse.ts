import { AccountsAppContext } from '../index'

export async function authorizationResponse (ctx: AccountsAppContext): Promise<void> {
  const { transactionRequests } = ctx
  const { id } = ctx.params
  const { body } = ctx.request

  const transactionRequest = await transactionRequests.getByRequestId(id)

  if(transactionRequest) {

    //TODO Validate authorization

    // If valid kickoff the transfer flow

  }

  ctx.status = 200
}
