export abstract class Try<A> {
  cata<FailureRes, SuccessRes>(match: {
    Failure: (e: Error) => FailureRes;
    Success: (a: A) => SuccessRes;
  }) {
    type constraintsT = keyof typeof match;
    switch ((this.constructor.name as unknown) as constraintsT) {
      case 'Failure': {
        const eThis = (this as unknown) as Failure;
        return match['Failure'](eThis.e);
      }
      case 'Success':
      default: {
        const aThis = (this as unknown) as Success<A>;
        return match['Success'](aThis.a);
      }
    }
  }

  try<C>(fnFailure: (e: Error) => C, fnSuccess: (a: A) => C): C {
    return this.cata({
      Failure: e => fnFailure(e),
      Success: a => fnSuccess(a),
    });
  }

  map<B>(fn: (a: A) => B): Try<B> {
    return this.cata({
      Failure: e => failure(e),
      Success: a => success(fn(a)),
    });
  }

  chain<B>(fn: (a: A) => Try<B>): Try<B> {
    return this.cata({
      Failure: e => failure(e),
      Success: a => fn(a),
    });
  }

  isFailure() {
    return this.cata({
      Failure: e => true,
      Success: a => false,
    });
  }

  isSuccess() {
    return this.cata({
      Failure: e => false,
      Success: a => true,
    });
  }

  fromFailure(defaultVal: Error): Error {
    return this.cata({
      Failure: e => e,
      Success: a => defaultVal,
    });
  }

  fromSuccess(defaultVal: A): A {
    return this.cata({
      Failure: e => defaultVal,
      Success: a => a,
    });
  }

  static return<A>(a: A) {
    return success(a);
  }
}

export class Failure extends Try<never> {
  constructor(public e: Error) {
    super();
  }
}
export class Success<A> extends Try<A> {
  constructor(public a: A) {
    super();
  }
}

export function failure(e: Error) {
  return new Failure(e);
}

export function success<A>(a: A) {
  return new Success(a);
}
