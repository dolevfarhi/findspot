import React, { Component } from 'react';
import {Map,  Marker} from 'google-maps-react';

export class MapGoogle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      position: props.position,
      markers: props.markers,
    };
  }
  render() {
    return (
      <Map google={this.props.google} style={{width: '100%', height: '100%', position: 'relative'}} className={'map'} zoom={15} initialCenter={this.state.position}>
        <Marker title={'My Position.'} name={'Me'} position={this.state.position} />
        {this.state.markers.map((marker,index) => (<Marker key={`marker${index}`} position={marker} />))}
      </Map>
    );
  }
}

export default MapGoogle;
