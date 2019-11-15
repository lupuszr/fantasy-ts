class Monoid<T> {
  constructor(public zero: T, public op: (t1: T, t2: T) => T) {}
}
