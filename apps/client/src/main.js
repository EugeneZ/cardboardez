//@flow
import polyfill from 'babel-polyfill';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import Container from './component/Container';

function getRoot() {
  return document.getElementById('react');
}

function runApp() {
  const root = getRoot();
  if (!root) {
    throw new Error('Missing root element');
  }
  render(<Container />, root);
}

runApp();

if (module.hot) {
  module.hot.dispose(function() {
    unmountComponentAtNode(getRoot());
  });

  module.hot.accept(function() {
    // module or one of its dependencies was just updated
  });
}
