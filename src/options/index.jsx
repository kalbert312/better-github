// @flow

import React from "react";
import ReactDOM from "react-dom";
import type { ExtSettings } from "../common/options";
import OptionsPage from "./options";

type Props = {
	chrome: Object,
	extSettings: ExtSettings,
};

class App extends React.Component<Props> {
	constructor(props) {
		super(props);

		this.state = {
			extSettings: this.props.extSettings,
		};
	}

	onSave = (savedSettings: ExtSettings) => {
		this.setState({
			extSettings: savedSettings,
		});
		chrome.runtime.sendMessage({ type: "refreshSettings" });
	};

	render() {
		return (
			<OptionsPage
				chrome={ this.props.chrome }
				extSettings={ this.state.extSettings }
				onSave={ this.onSave }
			/>
		);
	}
}

const bootstrap = () => {
	ReactDOM.render(
		<span>Loading...</span>,
		document.getElementById("root"),
	);

	chrome.runtime.sendMessage({ type: "getSettings" }, (response) => {
		if (!response || response.error) {
			throw new Error(response ? response.error : "An unknown error has occurred.");
		}

		ReactDOM.render(
			<App chrome={ chrome } extSettings={ response.settings }/>,
			document.getElementById("root"),
		);
	});
};

document.addEventListener("DOMContentLoaded", bootstrap);
