import {React, useState, Component} from "react";


class SearchBar extends Component {
  	constructor() {
		super();
        let input = ""
		sessionStorage.setItem('searchQuery', input)
		this.onChangeValue = this.onChangeValue.bind(this);
	}

  	onChangeValue(event) {
		sessionStorage.setItem('searchQuery', input)
    	return event.target.value
 	}


	render() {
    	return (
			<div onChange={this.onChangeValue}> 
				<input type="text" placeholder="Search" value="" className="w-1/4" />
			</div>
    	);
  	}
}

export default SearchBar;