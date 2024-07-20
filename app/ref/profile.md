Let's create the Profile screen component that displays the user's information and includes buttons to navigate to screens where the user can add more information to confirm being a patient or register as a doctor.

### Profile Screen Component (TypeScript)

First, we'll create the `ProfileScreen` component that displays the user's information and includes the navigation buttons.

```tsx
// screens/ProfileScreen.tsx
// screens/ProfileScreen.tsx
import React from 'react'
import { View, StyleSheet, Button, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import CustomText from '@/components/CustomText'
import { IUser } from '@/interfaces/user.interface'
import { COLORS } from '@/constants/theme'
import { useRouter } from 'expo-router'

interface ProfileScreenProps {
  user: IUser
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ user }) => {
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <CustomText type='h3' style={styles.header}>
          Profile
        </CustomText>
        <View style={styles.infoContainer}>
          <CustomText type='body1'>Username: {user.username}</CustomText>
          <CustomText type='body1'>First Name: {user.firstname}</CustomText>
          <CustomText type='body1'>Last Name: {user.lastname}</CustomText>
          <CustomText type='body1'>Email: {user.email}</CustomText>
          <CustomText type='body1'>Role: {user.role}</CustomText>
          <CustomText type='body1'>Email Verified: {user.isEmailVerified}</CustomText>
          <CustomText type='body1'>Account Status: {user.accountStatus}</CustomText>
          <CustomText type='body1'>Created At: {user.createdAt.toDateString()}</CustomText>
          <CustomText type='body1'>Updated At: {user.updatedAt.toDateString()}</CustomText>
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title='Add Patient Information'
            onPress={() => router.push('PatientRegistration')}
          />
          <Button title='Register as Doctor' onPress={() => router.push('DoctorRegistration')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
})

export default ProfileScreen
```

### Navigation Setup

We'll assume that the `ProfileScreen` will be part of a stack navigator and that there are separate screens for patient and doctor registrations (`PatientRegistration` and `DoctorRegistration`).

```tsx
// navigation/AppNavigator.tsx
// navigation/AppNavigator.tsx
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import ProfileScreen from '../screens/ProfileScreen'
import PatientRegistrationScreen from '../screens/PatientRegistrationScreen'
import DoctorRegistrationScreen from '../screens/DoctorRegistrationScreen'

const Stack = createStackNavigator()

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Profile'>
        <Stack.Screen name='Profile' component={ProfileScreen} options={{ title: 'Profile' }} />
        <Stack.Screen
          name='PatientRegistration'
          component={PatientRegistrationScreen}
          options={{ title: 'Patient Registration' }}
        />
        <Stack.Screen
          name='DoctorRegistration'
          component={DoctorRegistrationScreen}
          options={{ title: 'Doctor Registration' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default AppNavigator
```

### Mock Data for Testing

We'll use mock user data to test the `ProfileScreen`. This mock data can be passed as props to the `ProfileScreen` in the test setup.

```tsx
// mockData/mockUser.ts
import { IUser } from '@/interfaces/user.interface'

export const mockUser: IUser = {
  id: '1',
  username: 'johndoe',
  password: 'password123',
  firstname: 'John',
  lastname: 'Doe',
  email: 'john.doe@example.com',
  role: 'user',
  isEmailVerified: 'true',
  accountStatus: 'active',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-06-01'),
}
```

### Patient and Doctor Registration Screens (Placeholder Components)

We'll create placeholder components for `PatientRegistrationScreen` and `DoctorRegistrationScreen`.

