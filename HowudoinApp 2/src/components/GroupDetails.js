import React, { useState, useEffect } from 'react';

const GroupDetails = ({ groupId, userToken }) => {
    const [group, setGroup] = useState(null);
    const [memberEmails, setMemberEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    // Helper function to format date
    const formatDate = (dateString) => {
      const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString(undefined, options);
    };
  
    useEffect(() => {
      const fetchGroupDetails = async () => {
        try {
          setLoading(true);
  
          // Fetch group info
          const groupResponse = await fetch(`http://192.168.0.109:8080/api/groups/${groupId}`, {
            headers: {
              'Authorization': `Bearer ${userToken}`,
            }
          });
  
          if (!groupResponse.ok) {
            if (groupResponse.status === 404) {
              setError('Group not found.');
            } else {
              setError('Failed to fetch group details.');
            }
            throw new Error('Failed to fetch group details');
          }
  
          const groupData = await groupResponse.json();
          setGroup(groupData);
  
          // Fetch group members 
          const membersResponse = await fetch(`http://192.168.0.109:8080/api/groups/${groupId}/members`, {
            headers: {
              'Authorization': `Bearer ${userToken}`,
            }
          });
  
          if (!membersResponse.ok) {
            setError('Failed to fetch group members.');
            throw new Error('Failed to fetch group members');
          }
          const membersData = await membersResponse.json();
          setMemberEmails(membersData);
  
        } catch (err) {
          console.error('Error fetching group details:', err);
          setError('An error occurred while fetching group details.'); 
        } finally {
          setLoading(false);
        }
      };
  
      if (groupId && userToken) {
        fetchGroupDetails();
      }
    }, [groupId, userToken]);
  
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }
  
    if (error) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      );
    }
  
    if (!group) {
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-600">No group found.</p>
        </div>
      );
    }
  
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
        {/* Group Header */}
        <div className="border-b pb-4">
          <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
          <p className="text-sm text-gray-500">
            Created {formatDate(group.createdAt)}
          </p>
        </div>
  
        {/* Member List */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Members ({memberEmails.length})</h3>
            <div className="space-y-2">
              {memberEmails.map((email, index) => (
                <div 
                  key={index}
                  className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <p className="text-gray-900">{email}</p>
                    {email === group.creatorEmail && (
                      <span className="text-xs font-medium text-blue-600">Group Creator</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
  
        {/* Admin Actions - Only shown to group creator */}
        {group.creatorId === userToken && (
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Actions</h3>
            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                onClick={() => {/* Add delete group handler */}}
              >
                Delete Group
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                onClick={() => {/* Add edit group handler */}}
              >
                Edit Group
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default GroupDetails;