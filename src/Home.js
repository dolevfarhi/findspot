import React, { Component } from 'react';
import MyMapComponent from "./Map.js"

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isMarkerShown: false,
      position: { lat: 32.0900011, lng: 34.8030246 },
    };
    this.findSpot = this.findSpot.bind(this);

  }
  componentDidMount() {
    this.delayedShowMarker()
  }
  delayedShowMarker = () => {
    setTimeout(() => { this.setState({ isMarkerShown: true })}, 3000)
  }
  handleMarkerClick = () => {
    this.setState({ isMarkerShown: false })
    this.delayedShowMarker()
  }
  componentWillUnmount(){
  }
  findSpot(){
//    this.setState({position: { lat: 31.0900011, lng: 34.8030246 }})
  }
  render() {
  return (
    <div>
    <MyMapComponent isMarkerShown={this.state.isMarkerShown} onMarkerClick={this.handleMarkerClick} position={this.state.position}/>
    <button className="fixed-bottom findButton vw-100 text-center" onClick={this.findSpot}>FIND A SPOT <i className="ml-2 fas fa-car"></i></button>

    </div>
  )
}
}

export default Home;
