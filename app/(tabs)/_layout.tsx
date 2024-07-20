import Colors from '@/constants/Colors'
import { AntDesign, Entypo, FontAwesome, FontAwesome5 } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { useColorScheme } from 'react-native'

const TabBarIcons = (props: {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
}) => {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />
}

const TabLayout = () => {
  const colorScheme = useColorScheme()
  const { t } = useTranslation()

  return (
    <Tabs>
      <Tabs.Screen
        name='index'
        options={{
          title: t('layout.one'), // "Home"
          tabBarIcon: ({ color }) => <TabBarIcons name='home' color={color} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='chat'
        options={{
          title: t('layout.tow'), // "Chats"
          tabBarIcon: ({ color }) => <Entypo name='message' color={color} size={28} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='appointment'
        options={{
          title: t('layout.three'), // "Appointments"
          tabBarIcon: ({ color }) => <FontAwesome5 name='book-medical' size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name='setting'
        options={{
          title: t('layout.four'), // "Setting"
          tabBarIcon: ({ color }) => <AntDesign name='setting' color={color} size={28} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: t('layout.five'), // "Profile"
          tabBarIcon: ({ color }) => <AntDesign name='user' color={color} size={28} />,
        }}
      />
    </Tabs>
  )
}

export default TabLayout
