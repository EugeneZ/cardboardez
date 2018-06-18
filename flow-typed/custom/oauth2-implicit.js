// @flow
declare module 'oauth2-implicit' {
  declare type State = { [string]: string };

  declare type Options = {
    auth_uri: string,
    client_id: string,
    scope?: Array<string>,
    redirect_uri?: string,
    state?: State
  };

  declare type Credentials = {
    accessToken: string,
    tokenType: string,
    expiresIn?: number,
    scope: Array<string>,
    state?: State
  };

  declare export function start(options: Options): void;
  declare export function finish(): ?Credentials;
  declare export function run(options: Options): ?Credentials;
}
