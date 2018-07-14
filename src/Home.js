import React, {Component} from 'react';
import {GoogleApiWrapper} from 'google-maps-react';
import Swal from 'sweetalert2'
import ReactCountdownClock from "react-countdown-clock"
import withReactContent from 'sweetalert2-react-content'
import TopHeader from "./TopHeader.js"
import Map from "./Map.js"



const MySwal = withReactContent(Swal);
class Home extends Component {
  constructor(props) {
    super(props);
    let User = JSON.parse(localStorage.user);
    this.state = {
      user:{id:User.id,money:User.money,points: User.points},
      position: {lat: 0,lng: 0},
      markers: [],
      searcher: true,
      spot:{id:0,points:0,postion:{lat: 0,lng: 0}}
    };
    this.addPlace = this.addPlace.bind(this);
    this.findMe = this.findMe.bind(this);
    this.mapReady = this.mapReady.bind(this);
    this.findSpot = this.findSpot.bind(this);
    this.renderSearcher = this.renderSearcher.bind(this);
    this.renderFind = this.renderFind.bind(this);
    this.changeMode = this.changeMode.bind(this);
    this.drawRouteEvent = this.drawRouteEvent.bind(this);
    this.drawRoute = this.drawRoute.bind(this);
    this.clearMarkers = this.clearMarkers.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.saveSpot = this.saveSpot.bind(this);
    this.cancelSpot = this.cancelSpot.bind(this);
  }

