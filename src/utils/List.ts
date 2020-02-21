import { Maybe } from "./Maybe";

export abstract class List<A>  {
  cata<NilRes, ConsRes>(match: { Nil: () => NilRes; Cons: (a: A, list: List<A>) => ConsRes }) {
    type constraintsT = keyof typeof match;
    // @ts-ignore
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

  traverse<B>(fn: (a: A) => Maybe<B>): Maybe<List<B>> {
    return this.cata({
      Nil: () => Maybe.of(List.empty()),
      Cons: (a, ls) =>
        fn(a).chain(res =>
          ls.traverse(fn).map(t => cons(res, t)))
    })
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

  static of<A>(a: A): List<A> {
    return cons(a,List.empty());
  }

  static empty<A>(): List<A> {
    return nil() as List<A>;
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
const xr = [1,2,3,4,5]
const mr = List.fromArray(xr);
const z = mr.chain(u => cons(u + 1, nil()))
console.log(z)
