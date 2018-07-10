import React from 'react';
import ReactDOM from 'react-dom';
import Splash from './Splash';
import Home from './Home';
import { HashRouter,Switch, Route } from 'react-router-dom'
import './main.css';
ReactDOM.render((
    <HashRouter>
      <div className="site">
          <div className="container-fluid text-center p-0">
            <Switch>
              <Route exact path='/(|index.html)' component={Splash}/>
                <Route exact path='/home' component={Home}/>
            </Switch>
          </div>
      </div>
    </HashRouter>
  ), document.getElementById('root'))
