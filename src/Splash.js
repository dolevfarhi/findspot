import React, { Component } from 'react';

class Splash extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    var self = this;
    setTimeout(() => self.props.history.push('/home'), 300);
  }
  render() {
  return (
    <div>
      <span className="textLogo position-absolute vw-100">Sp_ot</span>
      <span><img src="./splash.png" className="vh-100 vw-100" alt="Splash Screen"/></span>
    </div>
  )

}
}

export default Splash;
