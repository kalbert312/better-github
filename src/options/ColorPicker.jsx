import React from "react";
import reactCSS from "reactcss";
import { SketchPicker } from "react-color";

type Props = {
	color: ?string, // #000000
	onChange?: ?(?string) => void,
};

class ColorPicker extends React.Component<Props> {
	constructor(props) {
		super(props);

		this.state = {
			displayColorPicker: false,
			color: this.props.color,
		};
	}

	handleClick = () => {
		this.setState({ displayColorPicker: !this.state.displayColorPicker });
	};

	handleClose = () => {
		this.setState({ displayColorPicker: false });
	};

	handleChange = (color) => {
		this.setState({ color: color ? color.hex: null });
		if (this.props.onChange) {
			this.props.onChange(color ? color.hex : null);
		}
	};

	render() {
		const styles = reactCSS({
			"default": {
				color: {
					width: "50px",
					height: "14px",
					borderRadius: "2px",
					background: this.state.color,
				},
				swatch: {
					padding: "5px",
					background: "#fff",
					borderRadius: "1px",
					boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
					display: "inline-block",
					cursor: "pointer",
				},
				container: {
					position: "relative",
				},
				popover: {
					position: "absolute",
					right: "0",
					zIndex: "2",
				},
				cover: {
					position: "fixed",
					top: "0px",
					right: "0px",
					bottom: "0px",
					left: "0px",
				},
			},
		});

		return (
			<div style={ styles.container }>
				<div style={ styles.swatch } onClick={ this.handleClick }>
					<div style={ styles.color }/>
				</div>
				{ this.state.displayColorPicker ? <div style={ styles.popover }>
					<div style={ styles.cover } onClick={ this.handleClose }/>
					<SketchPicker
						disableAlpha={ true }
						color={ this.state.color }
						presetColors={ [
							"#ECF0F1",
							"#BDC3C7",
							"#95A5A6",
							"#7F8C8D",
							"#34495E",
							"#2C3E50",
							"#E74C3C",
							"#C0392B",
							"#D35400",
							"#F39C12",
							"#F1C40F",
							"#2ECC71",
							"#27AE60",
							"#16A085",
							"#1ABC9C",
							"#3498DB",
							"#2980B9",
							"#9B59B6",
							"#8E44AD",
						] }
						onChange={ this.handleChange }
					/>
				</div> : null }
			</div>
		);
	}
}

export default ColorPicker;
