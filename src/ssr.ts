let ssrEnabled = false;

export function useStaticRendering(enable: boolean) {
	ssrEnabled = enable;
}

export function isUsingStaticRendering() {
	return ssrEnabled;
}
