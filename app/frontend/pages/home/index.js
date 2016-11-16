import { Set } from 'immutable';
import capitalize from 'capitalize';
import React from 'react';
import Layout from '../../components/Layout';
import CarTable from '../../components/CarTable';
import s from './styles.css';
import axios from 'axios';
import { ScatterPlot, BarChart } from 'react-d3-components';

const devMode = window.location.host.includes('localhost');
const URL = window.location.protocol + '//' + (devMode ? 'localhost:8000' : window.location.host) + '/cars/';
const COUNTRIES = ['AT', 'BE', 'CA', 'DE', 'FI', 'FR', 'GB', 'IT', 'NL', 'US', 'CH'];

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
      let onChange = this.props.onChange.bind(this.props.that, this.props.filtered, country);
      divs.push(<div key={country} className="input-group">
                  <label className={`input-group-addon ${s.alignNavRows}`}>
                    <input onChange={onChange}
                        checked={!this.props.filtered.has(country)} type="checkbox" />
                    {country} ({this.props.cars.filter(c => c.country_code == country).length})
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
      cars: []
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

  allTimeSummaryDiv(cars) {
    return (
      <ul>
        <li>X cars seen all-time</li>
        <li>Captured X price changes over Y cars</li>
        <li>Captured X odometer changes over Y cars</li>
      </ul>);
  }

  recentSummaryDiv(cars) {
    let lastUpdated = Math.max(...cars.map(c => new Date(c.last_seen)));
    lastUpdated = new Date(lastUpdated).toLocaleString();

    let newCars = cars.map(c => {
      return (new Date() - new Date(c.first_seen)) / 1000 / 86400;
    }).filter(c => c < 1).length;
    let numCityLocations = Set(cars.map(c => c.metro_id)).size;
    let numCountry = Set(cars.map(c => c.country_code)).size;

    return (
      <ul>
        <li>Last updated: {lastUpdated}</li>
        <li>{cars.length} cars active within last 24 hours</li>
        <li>{newCars} new cars added within last 24 hours</li>
        <li>Cars seen in {numCityLocations} city locations</li>
        <li>Cars seen in {numCountry} countries</li>
      </ul>)
  }

  render() {
    let filteredCars = this.filteredCars();
    if (this.state.cars.length == 0) {
      var odometerPlot = null;
      var badgePlot = null;
    } else {
      let tooltipHtml = (x, y) => {
        return <div>Odometer {x}, price {y}</div>;
      };
      var odometerPlot = <ScatterPlot data={this.odometerChartData(filteredCars)} width={600} height={400} margin={{top: 10, bottom: 50, left: 50, right: 10}}
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
            <div className="col-sm-2 sidenav">
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
              </div>
              <br />
            </div>

            <div className="col-lg-6 col-sm-12">
              <h4>Recent Activity Summary</h4>
              { this.recentSummaryDiv(filteredCars) }
            </div>

            <div className="col-lg-5 col-sm-12">
              <h4>Badge Breakdown</h4>
              { badgePlot }
            </div>

            <div className="col-lg-5 col-sm-12">
              <h4>Odometer vs Price</h4>
              { odometerPlot }
            </div>

            <div className="col-lg-12 col-sm-12">
              <h4>Details</h4>
              <CarTable cars={filteredCars}></CarTable>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

}

export default HomePage;
