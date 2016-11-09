/* eslint max-len: 0 */
import React from 'react';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';

const modelTypes = {
  MODEL_S: 'Model S',
  MODEL_X: 'Model X'
};

const colorLookup = {
  PBCW: 'rgb(255, 255, 255)',
  PBSB: 'rgb(41, 32, 35)',
  B02: 'rgb(41, 32, 35)',
  PMAB: 'rgb(94, 74, 56)',
  PMBL: 'rgb(77, 77, 79)',
  PMMB: 'rgb(21, 29, 154)',
  PMMR: 'rgb(234, 30, 37)',
  PMNG: 'rgb(64, 64, 64)',
  PMSG: 'rgb(63, 94, 56)',
  PMSS: 'rgb(232, 231, 226)',
  PMTG: 'rgb(95, 105, 93)',
  PPSR: 'rgb(102, 68, 56)',
  PPSW: 'rgb(253, 253, 253)'
};


function enumFormatter(cell, row, enumObject) {
  return enumObject[cell];
}

export default class CarTable extends React.Component {
  constructor(props) {
    super(props);
  }

  options(key) {
    let options = Array.from(new Set(this.props.cars.map(row => row[key])));
    options.sort();
    let ret = {};
    options.forEach(r => {
        ret[r] = r;
    });
    return ret;
  }

  render() {
    return (
      <BootstrapTable data={ this.props.cars } pagination={ true } striped={ true } hover={ true }
            options={{ paginationShowsTotal: true, sizePerPageList: [10, 50, 100] }}>
        <TableHeaderColumn dataField='vin' isKey={ true } hidden={ true }>VIN</TableHeaderColumn>
        <TableHeaderColumn dataField='model' dataFormat={ enumFormatter } formatExtraData={ modelTypes }
          filter={ { type: 'SelectFilter', options: modelTypes } }>Model</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} filter={ { type: 'SelectFilter', options: this.options('badge') } }
            dataField='badge'>Type</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} filter={ { type: 'SelectFilter', options: this.options('paint') } }
            dataField='paint'>Color</TableHeaderColumn>
         <TableHeaderColumn dataSort={true} filter={ { type: 'SelectFilter', options: this.options('is_autopilot') } }
            dataField='is_autopilot'>Autopilot</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='price'>Price</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='odometer'>Odometer</TableHeaderColumn>
      </BootstrapTable>
    );
  }
}
