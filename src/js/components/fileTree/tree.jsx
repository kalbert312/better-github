// @flow
import React from "react";
import Branch from "./branch.jsx";
import type { FileNode } from "../../bridge/github-elements";
import { isElementVisible, loadLargeDiffForDiffPanel } from "../../bridge/github-elements";
import type { ExtSettings } from "../../../common/options";
import { OptionKeys } from "../../../common/options";

type Props = {
	root: FileNode,
	extSettings: ExtSettings
};

class Tree extends React.Component<Props> {
	constructor(props) {
		super(props);

		this.onClose = this.onClose.bind(this);
		this.onScroll = this.onScroll.bind(this);

		this.state = {
			show: true,
			visibleElement: null
		};
	}

	componentDidMount() {
		window.addEventListener("DOMContentLoaded", this.onScroll, false);
		window.addEventListener("load", this.onScroll, false);
		window.addEventListener("scroll", this.onScroll, false);
		window.addEventListener("resize", this.onScroll, false);
		window.addEventListener("popstate", this.onScroll, false);
	}

	componentWillUnmount() {
		window.removeEventListener("DOMContentLoaded", this.onScroll, false);
		window.removeEventListener("load", this.onScroll, false);
		window.removeEventListener("scroll", this.onScroll, false);
		window.removeEventListener("resize", this.onScroll, false);
		window.removeEventListener("popstate", this.onScroll, false);
	}

	onScroll() {
		const { visibleElement } = this.state;
		const { root, extSettings } = this.props;
		const { diffElements = [] } = root;
		const visibleDiffElements = diffElements.filter(isElementVisible);
		if (!extSettings[OptionKeys.diff.filesChanged.singleFileDiffing] && extSettings[OptionKeys.diff.filesChanged.autoLoadLargeDiffs]) {
			visibleDiffElements.forEach((el) => {
				loadLargeDiffForDiffPanel(el);
			});
		}
		const nextVisibleElement = visibleDiffElements.length ? visibleDiffElements[0] : null;
		if (nextVisibleElement !== visibleElement) {
			this.setState({
				visibleElement: nextVisibleElement
			});
		}
	}

	onClose() {
		const show = false;
		this.setState({ show });
		document.body.classList.toggle("enable_better_github_pr", show);
	}

	render() {
		const { root, extSettings } = this.props;
		const { show, visibleElement } = this.state;

		if (!show) {
			return null;
		}

		return (
			<div id="better-github-pr-tree">
				{ !extSettings[OptionKeys.diff.filesChanged.singleFileDiffing] ? <button onClick={ this.onClose } className='close_button'>✖</button> : null }
				{ root && root.list.map(node => (
					<span key={ node.nodeLabel }>
						<Branch { ...node } visibleElement={ visibleElement }/>
                    </span>
				)) }
			</div>
		);
	}
}

export default Tree;
