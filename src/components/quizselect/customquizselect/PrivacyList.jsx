import React, { Component } from "react";


class PrivacyList extends Component {
  	constructor() {
		super();
		sessionStorage.setItem('privacy', "All")
		this.onChangeValue = this.onChangeValue.bind(this);
	}

  	onChangeValue(event) {
		sessionStorage.setItem('privacy', event.target.value)
    	return event.target.value
 	}


	render() {
    	return (
			<div onChange={this.onChangeValue}> 
				<label>Display:
					<select name="listSortMethod" defaultValue="All" className="text-black ml-1 p-1">
						<option value="All">All Quizzes</option>
						<option value="Public">Public Quizzes</option>
						<option value="Private">Private Quizzes</option>
					</select>
				</label>
			</div>
    	);
  	}
}

export default PrivacyList;