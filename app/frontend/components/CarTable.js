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

const currencyLookup = {
    US: '$',
    GB: '£',
    FR: '€'
};

const odometerUnitLookup = {
    US: 'mi',
    GB: 'km',
    FR: 'km'
};


function modelFormatter(cell, row, enumObject) {
  return enumObject[cell];
}

function priceFormatter(cell, row) {
  let val = currencyLookup[row['country_code']];
  return (val ? val : '$') + cell.toLocaleString();
}

function paintFormatter(cell, row) {
  let color = colorLookup[cell] ? colorLookup[cell] : colorLookup['PBCW'];
  return <div style={{
      width: '100%',
      height: '1.2em',
      border: '1px solid #d8d8d8',
      backgroundColor: color,
      opacity: .8

  }}></div>
}

function odometerFormatter(cell, row) {
  let val = odometerUnitLookup[row['country_code']];
  return cell.toLocaleString() + ' ' + (val ? val : 'km');
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
        <TableHeaderColumn dataField='model' dataFormat={ modelFormatter } formatExtraData={ modelTypes }
          filter={ { type: 'SelectFilter', options: modelTypes } }>Model</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} filter={ { type: 'SelectFilter', options: this.options('badge') } }
            dataField='badge'>Type</TableHeaderColumn>
        <TableHeaderColumn dataSort={true}
            dataField='paint' dataFormat={ paintFormatter }>Color</TableHeaderColumn>
         <TableHeaderColumn dataSort={true} filter={ { type: 'SelectFilter', options: this.options('is_autopilot') } }
            dataField='is_autopilot'>Autopilot</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataFormat={ priceFormatter } dataField='price'>Price</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataFormat={ odometerFormatter } dataField='odometer'>Odometer</TableHeaderColumn>
      </BootstrapTable>
    );
  }
}
