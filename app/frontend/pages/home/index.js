/**
 * React Static Boilerplate
 * https://github.com/kriasoft/react-static-boilerplate
 *
 * Copyright © 2015-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { PropTypes } from 'react';
import Layout from '../../components/Layout';
import CarTable from '../../components/CarTable';
import s from './styles.css';
import { title, html } from './index.md';
import axios from 'axios';


const URL = 'http://localhost:8000/cars/';

class HomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        cars: []
    };
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
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <h3>Pricing</h3>
        <CarTable cars={this.state.cars}></CarTable>
      </Layout>
    );
  }

}

export default HomePage;
