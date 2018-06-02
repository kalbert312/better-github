// @flow

import React from "react";
import isEqual from "lodash.isequal";
import cloneDeep from "clone-deep";
import type { ExtSettings, GitHubApiTokenDetail } from "../common/options";
import { OptionKeys } from "../common/options";
import { Button, FormControl, FormGroup, FormLabel, Grid, Snackbar, Switch, TextField } from "@material-ui/core/es/index";
import ColorPicker from "./ColorPicker";
import ApiTokenList from "./ApiTokenList";

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
			const newState = {
				isSaving: false,
				showSnack: "success",
			};
			if (this.props.chrome.runtime.lastError) {
				console.error(this.props.chrome.runtime.lastError);
				newState.showSnack = "fail";
			}
			this.setState(newState);
			if (this.props.onSave && newState.showSnack !== "fail") {
				this.props.onSave(this.state.extSettings);
			}
		});

		this.props.chrome.storage.local.set(this.state.extSettings);
	};

	onSnackClose = () => {
		this.setState({
			showSnack: false,
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
		if (settingsKey === OptionKeys.diff.filesChanged.fileTreeEnabled && !newValue) {
			childSettingChanges[OptionKeys.diff.filesChanged.singleFileDiffing] = false;
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

	onApiTokenListChange = (values: Array<GitHubApiTokenDetail>) => {
		this.setState({
			extSettings: {
				...this.state.extSettings,
				[OptionKeys.api.tokens]: values,
			},
		});
	};

	render() {
		const { extSettings } = this.state;

		const unsavedChanges = !isEqual(this.props.extSettings, this.state.extSettings);
		const savedButtonDisabled = this.state.isSaving || !unsavedChanges;

		return (
			<div>
				<Snackbar
					anchorOrigin={ {
						vertical: "top",
						horizontal: "left",
					} }
					onClose={ this.onSnackClose }
					open={ this.state.showSnack }
					autoHideDuration={ 2500 }
					message={
						<span>{ this.state.showSnack !== "fail" ? "Settings saved!" : "Failed to save settings :(" }</span>
					}
				/>
				<Grid container direction="column" style={ { width: "700px" } }>
					<Grid item>
						<div style={ { height: "390px", overflowY: "scroll", padding: "16px" } }>
							<div>
								<FormControl component="fieldset" disabled={ this.state.isSaving } fullWidth={ true } style={ { marginBottom: "30px" } }>
									<FormLabel component="legend">API Tokens</FormLabel>
									<FormGroup>
										<div style={ { marginLeft: "12px" } }>
											<ApiTokenList maxItems={ 2 } onChanged={ this.onApiTokenListChange } values={ this.state.extSettings[OptionKeys.api.tokens] }/>
										</div>
									</FormGroup>
								</FormControl>
							</div>
							<div>
								<FormControl component="fieldset" disabled={ this.state.isSaving } fullWidth={ true } style={ { marginBottom: "30px" } }>
									<FormLabel component="legend">Common</FormLabel>
									<FormGroup>
										<div style={ { marginLeft: "12px" } }>
											<TextField
												helperText="any valid CSS width value (e.g. 90%)"
												id="common-page-width"
												InputLabelProps={ {
													shrink: true,
												} }
												label="Page Width"
												onChange={ this.getChangeHandler(OptionKeys.common.pageWidth) }
												margin="normal"
												value={ extSettings[OptionKeys.common.pageWidth] }
											/>
										</div>
									</FormGroup>
								</FormControl>
							</div>
							<div>
								<FormControl component="fieldset" disabled={ this.state.isSaving } fullWidth={ true }>
									<FormLabel component="legend">PR - Files Changed</FormLabel>
									<FormGroup>
										<div style={ { marginLeft: "12px" } }>
											<Grid container={ true } justify="space-between" alignItems="center">
												<label htmlFor="pr-files-file-tree">Enable File Tree</label>
												<Switch
													color="primary"
													checked={ extSettings[OptionKeys.diff.filesChanged.fileTreeEnabled] }
													id="pr-files-file-tree"
													onChange={ this.getChangeHandler(OptionKeys.diff.filesChanged.fileTreeEnabled, "switch") }
												/>
											</Grid>
											{ extSettings[OptionKeys.diff.filesChanged.fileTreeEnabled] &&
											<div style={ { marginLeft: "24px" } }>
												<TextField
													helperText="any valid CSS width value (e.g. 400px)"
													id="pr-files-tree-width"
													InputLabelProps={ {
														shrink: true,
													} }
													label="File Tree Width"
													onChange={ this.getChangeHandler(OptionKeys.diff.filesChanged.fileTreeWidth) }
													margin="normal"
													value={ extSettings[OptionKeys.diff.filesChanged.fileTreeWidth] }
												/>
												<Grid container={ true } justify="space-between" alignItems="center">
													<label htmlFor="pr-files-single-diff">Single File Diffing (Experimental)</label>
													<Switch
														color="primary"
														checked={ extSettings[OptionKeys.diff.filesChanged.singleFileDiffing] }
														id="pr-files-single-diff"
														onChange={ this.getChangeHandler(OptionKeys.diff.filesChanged.singleFileDiffing, "switch") }
													/>
												</Grid>
												<Grid container={ true } justify="space-between" alignItems="center">
													<label>File Colors</label>
													<div>
														<Grid container={ true } justify="space-between" alignItems="center">
															{ this.getColorPicker(extSettings, OptionKeys.diff.filesChanged.fileTreeFileColorAdded, "Added") }
															{ this.getColorPicker(extSettings, OptionKeys.diff.filesChanged.fileTreeFileColorDeleted, "Deleted") }
															{ this.getColorPicker(extSettings, OptionKeys.diff.filesChanged.fileTreeFileColorModified, "Modified") }
															{ this.getColorPicker(extSettings, OptionKeys.diff.filesChanged.fileTreeFileColorMoved, "Moved") }
															{ this.getColorPicker(extSettings, OptionKeys.diff.filesChanged.fileTreeFileColorRenamed, "Renamed") }
														</Grid>
													</div>
												</Grid>
											</div>
											}
											<Grid container={ true } justify="space-between" alignItems="center" style={ { marginBottom: "30px" } }>
												<label htmlFor="pr-files-auto-load-large-diff">Auto Load Large Diffs</label>
												<Switch
													color="primary"
													checked={ extSettings[OptionKeys.diff.filesChanged.autoLoadLargeDiffs] }
													id="pr-files-auto-load-large-diff"
													onChange={ this.getChangeHandler(OptionKeys.diff.filesChanged.autoLoadLargeDiffs, "switch") }
                                                />
							                </Grid>
                                            <Grid container={ true } justify="space-between" alignItems="center">
                                                <label htmlFor="pr-files-collapse-inner-directories">Collapse inner directories in file tree when possible</label>
                                                <Switch
                                                    color="primary"
                                                    checked={ extSettings[OptionKeys.diff.filesChanged.collapseInnerDirectories] }
                                                    id="pr-files-collapse-inner-directories"
                                                    onChange={ this.getChangeHandler(OptionKeys.diff.filesChanged.collapseInnerDirectories, "switch") }
                                                />
                                            </Grid>
										</div>
									</FormGroup>
								</FormControl>
							</div>
						</div>
					</Grid>
					<Grid item style={ { height: "50px", padding: "8px 16px 8px 16px" } }>
						<Button id="save" variant="raised" color="primary" disabled={ savedButtonDisabled } fullWidth={ true } onClick={ this.saveSettings }>Save</Button>
					</Grid>
				</Grid>
			</div>
		);
	}
}

export default OptionsPage;
