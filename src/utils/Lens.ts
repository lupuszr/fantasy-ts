function composeFn<F extends Function, G extends Function>(f: F, g: G) {
  return <T>(x: T) => g(f(x));
}

export class Lens<O, V> {
  constructor(public get: (o: O) => V, public set: (o: O, v: V) => O) {}

  static compose<Outer, Inner, Value>(outer: Lens<Outer, Inner>, inner: Lens<Inner, Value>): Lens<Outer, Value> {
    return new Lens<Outer, Value>(composeFn(outer.get, inner.get), composeFn(outer.set, inner.set));
  }
}
