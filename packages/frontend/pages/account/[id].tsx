import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { NextPage } from 'next'
import { TransactionService } from '../../services/transactions'
import { TransactionCardProps, AccountPageProps, Totals } from "../../types"
import { formatCurrency, checkUser } from "../../utils"
import { AccountsService } from '../../services/accounts'
import moment from 'moment'
import { motion } from 'framer-motion'

const accountsService = AccountsService()
const transactionService = TransactionService()

const Account: NextPage<AccountPageProps> = ({ account, transactions }) => {
  return (
    <div>
      <Head>
        <title>{account.name}</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        <div className='w-full rounded-b-2xl fixed top-0' style={{height: '21rem', background: 'linear-gradient(#023347, #025C5E, #B1CDAC)', zIndex:-3000 }}/>
          <div className='' style={{textDecoration: 'none', color: 'inherit', zIndex:0, marginTop: '6rem' }}>
            <div className='w-full mx-auto max-w-lg'>
              <div className="flex">
                <div className="text-headline text-white flex-1 text-base mx-4 px-4">
                  {account.name}
                </div>
              </div>
              <div className="w-full flex my-4 flex-wrap">
                {/* AddTransaction should Only be displayed when there is no current OTP present. */}
                <AddTransaction/>
                <Balance balance={account.balance} assetScale={2}/>
                { transactions.length > 0 ? transactions.map(transaction => <TransactionCard key={'transaction_' + transaction.id} transaction={transaction}/>) : <Empty/>}
              </div>
              {/* <Timer/> */}
            </div>
        </div>
      </div>
    </div>
  )
}


const TransactionCard: React.FC<TransactionCardProps> = ({ transaction }) => {
  const time = new Date(transaction.epoch).toLocaleString()
  const cardColour = transaction.amount >= 0 ? "success" : "error"
  const TimeNoSSR = dynamic(() => Promise.resolve(Time), { ssr: false })
  return (
    <div className="bg-white max-w-xl sm:max-w-xs rounded-xl elevation-4 flex flex-col w-full mt-8 px-6 py-4 mx-8" style={{textDecoration: 'none', color: 'inherit'}}>
      <div className="flex flex-1">
        <div className="flex-1">
          <div className={"text-headline text-" + cardColour}>
            {formatCurrency(transaction.amount, 2)}
          </div>
          <div className="text-body py-2">
            {transaction.Description}
          </div>
          <div className="text-caption text-right">
          <TimeNoSSR className="text-right">{time}</TimeNoSSR>
          </div>
        </div>
        <div>
          <img className="h-10" src={'/Mono_logo.svg'}/>
        </div>
      </div>
    </div>
  )
}

const Time = (props) => {
  return (
    <React.Fragment>{props.children}</React.Fragment>
  )
}

const Empty: React.FC = () => {
  return (
    <div className="bg-white  max-w-xl sm:max-w-xs rounded-xl elevation-4 flex flex-col w-full mt-8 px-6 py-4 mx-8" style={{textDecoration: 'none', color: 'inherit'}}>
      <div className="flex flex-wrap content-center text-center mx-10">
        <div className="w-full mb-2">
          <img className="h-40" src={'/icons/undraw_empty_xct9.svg'}/>
        </div>
        <div className="w-full text-caption">
          No transactions found! Create a transaction to get started.
        </div>
      </div>
    </div>
  )
}

const AddTransaction: React.FC = () => {
  // TODO: This should trigger a function to create an OTP so that we can display the OTP to the user.
  return (
    <motion.div
        className="inline-block max-w-xl sm:max-w-xs flex flex-col w-full mt-8 px-6 py-4 mx-8 rounded-xl elevation-4 bg-white hover:elevation-8 active:bg-dark focus:outline-none"
        onTap={() => {
          console.log('tapped')
        }}
        whileTap={{ boxShadow: "0px 5px 5px -3px rgba(0,0,0,0.20), 0px 8px 10px 1px rgba(0,0,0,0.14), 0px 3px 14px 2px rgba(0,0,0,0.12)" }}
      >
        <div className="flex flex-wrap">
          <div className="mr-1 ml-auto">
            <img className="" src={'/icons/add-24px.svg'}/>
          </div>
          <div className="ml-1 mr-auto text-button uppercase" style={{ paddingTop: '1px' }}>
            create otp
          </div>
          {/* <Loader/> */}
        </div>
      </motion.div>
  )
}

const Loader: React.FC = () => {
  return (
    <motion.img 
      className="h-16"
      src={'/Logo.svg'}
      animate={{
        rotate: [720, 0]
      }}
      transition={{
        duration: 1,
        loop: Infinity,
        ease: "circInOut"
      }}
    />
  )
}

const Balance: React.FC<Totals> = ({ balance, assetScale }) => {
  return (
    <div className="bg-white max-w-xl sm:max-w-xs rounded-xl elevation-4 flex flex-col w-full mt-8 px-6 py-4 mx-8" style={{textDecoration: 'none', color: 'inherit'}}>
      <div className="flex flex-wrap text-subheader">
        <div className="w-1/2">
          Balance
        </div>
        <div className="w-1/2 text-right">
          {formatCurrency(balance, assetScale)}
        </div>
      </div>
    </div>
  )
}

const Timer: React.FC = () => { // TODO: Update this to us the expireAt of the latest OTP.
  const expireAt = moment(1578315468000)
  const calculateTimeLeft = () => {
    return moment().isAfter(expireAt) ? '' : 'Expires ' + moment().to(expireAt)
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  
  useEffect(() => {
    let interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)
    return () => { clearInterval(interval) }
  })
  return (
    <div className="flex">
      <div className="text-caption text-white flex-1 text-base mx-4 px-4">
        {timeLeft}
      </div>
    </div>
  )
}

export default Account

Account.getInitialProps = async (ctx) => {
  let id = ctx.query.id
  let account, transactions
  const user = await checkUser(ctx)
  try {
    account = await accountsService.getAccount(id.toString(), user.token)
    transactions = await transactionService.getTransactions(account.id.toString(), user.token)
  } catch(error) {
    console.log(error)
  }
  return { account: account, transactions: transactions }
}
