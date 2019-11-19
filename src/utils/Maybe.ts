
export abstract class Maybe<A>  {
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

    map<B>(fn: (a: A) => B): Maybe<B> {
        return this.cata(
            {
                Nothing: () => nothing(),
                Just: a => just(fn(a))
            }
        )
    }

    chain<B>(fn: (a: A) => Maybe<B>): Maybe<B> {
        return this.cata({
            Nothing: () => nothing(),
            Just: a => fn(a)
        })
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