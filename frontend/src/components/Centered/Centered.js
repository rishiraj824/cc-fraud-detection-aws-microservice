import cx from 'classnames';

import css from './Centered.module.css';

const Centered = ({ children, className }) => (
  <span className={cx(css.center, className)}>{children}</span>
);

export default Centered;