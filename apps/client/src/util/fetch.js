//@flow
import 'whatwg-fetch';
import config from '../config';

export type FetchOptions = {
  body?: ?BodyInit,

  cache?: CacheType,
  credentials?: CredentialsType,
  headers?: { [string]: string },
  integrity?: string,
  keepalive?: boolean,
  method?: string,
  mode?: ModeType,
  redirect?: RedirectType,
  referrer?: string,
  referrerPolicy?: ReferrerPolicyType,
  window?: any
};

async function defaultFetch(
  url: string,
  options: FetchOptions = {}
): Promise<any> {
  return fetch(config.api + url, {
    headers: {
      Accept: 'application/json',
      ...(options.headers || {})
    },
    ...options
  }).then(response => {
    if (!response.ok || response.status < 200 || response.status > 299) {
      return Promise.reject(response);
    }
    return response.json();
  });
}

export default defaultFetch;

export const createAuthorizedFetch = (token: string) => (
  url: string,
  options?: FetchOptions = {}
) =>
  defaultFetch(url, {
    headers: { Authorization: `Bearer ${token}`, ...(options.headers || {}) },
    ...options
  });
