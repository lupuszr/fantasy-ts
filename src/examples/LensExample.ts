import { PropertyObject } from '../types/classHelpers';
import { Lens } from '../utils/Lens';

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

class Customer {
  constructor(public name: string, public address: Address) {}

  copy(match: Partial<PropertyObject<typeof Customer>>): Customer {
    return { ...this, ...match };
  }
}

const address = new Address('pera', '', '', '', '12');

const customer = new Customer('Pera Peric', address);

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