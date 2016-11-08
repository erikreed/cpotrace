/* eslint max-len: 0 */
import axios from 'axios';
import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

const modelTypes = {
  MODEL_S: 'Model S',
  MODEL_X: 'Model X'
};
const URL = 'http://localhost:8000/cars/';

function enumFormatter(cell, row, enumObject) {
  return enumObject[cell];
}

export default class CarTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      cars: []
    };
  }

  badges() {
    let badges = Array.from(new Set(this.state.cars.map(row => row.badge)));
    badges.sort();
    let ret = {};
    badges.forEach(r => {
        ret[r] = r;
    });
    return ret;
  }

  componentDidMount() {
    axios.get(URL)
      .then(res => {
        this.setState({
          cars: res.data
        })
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <BootstrapTable data={ this.state.cars } pagination={ true } striped={ true } hover={ true }
            options={{ paginationShowsTotal: true, sizePerPageList: [10, 50, 100] }}>
        <TableHeaderColumn dataField='vin' isKey={ true } hidden={ true }>VIN</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} filter={ { type: 'SelectFilter', options: this.badges() } }
            dataField='badge'>Type</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='price'>Price</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='odometer'>Odometer</TableHeaderColumn>
        <TableHeaderColumn dataField='model' dataFormat={ enumFormatter } formatExtraData={ modelTypes }
          filter={ { type: 'SelectFilter', options: modelTypes } }>Model</TableHeaderColumn>
      </BootstrapTable>
    );
  }
}
