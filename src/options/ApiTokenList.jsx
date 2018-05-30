import React from "react";
import { Grid, IconButton, TextField } from "@material-ui/core/es/index";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";

export type KeyValue = {
	key: ?string,
	value: ?string,
};

export type Props = {
	initialValue: ?Array<KeyValue>
};

export type State = {
	currentValues: Array<KeyValue>,
};

class ApiTokenList extends React.Component<Props, State> {
	constructor(props) {
		super(props);

		let currentValues = this.props.initialValue;
		if (currentValues == null || !currentValues.length) {
			currentValues = [{ key: null, value: null }];
		}

		this.state = {
			currentValues: currentValues,
		};
	}

	addKeyValueRow = () => {
		this.setState({
			currentValues: [...this.state.currentValues, { key: null, value: null }],
		});
	};

	removeKeyValueRow = (index: number) => {
		if (index === 0) {
			this.setState({
				currentValues: [{ key: null, value: null }, ...this.state.currentValues.slice(1)],
			});
		} else {
			let newValues = [...this.state.currentValues];
			newValues.splice(index, 1);

			this.setState({
				currentValues: newValues,
			});
		}
	};

	renderKeyValueRow = (keyValue: KeyValue, index: number, lastIndex: number) => {
		return (
			<Grid container={ true } spacing={ 16 } alignItems="baseline">
				<Grid item xs>
					<TextField
						fullWidth={ true }
						helperText="host name (e.g. github.com)"
						margin="normal"
						value={ keyValue.key }
						InputLabelProps={ {
							shrink: true,
							required: true,
						} }
					/>
				</Grid>
				<Grid item xs>
					<TextField
						fullWidth={ true }
						helperText="api token"
						margin="normal"
						value={ keyValue.value }
						InputLabelProps={ {
							shrink: true,
							required: true,
						} }
					/>
				</Grid>
				<Grid item xs={ 1 }>
					{ (index !== 0 || keyValue.key || keyValue.value) &&
					<IconButton aria-label="remove" onClick={ () => this.removeKeyValueRow(index) }>
						<RemoveIcon/>
					</IconButton>
					}
				</Grid>
				<Grid item xs={ 1 }>
					{ index === lastIndex &&
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
