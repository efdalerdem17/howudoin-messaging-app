// FriendsListScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const FriendsListScreen = () => {
  const [friends, setFriends] = useState([]);
  const navigation = useNavigation();

  const fetchFriends = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch('http://192.168.0.109:8080/api/friends', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const openChat = (friendEmail) => {
    navigation.navigate('Message', { friendEmail });
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={friends}
        keyExtractor={(item, index) => `friend-${index}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.friendItem}
            onPress={() => openChat(item)}
          >
            <Text style={styles.friendEmail}>{item}</Text>
          </TouchableOpacity>
        )}
      />
      <View style={styles.footerContainer}>
        <Text style={styles.footer}>Designed by Efdal & Habibe</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
  },
  friendItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  friendEmail: {
    fontSize: 16,
    color: '#1f2937',
  },
  footerContainer: {
    padding: 8,
  },
  footer: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    fontStyle: 'italic',
  }
});

export default FriendsListScreen;