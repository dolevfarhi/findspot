import React, {Component} from 'react';
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
      makeVipFunction: props.vipFunction,
      showRank:false,
      rankList:[]
    };
    this.showFireworks = this.showFireworks.bind(this);
    this.showRank = this.showRank.bind(this);
    this.closeRank = this.closeRank.bind(this);

  }
  showFireworks(){
    this.setState({showFireworks: true},()=>{
      //fireworks.init("fireworks",{});
      MySwal.fire({html: `<i class="fas fa-star fa-4x"></i><br><b>You are now VIP!<br>Enjoy longer waiting periods</b>`}).then((result) => {
        if (result.value){
          //fireworks.stop();
          this.setState({showFireworks: false});
      }})
    });
  }
  componentWillReceiveProps(nextProps) {
    if (this.state.isVip !== nextProps.user.isVip && nextProps.user.isVip) this.showFireworks();
    this.setState({ isVip: nextProps.user.isVip, money: nextProps.user.money,points: nextProps.user.points });
  }
  showRank(){
    this.setState({ showRank: true });
    var self = this;
    MySwal.fire({title: `<p>Getting the ranks</p>`,onOpen: () => {MySwal.showLoading()}});
    fetch(`https://findspot.herokuapp.com/user`,{
      method: 'GET',
      headers: {"Content-Type": "application/json; charset=utf-8"}}).then((response) => response.json())
      .then((data) => {
        MySwal.close();
        data.sort((a, b) => b.points - a.points);
        self.setState({rankList:data});
        }).catch(()=>{ MySwal.close();});
      }
      closeRank(){
        this.setState({ showRank: false });

      }
  renderRank(){
    return (
      <div className="rank">
        <i className="fas fa-arrow-left fa-2x" onClick={this.closeRank}></i>
        <div className="font-weight-bold mt-2"><span>This Week</span> <i className="fas fa-trophy fa-2x"></i></div>
        <ul className="list-group">
          {this.state.rankList.map((el) => <li className="list-group-item text-left row d-flex align-items-center" key={el.id}><div className="col-3"><img src ={el.picture}/></div> <div className="col-7"><span>{el.name}</span></div><div className="col-1 text-right"><span>{el.points}</span></div></li>)}
        </ul>
      </div>
    )
  }
  renderTop() {
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
          <span className="ellipse" onClick={this.showRank}>
            <span className="text mr-2">{this.state.points}</span>
            <i className="fas fa-trophy"></i>
          </span>
        </div>
      </div>
      { this.state.showFireworks && <div id="fireworks"><div class="pyro">
    <div class="before"></div>
    <div class="after"></div>
</div>
    </div> }

    </div>)
  }
  render = () => this.state.showRank ? this.renderRank() : this.renderTop();

}
export default TopHeader;
