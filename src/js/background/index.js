import { defaultExtensionOptions } from "../../common/options";

let settings;
const maxTries = 2;

const getExtSettingsFromStorage = (storageType: string) => {
	chrome.storage[storageType].get(defaultExtensionOptions, (extSettings) => {
		settings = extSettings;
	});
};

getExtSettingsFromStorage("sync");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.type === "getSettings") {
		let start = new Date();
		let tries = 0;

		// hacky, but trying to work around intermittent loading problems
		while (!settings) {
			if (chrome.runtime.lastError) {
				sendResponse({
					error: chrome.runtime.lastError,
				});
				return;
			}
			let now = new Date();
			if ((now - start) / 1000 > 2) {
				if (tries === maxTries) {
					sendResponse({ error: "Failed to load extension settings" });
					return;
				} else if (tries === (maxTries - 1)) {
					getExtSettingsFromStorage("local");
				} else {
					getExtSettingsFromStorage("sync");
				}

				start = new Date();
				tries++;
			}
		}

		sendResponse({ settings });
	} else if (message.type === "refreshSettings") {
		getExtSettingsFromStorage();
	}
});
