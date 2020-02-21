import { PropertyObject } from '../types/classHelpers';
import { Lens } from '../utils/optics/Lens';

class Address {
  constructor(
    public no: string,
    public street: string,
    public city: string,
    public state: string,
    public zip: string
  ) {}

  copy(match: Partial<PropertyObject<typeof Address>>): Address {
    return { ...this, ...match };
  }
}

class Account {
  constructor(public id: number) {}

  copy(match: Partial<PropertyObject<typeof Account>>): Account {
    return { ...this, ...match };
  }
}

const idLens = new Lens<Account, number>(
  // get::
  (a: Account): number => a.id,
  // set::
  (a: Account, value: number): Account => a.copy({ id: value })
);

class Customer {
  constructor(public name: string, public address: Address, public account: Account) {}

  copy(match: Partial<PropertyObject<typeof Customer>>): Customer {
    return { ...this, ...match };
  }
}

const address = new Address('pera', '', '', '', '12');
const account = new Account(1234);

const accountLens = new Lens<Customer, Account>(
  // get::
  (a: Customer): Account => a.account,
  // set::
  (a: Customer, value: Account): Customer => a.copy({ account: value })
);

const customer = new Customer('Pera Peric', address, account);

const customerIdLens = Lens.compose(accountLens, idLens);
const x = customerIdLens.get(customer);
const u = customerIdLens.set(customer, 345);

const addressLens = new Lens<Customer, Address>(
  // get::
  (a: Customer): Address => a.address,
  // set::
  (a: Customer, value: Address): Customer => a.copy({ address: value })
);

const zipLens = new Lens<Address, string>(
  // get::
  (a: Address): string => a.zip,
  // set::
  (a: Address, value: string): Address => a.copy({ zip: value })
);

const custAddrZipLens = Lens.compose(addressLens, zipLens);

const r = custAddrZipLens.get(customer);
console.log(r); // 12
