import React, {Component} from 'react';
import fireworks from 'react-fireworks';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
const MySwal = withReactContent(Swal);

class TopHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      money: props.user.money,
      points: props.user.point,
      isVip : props.user.isVip,
      showFireworks : false,
      makeVipFunction: props.vipFunction
    };
    this.showFireworks = this.showFireworks.bind(this);

  }
  showFireworks(){
    this.setState({showFireworks: true},()=>{
      fireworks.init("fireworks",{});
      MySwal.fire({html: `<i class="fas fa-star fa-4x"></i><br><b>You are now VIP!<br>Enjoy longer waiting periods</b>`}).then((result) => {
        if (result.value){
          fireworks.stop();
          this.setState({showFireworks: false});
      }})
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.isVip !== nextProps.user.isVip && nextProps.user.isVip) this.showFireworks();
    this.setState({ isVip: nextProps.user.isVip, money: nextProps.user.money,points: nextProps.user.points });
  }

  render() {
    return (
      <div className="fixed-top mapHead vw-100">
      <div className="row">
        <div className="col-6 row">
          <div className="col-9 text-left">
          <span className="ml-3 logo" onClick={this.state.makeVipFunction}>Sp_ot</span>
          </div>
          { this.state.isVip && <div className="col-2 text-left"> <i className="fas fa-star"></i></div> }
        </div>

        <div className="col-3">
          <span className="ellipse">
            <span className="text mr-2">{this.state.money}$</span>
            <i className="fas fa-piggy-bank"></i>
          </span>
        </div>
        <div className="col-3">
          <span className="ellipse">
            <span className="text mr-2">{this.state.points}</span>
            <i className="fas fa-trophy"></i>
          </span>
        </div>
      </div>
      { this.state.showFireworks && <div id="fireworks"></div> }

    </div>)
  }
}
export default TopHeader;
