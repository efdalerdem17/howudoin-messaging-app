// src/screens/GroupChatScreen.js
import React from 'react';
import { GroupChat } from '../components/GroupMessaging';

export default function GroupChatScreen({ route, navigation }) {
  const { groupId, groupName } = route.params;
  
  return (
    <GroupChat 
      groupId={groupId}
      groupName={groupName}
      navigation={navigation}
    />
  );
}
