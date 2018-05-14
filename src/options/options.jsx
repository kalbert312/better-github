// @flow

import React from "react";
import isEqual from "lodash.isequal";
import cloneDeep from "clone-deep";
import type { ExtSettings } from "../common/options";
import { OptionKeys } from "../common/options";
import { Button, FormControl, FormGroup, FormLabel, Grid, Snackbar, Switch, TextField } from "@material-ui/core/es/index";
import ColorPicker from "./ColorPicker";

export type Props = {
	chrome: Object,
	extSettings: ExtSettings,
	onSave?: ?(extSettings: ExtSettings) => any,
}

class OptionsPage extends React.Component<Props> {
	constructor(props) {
		super(props);

		this.state = {
			extSettings: cloneDeep(this.props.extSettings),
			isSaving: false,
		};
	}

	saveSettings = () => {
		this.setState({
			isSaving: true,
		});
		this.props.chrome.storage.sync.set(this.state.extSettings, () => {
			this.setState({
				isSaving: false,
				showSavedSnack: true,
			});
			if (this.props.onSave) {
				this.props.onSave(this.state.extSettings);
			}
		});
	};

	onSnackClose = () => {
		this.setState({
			showSavedSnack: false,
		});
	};

	getChangeHandler = (settingsKey: string, type: ?string = "input"): Function => ((arg1, arg2) => {
		let newValue;
		switch (type) {
			case "switch":
				newValue = !!arg1.target.checked;
				break;
			case "color":
				newValue = arg1;
				break;
			case "input":
			default:
				newValue = arg1.target.value;
				break;
		}

		const childSettingChanges = {};
		if (settingsKey === OptionKeys.pr.filesChanged.fileTreeEnabled && !newValue) {
			childSettingChanges[OptionKeys.pr.filesChanged.singleFileDiffing] = false;
		}

		this.setState({
			extSettings: {
				...this.state.extSettings,
				...childSettingChanges,
				[settingsKey]: newValue,
			},
		});
	});

	getColorPicker = (extSettings, settingsKey, label) => {
		const id = `pr-files-file-color-${label}`;
		return (
			<div style={ { marginLeft: "12px" } }>
				<label htmlFor={ id }>{ label }</label>
				<div id={ id }>
					<ColorPicker
						color={ extSettings[settingsKey] }
						onChange={ this.getChangeHandler(settingsKey, "color") }
					/>
				</div>
			</div>
		);
	};

	render() {
		const { extSettings } = this.state;

		const unsavedChanges = !isEqual(this.props.extSettings, this.state.extSettings);
		const savedButtonDisabled = this.state.isSaving || !unsavedChanges;

		return (
			<div style={ { width: "600px", margin: "16px 16px 30px 16px" } }>
				<div>
					<FormControl component="fieldset" disabled={ this.state.isSaving } fullWidth={ true } style={ { marginBottom: "30px" } }>
						<FormLabel component="legend">Common</FormLabel>
						<FormGroup>
							<TextField
								helperText="any valid CSS width value (e.g. 90%)"
								id="common-page-width"
								label="Page Width"
								onChange={ this.getChangeHandler(OptionKeys.common.pageWidth) }
								margin="normal"
								value={ extSettings[OptionKeys.common.pageWidth] }
							/>
						</FormGroup>
					</FormControl>
				</div>
				<div>
					<FormControl component="fieldset" disabled={ this.state.isSaving } fullWidth={ true } style={ { marginBottom: "30px" } }>
						<FormLabel component="legend">PR - Files Changed</FormLabel>
						<FormGroup>
							<Grid container={ true } justify="space-between" alignItems="center">
								<label htmlFor="pr-files-file-tree">Enable File Tree</label>
								<Switch
									color="primary"
									checked={ extSettings[OptionKeys.pr.filesChanged.fileTreeEnabled] }
									id="pr-files-file-tree"
									onChange={ this.getChangeHandler(OptionKeys.pr.filesChanged.fileTreeEnabled, "switch") }
								/>
							</Grid>
							{ extSettings[OptionKeys.pr.filesChanged.fileTreeEnabled] &&
							<div style={ { marginLeft: "30px" } }>
								<TextField
									helperText="any valid CSS width value (e.g. 400px)"
									id="pr-files-tree-width"
									label="File Tree Width"
									onChange={ this.getChangeHandler(OptionKeys.pr.filesChanged.fileTreeWidth) }
									margin="normal"
									value={ extSettings[OptionKeys.pr.filesChanged.fileTreeWidth] }
								/>
								<Grid container={ true } justify="space-between" alignItems="center">
									<label htmlFor="pr-files-single-diff">Single File Diffing (Experimental)</label>
									<Switch
										color="primary"
										checked={ extSettings[OptionKeys.pr.filesChanged.singleFileDiffing] }
										id="pr-files-single-diff"
										onChange={ this.getChangeHandler(OptionKeys.pr.filesChanged.singleFileDiffing, "switch") }
									/>
								</Grid>
								<Grid container={ true } justify="space-between" alignItems="center">
									<label>File Colors</label>
									<div>
										<Grid container={ true } justify="space-between" alignItems="center">
											{ this.getColorPicker(extSettings, OptionKeys.pr.filesChanged.fileTreeFileColorAdded, "Added") }
											{ this.getColorPicker(extSettings, OptionKeys.pr.filesChanged.fileTreeFileColorDeleted, "Deleted") }
											{ this.getColorPicker(extSettings, OptionKeys.pr.filesChanged.fileTreeFileColorModified, "Modified") }
											{ this.getColorPicker(extSettings, OptionKeys.pr.filesChanged.fileTreeFileColorMoved, "Moved") }
											{ this.getColorPicker(extSettings, OptionKeys.pr.filesChanged.fileTreeFileColorRenamed, "Renamed") }
										</Grid>
									</div>
								</Grid>
							</div>
							}
							<Grid container={ true } justify="space-between" alignItems="center" style={ { marginBottom: "30px" } }>
								<label htmlFor="pr-files-auto-load-large-diff">Auto Load Large Diffs</label>
								<Switch
									color="primary"
									checked={ extSettings[OptionKeys.pr.filesChanged.autoLoadLargeDiffs] }
									id="pr-files-auto-load-large-diff"
									onChange={ this.getChangeHandler(OptionKeys.pr.filesChanged.autoLoadLargeDiffs, "switch") }
								/>
							</Grid>
							<div>
								<Button id="save" variant="raised" color="primary" disabled={ savedButtonDisabled } fullWidth={ true }
								        onClick={ this.saveSettings }>Save</Button>
							</div>
							<Snackbar
								anchorOrigin={ {
									vertical: "bottom",
									horizontal: "left",
								} }
								onClose={ this.onSnackClose }
								open={ this.state.showSavedSnack }
								autoHideDuration={ 2500 }
								message={
									<span>Settings saved!</span>
								}
							/>
						</FormGroup>
					</FormControl>
				</div>
			</div>
		);
	}
}

export default OptionsPage;
