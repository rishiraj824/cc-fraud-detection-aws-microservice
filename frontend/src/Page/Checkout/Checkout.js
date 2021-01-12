import { Component } from 'react';
import { Spin, notification } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import Checkout from '../../components/Checkout';
import Success from '../../components/Success';
import Centered from '../../components/Centered';

const DELTA = 5000;
const checkoutUrl = 'https://t3ms686u5g.execute-api.us-east-2.amazonaws.com/dev1/l1';

const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

const Loading = () => (
  <>
    <Spin indicator={antIcon} />
    <Centered>Processing your order...</Centered>
  </>
)

const openNotificationWithIcon = (type, message, description, placement = 'bottomRight') => {
  notification[type]({
    message,
    description,
    placement
  });
};

const data = {
  1: {
    id: 1,
    name: 'Episode IV – A New Hope',
    price: 23.99,
    img: 'https://imgc.allpostersimages.com/img/print/u-g-F5L5V30.jpg'
  },
  2: {
    id: 2,
    name: 'Episode V – The Empire Strikes Back',
    price: 23.99,
    img: 'https://images-na.ssl-images-amazon.com/images/I/91eOgodm4nL.jpg'
  },
  3: {
    id: 3,
    name: 'Episode VI – Return of the Jedi',
    price: 23.99,
    img: 'https://i.pinimg.com/originals/d8/32/63/d83263fdb0ff5862707209b762e93d45.jpg'
  },
  4: {
    id: 4,
    name: 'Star Wars: Sequel Trilogy',
    price: 69.99,
    img: 'https://m.media-amazon.com/images/M/MV5BMDljNTQ5ODItZmQwMy00M2ExLTljOTQtZTVjNGE2NTg0NGIxXkEyXkFqcGdeQXVyODkzNTgxMDg@._V1_.jpg'
  },
}

const STEPS = {
  CHECKOUT: 1,
  LOADING: 2,
  SUCCESS: 3,
  ERROR: 4
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: STEPS.CHECKOUT,
      email: '',
      cvc: '',
      expiry: '',
      focus: '',
      name: '',
      number: '',
      state: '',
      country: '',
      zip: '',
      quantities: {
        1: 0,
        2: 0,
        3: 0,
        4: 0
      }
    };
  }

  handleInputFocus = (e, a, b) => {
    if (e) {
      this.setState({ focus: e.target.name });
    }
  }

  handleInputChange = (e) => {
    const { name, value } = e.target;
    this.setState({ [name]: value });
  }

  updateQuantity(val, id) {
    const { quantities } = this.state;
    this.setState({
      quantities: { ...quantities, [id]: val }
    })
  }

  async handleSubmit() {
    const {
      cvc,
      expiry,
      name,
      number,
      email,
      state,
      country,
      zip,
      quantities
    } = this.state;
    const payload = {
      cvc,
      email,
      expiry,
      name,
      number,
      state,
      country,
      zip,
    }

    payload.items = Object.keys(data).filter(k => quantities[k] > 0).map(
      k => ({ ...data[k], quantity: quantities[k] })
    )

    payload.total = this.getTotal();


    this.setState({
      step: STEPS.LOADING
    })
    try {
      let response = await fetch(checkoutUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "type": "topic",
          "tid": "",
          "topicname": "mytopic",
          "topicdata": payload
        }),
        redirect: 'follow'
      });

      let result = await response.json();
      const resp = JSON.parse(result.body);

      if (resp && resp.message && resp.tid && resp.message === "Forwarded Successfully") {
        setTimeout(() => this.fetchTransactionData(resp.tid), DELTA);
      } else {
        this.showError()
      }
    } catch (e) {
      this.showError()
    }
  }

  async fetchTransactionData(tid) {
    let response = await fetch(checkoutUrl, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "type": "transaction",
        "tid": tid,
        "topicdata": {}
      }),
      redirect: 'follow'
    });
    response = await response.json();

    const result = JSON.parse(response.body);
    if (result.transactionstatus === 'pending') {
      setTimeout(() => this.fetchTransactionData(tid), DELTA);
    } else {
      this.showSuccess(tid)
    }
  }

  showError() {
    this.setState({
      step: STEPS.CHECKOUT
    });
    openNotificationWithIcon(
      'error',
      'Transaction failed',
      'Something went wrong. Please try again or contact our team.'
    );
  }

  showSuccess(tid) {
    this.setState({
      step: STEPS.SUCCESS,
      tid: tid
    })
  }

  getTotal() {
    const { quantities } = this.state;
    return (Math.round(
      Object.keys(quantities).reduce((acc, k) => (acc + (quantities[k] * data[k].price)), 0) * 100
    ) / 100);
  }

  render() {
    const { step, tid, ...rest } = this.state;
    const total = this.getTotal();

    return (
      <>
        <h1>Shopping Cart</h1>
        {step === STEPS.CHECKOUT && <Checkout
          data={data}
          total={total}
          {...rest}
          handleInputChange={(e) => this.handleInputChange(e)}
          handleInputFocus={(e) => this.handleInputFocus(e)}
          updateQuantity={(v, i) => this.updateQuantity(v, i)}
          handleSubmit={() => this.handleSubmit()}
        />}
        {step === STEPS.LOADING && <Loading />}
        {step === STEPS.SUCCESS && <Success id={tid} />}
        {step === STEPS.ERROR && <>error</>}
      </>
    )
  }
}

export default App;