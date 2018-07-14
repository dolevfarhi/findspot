import React, {Component} from 'react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'

class Splash extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {
    var self = this;
    const MySwal = withReactContent(Swal);
    let User = JSON.parse(localStorage.getItem('user'));
    if (!User) setTimeout(() => self.props.history.push('/login'), 2000);
    else {
      setTimeout(() => {
        MySwal.close()
        self.props.history.push('/home')
      } , 2000);
      MySwal.fire({title: `<p>Welcome <br/> ${User.name}</p>`,onOpen: () => {MySwal.showLoading()}});
    }
  }
  render() {
    return (<div>
      <span className="textLogo position-absolute vw-100">Sp_ot</span>
      <span><img src="./splash.png" className="vh-100 vw-100" alt="Splash Screen"/></span>
    </div>)

  }
}

export default Splash;
