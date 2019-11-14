import { IO } from './utils/IO';

export interface EffectsT<A extends Function> {
  IO: IO<A>;
  List: [A];
}
