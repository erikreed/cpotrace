import { Set } from 'immutable';
import capitalize from 'capitalize';
import React from 'react';
import Layout from '../../components/Layout';
import CarTable from '../../components/CarTable';
import s from './styles.css';
import axios from 'axios';
import { ScatterPlot, BarChart } from 'react-d3-components';
import { Button, ButtonToolbar } from 'react-bootstrap';

const devMode = window.location.host.includes('localhost');
const URL_BASE = window.location.protocol + '//' + (devMode ? 'localhost:8000' : window.location.host);
const CARS_URL = URL_BASE + '/cars/';
const SUMMARY_URL = URL_BASE + '/cars/summary/';

const COUNTRIES = function() {
  let data = `AT	Austria	de-AT,hr,hu,sl
              BE	Belgium	nl-BE,fr-BE,de-BE
              CA	Canada	en-CA,fr-CA,iu
              CH	Switzerland	de-CH,fr-CH,it-CH,rm
              DE	Germany	de
              DK	Denmark	da-DK,en,fo,de-DK
              FI	Finland	fi-FI,sv-FI,smn
              FR	France	fr-FR,frp,br,co,ca,eu,oc
              GB	United Kingdom	en-GB,cy-GB,gd
              HK	Hong Kong	zh-HK,yue,zh,en
              IT	Italy	it-IT,de-IT,fr-IT,sc,ca,co,sl
              JP	Japan	ja
              NL	Netherlands	nl-NL,fy-NL
              NO	Norway	no,nb,nn,se,fi
              SE	Sweden	sv-SE,se,sma,fi-SE
              US	United States	en-US,es-US,haw,fr`;
  let countries = data.split('\n').map(s => s.trim()).map(s => s.split('\t')).map(r => {
    return {
      code: r[0],
      name: r[1],
      languages: r[2].split(',')
    };
  });
  return countries;
}();
const COUNTRY_CODES = COUNTRIES.map(c => c.code);
console.log(COUNTRIES);


class CarModelFilterCount extends React.Component {
  render() {
    let model = capitalize.words(this.props.model.replace('_', ' ').toLowerCase());
    return (<div className="input-group">
              <label className={`input-group-addon ${s.alignNavRows}`}>
                <input onChange={this.props.onChange} checked={!this.props.filtered.has(this.props.model)} type="checkbox" />
                {model} ({this.props.cars.filter(c => c.model == this.props.model).length})
              </label>
            </div>)
  }
}

class CarCountryFilterCounts extends React.Component {
  render() {
    let divs = [];
    for (let country of COUNTRIES) {
      let onChange = this.props.onChange.bind(this.props.that, this.props.filtered, country.code);
      divs.push(<div key={country.code} className="input-group">
                  <label className={`input-group-addon ${s.alignNavRows}`}>
                    <input onChange={onChange}
                        checked={!this.props.filtered.has(country.code)} type="checkbox" />
                    {country.name} ({this.props.cars.filter(c => c.country_code == country.code).length})
                  </label>
                </div>)
    }
    return <div>{divs}</div>;
  }
}



