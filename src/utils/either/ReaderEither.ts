import { Either, left, right } from '../Either';

class ReaderEither<Env, E, A> {
  constructor(public fn: (e: Env) => Either<E, A>) {}
  cata<X>(match: { ReaderEither: (fn: (e: Env) => Either<E, A>) => X }) {
    type constraintsT = keyof typeof match;
    switch ((this.constructor.name as unknown) as constraintsT) {
      case 'ReaderEither':
      default: {
        return match['ReaderEither'](this.fn);
      }
    }
  }

  run(env: Env) {
    return this.cata({
      ReaderEither: fn => fn(env),
    });
  }

  map<B>(fn: (a: A) => B): ReaderEither<Env, E, B> {
    return new ReaderEither((env: Env) => {
      const either1 = this.run(env);
      return either1.cata({
        Left: e => left(e) as Either<E, B>,
        Right: a => right(fn(a)),
      });
    });
  }

  chain<B>(fn: (a: A) => ReaderEither<Env, E, B>): ReaderEither<Env, E, B> {
    return new ReaderEither(env => {
      const val = this.run(env);

      const x = val.cata({
        Left: (e: E) => new ReaderEither<Env, E, B>(() => left(e)),
        Right: a => fn(a),
      });
      return x.run(env);
    });
  }

  static ask<E1>() {
    return new ReaderEither((env: E1) => right(env));
  }

  static return<Env1, E, A>(a: A): ReaderEither<Env1, E, A> {
    return new ReaderEither(() => right(a));
  }
}

// Example::

const tomCat = ReaderEither.ask<{
  question: string;
  species: 'cat' | 'mouse';
}>()
  .chain(env => ReaderEither.return(env.question + 'this is Tom.' + 'He is a ' + env.species))
  .map(a => a.toUpperCase());

const t = tomCat.run({ question: 'What is his name?', species: 'cat' });
console.log(t);
