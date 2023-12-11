import React, { Component } from "react";


class SortByList extends Component {
  	constructor() {
		super();
		sessionStorage.setItem('sortingQuery', "newest")
		this.onChangeValue = this.onChangeValue.bind(this);
	}

  	onChangeValue(event) {
		sessionStorage.setItem('sortingQuery', event.target.value)
    	return event.target.value
 	}


	render() {
    	return (
			<div onChange={this.onChangeValue}> 
				<label className="text-white mx-2">Sort by:
					<select name="listSortMethod" defaultValue="newest" className="text-black mx-2">
						<option value="newest">Newest</option>
						<option value="oldest">Oldest</option>
						<option value="title">Title, A-{">"}Z</option>
						<option value="titleReverse">Title, Z-{">"}A</option>
						<option value="shortest">Shortest</option>
						<option value="longest">Longest</option>
					</select>
				</label>
			</div>
    	);
  	}
}

export default SortByList;