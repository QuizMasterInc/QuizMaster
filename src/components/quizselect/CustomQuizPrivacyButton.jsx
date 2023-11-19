import React, { Component } from "react";
import { Link } from "react-router-dom";

class PrivacyRadioButtons extends Component {
  constructor() {
    super();
    this.onChangeValue = this.onChangeValue.bind(this);
  }

  onChangeValue(event) {
    console.log(event.target.value);
    return event.target.value
  }

  render() {
    return (
      <div onChange={this.onChangeValue} class="text-white">
        <input type="radio" value="All" name="privacy" /> All Quizzes
        <input type="radio" value="Public" name="privacy" /> Public
        <input type="radio" value="Private" name="privacy" /> Private
      </div>
    );
  }
}

export default PrivacyRadioButtons;

