import React, { PureComponent } from 'react';
import { RaisedButton } from 'material-ui';
import { FontIcon } from 'material-ui';

const styles = {
    container: {
        padding: '5%',
        display: 'flex',
        marginBottom: 50,
        flexWrap: 'wrap',
    },
    loginButton: {
        margin: '10px auto',
    },
};

export default class Welcome extends PureComponent {
    render() {
        return (
            <div style={styles.container}>
                {['Google', 'Facebook', 'Github', 'Vimeo'].map(provider =>
                    <RaisedButton
                        key={provider}
                        primary={true}
                        label={`Login with ${provider}`}
                        href={`/auth/${provider.toLowerCase()}`}
                        icon={<FontIcon className={`fa fa-${provider.toLowerCase()}`}/>}
                        style={styles.loginButton}
                    />
                )}
            </div>
        );
    }
}
