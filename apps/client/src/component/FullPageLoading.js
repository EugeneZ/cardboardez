// @flow
import React, { PureComponent } from 'react';
import { CircularProgress } from 'material-ui/Progress';

export default class FullPageLoading extends PureComponent<{}> {
  render() {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0
        }}
      >
        <CircularProgress size={100} />
      </div>
    );
  }
}
