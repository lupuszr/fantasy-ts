export abstract class Tree<A>  {
  cata<TipRes, BranchRes>(match: { Tip: () => TipRes; Branch: (leftBranch: Tree<A>, value: A, rightBranch: Tree<A>) => BranchRes }) {
    type constraintsT = keyof typeof match;
    const cname = (this.constructor.name as unknown) as constraintsT;
    switch (cname) {
      case 'Tip': {
        return match['Tip']();
      }
      case 'Branch':
      default: {
        const { leftBranch, value, rightBranch } = (this as unknown) as Branch<A>;
        return match['Branch'](leftBranch, value, rightBranch);
      }
    }
  }

  static leaf<A>(a: A): Tree<A> {
    return branch(tip(), a, tip())
  }
}
export class Tip<A> extends Tree<A> {
  constructor() {
    super();
  }
}
export class Branch<A> extends Tree<A> {
  constructor(public leftBranch: Tree<A>, public value: A, public rightBranch: Tree<A>) {
    super();
  }
}

// smart constructors:
export function tip<A>(): Tip<A> {
  return new Tip();
}

export function branch<A>(leftBranch: Tree<A>, a: A, rightBranch: Tree<A>): Branch<A> {
  return new Branch(leftBranch, a, rightBranch);
}

// @doc
// Example: 
// new tree
//     40
//  4     3
// 1 2  10 32
/*
const b = branch(
  branch(Tree.leaf(1), 4, Tree.leaf(2)),
  40,
  branch(Tree.leaf(10), 3, Tree.leaf(32))
)
*/

// Pattern match on tree 40 -> 3 -> 10
/*
const d2 = b.cata({
  Branch: (lb, v, rb) => {
    return rb.cata({
      Branch: (lr1, vr1, rr1) => {
        return lr1.cata({
          Branch: (l2, v2, r2) => {
            return v2;
          },
          Tip: () => {}
        })
      },
      Tip: () => {} 
    })
  },
  Tip: () => {}
});
*/