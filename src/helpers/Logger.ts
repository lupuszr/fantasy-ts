import { EffectsT } from '../global';
import { IO } from '../utils/IO';

type EffectNames = keyof EffectsT<Function>;
export class Logger<E extends EffectNames> {
  constructor(public log: <T>(t: T) => EffectsT<() => T>[E]) {}

  static apply<E extends EffectNames>(ev: Logger<E>): Logger<E> {
    return ev;
  }
}

// Example implementation::

const log = <T>(t: T) =>
  IO.return(() => {
    console.log(t);
    return t;
  });
const logger = new Logger<'IO'>(log);

// Example usage::

logger
  .log('this')
  .chain(k => logger.log(k + 'is'))
  .chain(r => logger.log(r + 'sparta'))
  .run();
