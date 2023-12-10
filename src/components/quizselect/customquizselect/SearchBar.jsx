import {React, useState, Component} from "react";


class SearchBar extends Component {
  	constructor() {
		super();
		sessionStorage.setItem('searchQuery', "")
		this.onChangeValue = this.onChangeValue.bind(this);
	}

  	onChangeValue(event) {
		sessionStorage.setItem('searchQuery', inputSearchBar.value)
		console.log(sessionStorage.getItem('searchQuery'))
    	return event.target.value
 	}


	render() {
    	return (
			<div onChange={this.onChangeValue}> 
				<input id="inputSearchBar" type="text" placeholder="Search" className="w-1/4" />
			</div>
    	);
  	}
}

export default SearchBar;