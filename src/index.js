import React from 'react';
import ReactDOM from 'react-dom';
import Splash from './Splash';
import Home from './Home';
import Login from './Login';
import {HashRouter, Switch, Route,Redirect} from 'react-router-dom';
import './main.css';
const PrivateRoute = ({ component: Component, ...rest }) => (

  <Route {...rest} render={props => (
     localStorage.getItem("user") ?
    (<Component {...props}/> ) : (<Redirect to={{ pathname: '/login',state: { from: props.location } }}/>)
  )}/>
)

ReactDOM.render((<HashRouter>
  <div className="site">
    <div className="container-fluid text-center p-0">
      <Switch>
        <Route exact path='/' component={Splash}/>
        <Route exact path='/index.html' component={Splash}/>
        <PrivateRoute exact path='/home' component={Home}/>
        <Route exact path="/login" component={Login} />
      </Switch>
    </div>
  </div>
</HashRouter>), document.getElementById('root'))