```tsx
// screens/PatientRegistrationScreen.tsx
// screens/PatientRegistrationScreen.tsx
import React, { useState } from 'react'
import { View, StyleSheet, Button, ScrollView } from 'react-native'
import AuthInputField from '@/components/AuthInputField'
import AuthCheckbox from '@/components/AuthCheckbox'
import { IPatient } from '@/interfaces/patient.interface'
import { useRouter } from 'expo-router'

const PatientRegistrationScreen: React.FC = () => {
  const [patientData, setPatientData] = useState<IPatient>({
    id: '',
    userId: '',
    gender: '',
    age: 0,
    address1: '',
    address2: '',
    occupation: '',
    phone: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const router = useRouter()

  const handleInputChange = (name: keyof IPatient, value: string | number) => {
    setPatientData(prevData => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    console.log(patientData)
    // Submit data logic
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthInputField
        name='gender'
        label='Gender'
        placeholder='Enter your gender'
        onChangeText={value => handleInputChange('gender', value)}
      />
      <AuthInputField
        name='age'
        label='Age'
        placeholder='Enter your age'
        keyboardType='numeric'
        onChangeText={value => handleInputChange('age', Number(value))}
      />
      <AuthInputField
        name='address1'
        label='City'
        placeholder='Enter your city'
        onChangeText={value => handleInputChange('address1', value)}
      />
      <AuthInputField
        name='address2'
        label='Quarter'
        placeholder='Enter your quarter'
        onChangeText={value => handleInputChange('address2', value)}
      />
      <AuthInputField
        name='occupation'
        label='Occupation'
        placeholder='Enter your occupation'
        onChangeText={value => handleInputChange('occupation', value)}
      />
      <AuthInputField
        name='phone'
        label='Phone'
        placeholder='Enter your phone number'
        keyboardType='phone-pad'
        onChangeText={value => handleInputChange('phone', Number(value))}
      />
      <Button title='Submit' onPress={handleSubmit} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

export default PatientRegistrationScreen
```

```tsx
// screens/DoctorRegistrationScreen.tsx
// screens/DoctorRegistrationScreen.tsx
import React, { useState } from 'react'
import { View, StyleSheet, Button, ScrollView } from 'react-native'
import AuthInputField from '@/components/AuthInputField'
import AuthCheckbox from '@/components/AuthCheckbox'
import AuthSelectField from '@/components/AuthSelectField'
import { IDoctor } from '@/interfaces/doctor.interface'
import { useRouter } from 'expo-router'

const DoctorRegistrationScreen: React.FC = () => {
  const [doctorData, setDoctorData] = useState<IDoctor>({
    id: '',
    userId: '',
    specialization: '',
    verificationStatus: '',
    documents: '',
    experience: 0,
    fee: 0,
    language: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })

  const router = useRouter()

  const handleInputChange = (name: keyof IDoctor, value: string | number | string[]) => {
    setDoctorData(prevData => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = () => {
    console.log(doctorData)
    // Submit data logic
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AuthInputField
        name='specialization'
        label='Specialization'
        placeholder='Enter your specialization'
        onChangeText={value => handleInputChange('specialization', value)}
      />
      <AuthInputField
        name='verificationStatus'
        label='Verification Status'
        placeholder='Enter your verification status'
        onChangeText={value => handleInputChange('verificationStatus', value)}
      />
      <AuthInputField
        name='documents'
        label='Documents'
        placeholder='Enter your documents'
        onChangeText={value => handleInputChange('documents', value)}
      />
      <AuthInputField
        name='experience'
        label='Experience'
        placeholder='Enter your experience'
        keyboardType='numeric'
        onChangeText={value => handleInputChange('experience', Number(value))}
      />
      <AuthInputField
        name='fee'
        label='Fee'
        placeholder='Enter your fee'
        keyboardType='numeric'
        onChangeText={value => handleInputChange('fee', Number(value))}
      />
      <AuthSelectField
        name='language'
        label='Language'
        placeholder='Select languages'
        options={[
          { label: 'English', value: 'English' },
          { label: 'French', value: 'French' },
          { label: 'Spanish', value: 'Spanish' },
          { label: 'German', value: 'German' },
        ]}
        onValueChange={value => handleInputChange('language', value)}
      />
      <Button title='Submit' onPress={handleSubmit} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
})

export default DoctorRegistrationScreen
```

### Summary

1. **ProfileScreen** component displays user information and includes buttons to navigate to additional information screens.
2. **Navigation Setup** with stack navigator including `ProfileScreen`, `PatientRegistrationScreen`, and `DoctorRegistrationScreen`.
3. **Mock Data** for testing the profile screen.
4. **Placeholder Components** for patient and doctor registration screens.

This setup will allow users to view their profile information and navigate to screens where they can add more details to confirm their status as a patient or register as a doctor.
