import { pipe } from 'rxjs';
import { filter, throwIfEmpty } from 'rxjs/operators';

export function throwIfFalse(predicate, error_func) {
    return pipe(
        filter(v => predicate(v)),
        throwIfEmpty(error_func)
    );
}
