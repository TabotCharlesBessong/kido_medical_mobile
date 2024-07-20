import React, { useState, useEffect } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { COLORS } from '@/constants/theme'
import { Conversation, generateRandomConversations } from '@/constants/data/conversation'
import { CustomText } from '@/components'

const ChatScreen: React.FC = () => {
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])

  useEffect(() => {
    setConversations(generateRandomConversations())
  }, [])

  const handleConversationSelect = (conversationId: string) => {
    router.push(`/chat/conversation`)
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <CustomText type='h3'>Chats</CustomText>
        {conversations.map(conversation => (
          <TouchableOpacity
            key={conversation.id}
            style={styles.conversationItem}
            onPress={() => handleConversationSelect(conversation.id)}
          >
            <Image source={{ uri: conversation.profilePic }} style={styles.profilePic} />
            <View style={styles.conversationInfo}>
              <CustomText type='body1'>{conversation.name}</CustomText>
              <CustomText type='body2'>{conversation.lastMessage}</CustomText>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  header: {
    marginVertical: 20,
  },
  conversationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray,
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  conversationInfo: {
    flex: 1,
  },
})

export default ChatScreen
