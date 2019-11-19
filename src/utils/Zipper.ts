// Based on:
// http://gallium.inria.fr/~huet/PUBLIC/zip.pdf

// abstract class Tree<I> {
//   cata<A, B>(match: { Item: (a: I) => Item<I>; Section: ([a, x]: Array<Tree<I>>) => Section<I> }) {
//     type constraintsT = keyof typeof match;
//     switch ((this.constructor.name as unknown) as constraintsT) {
//       case 'Item': {
//         const eThis = (this as unknown) as Item<I>;
//         return match['Item'](eThis.item);
//       }
//       case 'Section':
//       default: {
//         const aThis = (this as unknown) as Section<I>;
//         return match['Section'](aThis.section);
//       }
//     }
//   }
// }
// class Item<itemP> extends Tree<itemP> {
//   constructor(public item: itemP) {
//     super();
//   }
// }
// class Section<itemP> extends Tree<itemP> {
//   constructor(public section: Array<Tree<itemP>>) {
//     super();
//   }
// }



abstract class Tree<A>  {
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
function tip<A>(): Tip<A> {
  return new Tip();
}

function branch<A>(leftBranch: Tree<A>, a: A, rightBranch: Tree<A>): Branch<A> {
  return new Branch(leftBranch, a, rightBranch);
}

/// Example: 
// new tree
const b = branch(
  branch(Tree.leaf(1), 4, Tree.leaf(2)),
  40,
  branch(Tree.leaf(10), 3, Tree.leaf(32))
)

// Pattern match on tree 40 -> 3 -> 10
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

console.log(d2);
// type path =
// Top
// | Node of tree list * path * tree list;;

abstract class Path<TreeListL, Path, TreeListR>  {
  cata<TopRes, NodeRes>(match: { Top: () => TopRes; Node: (tl: TreeListL, p: Path, tr: TreeListR) => NodeRes }) {
    type constraintsT = keyof typeof match;
    const cname = (this.constructor.name as unknown) as constraintsT;
    switch (cname) {
      case 'Top': { 
        return match['Top']();
      }
      case 'Node':
      default: {
        const { tl, p, tr } = (this as unknown) as Node<TreeListL, Path, TreeListR>;
        return match['Node'](tl, p, tr);
      }
    }
  }
}
export class Top extends Path<never, never, never> {
  constructor() {
    super();
  }
}
export class Node<TreeListL, Path, TreeListR> extends Path<TreeListL, Path, TreeListR> {
  constructor(public tl: TreeListL, public p: Path, public tr: TreeListR) {
    super();
  }
}

