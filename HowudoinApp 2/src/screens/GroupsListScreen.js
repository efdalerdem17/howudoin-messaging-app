// src/screens/GroupsListScreen.js
import React, { useState, useEffect, useContext } from 'react';

import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function GroupsListScreen({ navigation }) {
  const [groups, setGroups] = useState([]);
  const { userToken } = useContext(AuthContext);

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchGroups();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchGroups = async () => {
    try {
      const response = await fetch('http://192.168.0.109:8080/api/groups', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Fetch groups error:', error);
      setGroups([]);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        renderItem={({ item }) => (
          <View style={styles.groupItem}>
            {/* Navigate to GroupChat */}
            <TouchableOpacity
              onPress={() => navigation.navigate('GroupChat', { 
                groupId: item.id,
                groupName: item.name
              })}
            >
              <Text style={styles.groupName}>{item.name}</Text>
              <Text style={styles.memberCount}>
                {item.memberIds.length} member(s)
              </Text>
            </TouchableOpacity>

            {/* Navigate to GroupDetails */}
            <TouchableOpacity
              style={styles.detailsButton}
              onPress={() => navigation.navigate('GroupDetails', { 
                groupId: item.id,
                groupName: item.name
              })}
            >
              <Text style={styles.detailsText}>Details</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  groupItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  groupName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  memberCount: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  detailsButton: {
    marginTop: 8,
    backgroundColor: '#f4511e',
    padding: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  detailsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});