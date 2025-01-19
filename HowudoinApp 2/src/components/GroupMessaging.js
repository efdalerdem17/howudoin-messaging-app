import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet,
  ActivityIndicator,
  Alert 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

export const CreateGroup = ({ onSuccess }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const { userToken } = useContext(AuthContext);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    try {
      const response = await fetch('http://192.168.0.109:8080/api/friends', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });
      const data = await response.json();
      setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
      Alert.alert('Error', 'Failed to load friends list');
    }
  };

  const fetchUserIdByEmail = async (email) => {
    try {
      const response = await fetch(`http://192.168.0.109:8080/api/users/find-by-email?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('User not found');
      }

      const user = await response.json();
      return user.id;
    } catch (error) {
      console.error('Error fetching user ID:', error);
      return null;
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Error', 'Please enter a group name');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select at least one friend');
      return;
    }

    setLoading(true);
    try {
      const memberIdsPromises = selectedFriends.map(email => fetchUserIdByEmail(email));
      const memberIds = await Promise.all(memberIdsPromises);
      const validMemberIds = memberIds.filter(id => id !== null);

      const response = await fetch('http://192.168.0.109:8080/api/groups/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          name: groupName,
          memberIds: validMemberIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create group');
      }

      const createdGroup = await response.json();
      setGroupName('');
      setSelectedFriends([]);
      
      if (onSuccess) {
        onSuccess(createdGroup);
      }
      Alert.alert('Success', 'Group created successfully');

    } catch (error) {
      console.error('Group creation error:', error);
      Alert.alert('Error', 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFriendSelection = (friendEmail) => {
    setSelectedFriends(prev => 
      prev.includes(friendEmail)
        ? prev.filter(email => email !== friendEmail)
        : [...prev, friendEmail]
    );
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Group Name"
        value={groupName}
        onChangeText={setGroupName}
        placeholderTextColor="#666"
      />

      <Text style={styles.sectionTitle}>Select Friends</Text>
      
      <FlatList
        data={friends}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={[
              styles.friendItem,
              selectedFriends.includes(item) && styles.selectedFriend
            ]}
            onPress={() => toggleFriendSelection(item)}
          >
            <Text style={styles.friendEmail}>{item}</Text>
            {selectedFriends.includes(item) && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => `friend-${index}`}
        style={styles.friendsList}
      />

      <TouchableOpacity 
        style={[styles.createButton, loading && styles.disabledButton]}
        onPress={handleCreateGroup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.buttonText}>Create Group</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export const GroupChat = ({ groupId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { userToken } = useContext(AuthContext);  
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [emailMap, setEmailMap] = useState({});

  useEffect(() => {
    if (userToken) {
      try {
        const decoded = jwtDecode(userToken); 
        if (decoded && decoded.sub) {
          setCurrentUserEmail(decoded.sub);
        } else {
          console.error("Invalid JWT token structure."); 
        }
      } catch (error) {
        console.error('Token decode error:', error);
        // Handle decode error gracefully
      }
    }
  }, [userToken]);

  const fetchUserEmail = async (userId) => {
    if (emailMap[userId]) return emailMap[userId];
    
    try {
      console.log('Fetching email for userId:', userId); 
      const response = await fetch(`http://192.168.0.109:8080/api/users/find/${userId}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
        }
      });
  
      console.log('Response status:', response.status);
  
      if (!response.ok) {
        console.log('Error response:', await response.text());  
        throw new Error('Failed to fetch user email');
      }
  
      const userData = await response.json();
      console.log('User data received:', userData);  
  
      setEmailMap(prev => ({ ...prev, [userId]: userData.email }));
      return userData.email;
    } catch (error) {
      console.error('Error fetching user email:', error);
      return userId;  
    }
  };
  
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [groupId]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(
        `http://192.168.0.109:8080/api/groups/${groupId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }
      const data = await response.json();
      
      // Get emails for new senders
      for (const message of data) {
        if (!emailMap[message.senderId]) {
          await fetchUserEmail(message.senderId);
        }
      }

      setMessages(data);
    } catch (error) {
      console.error('Fetch messages error:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        `http://192.168.0.109:8080/api/groups/${groupId}/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'text/plain',
            'Authorization': `Bearer ${userToken}`,
          },
          body: newMessage.trim(),
        }
      );

      if (response.ok) {
        setNewMessage('');
        await fetchMessages();
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return '';
      }
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const renderMessage = ({ item }) => {
    const isSentByMe = item.senderId === currentUserEmail;
    const senderEmail = emailMap[item.senderId] || 'Unknown';

    return (
      <View style={[
        styles.messageContainer,
        isSentByMe ? styles.sentMessage : styles.receivedMessage
      ]}>
        <Text style={styles.senderEmail}>{senderEmail}</Text>
        <Text style={[
          styles.messageText,
          isSentByMe ? styles.sentMessageText : styles.receivedMessageText
        ]}>
          {item.content}
        </Text>
        {item.sentAt && (
          <Text style={styles.timestamp}>
            {formatDate(item.sentAt)}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id?.toString() || Date.now().toString()}
        inverted
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={newMessage}
          onChangeText={setNewMessage}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!newMessage.trim() || loading) && styles.disabledButton
          ]}
          onPress={sendMessage}
          disabled={!newMessage.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  // CreateGroup Styles
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  friendsList: {
    flex: 1,
    marginBottom: 16,
  },
  friendItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedFriend: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0ea5e9',
  },
  friendEmail: {
    fontSize: 16,
    color: '#1f2937',
  },
  checkmark: {
    color: '#0ea5e9',
    fontSize: 20,
    fontWeight: 'bold',
  },
  createButton: {
    backgroundColor: '#0ea5e9',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  // GroupChat Styles
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
    marginHorizontal: 16,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4ade80',
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  senderEmail: {
    fontSize: 12,
    marginBottom: 4,
    color: '#6b7280',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  sentMessageText: {
    color: '#fff',
  },
  receivedMessageText: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 10,
    color: '#6b7280',
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#4ade80',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});


