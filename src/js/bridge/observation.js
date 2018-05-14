// @flow

const { MutationObserver } = window;

export const observe = (selector: string, onMutationFn: Function): MutationObserver => {
	const elForSelector = document.querySelector(selector);
	if (!elForSelector) {
		return;
	}
	const observer = new MutationObserver(onMutationFn);
	observer.observe(elForSelector, { childList: true });
	return observer;
};
