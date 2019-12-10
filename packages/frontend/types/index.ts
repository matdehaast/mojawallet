export type AccountCardProps = {
  account: AccountDetails
}

export type ProfilePageProps = {
  user: UserDetails
}

export type AccountDetails = {
  id: number
  name: string
  balance: number
  owner: number
  assetScale: number
}

export type UserDetails = {
  id: number
  username: string
  password: string
  defaultAccountId: number
  token: string
}

export type AccountsPageProps = {
  accounts: AccountDetails[]
  user: UserDetails
}

export type Totals = {
  balance: number
  assetScale: number
}
