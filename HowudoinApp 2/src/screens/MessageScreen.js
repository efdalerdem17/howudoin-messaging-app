import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import jwt_decode from 'jwt-decode';

const MessageScreen = ({ route, navigation }) => {
  const { friendEmail } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [friendId, setFriendId] = useState(null);
  const flatListRef = useRef(null);

  const getUserIdFromToken = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        const decoded = jwt_decode(token);
        return decoded.id;
      }
      return null;
    } catch (error) {
      console.error('Error getting userId from token:', error);
      return null;
    }
  };

  const getFriendId = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`http://192.168.0.109:8080/api/users/find-by-email?email=${encodeURIComponent(friendEmail)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Friend info failed');
      }

      const userData = await response.json();
      console.log('Friend user data:', userData);
      if (!userData || !userData.id) {
        throw new Error('User ID couldnt find');
      }
      return userData.id;
    } catch (error) {
      console.error('Error getting friend ID:', error);
      Alert.alert('Error', 'Error getting friend ID:');
      return null;
    }
  };

  useEffect(() => {
    const initializeFriendId = async () => {
      const id = await getFriendId();
      setFriendId(id);
    };
    initializeFriendId();
  }, [friendEmail]);

  const fetchMessages = async () => {
    if (isLoading || !friendId) return;
    
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('userToken');
      
      console.log('Fetching messages with friendId:', friendId);
      
      const response = await fetch(`http://192.168.0.109:8080/api/messages?userId2=${friendId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Fetched messages:', data);
      
      if (Array.isArray(data)) {
        setMessages(data.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt)));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mesaj gönder
  const sendMessage = async () => {
    if (newMessage.trim() === '' || isSending || !friendId) return;

    try {
      setIsSending(true);
      const token = await AsyncStorage.getItem('userToken');
      
      console.log('Sending message to friendId:', friendId);

      const response = await fetch(`http://192.168.0.109:8080/api/messages/send?receiverId=${friendId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'text/plain',
        },
        body: newMessage.trim()
      });

      if (!response.ok) {
        throw new Error('Message couldnt send');
      }

      setNewMessage('');
      await fetchMessages();

    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Error sending message');
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    if (friendId) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000);
      return () => clearInterval(interval);
    }
  }, [friendId]);

  const renderMessage = ({ item }) => {
    const isMyMessage = item.senderId === friendId;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.friendMessage : styles.myMessage
      ]}>
        <Text style={[
          styles.messageText,
          isMyMessage ? styles.friendMessageText : styles.myMessageText
        ]}>
          {item.content}
        </Text>
        <Text style={styles.timestamp}>
          {new Date(item.sentAt).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    );
  };

  if (!friendId) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ade80" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{friendEmail}</Text>
      </View>

      {isLoading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ade80" />
        </View>
      ) : messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Henüz mesaj yok</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id || Date.now().toString()}
          contentContainerStyle={styles.messagesList}
          inverted
          onRefresh={fetchMessages}
          refreshing={isLoading}
        />
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Write your message..."
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (newMessage.trim() === '' || isSending) && styles.sendButtonDisabled
          ]}
          onPress={sendMessage}
          disabled={newMessage.trim() === '' || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="#4ade80" />
          ) : (
            <Ionicons
              name="send"
              size={24}
              color={newMessage.trim() === '' ? '#c4c4c4' : '#4ade80'}
            />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4511e',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#6b7280',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 16,
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#4ade80',
    borderBottomRightRadius: 4,
  },
  friendMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  friendMessageText: {
    color: '#1f2937',
  },
  timestamp: {
    fontSize: 12,
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
    justifyContent: 'center',
    alignItems: 'center',
    width: 44,
    height: 44,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  }
});

export default MessageScreen;