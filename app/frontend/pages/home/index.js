/**
 * React Static Boilerplate
 * https://github.com/kriasoft/react-static-boilerplate
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

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
      divs.push(<div key={country} className="input-group">
                  <label className="input-group-addon">
                    <input onChange={this.props.onChange} checked={!this.props.filtered.has(country)} type="checkbox" />
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
      filteredModels: new Set(),
      filteredCountries: new Set(),
      cars: []
    };
  }

  handleFilterChange(set, val, event) {
    let filteredModels = new Set(set);
    if (event.target.value) {
      filteredModels.add(val);
    } else {
      filteredModels.delete(val);
    }
    this.setState({
      filteredModels: filteredModels
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


  render() {
    return (
      <Layout className={s.content}>

        <div className="container-fluid">
          <div className="row content">
            <div className="col-sm-3 sidenav">
              <h3>Tesla CPO Trace</h3>
              <div className="nav nav-pills nav-stacked">
                Models:
                <CarModelFilterCount filtered={this.state.filteredModels}
                    onChange={this.handleFilterChange.bind(this, this.state.filteredModels, 'MODEL_S')}
                    cars={this.state.cars} model='MODEL_S' />
                <CarModelFilterCount filtered={this.state.filteredModels}
                    onChange={this.handleFilterChange.bind(this, this.state.filteredModels, 'MODEL_X')}
                    cars={this.state.cars} model='MODEL_X' />

                Countries:
                <CarCountryFilterCounts filtered={this.state.filteredCountries}
                    onChange={this.handleFilterChange.bind(this)}
                    cars={this.state.cars} />
              </div>
              <br />
            </div>

            <div className="col-sm-9">
              <h4>Details</h4>
              <CarTable cars={this.state.cars}></CarTable>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

}

export default HomePage;
