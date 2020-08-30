import { action, observable, runInAction } from 'mobx';
import { useMemo, useRef } from 'preact/hooks';

import { isPlainObject } from './utils/object';

function wrapInAction(context: unknown, fn: (...args: unknown[]) => unknown) {
	return action((...args: unknown[]) => fn.apply(context, args));
}

type Obj = Record<string, any>;

const EMPTY: never[] = [];

export function useLocalStore<TStore extends Obj>(initializer: () => TStore): TStore
export function useLocalStore<TStore extends Obj, TSource extends object>(initializer: (source: TSource) => TStore, source: TSource): TStore
export function useLocalStore<TStore extends Obj, TSource extends object>(initializer: (source?: TSource) => TStore, source?: TSource): TStore {
	const lastSourceRef = useRef(source);
	const observableSource = useMemo(() =>
		source && observable(source, {}, { deep: false }),
		EMPTY);

	if (observableSource && source && lastSourceRef.current !== source) {
		Object.assign(observableSource, source);
		lastSourceRef.current = source;
	}

	return useMemo(() => {
		const local = observable(initializer(source));
		if (isPlainObject(local)) {
			runInAction(() => {
				for (const key in local) {
					const value = local[key];
					if (typeof value === 'function') {
						(local as Obj)[key] = wrapInAction(local, value);
					}
				}
			});
		}
		return local;
	}, EMPTY);
}
