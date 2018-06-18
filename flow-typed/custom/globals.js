// @flow
declare var module: {
  hot: {
    accept: (() => void) => void,
    dispose: (() => void) => void
  }
};