  componentDidMount = () => window.addEventListener('drawRoute', this.drawRouteEvent);
  componentWillUnmount = () => window.removeEventListener('drawRoute', this.drawRouteEvent);
  componentWillMount() {
    var self = this;
    MySwal.fire({title: `<p>Getting your status</p>`,onOpen: () => {MySwal.showLoading()}});

    fetch(`https://findspot.herokuapp.com/spot/search/${this.state.user.id}`,{
      method: 'POST',
      headers: {"Content-Type": "application/json; charset=utf-8"}}).then((response) => response.json())
      .then((data) => {
        MySwal.close();
        let spot = data[0];
        let pos = {lat:spot.location.coordinates[1],lng:spot.location.coordinates[0]};
        let spotcustom = {id:spot._id,points:spot.points,position:pos, date:spot.creationDate};
        let now = new Date();
        let creation = new Date(spot.creationDate);
        let ctd = 300 - Math.ceil((now-creation)/1000);
        self.clearMarkers();
        self.setState({countdown:ctd,position: pos,spot:spotcustom,searcher:false,markers:[]},()=>{
        self.updateLocation();
        });
      }).catch(()=>{ MySwal.close(); self.findMe()});
  }
  saveSpot() {
    if (this.state.spot.id){
      MySwal.fire({title: `<p>You cant save another spot</p>`,type:'warning',  timer: 2000});
    }else {
    let pointsGiven = Math.ceil(Math.random() *10);
    var self = this;
    MySwal.fire({
  title: 'Are you sure?',
  text: `You are about to save this spot. You'll get ${pointsGiven} points for this.`,
  type: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes, save it!'
}).then((result) => {
  if (result.value) {
    MySwal.fire({title: <p>Publishing it  <br/> <i className="mt-3 far fa-smile"></i></p>,onOpen: () => {MySwal.showLoading()}});
    fetch('https://findspot.herokuapp.com/spot', {
      method: 'POST',
      headers: {"Content-Type": "application/json; charset=utf-8"},
      body: JSON.stringify({lat: self.state.position.lat, long: self.state.position.lng,savedBy:self.state.user.id,points:pointsGiven})})
    .then((response) => {
      MySwal.close()
      if (response.status === 200) {
        response.json().then(function(object) {

          let spot = {id:object._id,points:object.points,position:self.state.position, date:object.creationDate};
          self.clearMarkers();
          self.setState({countdown:300,spot: spot,markers:[]},()=>{
          MySwal.fire({title: 'Yes :)',text: `Your Spot is published you just need to wait now!`,
          type: 'success'});
          self.updateLocation();
          });
        })
      }
      else  MySwal.fire({title: <p>Spot not published, error happened <br/> <i className="mt-3 far fa-frown"></i></p>,  timer: 2000});
    }

    );
  }
})
}
  }
  cancelSpot(){
    MySwal.fire({
    title: 'Are you sure?',
    text: `You are about to cancel this spot. You'll not gain the ${this.state.spot.points} points.`,
    type: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, cancel it!'
    }).then((result) => {
    if (result.value) {
    MySwal.fire({title: <p>Canceling it  <br/> <i className="mt-3 far fa-smile fa-2x"></i></p>,onOpen: () => {MySwal.showLoading()}});
    fetch(`https://findspot.herokuapp.com/spot/${this.state.spot.id}`, {
      method: 'DELETE',
      headers: {"Content-Type": "application/json; charset=utf-8"}
    }).then((response) => {
      MySwal.close()
      if (response.status === 204) {
          let spot = {id:0,points:0,position:{lat:0,lng:0}};
          this.clearMarkers();
          this.setState({spot:spot,markers:[]}, () => this.updateLocation());
          MySwal.fire({title: 'Yes :)',text: `Your Spot was upublished!`,type: 'success'});
      }
      else  MySwal.fire({title: <p>Spot not published, error happened <br/> <i class="mt-3 far fa-frown"></i></p>,  timer: 2000});
    }

    );
    }
    })
  }
  findSpot() {
    if (!this.state.spot.id){
    MySwal.fire({title: <p>Searching spots near you</p>,onOpen: () => {MySwal.showLoading()}});
    var self = this;
    let distance;
    let zoomLevel = this.state.map.getZoom();
    if (zoomLevel >= 15) distance = 2000;
    else { distance = (15 - zoomLevel) * 3000 };
    fetch('https://findspot.herokuapp.com/spot/search', {
      method: 'POST',
      headers: {"Content-Type": "application/json; charset=utf-8"},
      body: JSON.stringify({lat: this.state.position.lat, long: this.state.position.lng, distance: distance})})
    .then((response) => response.json())
    .then((data) => {
      MySwal.close()
      if (!data.length) {
        MySwal.fire({title: <p>No Spots close to you <br/> <i className="mt-3 far fa-frown"></i></p>,  timer: 2000});
      } else
        data.forEach((el) => self.addPlace({lat: el.location.coordinates[1], lng: el.location.coordinates[0]},false));
      }
    );
  }
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

  addPlace(position,draggable=true,type="parking") {
    var self=this;
    var map = this.state.map;
    let icon;
    if (type === "parking") icon = "https://maps.google.com/mapfiles/kml/shapes/parking_lot_maps.png";
    else icon = "https://maps.gstatic.com/mapfiles/api-3/images/spotlight-poi2.png";
    var marker = new this.props.google.maps.Marker({position: position, map: map,draggable:draggable,icon: icon});
    var infowindow = new this.props.google.maps.InfoWindow();
    let markersSize = this.state.markers.length;
    this.setState({markers:[...this.state.markers, marker]});

    this.props.google.maps.event.addListener(marker, 'dragend', function (event) {
      if(self.state.markers.indexOf(marker)===0){
        self.setState({position: {lat: this.getPosition().lat(),lng: this.getPosition().lng()} }, () => self.updateLocation());
      }
    });
    this.props.google.maps.event.addListener(marker, 'click', ((marker, i) => () => {
      if (i>0){
        infowindow.setContent(`<div class='openDialog'><b>Get</b> <i class="ml-2 fas fa-car"></i> <br/><button onclick="fireEvent('drawRoute',${i})" >Click Here to Start</button></div>`);
        infowindow.open(map, marker);
      }
  })(marker, markersSize));

  }
  moveMarker(marker,position) {
      var latlng = new this.props.google.maps.LatLng(position);
      marker.setPosition(latlng);
  }
  componentDidUpdate(){}
  changeMode(){
    if (this.state.spot.id){
      MySwal.fire({title: `<p>You cant change modes while saving spots</p>`,type:'warning',  timer: 2000});
    }else {
    this.clearMarkers();
    this.setState({searcher: !this.state.searcher,markers:[]}, () => this.updateLocation());
  }
  }
  updateLocation(){
    MySwal.close();
    if (this.state.markers.length) this.moveMarker(this.state.markers[0],this.state.position);
    else this.addPlace(this.state.position,this.state.spot.id?false:true,this.state.searcher?"Me":"parking");

    this.state.map.panTo(this.state.position);
  }
  findMe(){
    var self = this;
    MySwal.fire({title: `<p> Getting your Location</p>`,onOpen: () => {MySwal.showLoading()}});
    navigator.geolocation.getCurrentPosition((location) => {
      MySwal.close();
      self.setState({position: {lat: location.coords.latitude,lng: location.coords.longitude} }, () => self.updateLocation());
    }, (error) => {
      MySwal.fire({title: `We need your location :(, Using Default one`});
      self.setState({position: {lat: 32.0900011,lng: 34.8030246} }, () => self.updateLocation());
    });
  }
  renderSearcher(){
    return (<div>
      <TopHeader money={this.state.user.money} points={this.state.user.points}/>
      <Map google={this.props.google} onReady={this.mapReady} position={this.state.position}/>
      <button className="fixed-bottom findButton vw-100 text-center" onClick={this.findSpot}>FIND A SPOT
        <i className="ml-2 fas fa-car"></i>
      </button>
      <button className="fixed-btn changeMode" onClick={this.changeMode}><i className="fas fa-car"></i></button>
        <button className="fixed-btn findMe" onClick={this.findMe}><i className="fas fa-map-marker-alt"></i></button>
    </div>)
  }
  renderFind(){
    return (<div>
      <TopHeader money={this.state.user.money} points={this.state.user.points}/>
      <Map google={this.props.google} onReady={this.mapReady} position={this.state.position}/>
        {parseInt(this.state.spot.id,10)===0 &&
          <button className="fixed-bottom findButton vw-100 text-center" onClick={this.saveSpot}>SAVE A SPOT
              <i className="ml-2 fas fa-parking"></i>
            </button> }

            {parseInt(this.state.spot.id,10)!==0 &&
              <button className="fixed-bottom findButton vw-100 text-center" onClick={this.cancelSpot}>CANCEL SPOT
                  <i className="ml-2 fas fa-times"></i>
                </button> }

                { this.state.countdown && <ReactCountdownClock seconds={this.state.countdown} color="#379af0" size={60} onComplete={this.timesUP} /> }

      <button className="fixed-btn changeMode" onClick={this.changeMode}><i className="fas fa-parking"></i></button>
        <button className="fixed-btn findMe" onClick={this.findMe}><i className="fas fa-map-marker-alt"></i></button>
    </div>)
  }
  render = () => this.state.searcher ? this.renderSearcher() : this.renderFind();

}

export default(GoogleApiWrapper({apiKey: process.env.REACT_APP_MAPSKEY, libraries: ['places']})(Home));
