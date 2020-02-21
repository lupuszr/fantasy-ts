
export abstract class Maybe<A>  {
    /**
     *
     *
     * @template NothingRes
     * @template JustRes
     * @param {{ Nothing: () => NothingRes; Just: (a: A) => JustRes }} match
     * @returns
     * @memberof Maybe
     */
    cata<NothingRes, JustRes>(match: { Nothing: () => NothingRes; Just: (a: A) => JustRes }) {
        type constraintsT = keyof typeof match;
        const cname = (this.constructor.name as unknown) as constraintsT;
        switch (cname) {
            case 'Nothing': {
                return match['Nothing']();
            }
            case 'Just':
            default: {
                const aThis = (this as unknown) as Just<A>;
                return match['Just'](aThis.a);
            }
        }
    }

    /**
     *
     *
     * @template B
     * @param {(a: A) => B} fn
     * @returns {Maybe<B>}
     * @memberof Maybe
     */
    map<B>(fn: (a: A) => B): Maybe<B> {
        return this.cata(
            {
                Nothing: () => nothing(),
                Just: a => just(fn(a))
            }
        )
    }

    /**
     *
     *
     * @template B
     * @param {(a: A) => Maybe<B>} fn
     * @returns {Maybe<B>}
     * @memberof Maybe
     */
    chain<B>(fn: (a: A) => Maybe<B>): Maybe<B> {
        return this.cata({
            Nothing: () => nothing(),
            Just: a => fn(a)
        })
    }

    /**
     ** This method provides an easy fallback mechanism
     *
     * @example:
     * function getNickname() {
     *    return nothing();
     * }
     *
     * const nickname = getNickname().alt(() => just("default"));
     *
     * @param {Maybe<A>} a
     * @returns {Maybe<A>}
     * @memberof Maybe
     */
    alt(a: Maybe<A>): Maybe<A> {
      return this.cata({
        Just: a => just(a),
        Nothing: () => a
      })
    }

    /**
     * alias to alt @see alt
     * 
     *
     * @param {Maybe<A>} a
     * @returns {Maybe<A>}
     * @memberof Maybe
     */
    fallback(a: Maybe<A>): Maybe<A> {
      return this.alt(a);
    }

    // make a potential side effect if a values exists
    // this function exists only for sake of un-pure development.
    tapJust(fn: (a: A) => void): Maybe<A> {
      return this.cata({
        Nothing: () => this,
        Just: a =>  {
          fn(a);
          return this;
        }
      })
    }

    // make a potential side effect if the Maybe is nothing.
    // ideal for handling cases like unexpected null or similar situations
    // this function exists only for sake of un-pure development.
    tapNothing(fn: () => void): Maybe<A> {
      return this.cata({
        Nothing: () => {
          fn();
          return this;
        },
        Just: _ =>  {
          return this;
        }
      })
    }

    // static functions

    static of<A>(a: A): Maybe<A> {
      return just(a);
    }

    static fromNullable<T>(a: T): Maybe<NonNullable<T>> {
      if (!a) {
        return nothing();
      }
      const x: NonNullable<T> = a as NonNullable<T>;
      return just(x);
    }

    static fromNullableObject<T extends Object>(obj: T): { [A in keyof T]: Maybe<NonNullable<T[A]>> } {
      return Object.entries(obj).reduce((acc, [key, val]) => {
        return {
          ...acc,
          [key]: typeof val === "object" 
            ? Maybe.fromNullableObject(val)
            : Maybe.fromNullable<typeof val>(val)
        };
      }, {}) as { [A in keyof T]: Maybe<NonNullable<T[A]>> };
    }

}
export class Nothing extends Maybe<never> {
    constructor() {
        super();
    }
}
export class Just<A> extends Maybe<A> {
    constructor(public a: A) {
        super();
    }
}

// smart constructors
export function nothing() {
    return new Nothing();
}

export function just<A>(a: A) {
    return new Just(a);
}

const a = new Just(10)
a.cata({
    Nothing: () => '',
    Just: (a) => 10 + a
})