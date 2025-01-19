# howudoin-messaging-app
This repository was created for the Mobile Application Development course at Sabancı University. It includes the implementation of a messaging application named Howudoin, designed to function like popular chat platforms such as WhatsApp.
# Howudoin Project 📱💬

Howudoin is a mobile messaging application inspired by WhatsApp, designed to provide features like user registration, friend management, group creation, and real-time messaging. The project is divided into two phases: **Phase I (Backend)** and **Phase II (Frontend)**. 

---

## 📋 Project Overview

### Phase I: Backend (Deadline: November 21st, 2024)
- Built using **Spring Boot**.
- Handles user authentication, friend management, group messaging, and real-time messaging.
- Utilizes **MongoDB** for flexible document-based data storage.
- Secures endpoints with **JWT-based authentication**.

### Phase II: Frontend (Deadline: December 27th, 2024)
- Developed with **React Native**.
- Provides a simple and intuitive user interface.
- Supports both **iOS** and **Android** platforms.
- Integrates with the backend for real-time communication and data management.

---

## ⚙️ Features

### **Frontend**
- **User Registration & Login**: Allows new users to sign up and existing users to log in. JWT tokens are used for authentication.
- **Friend Management**: Add, accept, or view friends.
- **Group Management**: Create groups, add members, and view group details.
- **Real-Time Messaging**: Chat with friends or in groups with message history retrieval.

### **Backend**
- **User Authentication**: Secure registration and login with JWT tokens.
- **Friend Requests**: Send, accept, and manage friend requests.
- **Messaging**: Real-time messaging for friends and groups.
- **MongoDB Database**:
  - Collections: `Users`, `Groups`, and `Messages`.
  - Stores user data, group information, and chat history.

---

## 🚀 Installation

### Prerequisites
1. **Node.js** and **npm** (for frontend)
2. **Java 17** (for backend)
3. **MongoDB** (for database)
4. **Postman** or similar tool for testing APIs.

### Backend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/howudoin.git
   cd howudoin/backend
2. Update the application.properties file with your MongoDB URI.
3. Build and run the Spring Boot application:
   mvn clean install
   mvn spring-boot:run
### Frontend Setup
1. Navigate to the frontend directory:
   cd howudoin/frontend
2. Install dependencies:
   npm install
3. Start the React Native app:
   npm start
4. Use an emulator or physical device to view the app.
   
### 🛠 API Endpoints

### Public Endpoints
**POST /register:** Register a new user.
**POST /login:** Authenticate and login a user.
### Secure Endpoints (Require JWT)
### Friend Management:
**POST /friends/add:** Send a friend request.
**POST /friends/accept:** Accept a friend request.
**GET /friends:** Retrieve friend list.
### Messaging:
**POST /messages/send:** Send a message to a friend.
**GET /messages:** Retrieve conversation history.
### Group Management:
**POST /groups/create:** Create a new group.
**POST /groups/:groupId/add-member:** Add a member to a group.
**POST /groups/:groupId/send:** Send a message to a group.
**GET /groups/:groupId/messages:** Retrieve group message history.
**GET /groups/:groupId/members:** Retrieve group members.

### 🖥 Screen Mockups and Flow

### UI Screens
Login Screen
Friend List Screen
Group List Screen
Messaging Interface
### Navigation Flow
Login/Registration → Home (Friend List & Group List).
Navigate to Friend Details or Group Details.
Real-time Messaging and History Retrieval.


Happy Coding! 💻✨






