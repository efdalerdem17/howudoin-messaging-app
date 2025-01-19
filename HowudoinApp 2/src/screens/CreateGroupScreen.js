import React from 'react';
import { CreateGroup } from '../components/GroupMessaging';

export default function CreateGroupScreen({ navigation }) {
  const onGroupCreated = (newGroup) => {
    navigation.goBack();
  };

  return (
    <CreateGroup 
      onSuccess={onGroupCreated}
    />
  );
}