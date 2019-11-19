import { PropertyObject } from '../../types/classHelpers';
import { List, cons, nil } from '../List';
import { Maybe, nothing, just } from '../Maybe';

class ListZipper<A> {
  constructor(
    public lefts: List<A>,
    public focus: A,
    public rights: List<A>
  ){}

  copy(match: Partial<PropertyObject<typeof ListZipper>>): ListZipper<A> {
    return {...this, ...match}
  }

  put(newFocus: A): ListZipper<A> {
    return listZipper(this.lefts, newFocus, this.rights);
  }

  goLeft(): Maybe<ListZipper<A>> {
    return this.lefts.cata({
      Nil: () => nothing(),
      Cons: (a: A, ls: List<A>) => just(listZipper(ls, a, cons(this.focus, this.rights)))
    })
  }

  goLeftBy(n: number): Maybe<ListZipper<A>> {
    switch(true) {
      case (n === 1): return this.goLeft();
      case (n > 1): {
        console.log("n::", n)
        return this.goLeftBy(n - 1).chain(a => a.goLeft())
      }
      default: return nothing()
    }
  }

  goRight(): Maybe<ListZipper<A>> {
    return this.rights.cata({
      Nil: () => nothing(),
      Cons: (a: A, rs: List<A>) => just(listZipper(cons(this.focus, this.lefts), a, rs))
    })
  }
 
  toList(): List<A> {
    return this.lefts.concat(cons(this.focus, this.rights))
  }
}

export function listZipper<A>(lefts: List<A>, a: A, rights: List<A>) {
  return new ListZipper(lefts, a, rights)
}

// smart constructor
export function zipper<A>(l: List<A>): Maybe<ListZipper<A>> {
  return l.cata({
    Nil: () => nothing(),
    Cons: (a, ls) => just(listZipper(nil(), a, ls))
  }) as Maybe<ListZipper<A>>
}

// Example:
const a = [1, 2,3, 4,5, 100]
const l = List.fromArray(a);
const r = zipper(l)
  .chain(u => u.goRight())
  .chain(u => u.goRight())
  // .chain(u => just(u.put(1024)))
  .chain(u => u.goRight())
  .chain(u => u.goLeftBy(2))
  .map(u => u.focus)
  // .chain(u => just(u.toList()))
  // .chain(u => just(u.toArray()))
console.log(r);
