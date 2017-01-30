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
const HISTORY_URL = URL_BASE + '/cars/history/';
const carHistoryCache = {};

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
              JP	Japan	jp
              NL	Netherlands	nl-NL,fy-NL
              NO	Norway	no,nb,nn,se,fi
              SE	Sweden	sv-SE,se,sma,fi-SE
              US	United States	en-US,es-US,haw,fr`;
  return data.split('\n').map(s => s.trim()).map(s => s.split('\t')).map(r => {
    return {
      code: r[0],
      name: r[1],
      languages: r[2].split(',')
    };
  });
}();
const COUNTRY_CODES = COUNTRIES.map(c => c.code);


class CarModelFilterCount extends React.PureComponent {
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

class LoadingModal extends React.Component {
  render() {
    if (this.props.show) {
      return (
          <div className={s.modalOverlay}>
            <div className="sk-cube-grid loadingModal">
              <div className="sk-cube sk-cube1"></div>
              <div className="sk-cube sk-cube2"></div>
              <div className="sk-cube sk-cube3"></div>
              <div className="sk-cube sk-cube4"></div>
              <div className="sk-cube sk-cube5"></div>
              <div className="sk-cube sk-cube6"></div>
              <div className="sk-cube sk-cube7"></div>
              <div className="sk-cube sk-cube8"></div>
              <div className="sk-cube sk-cube9"></div>
              <h3>Loading...</h3>
            </div>
          </div>);
    }
    return null;
  }
}

class CarCountryFilterCounts extends React.PureComponent {
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

class HomePage extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      filteredObjects: Set(),
      cars: [],
      summary: {}
    };
  this.state.filteredObjects = this.clearSelection(false).subtract(['MODEL_S', 'US']);
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

  selectAll() {
    this.setState({
      filteredObjects: Set()
    });
  }

  clearSelection(save=true) {
    let filteredObjects = this.state.filteredObjects.union(['MODEL_X', 'MODEL_S', ...COUNTRY_CODES]);
    if (save) {
      this.setState({
        filteredObjects: filteredObjects
      });
    }
    return filteredObjects;
  }

  render() {
    const filteredCars = this.filteredCars();
    const view = !this.state.selectedCar ? (<SummaryView cars={filteredCars} summary={this.state.summary} />) : (<SelectedCarView car={this.state.selectedCar} />);

    return (
      <Layout className={s.content}>

        <LoadingModal show={this.state.cars.length == 0} />

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

            { view }

          </div>

          <div className="row content">

            <div className="col-lg-12 col-sm-12">
              <h4>Details</h4>
              <CarTable cars={filteredCars} carClick={r => this.setState({selectedCar: r})} />
            </div>
          </div>

        </div>
      </Layout>
    );
  }

}

class SummaryView extends React.PureComponent {

  constructor(props) {
    super(props);
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
    badges.sort();
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
        <li>{ this.props.summary.totalCars } cars seen all-time</li>
        <li>Captured { this.props.summary.priceChanges } price changes over { this.props.summary.priceChangeCars } cars</li>
        <li>Captured { this.props.summary.odometerChanges } odometer changes over { this.props.summary.odometerChangeCars } cars</li>
      </ul>);
  }

  render() {
    let odometerPlot = null;
    let badgePlot = null;
    if (this.props.cars.length > 0) {
      const odometerPriceToCar = {};
      this.props.cars.map(c => {
        odometerPriceToCar[[c.price, c.odometer].toString()] = c;
      });
      const tooltipHtml = (x, y) => {
        const c = odometerPriceToCar[[y, x].toString()];
        return <div>{c.badge}: Odometer {x}, price {y}</div>;
      };
      odometerPlot = <ScatterPlot data={this.odometerChartData(this.props.cars)} width={600} height={400} margin={{top: 10, bottom: 50, left: 75, right: 10}}
                            tooltipMode={'mouse'} opacity={1} tooltipHtml={tooltipHtml} xAxis={{label: "Odometer"}} yAxis={{label: "Price"}}/>;
      badgePlot = <BarChart groupedBars data={this.badgeChartData(this.props.cars)} width={600} height={400}
                                margin={{top: 10, bottom: 50, left: 50, right: 10}}/>;
    }

    return (
      <div>
        <div className="col-lg-6 col-sm-8">
          <h4>Recent Activity Summary</h4>
          { this.recentSummaryDiv(this.props.cars) }
        </div>
        <div className="col-lg-6 col-sm-8">
          <h4>All Time Statistics</h4>
          { this.allTimeSummaryDiv() }
        </div>

        <div className="col-lg-5 col-sm-12 text-center">
          <h4>Badge Breakdown</h4>
          { badgePlot }
        </div>

        <div className="col-lg-5 col-sm-12 text-center">
          <h4>Odometer vs Price</h4>
          { odometerPlot }
        </div>

      </div>
    );
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

}

class SelectedCarView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    this.updateCar();
  }

  updateCar() {
    if (!this.props.car) {
      return;
    }

    const vin = this.props.car.vin;
    if (carHistoryCache[vin]) {
      this.setState({
        history: carHistoryCache[vin]
      });
      return;
    }
    let err = (msg) => console.log(msg);

     axios.get(`${HISTORY_URL}?vin=${vin}`)
      .then(res => {
        carHistoryCache[vin] = res.data;
        this.setState({
          history: res.data
        })
      })
      .catch(err);
  }

  componentWillReceiveProps(nextProps) {
    this.updateCar();
  }

  render() {
    const car = this.props.car;
    if (this.state.history) {
      const odometerData = this.state.history.odometer_changes.map(r => {
        return {y: r.odometer_new, x: new Date(r.timestamp)};
      });
      const priceData = this.state.history.price_changes.map(r => {
        return {y: r.price_new, x: new Date(r.timestamp)};
      });
      const odometerPlotData = [{
        values: odometerData,
        label: 'Odometer'
      }];
      const pricePlotData = [{
        values: priceData,
        label: 'Price'
      }];

      const tooltipHtml = (x, y) => {
        return <div>{y}</div>;
      };

      var odometerPlot = odometerData.length > 1 ? <ScatterPlot data={odometerPlotData} width={600} height={400} margin={{top: 10, bottom: 50, left: 75, right: 10}}
                            opacity={1} tooltipMode={'mouse'} tooltipHtml={tooltipHtml} xAxis={{label: "Time"}} yAxis={{label: "Odometer"}}/> : <p>No data</p>;
      var pricePlot = priceData.length > 1 ? <ScatterPlot data={pricePlotData} width={600} height={400} margin={{top: 10, bottom: 50, left: 75, right: 10}}
                            opacity={1} tooltipMode={'mouse'} tooltipHtml={tooltipHtml} xAxis={{label: "Time"}} yAxis={{label: "Price"}}/> : <p>No data</p>;
    } else {
      var odometerPlot = <p>No data</p>;
      var pricePlot = <p>No data</p>;
    }

    if (car) {
      let language = car.country_code == 'US' ? '' : COUNTRIES.filter(c => c.code == car.country_code)[0];
      if (language) {
        language = language.languages[0].replace('-', '_') + '/';
      } else {
        language = '';
      }
      let url = `https://www.tesla.com/${language}${car.title_status == 'USED' ? 'preowned' : 'new'}/${car.vin}`;
      return (
        <div>

          <div className="col-lg-5 col-sm-12 text-center">
            <h4>Odometer History</h4>
            { odometerPlot }
          </div>
          <div className="col-lg-5 col-sm-12 text-center">
            <h4>Price History</h4>
            { pricePlot }
          </div>

          <div className="col-lg-6 col-sm-8">
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
        </div>
      )
    }
    return null;
  }
}

export default HomePage;
