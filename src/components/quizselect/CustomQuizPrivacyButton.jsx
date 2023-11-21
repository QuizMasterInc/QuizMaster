import React, { Component } from "react";
import { Link } from "react-router-dom";

class PrivacyRadioButtons extends Component {
  constructor() {
    super();
    sessionStorage.setItem('privacy', "All")
    this.onChangeValue = this.onChangeValue.bind(this);
  }

  onChangeValue(event) {
    sessionStorage.setItem('privacy', event.target.value)
    //console.log("stored: ", sessionStorage.getItem('privacy'))
    return event.target.value
  }


  render() {
    return (
      <div onChange={this.onChangeValue} class="text-white flex">
        <div class="mx-2 py-2">
          <input type='radio' value='All' name='privacy' defaultChecked /> All Quizzes
        </div>
        <div class="mx-2 py-2">
          <input type='radio' value='Public' name='privacy' class="mx-1" /> Public
        </div>
        <div class="mx-2 py-2">
          <input type='radio' value='Private' name='privacy' class="mx-1" /> Private
        </div>
      </div>
    );
  }
}

export default PrivacyRadioButtons;

