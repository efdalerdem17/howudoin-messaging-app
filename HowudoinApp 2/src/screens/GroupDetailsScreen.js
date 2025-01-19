import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Modal,
  FlatList 
} from 'react-native';
import { AuthContext } from '../context/AuthContext';

const GroupDetailsScreen = ({ route }) => {
  const { groupId } = route.params;
  const [group, setGroup] = useState(null);
  const [memberDetails, setMemberDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userToken } = useContext(AuthContext);
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('default', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`http://192.168.0.109:8080/api/users/find/${userId}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        console.error('User details response not ok:', response.status);
        throw new Error('Failed to fetch user details');
      }
      
      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error in fetchUserDetails:', error);
      return null;
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch('http://192.168.0.109:8080/api/friends', {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json'
        }
      });
      const allFriends = await response.json();
      
      // Filter out friends who are already members
      const currentMemberEmails = memberDetails.map(member => member.email);
      const availableFriends = allFriends.filter(
        friend => !currentMemberEmails.includes(friend)
      );
      
      setFriends(availableFriends);
    } catch (error) {
      console.error('Error fetching friends:', error);
      Alert.alert('Error', 'Failed to load friends list');
    }
  };

  const addMembers = async () => {
    if (selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select at least one friend');
      return;
    }

    setLoading(true);
    try {
      // Convert emails to user IDs
      const addMemberPromises = selectedFriends.map(async (email) => {
        const response = await fetch(
          `http://192.168.0.109:8080/api/users/find-by-email?email=${encodeURIComponent(email)}`,
          {
            headers: {
              'Authorization': `Bearer ${userToken}`,
            },
          }
        );
        const userData = await response.json();
        
        // Add member to group
        await fetch(`http://192.168.0.109:8080/api/groups/${groupId}/add-member?memberId=${userData.id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
          },
        });
        
        return userData;
      });

      await Promise.all(addMemberPromises);
      
      // Refresh group details
      fetchGroupDetails();
      setIsAddMemberModalVisible(false);
      setSelectedFriends([]);
      Alert.alert('Success', 'Member added successfully');
    } catch (error) {
      console.error('Error adding members:', error);
      Alert.alert('Error', 'Failed to add member');
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

  useEffect(() => {
    if (isAddMemberModalVisible) {
      fetchFriends();
    }
  }, [isAddMemberModalVisible]);


  const fetchGroupDetails = async () => {
    if (!groupId || !userToken) return;

    try {
      setLoading(true);
      setError(null);

      const groupResponse = await fetch(`http://192.168.0.109:8080/api/groups/${groupId}`, {
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!groupResponse.ok) {
        throw new Error(groupResponse.status === 404 ? 'Group not found' : 'Failed to fetch group details');
      }

      const groupData = await groupResponse.json();
      setGroup(groupData);

      if (groupData.memberIds && groupData.memberIds.length > 0) {
        const memberDetailsPromises = groupData.memberIds.map(fetchUserDetails);
        const memberDetailsResults = await Promise.all(memberDetailsPromises);
        
        const validMemberDetails = memberDetailsResults.filter(member => member !== null);
        setMemberDetails(validMemberDetails);
      } else {
        setMemberDetails([]);
      }

    } catch (error) {
      console.error('Error in fetchGroupDetails:', error);
      setError(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId, userToken]);
  
    

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Group not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Group Header */}
      <View style={styles.header}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.createdAt}>
          Created {formatDate(group.createdAt)}
        </Text>
      </View>

      {/* Members Section */}
      <View style={styles.membersContainer}>
        <View style={styles.memberHeader}>
          <Text style={styles.sectionTitle}>
            Members ({memberDetails.length})
          </Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setIsAddMemberModalVisible(true)}
          >
            <Text style={styles.addButtonText}>Add Member</Text>
          </TouchableOpacity>
        </View>
        {memberDetails.map((member, index) => (
          <View key={index} style={styles.memberItem}>
            <View style={styles.memberInfo}>
              <Text style={styles.memberEmail}>{member.email}</Text>
              {member.id === group.creatorId && (
                <View style={styles.creatorBadgeContainer}>
                  <Text style={styles.creatorBadge}>Group Admin</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      {/* Add Member Modal */}
      <Modal
        visible={isAddMemberModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Member</Text>
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
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsAddMemberModalVisible(false);
                  setSelectedFriends([]);
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.addButton]}
                onPress={addMembers}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Add Selected</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  groupName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  createdAt: {
    fontSize: 14,
    color: '#6b7280',
  },
  membersContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    marginTop: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  memberItem: {
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  memberInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  memberEmail: {
    fontSize: 16,
    color: '#1f2937',
    flex: 1,
  },
  creatorBadgeContainer: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  creatorBadge: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  memberHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1f2937',
  },
  friendsList: {
    maxHeight: 400,
  },
  friendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFriend: {
    backgroundColor: '#e0f2fe',
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
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#6b7280',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});

export default GroupDetailsScreen;