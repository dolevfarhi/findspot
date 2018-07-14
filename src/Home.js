import React, {Component} from 'react';
import {GoogleApiWrapper} from 'google-maps-react';
import Swal from 'sweetalert2'
import withReactContent from 'sweetalert2-react-content'
import TopHeader from "./TopHeader.js"
import Map from "./Map.js"

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user:{
        money:7,
        points:10
      },
      position: {
        lat: 32.0900011,
        lng: 34.8030246
      },
      markers: [],
      searcher: true
    };
    this.addPlace = this.addPlace.bind(this);
    this.mapReady = this.mapReady.bind(this);
    this.findSpot = this.findSpot.bind(this);
    this.renderSearcher = this.renderSearcher.bind(this);
    this.renderFind = this.renderFind.bind(this);
    this.changeMode = this.changeMode.bind(this);
    this.drawRouteEvent = this.drawRouteEvent.bind(this);
    this.drawRoute = this.drawRoute.bind(this);
    this.clearMarkers = this.clearMarkers.bind(this);
  }

  componentDidMount = () => window.addEventListener('drawRoute', this.drawRouteEvent);
  componentWillUnmount = () => window.removeEventListener('drawRoute', this.drawRouteEvent);
  componentWillMount() {
  }

  findSpot() {
    const MySwal = withReactContent(Swal);
    MySwal.fire({title: <p>Searching spots near you</p>,onOpen: () => {MySwal.showLoading()}});
    var self = this;
    fetch('https://findspot.herokuapp.com/spot/search', {
      method: 'POST',
      headers: {"Content-Type": "application/json; charset=utf-8"},
      body: JSON.stringify({lat: this.state.position.lat, long: this.state.position.lng, distance: 2000})})
    .then((response) => response.json())
    .then((data) => {
      MySwal.close()
      if (!data.length) {
        MySwal.fire({title: <p>No Spots close to you <br/> <i class="mt-3 far fa-frown"></i></p>,  timer: 2000});
      } else
        data.forEach((el) => self.addPlace({lat: el.location.coordinates[1], lng: el.location.coordinates[0]}));
      }
    );
  }

  drawRoute(map,pointA,pointB){
    var directionsService = new this.props.google.maps.DirectionsService();
    var directionsDisplay = new this.props.google.maps.DirectionsRenderer();
    var self = this;
    directionsDisplay.setMap(map);
      var request = {
        origin: pointA,
        destination: pointB,
        travelMode: 'DRIVING'
      };
      directionsService.route(request, function(result, status) {
        if (status === 'OK') {
          self.clearMarkers();
          directionsDisplay.setDirections(result);
        }
      });
  }
  drawRouteEvent = (e) => this.drawRoute(this.state.map,this.state.position,this.state.markers[e.value].getPosition());
  clearMarkers = (e) => this.state.markers.forEach((el) => el.setMap(null));
  mapReady = (mapProps, map) => this.setState({map: map});

  addPlace(position) {
    var map = this.state.map;
    var marker = new this.props.google.maps.Marker({position: position, map: map});
    var infowindow = new this.props.google.maps.InfoWindow();
    this.setState({markers:[...this.state.markers, marker]});
    this.props.google.maps.event.addListener(marker, 'click', ((marker, i) => () => {
      infowindow.setContent(`<div class='openDialog'><b>Get</b> <i class="ml-2 fas fa-car"></i> <button onclick="fireEvent('drawRoute',${i})" >Click</button></div>`);
      infowindow.open(map, marker);
    })(marker, this.state.markers.length-1));

  }

  componentDidUpdate(){
    if (!this.state.searcher)
    this.props.google.maps.event.addListener(this.state.map, 'click', (event) => this.addPlace(event.latLng));
  }
  changeMode(){
    this.clearMarkers();
    this.props.google.maps.event.clearInstanceListeners(this.state.map);
    this.setState({searcher: !this.state.searcher,markers:[]});
  }

  renderSearcher(){
    return (<div>
      <TopHeader money={this.state.user.money} points={this.state.user.points}/>
      <Map google={this.props.google} onReady={this.mapReady} position={this.state.position}/>
      <button className="fixed-bottom findButton vw-100 text-center" onClick={this.findSpot}>FIND A SPOT
        <i className="ml-2 fas fa-car"></i>
      </button>
      <button className="changeMode" onClick={this.changeMode}><i className="fas fa-car"></i></button>
    </div>)
  }
  renderFind(){
    return (<div>
      <TopHeader money={this.state.user.money} points={this.state.user.points}/>
      <Map google={this.props.google} onReady={this.mapReady} position={this.state.position}/>
      <button className="changeMode" onClick={this.changeMode}><i className="fas fa-parking"></i></button>
    </div>)
  }
  render = () => this.state.searcher ? this.renderSearcher() : this.renderFind();

}

export default(GoogleApiWrapper({apiKey: process.env.REACT_APP_MAPSKEY, libraries: ['places']})(Home));
