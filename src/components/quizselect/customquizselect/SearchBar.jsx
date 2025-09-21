import {React, useState, Component} from "react";

// search bar component for AllCustomQuizzes
class SearchBar extends Component {
  	constructor() {
		super();
		sessionStorage.setItem('searchQuery', "")
		this.onChangeValue = this.onChangeValue.bind(this);
	}

  	onChangeValue(event) {
		sessionStorage.setItem('searchQuery', inputSearchBar.value)
    	return event.target.value
 	}


	render() {
    	return (
			<div onChange={this.onChangeValue}>
				<label>Search: 
					<input id="inputSearchBar" type="text" placeholder="Search" className="w-[150px] p-1 ml-1 text-black" />
				</label>
				
			</div>
    	);
  	}
}

export default SearchBar;