const hoistBlackList: Record<string, true> = {
	$$typeof: true,
	render: true,
	compare: true,
	type: true
};

export function copyStatic(base: {}, target: {}) {
	for (const key in base) {
		if (!hoistBlackList[key] && Object.prototype.hasOwnProperty.call(base, key)) {
			Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(base, key)!);
		}
	}
}
