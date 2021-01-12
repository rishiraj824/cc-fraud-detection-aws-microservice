import React from "react";
import {
  BrowserRouter as Router,
  Link,
  Switch,
  Route,
} from "react-router-dom";
import { Layout } from 'antd';

import Checkout from './Page/Checkout';
import Orders from './Page/Orders';

import Centered from './components/Centered'

import css from './App.module.css';

const { Header, Footer, Content } = Layout;

function App() {
  return (
    <Router>
      <Layout className={css.layout}>
        <Header className={css.header}>
          <Centered className={css.white}>Buy Movies</Centered>
        </Header>
        <Content>
          <span className={css.content}>
            <Switch>
              <Route path="/orders">
                <Orders />
              </Route>
              <Route path="/">
                <Checkout />
              </Route>
            </Switch>
          </span>
        </Content>
        <Footer className={css.footer}>
          <Centered>
            <p className={css.link}>
              <Link to="/">Home</Link>
            </p>
            <p>|</p>
            <span className={css.link}>
                Powered By AWS
            </span>
          </Centered>
        </Footer>
      </Layout>
    </Router>
  );
}

export default App;