/**
 * React Static Boilerplate
 * https://github.com/kriasoft/react-static-boilerplate
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import { Set } from 'immutable';
import capitalize from 'capitalize';
import React, { PropTypes } from 'react';
import Layout from '../../components/Layout';
import CarTable from '../../components/CarTable';
import s from './styles.css';
import title from './index.md';
import axios from 'axios';


const URL = 'http://localhost:8000/cars/';
const COUNTRIES = ['AT', 'BE', 'CA', 'DE', 'FI', 'FR', 'GB', 'IT', 'NL', 'US', 'CH'];

class CarModelFilterCount extends React.Component {
  render() {
    let model = capitalize.words(this.props.model.replace('_', ' ').toLowerCase());
    return (<div className="input-group">
              <label className="input-group-addon">
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
                  <label className="input-group-addon">
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
    console.log(set, val, event);
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

  static propTypes = {
    articles: PropTypes.array.isRequired,
  };

  componentDidMount() {
    document.title = title;

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


  render() {
    return (
      <Layout className={s.content}>

        <div className="container-fluid">
          <div className="row content">
            <div className="col-sm-3 sidenav">
              <h3>Tesla CPO Trace</h3>
              <div className="nav nav-pills nav-stacked">
                Models:
                <CarModelFilterCount filtered={this.state.filteredObjects}
                    onChange={this.handleFilterChange.bind(this, this.state.filteredObjects, 'MODEL_S')}
                    cars={this.state.cars} model='MODEL_S' />
                <CarModelFilterCount filtered={this.state.filteredObjects}
                    onChange={this.handleFilterChange.bind(this, this.state.filteredObjects, 'MODEL_X')}
                    cars={this.state.cars} model='MODEL_X' />

                Countries:
                <CarCountryFilterCounts filtered={this.state.filteredObjects}
                    onChange={this.handleFilterChange}
                    that={this}
                    cars={this.state.cars} />
              </div>
              <br />
            </div>

            <div className="col-sm-9">
              <h4>Details</h4>
              <CarTable cars={this.filteredCars()}></CarTable>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

}

export default HomePage;
