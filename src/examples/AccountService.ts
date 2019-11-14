import { Either, left, right } from '../utils/Either';
import { Try, failure, Success, success, Failure } from '../utils/Try';

export class AccountService<Account, Amount, Balance> {
  constructor(
    public open: (no: string, name: string, openDate: Either<string, Date>) => Try<Account>,
    public close: (account: Account, closeDate: Either<string, Date>) => Try<Account>,
    public debit: (account: Account, amount: Amount) => Try<Account>,
    public credit: (account: Account, amount: Amount) => Try<Account>,
    public balance: (account: Account) => Try<Balance>
  ) {}

  transfer(from: Account, to: Account, amount: Amount): Try<[Account, Account, Amount]> {
    return this.debit(from, amount).chain(d => this.credit(to, amount).map(c => [d, c, amount]));
  }
}

// Example implementation::

type Amount = bigint;
const today = new Date();
export class Balance {
  constructor(public amount: Amount = BigInt(0)) {}
}
class Account {
  constructor(
    public no: string,
    public name: string,
    public dateOfOpen: Date,
    public dateOfClose: Either<string, Date> = left(''),
    public balance = new Balance(BigInt(0))
  ) {}
}

export const accountServiceImpl = new AccountService<Account, Amount, Balance>(
  // open
  (no, name, openingDate) => {
    switch (true) {
      case no === '':
        return failure(Error("Account no can't be blank"));
      case name === '':
        return failure(Error("Account name can't be blank"));
      case openingDate.isLeft():
        return failure(Error('Date invalid'));
      default:
        return new Success(new Account(no, name, openingDate.fromRight(new Date())));
    }
  },
  // close
  (account: Account, closeDate: Either<string, Date>): Try<Account> => {
    const cd = closeDate.fromRight(today);
    if (cd.getUTCMilliseconds() - today.getUTCMilliseconds()) {
      return failure(Error("Close date can't be before opening data"));
    } else {
      return success({ ...account, dateOfClose: right(cd) });
    }
  },
  // debit
  (a: Account, amount: Amount): Try<Account> => {
    if (a.balance.amount < amount) {
      return failure(Error('Insufficient balance'));
    } else {
      return success({ ...a, balance: new Balance(a.balance.amount - amount) });
    }
  },
  // credit
  (a: Account, amount: Amount): Try<Account> => {
    return success({ ...a, balance: new Balance(a.balance.amount + amount) });
  },
  // balance
  (account: Account): Try<Balance> => {
    return success(account.balance);
  }
);
