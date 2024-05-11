import React, { useState, useEffect } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  ImageBackground,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
  Modal,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { GiftedChat, Bubble } from 'react-native-gifted-chat';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

// Function to fetch users
const fetchUsers = async () => {
  try {
    const response = await fetch('http://159.223.206.83:8084/users');
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error fetching users: ${error.message}`);
    return []; // Return an empty array on error
  }
};

// Function to handle incoming messages and generate bot responses
const handleBotResponse = (messages, onSend) => {
  const lastMessage = messages[messages.length - 1];
  const { text } = lastMessage;

  if (text.toLowerCase() === 'hello') {
    const response = {
      _id: Math.round(Math.random() * 1000000),
      text: 'How can I help you?',
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'ChatBot',
      },
    };
    onSend([response]);
  } else if (text.toLowerCase() === 'how can i go to the search screen') {
    const response = {
      _id: Math.round(Math.random() * 1000000),
      text: 'Click on the SearchPage Icon in the bottom container.',
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'ChatBot',
      },
    };
    onSend([response]);
  } else if (text.toLowerCase() === 'Thank you') {
    const response = {
      _id: Math.round(Math.random() * 1000000),
      text: 'I here to help you.',
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'ChatBot',
      },
    };
    onSend([response]);
  }
};

// Function to render the user list
const UserList = ({ users, onSelectUser, isLoading }) => {
  if (isLoading) {
    return <ActivityIndicator size="large" color="#00ff00" />;
  }

  if (users.length === 0) {
    return <Text>No users found</Text>;
  }

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onSelectUser(item)}>
          <View style={styles.userListItem}>
            <Image source={{ uri: item.image }} style={styles.userImage} />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{`${item.first} ${item.last}`}</Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  );
};

// Function to render the chat input
const ChatInput = ({ onSend }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim().length > 0) {
      onSend([{ text: text.trim(), createdAt: new Date() }]);
      setText('');
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Type a message"
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleSend}
      />
      <TouchableOpacity onPress={handleSend}>
        <FontAwesome5 name="paper-plane" size={20} color="#000" />
      </TouchableOpacity>
    </View>
  );
};

// Function to render the chat header
const ChatHeader = ({ chatType, userName, groupUsers }) => {
  if (chatType === 'individual') {
    return <Text style={styles.header}>Chatting with {userName}</Text>;
  } else if (chatType === 'group') {
    return (
      <View style={styles.groupHeader}>
        <Text style={styles.header}>Group Chat</Text>
        <TouchableOpacity onPress={() => setShowGroupUsers(true)}>
          <FontAwesome name="caret-down" size={15} color="#000" />
        </TouchableOpacity>
      </View>
    );
  } else {
    return <Text style={styles.header}>ChatBot</Text>;
  }
};

// Function to render the group users modal
const GroupUsersModal = ({ groupUsers, onClose }) => {
  return (
    <Modal transparent animationType="fade" visible={true}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Group Users</Text>
            <FlatList
              data={groupUsers}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <View style={styles.groupUserItem}>
                  <Image source={{ uri: item.image }} style={styles.groupUserImage} />
                  <Text style={styles.groupUserName}>{`${item.first} ${item.last}`}</Text>
                </View>
              )}
            />
            <TouchableOpacity style={styles.modalCloseButton} onPress={onClose}>
              <Text style={styles.modalCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const ChatScreen = () => {
  const [activeScreen, setActiveScreen] = useState('home'); // Track which screen to display
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State for search
  const [filteredUsers, setFilteredUsers] = useState([]); // State for filtered users
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showGroupUsers, setShowGroupUsers] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();
  const email = route.params?.email ?? ''; // Safe handling of `email`
  const last = route.params?.last ?? 'Unknown'; // Safe handling of `last`

  useEffect(() => {
    const fetchUserData = async () => {
      const fetchedUsers = await fetchUsers();
      setUsers(fetchedUsers);
      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const filtered = users.filter(
      (user) =>
        user.first.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleSearch = (text) => {
    setSearchTerm(text);
  };

  const onSend = (newMessages) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    // Check if the received message is from the user or bot
    if (newMessages[0]?.user?._id === 1) {
      // If it's a user message, call the function to handle bot response
      handleBotResponse(newMessages, onSend);
    }
  };

  const openGroupChat = () => {
    setActiveScreen('group');
    setMessages([
      {
        _id: 1,
        text: 'Welcome to the group chat!',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'System',
        },
      },
    ]);
  };

  const openBotChat = () => {
    setActiveScreen('bot');
    setMessages([
      {
        _id: 1,
        text: 'Hello! I am the chatbot.',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'ChatBot',
        },
      },
    ]);
  };

  const openIndividualChat = (user) => {
    setActiveScreen('individual');
    setMessages([
      {
        _id: 1,
        text: 'Hello, this is ' + user.first + ' ' + user.last + '!',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: user.first + ' ' + user.last,
        },
      },
    ]);
  };

  const endIndividualChat = () => {
    setActiveScreen('home');
    setMessages([]);
  };

  const groupUsers = [
    {
      _id: 1,
      first: 'John',
      last: 'Doe',
      email: 'john.doe@example.com',
      image: 'https://api.adorable.io/avatars/50/abott@adorable.png',
    },
    {
      _id: 2,
      first: 'Jane',
      last: 'Doe',
      email: 'jane.doe@example.com',
      image: 'https://api.adorable.io/avatars/50/abott@adorable.png',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {isLoading ? (
        <ActivityIndicator size="large" color="#00ff00" />
      ) : (
        <View style={styles.mainContent}>
          {activeScreen === 'individual' && (
            <View style={styles.chatContainer}>
              <ChatHeader chatType="individual" userName={messages[0]?.user?.name} />
              
              <TextInput
                style={styles.searchInput}
                placeholder="Search for users"
                value={searchTerm}
                onChangeText={handleSearch}
              />

              {searchTerm.length > 0 && ( // Only show users if there's search text
                <UserList users={filteredUsers} onSelectUser={openIndividualChat} isLoading={isLoading} />
              )}

              <GiftedChat
                messages={messages}
                onSend={onSend}
                renderBubble={(props) => (
                  <Bubble
                    {...props}
                    wrapperStyle={{
                      right: {
                        backgroundColor: 'lightgreen', // User's messages
                      },
                      left: {
                        backgroundColor: 'skyblue', // Other messages
                      },
                    }}
                  />
                )}
                user={{ _id: 1, name: 'User' }}
              />
            </View>
          )}

          {activeScreen === 'group' && (
            <View style={styles.chatContainer}>
              <ChatHeader chatType="group" userName={null} groupUsers={groupUsers} />
              <GiftedChat
                messages={messages}
                onSend={onSend}
                renderBubble={(props) => (
                  <Bubble
                    {...props}
                    wrapperStyle={{
                      right: {
                        backgroundColor: 'lightgreen', // User's messages
                      },
                      left: {
                        backgroundColor: 'skyblue', // Other messages
                      },
                    }}
                  />
                )}
                user={{ _id: 1, name: 'User' }}
              />
            </View>
          )}

          {activeScreen === 'bot' && (
            <View style={styles.chatContainer}>
              <ChatHeader chatType="bot" />
              <GiftedChat
                messages={messages}
                onSend={onSend}
                renderBubble={(props) => (
                  <Bubble
                    {...props}
                    wrapperStyle={{
                      right: {
                        backgroundColor: 'lightgreen', // User's messages
                      },
                      left: {
                        backgroundColor: 'skyblue', // Other messages
                      },
                    }}
                  />
                )}
                user={{ _id: 1, name: 'User' }}
              />
            </View>
          )}

          {showGroupUsers && (
            <GroupUsersModal groupUsers={groupUsers} onClose={() => setShowGroupUsers(false)} />
          )}
        </View>
      )}

      <View style={styles.leftBar}>
        <TouchableOpacity style={styles.chatbutton} onPress={openIndividualChat}>
          <FontAwesome5 name="user" size={30} color="#000" />
          <Text style={styles.chatsymboltext}>Individual</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatbutton} onPress={openGroupChat}>
          <FontAwesome5 name="users" size={30} color="#000" />
          <Text style={styles.chatsymboltext}>Group</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.chatbutton} onPress={openBotChat}>
          <FontAwesome5 name="robot" size={30} color="#000" />
          <Text style={styles.chatsymboltext}>Bot</Text>
        </TouchableOpacity>
      </View>

      <SafeAreaView style={styles.bottomContainer}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('HomePage')}>
          <FontAwesome5 name="home" size={25} color="#000" />
          <Text style={styles.symboltext}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('SearchingPage')}>
          <FontAwesome5 name="search" size={25} color="#000" />
          <Text style={styles.symboltext}>SearchPage</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('LocationScreen')}>
          <FontAwesome5 name="map" size={25} color="#000" />
          <Text style={styles.symboltext}>Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('ImageUpload')}>
          <FontAwesome5 name="camera" size={25} color="#000" />
          <Text style={styles.symboltext}>Image</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row-reverse', // Horizontal layout with right bar and content
  },
  mainContent: {
    flex: 1, // Takes the rest of the space
    padding: 10,
    paddingBottom: 70, // Ensure chat content does not overlap with bottom container
  },
  chatContainer: {
    flex: 1, // Ensures the GiftedChat takes the full space
  },
  searchInput: {
    borderWidth: 1,
    borderColor: 'black',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  leftBar: {
    flexDirection: 'column', // Vertical layout for left bar
    alignItems: 'center',
    backgroundColor: 'pink', // Distinguish left bar
    paddingVertical: 20,
  },
  bottomContainer: {
    position: 'absolute',
    backgroundColor: 'skyblue',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '8%',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 7,
    bottom: 0,
  },
  iconButton: {
    padding: 10,
    alignItems: 'center',
  },
  chatbutton: {
    padding: 10,
    alignItems: 'center',
    marginTop: 40,
  },
  symboltext: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 5,
  },
  chatsymboltext: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 15,
    marginTop: 5,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: 'lightgray',
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: 'lightgray',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'lightgray',
  },
  input: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: 'lightgray',
    borderRadius: 8,
    marginRight: 10,
  },
  individualChatButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  button: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 8,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  groupUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  groupUserImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  groupUserName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ChatScreen;
