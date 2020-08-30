import { Reaction } from 'mobx';
import { useEffect, useReducer, useRef } from 'preact/hooks';

import { ReactionTracking, stopReactionTracking, trackReaction } from './utils/tracking';

function incrementReducer(state: number) {
	return state + 1;
}

export function useObserver<T>(fn: () => T): T;
export function useObserver<T>(name: string, fn: () => T): T;
export function useObserver<T>(arg0: (() => T) | string, arg1?: () => T) {
	const name = `observer(${typeof arg0 === 'string' ? arg0 : ''})`;
	const fn = arg1 || arg0 as (() => T);
	const [ , forceUpdate ] = useReducer<number, void>(incrementReducer, 0);
	const reactionRef = useRef<ReactionTracking | null>(null);

	if (!reactionRef.current) {
		const reaction = new Reaction(name, () => {
			if (reactionRef.current!.mounted) {
				forceUpdate();
			}
			else {
				reaction.dispose();
				reactionRef.current = null;
			}
		});
		trackReaction(reactionRef, reaction);
	}

	useEffect(() => {
		stopReactionTracking(reactionRef);
		if (reactionRef.current) {
			reactionRef.current.mounted = true;
		}
		else {
			reactionRef.current = {
				cleanAt: Infinity,
				mounted: true,
				reaction: new Reaction(name, () => forceUpdate()),
			};
			forceUpdate();
		}
		return () => {
			reactionRef.current!.reaction.dispose();
			reactionRef.current = null;
		};
	}, []);
	
	let result: T | null = null;
	let error: Error | null = null;
	reactionRef.current!.reaction.track(() => {
		try {
			result = fn();
		} catch (e) {
			error = e;
		}
	});

	if (error) {
		throw error;
	}

	return result;
}
