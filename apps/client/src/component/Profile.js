import React, { PureComponent } from 'react';
import autobind from 'autobind-decorator';
import { Paper } from 'material-ui';
import { TextField } from 'material-ui';
import { RaisedButton } from 'material-ui';
import { connect } from 'react-redux';
import { currentUser } from '../selectors/users';
import { topLevelPaperContainer } from '../styles';

const styles = {
  container: {
    ...topLevelPaperContainer,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    flexWrap: 'wrap'
  }
};

function getMyName(props) {
  const me = props.user;
  return me && me.name;
}

@connect(state => ({
  user: currentUser(state)
}))
@autobind
export default class Profile extends PureComponent {
  state = {
    name: getMyName(this.props)
  };

  componentWillReceiveProps(nextProps) {
    if (!this.state.name) {
      this.setState({
        name: getMyName(nextProps)
      });
    }
  }

  render() {
    if (!this.props.user) {
      return null;
    }

    return (
      <Paper style={styles.container}>
        <TextField
          floatingLabelText="Your Name"
          value={this.state.name}
          onChange={this.onChangeName}
        />
        <RaisedButton
          label="Update Profile"
          onTouchTap={this.onClickSubmit}
          primary={true}
        />
      </Paper>
    );
  }

  onChangeName({ target: { value: name } }) {
    this.setState({ name });
  }

  onClickSubmit() {
    const { name } = this.state;

    if (!name || name.length < 2) {
      this.setState({ nameError: 'Your name must be at least two characters' });
      return;
    }

    this.props.dispatch({ type: 'PATCH_PROFILE', data: { name } });
  }
}
