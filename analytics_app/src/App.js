import React, { Component } from 'react';
import './App.css';

class App extends Component {

  constructor(props) {
    super(props);

    this.state = {
      searchTerm: '',
    };

    this.onChange = this.onChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onChange(event){
    this.setState({searchTerm: event.target.value});
  }

  onSubmit(){
    console.log(this.state.searchTerm);
  }

  render() {
    const {searchTerm} = this.state;
    return (
      <div>
        <form> 

          <input
          type="text"
          value={searchTerm}
          onChange={this.onChange}
          />

          <button 
            type="button"
            onClick={() => {this.onSubmit()}} 
            > Search for Game 
          </button>

        </form>
      </div>
    );
  }
}

export default App;
