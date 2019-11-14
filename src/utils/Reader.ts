export class Reader<Env, A> {
  constructor(public fn: (e: Env) => A) {}
  cata<X>(match: { Reader: (fn: (e: Env) => A) => X }) {
    type constraintsT = keyof typeof match;
    switch ((this.constructor.name as unknown) as constraintsT) {
      case 'Reader':
      default: {
        return match['Reader'](this.fn);
      }
    }
  }

  run(env: Env) {
    return this.cata({
      Reader: fn => fn(env),
    });
  }

  chain<B>(fn: (a: A) => Reader<Env, B>): Reader<Env, B> {
    return new Reader(env => {
      const val = this.run(env);
      const rb = fn(val);
      return rb.run(env);
    });
  }

  map<B>(fn: (a: A) => B): Reader<Env, B> {
    return new Reader((env: Env) => {
      const res = this.run(env);
      return fn(res);
    });
  }

  static ask<E1>() {
    return new Reader((env: E1) => env);
  }

  static return<E, T>(a: T): Reader<E, T> {
    return new Reader(() => a);
  }

  static runReader<E1, A1>(reader: Reader<E1, A1>, env: E1): A1 {
    return reader.cata({
      Reader: fn => fn(env),
    });
  }
}

/// Examples:::

const tom: Reader<string, string> = Reader.ask<string>().chain(env => Reader.return(env + 'this is Tom'));

const jerry: Reader<string, string> = Reader.ask<string>().chain(env => Reader.return(env + 'this is Jerry'));

const tomAndJerry: Reader<string, string> = tom.chain(t => jerry.chain(j => Reader.return(t + '\n' + j + '\n')));

const tomyBig = tom.map(t => t.toUpperCase());

const a = tomAndJerry.run('Who is this: ');
const r = tomyBig.run('Who is UP? ');
console.log(a, r);
