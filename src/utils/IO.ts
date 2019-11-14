export class IO<F extends Function> {
  constructor(public unsafeIO: F) {}
  cata<X>(match: { IO: (unsafeIO: F) => X }) {
    type constraintsT = keyof typeof match;
    switch ((this.constructor.name as unknown) as constraintsT) {
      case 'IO':
      default: {
        return match['IO'](this.unsafeIO);
      }
    }
  }

  run() {
    return this.cata({
      IO: unsafeIO => unsafeIO(),
    });
  }

  chain<B extends Function>(fn: (a: F) => IO<B>): IO<B> {
    return fn(this.run());
  }

  map<B extends Function>(fn: (a: F) => B): IO<B> {
    return new IO(fn(this.run()));
  }

  static return<F extends Function>(f: F) {
    return new IO(f);
  }
}

/// Examples::
type rr = (a: string) => string;
const x122 = new IO<rr>(() => 'fasz');
x122
  .chain(
    k =>
      new IO(() => {
        console.log(k, 'geci');
        return 'PINA';
      })
  )
  .map(k => () => {
    console.log(k, 'gecike');
    return k + '!!!PINA';
  })
  .chain(o => new IO(() => console.log(o, 'geci3')))
  .run();
