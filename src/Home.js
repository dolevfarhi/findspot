import React, {Component} from 'react';
import {GoogleApiWrapper} from 'google-maps-react';
import Swal from 'sweetalert2'
import ReactCountdownClock from "react-countdown-clock"
import withReactContent from 'sweetalert2-react-content'
import TopHeader from "./TopHeader.js"
import Map from "./Map.js"
import openSocket from 'socket.io-client';


//const  socket = openSocket('https://findspot.herokuapp.com');
const socket = openSocket('https://findspot.herokuapp.com');

const MySwal = withReactContent(Swal);
class Home extends Component {
  constructor(props) {
    super(props);
    let User = JSON.parse(localStorage.user);
    this.state = {
      user:User,
      position: {lat: 0,lng: 0},
      markers: [],
      searcher: true,
      spot:{id:0,points:0,position:{lat: 0,lng: 0}},
      text:'',
      chatUser:0,
      distance:0,
      duration:0,
      timeoutfunc:null,
      directionsDisplay:undefined
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
    this.cancelfindSpot = this.cancelfindSpot.bind(this);
    this.timesUP = this.timesUP.bind(this);
    this.socket = this.socket.bind(this);
    this.logout = this.logout.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.arrive = this.arrive.bind(this);
    this.toggleVip = this.toggleVip.bind(this);

    socket.on(this.state.user.id, (data)=>this.socket(data));

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
        let spotcustom = {id:spot._id,points:spot.points,position:pos, expires:spot.expires};
        let ctd = Math.ceil((new Date(spot.expires)-new Date())/1000);
        self.clearMarkers();
        self.setState({countdown:ctd,position: pos,spot:spotcustom,searcher:false,markers:[]},()=>{
        self.updateLocation();
        });
      }).catch(()=>{ MySwal.close(); self.findMe()});
  }
  toggleVip(){
     MySwal.fire({title: `<p>Changing your Status</p>`,onOpen: () => {MySwal.showLoading()}});
     let user = Object.assign({}, this.state.user);
     user.isVip = !user.isVip;
     var url = `https://findspot.herokuapp.com/user/removeVip/${user.id}`
     if (user.isVip) url = `https://findspot.herokuapp.com/user/makeVip/${user.id}`
     localStorage.removeItem("user");
     localStorage.setItem("user", JSON.stringify(user));
     fetch(url,{method: 'PUT',headers: {"Content-Type": "application/json; charset=utf-8"}}).then((response) => {
       MySwal.close();
       if (response.status === 200) this.setState({user:user});
    })
  }
  socket(data){
    var self = this;
    if(data.type === "start"){
      if (!this.state.chatUser){
        let ctd = Math.ceil((new Date(data.expires)-new Date())/1000);
        this.setState({countdown:ctd});
        let payload = {title: 'Someone is Coming!',imageUrl: data.user.picture,imageHeight: 96,imageAlt: 'profile',text:'Depending on the other user status time has been added.',confirmButtonColor: '#3085d6',confirmButtonText: 'OK!'};
        this.setState({chatUser:data.user.id});
        MySwal.fire(payload).then((result) => {
          if (result.value) {
            self.state.timeoutfunc = setInterval(() => {
              if (self.state.chatUser){
                let push = {user:self.state.user,myLocation:data.myLocation,spot:self.state.spot,type:"startno"};
                self.sendPush(data.user.id,push);
              }
            }, 3000);
            let push = {user:self.state.user,spot:self.state.spot,type:"ack"};
            self.sendPush(data.user.id,push);
          }})
        this.drawRoute(this.state.map,data.myLocation,this.state.spot.position,false);
      }
    }
    else if (data.type === "startno"){
      if (!this.state.chatUser){
        let payload = {title: `${data.user.name} accepted!`,imageUrl: data.user.picture,imageHeight: 96,imageAlt: 'profile',text:'Now  drive safe :)',confirmButtonColor: '#3085d6',confirmButtonText: 'OK!'};
        MySwal.fire(payload);
        let ctd = Math.ceil((new Date(data.expires)-new Date())/1000);

        this.setState({countdown:ctd,chatUser:data.user.id});
        this.drawRoute(this.state.map,data.myLocation,data.spot.position,false);
      }

    }
    else if(data.type === "finnish"){
      let points = this.state.spot.points;
      fetch(`https://findspot.herokuapp.com/spot/${this.state.spot.id}`,{method: 'DELETE',headers: {"Content-Type": "application/json; charset=utf-8"}})
      let user = Object.assign({}, this.state.user);
      user.points += points;
      localStorage.removeItem("user");
      localStorage.setItem("user", JSON.stringify(user));
      if (this.state.directionsDisplay) this.state.directionsDisplay.setMap(null);
      let spot = {id:0,points:0,position:{lat: 0,lng: 0}}
      clearInterval(this.state.timeoutfunc);
      this.setState({distance:0,duration:0,user: user,directionsDisplay:undefined,chatUser:0,text:'',countdown:0,spot:spot,markers:[]}, () => this.updateLocation());
      fetch(`https://findspot.herokuapp.com/user/points/${this.state.user.id}`, {
          method: 'PUT',
          headers: {"Content-Type": "application/json; charset=utf-8"},
          body: JSON.stringify({points:points})
      })
      MySwal.fire({title: 'Thanks!',text: `Thanks for holding the spot! You won ${points} points!`,type: 'success'});
      if (user.points>5 && !user.isVip) this.toggleVip();
      }
    else if(data.type === "cancel"){
      if (this.state.directionsDisplay) this.state.directionsDisplay.setMap(null);
      clearInterval(this.state.timeoutfunc);
      this.clearMarkers();
      if (this.state.spot.id){
      fetch(`https://findspot.herokuapp.com/spot/park/${this.state.spot.id}`, {method: 'DELETE',headers: {"Content-Type": "application/json; charset=utf-8"}});
      this.setState({distance:0,duration:0,directionsDisplay:undefined,chatUser:0,text:'',countdown:0,markers:[]}, () => this.updateLocation());
      }
      else {
        let spot = {id:0,points:0,position:{lat:0,lng:0}};
        this.setState({distance:0,duration:0,directionsDisplay:undefined,chatUser:0,text:'',countdown:0,spot:spot,markers:[]}, () => this.updateLocation());
      }
      MySwal.fire({title: 'Canceled',text: `The Other user canceled!`,type: 'warning'});
    }
    else if(data.type === "msg"){
      let payload = {imageUrl: data.picture,imageHeight: 96,imageAlt: 'profile',text:`[${data.name}] ${data.msg}`,confirmButtonColor: '#3085d6',confirmButtonText: 'OK!'};
      MySwal.fire(payload);
    }
    else if(data.type === "ack"){
      if (!this.state.chatUser){
        this.setState({chatUser:data.user.id});
        let payload = {title: `${data.user.name} accepted!`,imageUrl: data.user.picture,imageHeight: 96,imageAlt: 'profile',text:'Now  drive safe :)',confirmButtonColor: '#3085d6',confirmButtonText: 'OK!'};
        MySwal.fire(payload);
      }
    }
  }
  sendPush(id,message){
    fetch(`https://findspot.herokuapp.com/user/message/${id}`, {
      method: 'POST',
      headers: {"Content-Type": "application/json; charset=utf-8"},
      body: JSON.stringify(message)})
  }
  saveSpot() {
    if (this.state.spot.id){
      MySwal.fire({title: `<p>You cant save another spot</p>`,type:'warning',  timer: 2000});
    }else {
    let pointsGiven = Math.ceil(Math.random() *10);
    if (this.state.user.isVip) pointsGiven+=Math.ceil(Math.random() *30);
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
    let sendbody = {lat: self.state.position.lat, long: self.state.position.lng,savedBy:self.state.user.id,points:pointsGiven};
    if (this.state.user.isVip) sendbody.ttl=600000;
    fetch('https://findspot.herokuapp.com/spot', {
      method: 'POST',
      headers: {"Content-Type": "application/json; charset=utf-8"},
      body: JSON.stringify(sendbody)})
    .then((response) => {
      MySwal.close()
      if (response.status === 200) {
        response.json().then(function(object) {
          let spot = {id:object._id,points:object.points,position:self.state.position, expires:object.expires};
          self.clearMarkers();
          let now = new Date();
          let expires = new Date(spot.expires);
          let ctd = Math.ceil((expires-now)/1000);
          self.setState({countdown:ctd,spot: spot,markers:[]},()=>{
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

cancelfindSpot(){
  let payload = {title: 'Are you sure?',text: `You are about to cancel this spot.`,type: 'warning',showCancelButton: true,confirmButtonColor: '#3085d6',cancelButtonColor: '#d33',confirmButtonText: 'Yes, cancel it!'}
  MySwal.fire(payload).then((result) => {
  if (result.value) {
    let spot = {id:0,points:0,position:{lat:0,lng:0}};
    this.clearMarkers();
    clearInterval(this.state.timeoutfunc);
    let payload = {'type':"cancel"};
    if (this.state.directionsDisplay) this.state.directionsDisplay.setMap(null);
    this.sendPush(this.state.chatUser,payload);
    this.setState({distance:0,duration:0,directionsDisplay:undefined,chatUser:0,text:'',countdown:0,spot:spot,markers:[]}, () => this.updateLocation());
    MySwal.fire({title: 'Yes :)',text: `Your Route was canceled!`,type: 'success'});
  }
  })
}
  cancelSpot(){
    let payload = {title: 'Are you sure?',text: `You are about to cancel this spot. You'll not gain the ${this.state.spot.points} points.`,type: 'warning',showCancelButton: true,confirmButtonColor: '#3085d6',cancelButtonColor: '#d33',confirmButtonText: 'Yes, cancel it!'}
    MySwal.fire(payload).then((result) => {
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
          clearInterval(this.state.timeoutfunc);
          let payload = {'type':"cancel"};
          if (this.state.directionsDisplay) this.state.directionsDisplay.setMap(null);
          this.sendPush(this.state.chatUser,payload);
          this.setState({distance:0,duration:0,directionsDisplay:undefined,chatUser:0,text:'',countdown:0,spot:spot,markers:[]}, () => this.updateLocation());
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
    let distance= 2000;
    let zoomLevel = this.state.map.getZoom();
    if (this.state.user.isVip){
      if (zoomLevel >= 15) distance = 2000;
      else { distance = (15 - zoomLevel) * 3000 };
    }
    fetch('https://findspot.herokuapp.com/spot/search', {
      method: 'POST',
      headers: {"Content-Type": "application/json; charset=utf-8"},
      body: JSON.stringify({lat: this.state.position.lat, long: this.state.position.lng, distance: distance})})
    .then((response) => response.json())
    .then((data) => {
      MySwal.close()
      if (!data.length) {
        if (!self.state.user.isVip && zoomLevel<15)
        MySwal.fire({title: `<p>No Spots close to you, because you are not VIP, your search was limited to 2KM <br/> <i className="mt-3 far fa-frown"></i></p>`});
        else
        MySwal.fire({title: `<p>No Spots close to you <br/> <i className="mt-3 far fa-frown"></i></p>`});
      } else
        data.forEach((el) => self.addPlace({lat: el.location.coordinates[1], lng: el.location.coordinates[0]},false));
      }
    );
  }
  }

  drawRoute(map,pointA,pointB,fromEvent=true){
    var self = this;
    if(fromEvent){
      var spotid;
    MySwal.fire({title: `<p>Letting the  user know</p>`,onOpen: () => {MySwal.showLoading()}});
    fetch('https://findspot.herokuapp.com/spot/search', {
      method: 'POST',
      headers: {"Content-Type": "application/json; charset=utf-8"},
      body: JSON.stringify({lat: pointB.lat(), long: pointB.lng(), distance: 1})})
    .then((response) => response.json())
    .then((data) => {
      if (data.length) {
        spotid = data[0]._id;
        fetch(`https://findspot.herokuapp.com/spot/goingto/${spotid}/${self.state.user.id}`,{
          method: 'POST',
          headers: {"Content-Type": "application/json; charset=utf-8"},
          body: JSON.stringify({ttl: this.state.user.isVip?600000:300000})})
          .then((response) => {
            return response.json()})
          .then((data) => {
            MySwal.close();
            self.state.timeoutfunc = setInterval(() => {
              if (self.state.chatUser){
                let push = {user:self.state.user,expires:data.expires,myLocation:pointA,type:"start"};
                self.sendPush(data.savedBy,push);
              }
            }, 3000);
            fetch(`https://findspot.herokuapp.com/spot/park/${spotid}/${this.state.user.id}`, {
                method: 'PUT',
                headers: {"Content-Type": "application/json; charset=utf-8"}
            });
            let push = {user:self.state.user,expires:data.expires,myLocation:pointA,type:"start"};
            self.sendPush(data.savedBy,push);
            self.setState({countdown:Math.ceil((new Date(data.expires)-new Date())/1000)})
            });
          }}).catch(()=>{ MySwal.close(); });
    }
    var directionsService = new this.props.google.maps.DirectionsService();
    var directionsDisplay = new this.props.google.maps.DirectionsRenderer();
    this.setState({directionsDisplay: directionsDisplay});
    directionsDisplay.setMap(map);
      var request = {
        origin: pointA,
        destination: pointB,
        travelMode: 'DRIVING'
      };
      directionsService.route(request, function(result, status) {
        let totalDistance=0;
        let totalDuration=0;
        if (status === 'OK') {
          self.clearMarkers();
          directionsDisplay.setDirections(result);
          let legs = result.routes[0].legs;
          legs.forEach((el) =>{
            totalDistance += el.distance.value;
            totalDuration += el.duration.value;
          });
          totalDistance = (totalDistance/1000);
          var now = new Date();
          now.setSeconds(now.getSeconds() + totalDuration);
          self.setState({duration:`${now.getHours()}:${now.getMinutes()}${(now.getMinutes()<10?'0':'')}`,distance:`${totalDistance.toFixed(1)}km`});
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
        infowindow.setContent(`<div class='openDialog'><b>Find Spot</b> <i class="ml-2 fas fa-car"></i> <br/><button class="btn btn-success mt-3" onclick="fireEvent('drawRoute',${i})" >Start</button></div>`);
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

    if (this.state.spot.id || this.state.chatUser){
      MySwal.fire({title: `<p>You cant change modes while active</p>`,type:'warning',  timer: 2000});
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
    if (!this.state.spot.id && !this.state.chatUser){
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
  }
  timesUP(){
    let spot = {id:0,points:0,position:{lat: 0,lng: 0}}
    clearInterval(this.state.timeoutfunc);
    this.setState({distance:0,duration:0,directionsDisplay:undefined,chatUser:0,text:'',countdown:0,spot:spot,markers:[]}, () => this.updateLocation());
    MySwal.fire({title: 'Times out',text: `The time endend!`,type: 'warning'});
  }
  logout(){
    if (!this.state.spot.id && !this.state.chatUser){

    let payload = {title: 'Are you sure?',text: `You are about to logout.`,type: 'warning',showCancelButton: true,confirmButtonColor: '#3085d6',cancelButtonColor: '#d33',confirmButtonText: 'Yes, logout!'};
    MySwal.fire(payload).then((result) => {
      if (result.value){
      localStorage.removeItem("user");
      window.location.reload();
    }})
  }
  }
  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({[name]:value});
  }
  sendMessage() {
    this.sendPush(this.state.chatUser,{type:"msg",msg:this.state.text,name:this.state.user.name,picture:this.state.user.picture});
    this.setState({text: ""});
  }
  arrive(){
    var self = this;
    this.sendPush(this.state.chatUser,{type:"finnish"});
    if (this.state.directionsDisplay) this.state.directionsDisplay.setMap(null);
    let spot = {id:0,points:0,position:{lat: 0,lng: 0}}
    clearInterval(this.state.timeoutfunc);
    self.setState({distance:0,duration:0,directionsDisplay:undefined,chatUser:0,text:'',countdown:0,spot:spot,markers:[]}, () => {
      self.updateLocation()
      MySwal.fire({title: 'Arrived!',text: `You are now in your spot :)!`,type: 'success'});
    });
    setTimeout(function(){
    if (self.state.directionsDisplay) self.state.directionsDisplay.setMap(null);
    self.setState({distance:0,duration:0,directionsDisplay:undefined,chatUser:0,text:'',countdown:0,spot:spot,markers:[]}, () => {
      self.updateLocation()});
  }, 3000);
  }
  renderSearcher(){
    return (<div>
      <TopHeader user={this.state.user} vipFunction={this.toggleVip}/>
      <Map google={this.props.google} onReady={this.mapReady} position={this.state.position}/>
        { !this.state.directionsDisplay &&
        <button className="fixed-bottom findButton vw-100 text-center" onClick={this.findSpot}>FIND A SPOT
          <i className="ml-2 fas fa-car"></i>
        </button> }

        { this.state.directionsDisplay &&
        <button className="fixed-bottom findButton vw-100 text-center" onClick={this.cancelfindSpot}>CANCEL ROUTE
          <i className="ml-2 fas fa-times"></i>
        </button> }

      { this.state.countdown > 0 && <ReactCountdownClock seconds={this.state.countdown} color="#000" size={60} onComplete={this.timesUP} /> }

      <button className="fixed-btn changeMode" onClick={this.changeMode}><i className="fas fa-car"></i></button>
        <button className="fixed-btn findMe" onClick={this.findMe}><i className="fas fa-map-marker-alt"></i></button>
          <button className="fixed-btn profile" onClick={this.logout}><img src={this.state.user.picture} alt="profile"/></button>
          { this.state.chatUser !== 0 && <button className="fixed-btn arrive" onClick={this.arrive}><i className="fas fa-flag-checkered"></i></button>
}

{ this.state.distance && <div className="row info"><div className="col-6">{this.state.distance}</div><div className="col-6">{this.state.duration}</div></div> }

            { this.state.chatUser !== 0 && <div className="row chat"><div className="col-10 p-0 pl-1"> <input value={this.state.text} name="text" className="w-100" onChange={this.handleChange}/></div><div className="col-2 p-0"><button className="btn-primary w-100" onClick={this.sendMessage}>Send</button></div></div> }
</div>)
  }
  renderFind(){
    return (<div>
      <TopHeader user={this.state.user} vipFunction={this.toggleVip}/>
      <Map google={this.props.google} onReady={this.mapReady} position={this.state.position}/>
        {parseInt(this.state.spot.id,10)===0 &&
          <button className="fixed-bottom findButton vw-100 text-center" onClick={this.saveSpot}>SAVE A SPOT
              <i className="ml-2 fas fa-parking"></i>
            </button> }

            {parseInt(this.state.spot.id,10)!==0 &&
              <button className="fixed-bottom findButton vw-100 text-center" onClick={this.cancelSpot}>CANCEL SPOT
                  <i className="ml-2 fas fa-times"></i>
                </button> }
                { this.state.countdown > 0 && <ReactCountdownClock seconds={this.state.countdown} color="#000" size={60} onComplete={this.timesUP} /> }
      <button className="fixed-btn changeMode" onClick={this.changeMode}><i className="fas fa-parking"></i></button>
        <button className="fixed-btn findMe" onClick={this.findMe}><i className="fas fa-map-marker-alt"></i></button>
        <button className="fixed-btn profile" onClick={this.logout}><img src={this.state.user.picture} alt="profile"/></button>
        { this.state.distance && <div className="row info"><div className="col-6">{this.state.distance}</div><div className="col-6">{this.state.duration}</div></div> }
          { this.state.chatUser !== 0 && <div className="row chat"><div className="col-10 p-0 pl-1"> <input value={this.state.text} name="text" className="w-100" onChange={this.handleChange}/></div><div className="col-2 p-0"><button className="btn-primary w-100" onClick={this.sendMessage}>Send</button></div></div> }
  </div>)
  }
  render = () => this.state.searcher ? this.renderSearcher() : this.renderFind();

}

export default(GoogleApiWrapper({apiKey: process.env.REACT_APP_MAPSKEY, libraries: ['places']})(Home));
