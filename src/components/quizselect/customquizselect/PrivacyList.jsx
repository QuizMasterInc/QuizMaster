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
				<label className="text-white mx-2">Display:
					<select name="listSortMethod" defaultValue="All" className="text-black mx-2">
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