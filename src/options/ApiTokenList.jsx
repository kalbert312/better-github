// @flow

import * as React from "react";
import { Grid, IconButton, TextField } from "@material-ui/core/es/index";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import cloneDeep from "clone-deep";
import type { GitHubApiTokenDetail } from "../common/options";
import { normalizeGitHubApiTokenDetailValues } from "../common/options";

type ItemProperty = "h" | "t";

type Props = {
	values: ?Array<GitHubApiTokenDetail>,
	maxItems: ?number,
	onChanged: ?(Array<GitHubApiTokenDetail>) => any,
};

type State = {
	currentValues: Array<GitHubApiTokenDetail>,
};

class ApiTokenList extends React.Component<Props, State> {
	constructor(props) {
		super(props);

		this.state = {
			currentValues: normalizeGitHubApiTokenDetailValues(this.props.values),
		};
	}

	componentWillReceiveProps(nextProps: Props, nextContext: any): void {
		this.setState({
			currentValues: normalizeGitHubApiTokenDetailValues(nextProps.values),
		});
	}

	onChanged = () => {
		if (this.props.onChanged) {
			this.props.onChanged(this.state.currentValues);
		}
	};

	onInputChanged = (e: React.SyntheticEvent<HTMLInputElement>, itemProperty: ItemProperty, index: number) => {
		const newValues = cloneDeep(this.state.currentValues);
		newValues[index][itemProperty] = e.target.value;

		this.setState({
			currentValues: normalizeGitHubApiTokenDetailValues(newValues),
		}, () => {
			this.onChanged();
		});
	};

	addKeyValueRow = () => {
		this.setState({
			currentValues: [...this.state.currentValues, { h: null, t: null }],
		});
	};

	removeKeyValueRow = (index: number) => {
		const newState = {};
		if (index === 0) {
			newState.currentValues = [{ h: null, t: null }, ...this.state.currentValues.slice(1)];
		} else {
			let newValues = [...this.state.currentValues];
			newValues.splice(index, 1);
			newState.currentValues = newValues;
		}

		this.setState(newState, () => this.onChanged());
	};

	renderKeyValueRow = (keyValue: GitHubApiTokenDetail, index: number, lastIndex: number): React.ReactNode => {
		return (
			<Grid container={ true } spacing={ 16 } alignItems="baseline">
				<Grid item xs>
					<TextField
						error={ keyValue.h == null || keyValue.h.trim() === "" }
						fullWidth={ true }
						helperText="host name (e.g. github.com)"
						InputLabelProps={ {
							shrink: true,
							required: true,
						} }
						margin="normal"
						onChange={ (e) => this.onInputChanged(e, "h", index) }
						value={ keyValue.h }
					/>
				</Grid>
				<Grid item xs>
					<TextField
						error={ keyValue.t == null || keyValue.t.trim() === "" }
						fullWidth={ true }
						helperText="api token"
						InputLabelProps={ {
							shrink: true,
							required: true,
						} }
						margin="normal"
						onChange={ (e) => this.onInputChanged(e, "t", index) }
						value={ keyValue.t }
					/>
				</Grid>
				<Grid item xs={ 1 }>
					{ (index !== 0 || keyValue.h || keyValue.t) &&
					<IconButton aria-label="remove" onClick={ () => this.removeKeyValueRow(index) }>
						<RemoveIcon/>
					</IconButton>
					}
				</Grid>
				<Grid item xs={ 1 }>
					{ index === lastIndex && (this.props.maxItems == null || lastIndex + 1 !== this.props.maxItems) &&
					<IconButton aria-label="add" onClick={ () => this.addKeyValueRow() }>
						<AddIcon/>
					</IconButton>
					}
				</Grid>
			</Grid>
		);
	};

	render() {
		return (
			<div>
				{
					this.state.currentValues.map((keyValue, index, arr) => {
						return this.renderKeyValueRow(keyValue, index, arr.length - 1);
					})
				}
			</div>
		);
	}
}

export default ApiTokenList;
