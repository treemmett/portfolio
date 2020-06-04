import React, { FC } from 'react';
import { render } from 'react-dom';
import stars from '../assets/waves.jpg';
import styles from './styles.scss';

const App: FC = () => {
  return (
    <div>
      <div
        className={styles.splash}
        style={{ backgroundImage: `url(${stars})` }}
      >
        <h1>Hi, I&apos;m Tregan</h1>
      </div>
    </div>
  );
};

render(<App />, document.getElementById('root'));
