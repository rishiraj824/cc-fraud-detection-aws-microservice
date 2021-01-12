import { Row, Col, Button, Form, Input, InputNumber, Card, Divider } from 'antd';
import Cards from 'react-credit-cards';

import Centered from '../../components/Centered'
import css from './Checkout.module.css';
const CartItem = ({ id, img, name, price, quantity, onChange }) => {
  return (
    <Row key={id}>
      <Col span={4} className={css['cart-item']}>
        <img src={img} width="80px" alt={name} />
      </Col>
      <Col span={8}>
        {name}
      </Col>
      <Col span={6} className={css['cart-item']}>
        <span>
          <InputNumber
            min={0}
            max={100000}
            value={quantity}
            onChange={(e) => onChange(e, id)}
          />
        </span>
      </Col>
      <Col span={6} className={css['cart-item']}>
        {`$${price}`}
      </Col>
    </Row>
  )
}

const Checkout = ({
  data,
  total,
  cvc,
  name,
  number,
  expiry,
  email,
  focus,
  state,
  country,
  zip,
  quantities,
  handleInputChange,
  handleInputFocus,
  handleSubmit,
  updateQuantity
}) => {
  const isButtonDisabled = !(total !== 0 && number && name && email &&  cvc && expiry && state && country && zip);
  return (
    <Row>
      <Col span={16} className={css.col}>
        <Card>
          {Object.values(data).map(
            (item, i) => (
              <span key={item.id}>
                <CartItem
                  quantity={quantities[item.id]}
                  onChange={(val, id) => updateQuantity(val, id)}
                  {...item}
                />
                {i !== Object.values(data).length - 1 && <Divider key={`divider-${item.id}`} />}
              </span>)
          )}
        </Card>
      </Col>
      <Col span={8} className={css.col}>
        <Card className={css.mb1}>
          <span className={css.total}>
            <p><b>Total</b></p>
            <p>{`$${total}`}</p>
          </span>
        </Card>
        <Cards
          cvc={cvc}
          expiry={expiry}
          focused={focus}
          name={name}
          number={number}
        />
        <Form.Item className={css.mt1}>
          <Input
            value={email}
            name="email"
            placeholder="Email"
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item>
          <Input
            name="name"
            value={name}
            placeholder="Name"
            onChange={handleInputChange}
            onFocus={(e) => handleInputFocus(e)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            name="state"
            value={state}
            placeholder="State"
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item>
          <Input
            name="country"
            value={country}
            placeholder="Country"
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item>
          <Input
            name="zip"
            value={zip}
            placeholder="Zip Code"
            onChange={handleInputChange}
          />
        </Form.Item>
        <Form.Item className={css.mt1}>
          <Input
            maxLength={16}
            value={number}
            name="number"
            placeholder="Card Number"
            onChange={handleInputChange}
            onFocus={(e) => handleInputFocus(e)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            maxLength={7}
            value={expiry}
            name="expiry"
            placeholder="Expiry date, MM/YY"
            onChange={handleInputChange}
            onFocus={(e) => handleInputFocus(e)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            maxLength={3}
            value={cvc}
            name="cvc"
            placeholder="CVC"
            onChange={handleInputChange}
            onFocus={(e) => handleInputFocus(e)}
          />
        </Form.Item>
        <Form.Item>
          <Centered>
            <Button type="primary" onClick={() => handleSubmit()} disabled={isButtonDisabled}>Submit</Button>
          </Centered>
        </Form.Item>
      </Col>
    </Row>
  )
}

export default Checkout;