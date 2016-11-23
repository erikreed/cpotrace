/* eslint max-len: 0 */
import 'react-tooltip-component/lib/tooltip.css';
import React from 'react';
import capitalize from 'capitalize';
import Tooltip from 'react-tooltip-component';
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
  let paintName = row.paint_name || 'Unknown Paint';
  return (
    <Tooltip title={paintName} position={"top"}>
      <div style={{
          width: '100%',
          height: '1.2em',
          border: '1px solid #d8d8d8',
          backgroundColor: color,
          opacity: .8
      }}></div>
    </Tooltip>
  )
}

function odometerFormatter(cell, row) {
  let val = odometerUnitLookup[row['country_code']];
  return cell.toLocaleString() + ' ' + (val ? val : 'km');
}

export default class CarTable extends React.Component {
  constructor(props) {
    super(props);
  }

  cars() {
    // Copy cars since re-assigning the badge later on mutates them
    let cars = this.props.cars.map(r => Object.assign({}, r));
    let maxLength = Math.max(...cars.map(r => r.badge.length));
    // hack to get around the select filter apparently doing only a string starts-with
    const nullChar = '\u200B';
    cars.forEach(r => {
      for (let i = 0; i <= maxLength - r.badge.length; i++) {
        r.badge = nullChar + r.badge + nullChar;
      }
    });
    return cars
  }

  options(cars, key) {
    let options = Array.from(new Set(cars.map(row => row[key])));
    options.sort();
    let ret = {};
    options.forEach(r => {
        ret[r] = r;
    });
    return ret;
  }

  render() {
    const cars = this.cars();
    return (
      <BootstrapTable data={ cars } pagination={ true } striped={ true } hover={ true }
            options={{ paginationShowsTotal: true, sizePerPageList: [15], sizePerPage: 15, onRowClick: this.props.carClick }}>
        <TableHeaderColumn dataField='vin' isKey={ true } hidden={ true }>VIN</TableHeaderColumn>
        <TableHeaderColumn dataField='model' dataFormat={ modelFormatter } formatExtraData={ modelTypes }>
            Model</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='country_code'>Country</TableHeaderColumn>
        <TableHeaderColumn dataFormat={ t => capitalize(t.toLowerCase()) } dataSort={true} dataField='title_status'>Status</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} filter={ { type: 'SelectFilter', options: this.options(cars, 'badge') } }
            dataField='badge'>Type</TableHeaderColumn>
        <TableHeaderColumn dataSort={true}
            dataField='paint' dataFormat={ paintFormatter }>Color</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} filter={ { type: 'SelectFilter', options: this.options(cars, 'is_autopilot') } }
            dataField='is_autopilot'>Autopilot</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} filter={ { type: 'SelectFilter', options: this.options(cars, 'is_premium') } }
            dataField='is_premium'>Premium Interior</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} filter={ { type: 'SelectFilter', options: this.options(cars, 'is_panoramic') } }
            dataField='is_panoramic'>Pano Roof</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='wheels_name'>Wheels</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataField='year'>Year</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataFormat={ priceFormatter } dataField='price'>Price</TableHeaderColumn>
        <TableHeaderColumn dataSort={true} dataFormat={ odometerFormatter } dataField='odometer'>Odometer</TableHeaderColumn>
      </BootstrapTable>
    );
  }
}
