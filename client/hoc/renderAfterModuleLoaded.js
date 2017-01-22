import React, { PureComponent } from 'react';
import scriptloader from 'scriptloader';
import difference from 'lodash/difference';

export default function (mapPropsToModuleNames, ComponentToRenderWhenNotReady) {
    return function (ProxiedComponent) {
        return class ModuleLoaderProxy extends PureComponent {
            constructor(props) {
                super(props);
                this.loadModules = this.loadModules.bind(this);

                this.modulesToLoad = mapPropsToModuleNames(this.props);
                this.readyModules = [];
                this.loadingModules = [];
                this.allLoaded = false;

                this.loadModules();
            }

            componentWillReceiveProps(props) {
                this.modulesToLoad = mapPropsToModuleNames(props);
                this.loadModules();
            }

            render() {
                if (this.allLoaded) {
                    return <ProxiedComponent {...this.props}/>;
                } else if (ComponentToRenderWhenNotReady) {
                    return <ComponentToRenderWhenNotReady
                        {...this.props}
                        loadingModules={this.loadingModules}
                        readyModules={this.readyModules}
                    />;
                } else {
                    return null;
                }
            }

            loadModules() {
                if (!this.modulesToLoad.length || !difference(this.modulesToLoad, this.readyModules).length) {
                    this.allLoaded = true;
                    return;
                } else {
                    this.allLoaded = false;
                }

                this.modulesToLoad.forEach(moduleName => {
                    if (!this.readyModules.includes(moduleName) && !this.loadingModules.includes(moduleName)) {
                        this.loadingModules.push(moduleName);
                        scriptloader(moduleName).addEventListener('load', () => {
                            this.readyModules.push(moduleName);

                            if (!difference(this.modulesToLoad, this.readyModules).length) {
                                this.allLoaded = true;
                            }

                            this.forceUpdate();
                        });
                    }
                });
            }
        };
    }
}
