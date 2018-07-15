import React, {Component} from 'react';
import {Map} from 'google-maps-react';

export class MapGoogle extends Component {
  constructor(props) {
    super(props);
    this.state = {
       position: props.position
    };
  }
  render() {
    return (<Map google={this.props.google} style={{
        width: '100%',
        height: '100%',
        position: 'relative'
      }} onReady={this.props.onReady} className={'map'} zoom={15} initialCenter={this.state.position}>
    </Map>);
  }
}

export default MapGoogle;
