import React from 'react';
import { fetchUtils, Admin, Resource, ListGuesser, EditGuesser } from 'react-admin';
import { hydraClient, fetchHydra as baseFetchHydra, AdminBuilder } from '@api-platform/admin';
import parseHydraDocumentation from '@api-platform/api-doc-parser/lib/hydra/parseHydraDocumentation';
import { Redirect } from 'react-router-dom';

import authProvider from './authProvider';
import { List } from './users';

const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: 'application/json' });
  }
  const token = localStorage.getItem('token');
  options.headers.set('Authorization', `Bearer ${token}`);
  return fetchUtils.fetchJson(url, options);
}

// export default () => <HydraAdmin entrypoint="http://localhost:3000/api"/>;

// const dataProvider = jsonServerProvider('/api', httpClient);
// const dataProvider = hydraClient({entrypoint: 'http://localhost:3000/api'});
// const App = () => (
//   <Admin dataProvider={dataProvider} authProvider={authProvider}>
//     <Resource name="users" list={ListGuesser} edit={EditGuesser} />
//     <Resource name="groups" list={ListGuesser} edit={EditGuesser} />
//   </Admin>
// );


const entrypoint = 'http://localhost:3000/api';
const fetchHeaders = {'Authorization': `Bearer ${window.localStorage.getItem('token')}`};
const fetchHydra = (url, options = {}) => baseFetchHydra(url, {
  ...options,
  headers: new Headers(fetchHeaders),
});
const dataProvider = api => hydraClient(api, fetchHydra);
const apiDocumentationParser = entrypoint => parseHydraDocumentation(entrypoint, { headers: new Headers(fetchHeaders) })
  .then(
    ({ api }) => ({api}),
    (result) => {
      switch (result.status) {
        case 401:
          return Promise.resolve({
            api: result.api,
            customRoutes: [{
              props: {
                path: '/',
                render: () => <Redirect to={`/login`}/>,
              },
            }],
          });

        default:
          return Promise.reject(result);
      }
    },
  );

export default class extends React.Component {
  state = { api: null };

  componentDidMount() {
    apiDocumentationParser(entrypoint).then(({ api }) => {
      console.log(api.resources)
      this.setState({ api });
    }).catch((e) => {
      console.log(e);
    });
  }

  render() {
    if (null === this.state.api) return <div>Loading...</div>;
    return (
      <AdminBuilder api={ this.state.api }
             apiDocumentationParser={ apiDocumentationParser }
             dataProvider= { dataProvider(this.state.api) }
             authProvider={ authProvider }
      >
      </AdminBuilder>
    )
  }
}

// export default App;

