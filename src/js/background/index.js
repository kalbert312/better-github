import { defaultExtensionOptions } from "../../common/options";

let settings;
let error;

const getExtSettingsFromSync = () => {
	chrome.storage.sync.get(defaultExtensionOptions, (extSettings) => {
		if (chrome.runtime.lastError) {
			error = chrome.runtime.lastError;
		}
		settings = extSettings;
	});
};

getExtSettingsFromSync();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "getSettings") {
		let start = new Date();
		while (!settings) {
			let now = new Date();
			if ((now - start) / 1000 > 3 || error) {
				sendResponse({ error: true });
				return;
			}
		}

		sendResponse({ settings });
	} else if (message.type === "refreshSettings") {
		getExtSettingsFromSync();
	}
});
