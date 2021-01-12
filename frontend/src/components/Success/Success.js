import Centered from '../Centered';

import css from './Success.module.css'

const Success = ({id}) => {
  return (
    <Centered className={css.success}>
      <Centered><b>Trasaction Id: </b> {id}</Centered>
      <Centered>Order Placed. Your order will be there soon.</Centered>
      <img src={'/truck.gif'} width="50%" alt="Success"/>
    </Centered>
  )
}

export default Success;