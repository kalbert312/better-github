import { defaultExtensionOptions } from "../../common/options";
import "./hot-reload";

let settings;
const maxTries = 2;

const getExtSettingsFromStorage = () => {
	console.debug("Better GitHub | Fetching extension settings...");
	chrome.storage.sync.get(defaultExtensionOptions, (extSettings) => {
		settings = extSettings;
		console.debug("Better GitHub | Extension settings loaded.");
	});
};

getExtSettingsFromStorage();

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
				} else {
					getExtSettingsFromStorage();
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
