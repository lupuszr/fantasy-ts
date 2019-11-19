export abstract class Either<E, A> {
  cata<LeftRes, RightRes>(match: { Left: (e: E) => LeftRes; Right: (a: A) => RightRes }) {
    type constraintsT = keyof typeof match;
    const cname = (this.constructor.name as unknown) as constraintsT;
    switch (cname) {
      case 'Left': {
        const eThis = (this as unknown) as Left<E>;
        return match['Left'](eThis.e);
      }
      case 'Right':
      default: {
        const aThis = (this as unknown) as Right<A>;
        return match['Right'](aThis.a);
      }
    }
  }

  either<C>(fnLeft: (e: E) => C, fnRight: (a: A) => C): C {
    return this.cata({
      Left: e => fnLeft(e),
      Right: a => fnRight(a),
    });
  }

  map<B>(fn: (a: A) => B): Either<E, B> {
    return this.cata({
      Left: e => left(e),
      Right: a => right(fn(a)),
    });
  }

  chain<B>(fn: (a: A) => Either<E, B>): Either<E, B> {
    return this.cata({
      Left: e => left(e),
      Right: a => fn(a),
    });
  }

  isLeft() {
    return this.cata({
      Left: e => true,
      Right: a => false,
    });
  }

  isRight() {
    return this.cata({
      Left: e => false,
      Right: a => true,
    });
  }

  fromLeft(defaultVal: E): E {
    return this.cata({
      Left: e => e,
      Right: a => defaultVal,
    });
  }

  fromRight(defaultVal: A): A {
    return this.cata({
      Left: e => defaultVal,
      Right: a => a,
    });
  }

  static return<E, A>(a: A) {
    return new Right(a) as Either<E, A>
  }
}

export class Left<E> extends Either<E, never> {
  constructor(public e: E) {
    super();
  }
}
export class Right<A> extends Either<never, A> {
  constructor(public a: A) {
    super();
  }
}

export function left<E, A>(e: E) {
  return new Left(e) as Either<E, A>;
}

export function right<E, A>(a: A) {
  return new Right(a) as Either<E, A>; 
}
