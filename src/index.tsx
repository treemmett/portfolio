import React, { FC } from 'react';
import { render } from 'react-dom';
import { Router } from '@reach/router';
import Photos from './views/Photos';

render(
  <Router>
    <Photos path="/photos" />
  </Router>,
  document.getElementById('root')
);