class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredObjects: Set(),
      cars: [],
      summary: {}
    };
  }

  handleFilterChange(set, val, event) {
    let filteredObjects;
    if (set.has(val)) {
      filteredObjects = set.delete(val);
    } else {
      filteredObjects = set.add(val);
    }
    this.setState({
      filteredObjects: filteredObjects
    });
  }

  componentDidMount() {
    document.title = 'Tesla CPO Trace';
    let err = (msg) => console.log(msg);

    axios.get(CARS_URL)
      .then(res => {
        this.setState({
          cars: res.data
        })
      })
      .catch(err);

     axios.get(SUMMARY_URL)
      .then(res => {
        this.setState({
          summary: res.data
        })
      })
      .catch(err);
  }

  filteredCars() {
    let cars = this.state.cars;
    return cars.filter(c => !(this.state.filteredObjects.has(c.country_code) ||
        this.state.filteredObjects.has(c.model)));
  }

  odometerChartData(cars) {
    let badges = Set(cars.map(c => c.badge));
    let data = [];
    badges.forEach(b => {
      let badgeCars = cars.filter(c => c.badge == b);
      data.push({
        values: badgeCars.map(c => {
          return {x: c.odometer, y: c.price};
        }),
        label: b
      });
    });
    return data;
  }

  badgeChartData(cars) {
    let badges = [...Set(cars.map(c => c.badge))];
    badges.sort()
    let models = [...Set(cars.map(c => c.model))];

    let data = [];
    models.forEach(m => {
      let badgeCars = cars.filter(c => c.model == m);

      data.push({
        values: badges.map(b => {
          let countForBadge = badgeCars.filter(c => c.badge == b).map(r => 1).reduce((a, b) => a + b, 0);
          return {
            x: b,
            y: countForBadge
          }
        }),
        label: m
      });
    });
    return data;
  }

  allTimeSummaryDiv() {
    return (
      <ul>
        <li>{ this.state.summary.totalCars } cars seen all-time</li>
        <li>Captured { this.state.summary.priceChanges } price changes over { this.state.summary.priceChangeCars } cars</li>
        <li>Captured { this.state.summary.odometerChanges } odometer changes over { this.state.summary.odometerChangeCars } cars</li>
      </ul>);
  }

  selectAll() {
    this.setState({
      filteredObjects: Set()
    });
  }

  clearSelection() {
    let filteredObjects = this.state.filteredObjects.union(['MODEL_X', 'MODEL_S', ...COUNTRY_CODES]);
    this.setState({
      filteredObjects: filteredObjects
    });
  }

  recentSummaryDiv(cars) {
    let lastUpdated = Math.max(...cars.map(c => new Date(c.last_seen)));
    lastUpdated = new Date(lastUpdated).toLocaleString();

    let newCars = cars.map(c => {
      return (new Date() - new Date(c.first_seen)) / 1000 / 86400;
    }).filter(c => c < 1).length;
    let numCityLocations = Set(cars.map(c => c.metro_id)).size;
    let numCountry = Set(cars.map(c => c.country_code)).size;
    let numUsed = cars.filter(c => c.title_status == 'USED').length;

    return (
      <ul>
        <li>Last updated: {lastUpdated}</li>
        <li>{cars.length} cars active within last 24 hours ({numUsed} used)</li>
        <li>{newCars} cars added within last 24 hours</li>
        <li>Cars seen in {numCityLocations} city locations</li>
        <li>Cars seen in {numCountry} countries</li>
      </ul>)
  }

  selectedCarDetails() {
    let car = this.state.selectedCar;

    if (car) {
      let url = `https://www.tesla.com/${car.title_status == 'USED' ? 'preowned' : 'new'}/${car.vin}`;
      return (
        <div className="col-lg-12 col-sm-12">
          <hr />
          <h4>Selected Car Details</h4>
          <ul>
            <li>VIN: <a href={url}>{car.vin}</a></li>
            <li>Model: {car.model}</li>
            <li>Country Code: {car.country_code}</li>
            <li>Status: {car.title_status}</li>
            <li>First seen: {car.first_seen.toLocaleString()}</li>
            <li>Last seen: {car.last_seen.toLocaleString()}</li>
            <li>Paint: {car.paint}</li>
            <li>Year: {car.year}</li>
            <li>Autopilot: {car.is_autopilot}</li>
            <li>Metro ID: {car.metro_id}</li>
            <li>Price: {car.price}</li>
            <li>Odometer: {car.odometer}</li>
          </ul>
        </div>
      )
    }
    return null;
  }

  render() {
    let filteredCars = this.filteredCars();
    if (filteredCars.length == 0) {
      var odometerPlot = null;
      var badgePlot = null;
    } else {
      let tooltipHtml = (x, y) => {
        return <div>Odometer {x}, price {y}</div>;
      };
      var odometerPlot = <ScatterPlot data={this.odometerChartData(filteredCars)} width={600} height={400} margin={{top: 10, bottom: 50, left: 75, right: 10}}
                            tooltipMode={'mouse'} opacity={1} tooltipHtml={tooltipHtml} xAxis={{label: "Odometer"}} yAxis={{label: "Price"}}/>;
      var badgePlot = <BarChart groupedBars data={this.badgeChartData(filteredCars)} width={600} height={400}
                                margin={{top: 10, bottom: 50, left: 50, right: 10}}/>;
    }

    return (
      <Layout className={s.content}>

        <div className="container-fluid">
          <div className="row content">
            <div className="col-lg-12">
              <h3>Tesla CPO Trace</h3>
              <hr />
            </div>

            <div className="col-lg-2 col-sm-4 sidenav">
              <div className="nav nav-pills nav-stacked">
                <b>Models:</b>
                <CarModelFilterCount filtered={this.state.filteredObjects}
                    onChange={this.handleFilterChange.bind(this, this.state.filteredObjects, 'MODEL_S')}
                    cars={this.state.cars} model='MODEL_S' />
                <CarModelFilterCount filtered={this.state.filteredObjects}
                    onChange={this.handleFilterChange.bind(this, this.state.filteredObjects, 'MODEL_X')}
                    cars={this.state.cars} model='MODEL_X' />

                <b>Countries:</b>
                <CarCountryFilterCounts filtered={this.state.filteredObjects}
                    onChange={this.handleFilterChange}
                    that={this}
                    cars={this.state.cars} />
                <br />
                <ButtonToolbar>
                  <Button onClick={this.clearSelection.bind(this)}>Clear</Button>
                  <Button onClick={this.selectAll.bind(this)}>Select All</Button>
                </ButtonToolbar>
              </div>
              <br />
            </div>

            <div className="col-lg-6 col-sm-8">
              <h4>Recent Activity Summary</h4>
              { this.recentSummaryDiv(filteredCars) }
            </div>
            <div className="col-lg-6 col-sm-8">
              <h4>All Time Statistics</h4>
              { this.allTimeSummaryDiv() }
            </div>

            <div className="col-lg-10 col-sm-12">
              <h4>Details</h4>
              <CarTable cars={filteredCars} carClick={r => this.setState({selectedCar: r})}></CarTable>
            </div>
            { this.selectedCarDetails() }

          </div>
          <div className="row content">

            <div className="col-lg-6 col-sm-12 text-center">
              <h4>Badge Breakdown</h4>
              { badgePlot }
            </div>

            <div className="col-lg-6 col-sm-12 text-center">
              <h4>Odometer vs Price</h4>
              { odometerPlot }
            </div>


          </div>
        </div>
      </Layout>
    );
  }

}

export default HomePage;
