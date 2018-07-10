import React, { Component } from 'react';
import {GoogleApiWrapper} from 'google-maps-react';

import Map from "./Map.js"

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: { lat: 32.0900011, lng: 34.8030246 },
      markers: [{lat: 32.0850011, lng: 34.8030246},{lat: 32.0800011, lng: 34.8030246}],
    };
    this.findSpot = this.findSpot.bind(this);

  }
  componentDidMount() { }

  handleMarkerClick = () => {
    console.log("CLICK");
    this.setState({ isMarkerShown: !this.state.isMarkerShown })


  }
  componentWillUnmount(){
  }
  findSpot(){
  };


//

  render() {
  return (
    <div>
    <Map google={this.props.google} position={this.state.position} markers={this.state.markers}/>
    <button className="fixed-bottom findButton vw-100 text-center" onClick={this.findSpot}>FIND A SPOT <i className="ml-2 fas fa-car"></i></button>
    </div>
  )
}
}

export default(
  GoogleApiWrapper({
    apiKey: process.env.REACT_APP_MAPSKEY,
    libraries: ['places'],
  })(Home)
);
