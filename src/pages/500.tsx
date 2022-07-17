import { NextPage } from 'next';
import styles from './500.module.scss';

const FiveHundred: NextPage = () => (
  <div className={styles.page}>
    <h1>A server error occurred</h1>
  </div>
);

export default FiveHundred;
