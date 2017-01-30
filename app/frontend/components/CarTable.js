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

const METRO_LOOKUP = function(){
    let metros = {
        "Atlanta": {"MetroId": 9, "MetroName": "Atlanta", "StateProvince": "Georgia", "IsDefault": false},
        "Chicago": {"MetroId": 7, "MetroName": "Chicago", "StateProvince": "Illinois", "IsDefault": false},
        "Florida": {"MetroId": 10, "MetroName": "Florida", "StateProvince": "Florida", "IsDefault": false},
        "Los Angeles": {"MetroId": 4, "MetroName": "Los Angeles", "StateProvince": "California", "IsDefault": false},
        "Missouri": {"MetroId": 57, "MetroName": "Missouri", "StateProvince": "", "IsDefault": false},
        "New England": {"MetroId": 56, "MetroName": "New England", "StateProvince": "", "IsDefault": false},
        "New York": {"MetroId": 11, "MetroName": "New York", "StateProvince": "New York", "IsDefault": false},
        "Ohio": {"MetroId": 8, "MetroName": "Ohio", "StateProvince": "Ohio", "IsDefault": false},
        "Orange County\/San Diego": {
        "MetroId": 16,
            "MetroName": "Orange County\/San Diego",
            "StateProvince": "California",
            "IsDefault": false
    },
        "Pennsylvania": {"MetroId": 15, "MetroName": "Pennsylvania", "StateProvince": "Pennsylvania", "IsDefault": false},
        "Rocky Mountain Region": {
        "MetroId": 6,
            "MetroName": "Rocky Mountain Region",
            "StateProvince": "Colorado",
            "IsDefault": false
    },
        "San Francisco Bay Area": {
        "MetroId": 3,
            "MetroName": "San Francisco Bay Area",
            "StateProvince": "California",
            "IsDefault": true
    },
        "Seattle": {"MetroId": 2, "MetroName": "Seattle", "StateProvince": "Washington", "IsDefault": false},
        "Washington DC": {
        "MetroId": 1,
            "MetroName": "Washington DC",
            "StateProvince": "District of Columbia",
            "IsDefault": false
    },
        "0": {"MetroId": 0, "MetroName": "Any Location"}
    };
    let out = {};
    for (let m in metros) {
        out[metros[m].MetroId] = metros[m].MetroName;
    }
    return out;
}();

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

function locationFormatter(cell, row) {
    let location = METRO_LOOKUP[row.metro_id];
    if (location) {
        return location + ', ' + row.country_code;
    }
    return row.country_code;
}

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
        <TableHeaderColumn dataSort={true} dataFormat={ locationFormatter } dataField='metro_id'>Location</TableHeaderColumn>
        <TableHeaderColumn dataFormat={ t => capitalize(t.toLowerCase()) } dataSort={true} dataField='title_status'
            filter={ { type: 'SelectFilter', options: this.options(cars, 'title_status') } }>Status</TableHeaderColumn>
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
