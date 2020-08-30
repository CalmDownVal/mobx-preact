import type { Reaction } from 'mobx';
import type { RefObject } from 'preact';

export interface ReactionTracking {
	cleanAt: number;
	mounted: boolean;
	reaction: Reaction;
}

const CLEANUP_AFTER_MS = 10000;
const CLEANUP_TIMER_MS = 10000;
const trackedRefs = new Set<RefObject<ReactionTracking>>();

let cleanupTimerHandle = 0;

function cleanup() {
	const now = Date.now();
	trackedRefs.forEach(ref => {
		const tracking = ref.current;
		if (tracking && tracking.cleanAt <= now) {
			tracking.reaction.dispose();
			trackedRefs.delete(ref);
			ref.current = null;
		}
	});

	cleanupTimerHandle = 0;
	if (trackedRefs.size > 0) {
		scheduleCleanup();
	}
}

function scheduleCleanup() {
	if (cleanupTimerHandle === 0) {
		cleanupTimerHandle = setTimeout(cleanup, CLEANUP_TIMER_MS);
	}
}

export function trackReaction(ref: RefObject<ReactionTracking>, reaction: Reaction) {
	ref.current = {
		cleanAt: Date.now() + CLEANUP_AFTER_MS,
		mounted: false,
		reaction,
	};

	trackedRefs.add(ref);
	scheduleCleanup();
}

export function stopReactionTracking(ref: RefObject<ReactionTracking>) {
	trackedRefs.delete(ref);
}
