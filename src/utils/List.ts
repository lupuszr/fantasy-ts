
export abstract class List<A>  {
  cata<NilRes, ConsRes>(match: { Nil: () => NilRes; Cons: (a: A, list: List<A>) => ConsRes }) {
    type constraintsT = keyof typeof match;
    const cname = (this.constructor.name as unknown) as constraintsT;
    switch (cname) {
      case 'Nil': {
        return match['Nil']();
      }
      case 'Cons':
      default: {
        const { a, list } = (this as unknown) as Cons<A>;
        return match['Cons'](a, list);
      }
    }
  }

  concat(list: List<A>): List<A> {
    return this.cata({
      Nil: () => list,
      Cons: (a, ls) => cons(a, ls.concat(list))
    })
  }

  toArray(): Array<A> {
    return this.cata({
      Nil: () => [],
      Cons: (a, ls) => [a].concat(ls.toArray())
    });
  }

  map<B>(fn: (a: A) => B): List<B> {
    return this.cata({
      Nil: () => nil(),
      Cons: (a, ls) => cons<B>(fn(a), ls.map(fn))
    }) as List<B>;
  }

  chain<B>(fn: (a: A) => List<B>): List<B> {
    return this.cata({
      Nil: () => nil(),
      Cons: (a, ls) => fn(a).concat(ls.chain(fn))
    }) as List<B>;
  }

  static fromArray<A>(xs: Array<A>): List<A> {
    return xs.reduceRight((acc: List<A>, curr) => cons<A>(curr, acc), nil() as List<A>)
  }
}
export class Nil extends List<unknown> {
  constructor() {
    super();
  }
}
export class Cons<A> extends List<A> {
  constructor(public a: A, public list: List<A>) {
    super();
  }
}

// smart constructors
export function nil() {
  return new Nil();
}

export function cons<A>(a: A, list: List<A>) {
  return new Cons(a, list);
}

// Example::
const x = cons(1, nil())
const y = cons(10, cons(20, nil()))
console.log(x)
console.log(x.concat(y))
console.log(JSON.stringify(x.concat(y)))
console.log(List.fromArray(y.concat(x).concat(y).toArray()))
const xr = new Array(100).fill(1)
const mr = List.fromArray(xr);
const z = mr.chain(u => cons(u + 1, nil()))
console.log(z)
