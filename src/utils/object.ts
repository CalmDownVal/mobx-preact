export function isPlainObject(obj: unknown): obj is object {
	if (typeof obj === 'object' && obj) {
		const proto = Object.getPrototypeOf(obj)
		return !proto || proto === Object.prototype
	}
	return false
}
