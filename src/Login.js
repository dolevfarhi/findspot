import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import FacebookLogin from 'react-facebook-login';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import GoogleLogin from 'react-google-login';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRegister:false,
      username: "",
      password: "",
      name:"",
    };
    this.renderRegister = this.renderRegister.bind(this);
    this.loginit = this.loginit.bind(this);
    this.renderLogin = this.renderLogin.bind(this);
    this.responseFacebook = this.responseFacebook.bind(this);
    this.responseGoogle = this.responseGoogle.bind(this);
    this.login = this.login.bind(this);
  }

  loginit = (User) =>{
    const MySwal = withReactContent(Swal);
    localStorage.removeItem("user");
    localStorage.setItem("user", JSON.stringify(User));
    var self = this;
    setTimeout(() => { MySwal.close(); self.props.history.push('/home')} , 1000);
    MySwal.fire({title: `<p>Logging you in <br/> ${User.name}</p>`,onOpen: () => {MySwal.showLoading()}});
  }

responseGoogle = (response) => {
  if (response.hasOwnProperty("profileObj"))
    this.login({name: response.profileObj.name, fbgpid: response.profileObj.googleId});

  }
responseFacebook = (response) => {
  if (response.hasOwnProperty("name"))
    this.login({name: response.name, fbgpid: response.id});
  }
  login = (User) =>{
    const MySwal = withReactContent(Swal);
    MySwal.fire({title: <p>Loading</p>,onOpen: () => {MySwal.showLoading()}});
    var self = this;
    fetch('https://findspot.herokuapp.com/user/login', {
      method: 'POST',
      headers: {"Content-Type": "application/json; charset=utf-8"},
      body: JSON.stringify(User)})
    .then((response) => {
      if (response.status === 404) response.json().then( (object) => {
        if (User.hasOwnProperty("fbgpid")) self.registerUser(User);
        else MySwal.fire({title: `<p>Wrong Username/Password</p><i class="mt-3 far fa-frown"></i>`})
      })

      else if (response.status === 403) MySwal.fire({title: `<p>Wrong Password</p><br/> <i class="mt-3 far fa-frown"></i>`});
      else if (response.status === 200) response.json().then((object) => self.loginit({name:object.name,isVip:object.isVip,points:object.points,money:object.money,username:object.username,id:object._id,fbgpid:object.fbgpid}))
      else MySwal.fire({title: <p>Something Wrong happened <br/> <i class="mt-3 far fa-frown"></i></p>,  timer: 2000});
    });
  }
  registerUser(User){
    const MySwal = withReactContent(Swal);
    var self = this;
    fetch('https://findspot.herokuapp.com/user', {
      method: 'POST',
      headers: {"Content-Type": "application/json; charset=utf-8"},
      body: JSON.stringify(User)})
    .then((response) => {
      if (response.status === 500) {
        response.json().then(function(object) {
          MySwal.fire({title: <p>Error Creating the user <br/> <i class="mt-3 far fa-frown"></i></p>,  timer: 2000});
        })
      } else if (response.status === 200) {
        response.json().then(function(object) {
          MySwal.close()
          self.loginit({name:object.name,isVip:object.isVip,points:object.points,money:object.money,username:object.username,id:object._id,fbgpid:object.fbgpid});
        })
      }
    });
  }
  validateForm() {
    if (this.state.isRegister) return this.state.username.length && this.state.name.length && this.state.password.length;
    else return this.state.username.length && this.state.password.length;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    event.preventDefault();
    if (this.state.isRegister) this.registerUser({name: this.state.name,username: this.state.username,password: this.state.password})
    else this.login({username: this.state.username,password: this.state.password})
  }


  render = () => this.state.isRegister ? this.renderRegister() : this.renderLogin();
  renderRegister() {
    return (<div className="Login container mt-2">
          <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="name" bsSize="large">
            <ControlLabel>Name</ControlLabel>
            <FormControl autoFocus type="text" value={this.state.name} onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup controlId="username" bsSize="large">
            <ControlLabel>Username</ControlLabel>
            <FormControl autoFocus type="text" value={this.state.username} onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl value={this.state.password} onChange={this.handleChange} type="password"/>
          </FormGroup>
          <Button block bsSize="large" disabled={!this.validateForm()} type="submit"> Register </Button>
        </form>
        <span className="or d-block my-3 font-italic">or</span>
        <FacebookLogin appId="1996507257034852" fields="name,email,picture" cssClass="fb-login btn w-75 mx-auto btn-primary" icon="fa-facebook mr-2" callback={this.responseFacebook} textButton="Register with Facebook" version="3.0" />
          <GoogleLogin clientId="221656879974-m4gouq8du94nu05e8oilhvn3ktrdgou6.apps.googleusercontent.com" className="btn w-75 mx-auto btn-danger mt-2" onSuccess={this.responseGoogle} onFailure={this.responseGoogle}><i className="fab fa-google"></i><span> Register with Google</span></GoogleLogin>
            <span className="text-right mt-3 cursor-pointer text-primary w-100 d-block" onClick={(e) => this.setState({isRegister: !this.state.isRegister})}>Click here to Login</span>
      </div>
    );

  }

  renderLogin() {
    return (
      <div className="Login container mt-2">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="username" bsSize="large">
            <ControlLabel>Username</ControlLabel>
            <FormControl autoFocus type="text" value={this.state.username} onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl value={this.state.password} onChange={this.handleChange} type="password"/>
          </FormGroup>
          <Button block bsSize="large" disabled={!this.validateForm()} type="submit"> Login </Button>
        </form>
        <span className="or d-block my-3 font-italic">or</span>
        <FacebookLogin appId="1996507257034852" fields="name,email,picture" cssClass="fb-login btn w-75 mx-auto btn-primary" icon="fa-facebook mr-2" callback={this.responseFacebook} version="3.0"/>
        <GoogleLogin clientId="221656879974-m4gouq8du94nu05e8oilhvn3ktrdgou6.apps.googleusercontent.com" className="btn w-75 mx-auto btn-danger mt-2" onSuccess={this.responseGoogle} onFailure={this.responseGoogle}><i className="fab fa-google"></i><span> Login with Google</span></GoogleLogin>


      <span className="text-right mt-3 cursor-pointer text-primary w-100 d-block" onClick={(e) => this.setState({isRegister: !this.state.isRegister})}>Click here to Register</span>

      </div>
    );
  }
}
