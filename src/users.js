import React from 'react';
import { List as RAList, Datagrid, TextField, DateField, EditButton } from 'react-admin';

export const List = (props) => (
  <RAList {...props} title="Users" perPage={ 30 }>
    <Datagrid>
      <TextField source="username" label="Account" />
      <TextField source="name" label="Name"/>
      <DateField source="loggedAt" label="Logged At"/>
      <EditButton />
    </Datagrid>
  </RAList>
);
