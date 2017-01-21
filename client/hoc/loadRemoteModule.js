import React, { PureComponent } from 'react';
import forEach from 'lodash/forEach';
import scriptloader from 'scriptloader';

export default function (mapPropsToModuleNames) {
    return function (ProxiedComponent) {
        return class RemoteModuleLoader extends PureComponent {
            constructor(props) {
                super(props);
                this.readyModules = {};
                this.loadingModules = {};
                this.loadModules = this.loadModules.bind(this);
                this.loadModules(mapPropsToModuleNames(this.props));
            }

            componentWillReceiveProps(props) {
                this.loadModules(mapPropsToModuleNames(props));
            }

            render() {
                return <ProxiedComponent
                    {...this.props}
                    {...this.readyModules}
                />;
            }

            loadModules(moduleMap) {
                forEach(moduleMap, (moduleName, target) => {
                    if (moduleName && !this.readyModules[target] && !this.loadingModules[target]) {
                        this.loadingModules[target] = true;
                        scriptloader(`/assets/scripts/games/${moduleName}.js`).addEventListener('load', () => {
                            this.readyModules[target] = true;
                            this.forceUpdate();
                        });
                    }
                });
            }
        };
    }
}
