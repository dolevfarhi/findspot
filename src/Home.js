import React, { Component } from 'react';
import {GoogleApiWrapper} from 'google-maps-react';

import TopHeader from "./TopHeader.js"
import Map from "./Map.js"

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: { lat: 32.0900011, lng: 34.8030246 },
      markers: [],
      isDone:false
    };
    this.clickedSpot = this.clickedSpot.bind(this);

    this.findSpot = this.findSpot.bind(this);
  }
  componentDidMount() {
    window.addEventListener('clickedSpot', this.clickedSpot);
  }

  componentWillUnmount(){
    window.removeEventListener('clickedSpot', this.clickedSpot);
  }

  clickedSpot(e){
    let position = e.position;
    console.log(position);
  }

  componentWillMount(){
    var self = this;
    fetch('https://findspot.herokuapp.com/spot/search', {
  method: 'POST',
  headers: {"Content-Type": "application/json; charset=utf-8"},
  body: JSON.stringify({lat:this.state.position.lat,long:this.state.position.lng,distance:2000})
}).then(function(response) {
  return response.json();
}).then(function(data) {
  console.log(data);
  if (!data.length) alert("NO SPOTS CLOsE");
  else data.forEach((el) => self.setState({markers:[...self.state.markers, {lat: el.location.coordinates[1], lng: el.location.coordinates[0]}]}));
  self.setState({isDone:true});
});
  }
  findSpot(){

  };


//

  render() {
  return (
    <div>
      <TopHeader money="8" points = "11"/>
    { this.state.isDone && <Map google={this.props.google} position={this.state.position} markers={this.state.markers}/> }
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
