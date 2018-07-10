import React, {Component} from 'react';

class TopHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      money: props.money,
      points: props.points
    };
  }
  render() {
    return (<div className="fixed-top mapHead vw-100">
      <div className="row">
        <div className="col-6 text-left">
          <span className="ml-3 logo">Sp_ot</span>
        </div>
        <div className="col-3">
          <span className="ellipse">
            <span className="text">{this.state.money}$</span>
            <i className="fas fa-piggy-bank"></i>
          </span>
        </div>
        <div className="col-3">
          <span className="ellipse">
            <span className="text">{this.state.points}</span>
            <i className="fas fa-trophy"></i>
          </span>
        </div>
      </div>
    </div>)
  }
}
export default TopHeader;
