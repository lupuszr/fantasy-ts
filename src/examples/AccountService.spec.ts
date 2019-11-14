import fc from 'fast-check';
import { AccountService, AccountServiceImpl as ac, Balance } from './AccountService';
import { Try } from '../utils/Try';
import { right } from '../utils/Either';


const ac1 =  new AccountService<{ balance: bigint }, bigint, bigint>(
  (no, name, openDate) => Try.return({ balance: 1 as unknown as bigint }), //open
  (account, closeDate) => Try.return({ balance: 1 as unknown as bigint }), //close
  (account, amount) => Try.return({ balance: account.balance + amount }), //debit
  (account, amount) => Try.return({ balance: account.balance - amount }), // credit
  (account) => Try.return(account.balance) // balance
)

it('Equal credit & debit in sequence retain the same balance', () => {
  const accountModel = {
    balance: fc.bigUint().map(b => new Balance(b)),
    no: fc.string(),
    name: fc.string(),
    dateOfOpen: fc.date(),
    dateOfClose: fc.constant(right(new Date()))
  }

  fc.assert(
    fc.property(fc.record(accountModel), fc.bigUint(), (account, money) => {
      const res = ac.balance(account).chain(balance => 
          ac.credit(account, money).chain(a1 => 
            ac.debit(a1, money).map(a2 => [balance, a2.balance])
        )
      );

      const [b1, b2] = res.cata({
        Failure: e => [-1, -2],
        Success: b => b 
      });
      return b1 == b2;
    }), {verbose: true}
  );
});
