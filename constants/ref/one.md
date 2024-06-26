Got it. We'll incorporate Redux Toolkit for state management, include all necessary API endpoints, and use Expo Router for navigation.

### Updated Project Structure
1. **Screens**
   - Dashboard
   - Consultation List
   - Consultation Details
   - Create Consultation
   - Patient Profile
   - Messaging
   - Notifications
   - Auth (Login/Signup)
   - Prescription
   - Doctor Time Slot Creation
2. **Redux Toolkit**
   - Slices for authentication, consultations, prescriptions, etc.
   - Redux store setup
3. **API Integration with Axios**
4. **Navigation using Expo Router**

### Redux Toolkit Setup

#### Store Setup
First, let's set up the Redux store.

```tsx
// src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import consultationReducer from './slices/consultationSlice';
import prescriptionReducer from './slices/prescriptionSlice';
import doctorReducer from './slices/doctorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    consultations: consultationReducer,
    prescriptions: prescriptionReducer,
    doctor: doctorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

#### Auth Slice
```tsx
// src/store/slices/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface AuthState {
  user: any;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk('auth/login', async (credentials: { email: string; password: string }) => {
  const response = await axios.post('/api/auth/login', credentials);
  return response.data;
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
```

#### Consultation Slice
```tsx
// src/store/slices/consultationSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface ConsultationState {
  consultations: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ConsultationState = {
  consultations: [],
  loading: false,
  error: null,
};

export const fetchConsultations = createAsyncThunk('consultations/fetchConsultations', async () => {
  const response = await axios.get('/api/consultations');
  return response.data;
});

export const consultationSlice = createSlice({
  name: 'consultations',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConsultations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConsultations.fulfilled, (state, action) => {
        state.loading = false;
        state.consultations = action.payload;
      })
      .addCase(fetchConsultations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch consultations';
      });
  },
});

export default consultationSlice.reducer;
```

#### Prescription Slice
```tsx
// src/store/slices/prescriptionSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface PrescriptionState {
  prescriptions: any[];
  loading: boolean;
  error: string | null;
}

const initialState: PrescriptionState = {
  prescriptions: [],
  loading: false,
  error: null,
};

export const fetchPrescriptions = createAsyncThunk('prescriptions/fetchPrescriptions', async () => {
  const response = await axios.get('/api/prescriptions');
  return response.data;
});

export const prescriptionSlice = createSlice({
  name: 'prescriptions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(fetchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch prescriptions';
      });
  },
});

export default prescriptionSlice.reducer;
```

#### Doctor Slice
```tsx
// src/store/slices/doctorSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

interface DoctorState {
  timeSlots: any[];
  loading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  timeSlots: [],
  loading: false,
  error: null,
};

export const createTimeSlot = createAsyncThunk('doctor/createTimeSlot', async (timeSlot: any) => {
  const response = await axios.post('/api/doctor/time-slots', timeSlot);
  return response.data;
});

export const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createTimeSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTimeSlot.fulfilled, (state, action) => {
        state.loading = false;
        state.timeSlots.push(action.payload);
      })
      .addCase(createTimeSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create time slot';
      });
  },
});

export default doctorSlice.reducer;
```

### API Integration with Axios

Set up an Axios instance for making API requests.

```tsx
// src/api/axiosInstance.ts
import axios from 'axios';
import { store } from '../store';

const axiosInstance = axios.create({
  baseURL: 'https://your-api-base-url.com',
});

axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
```

### Navigation with Expo Router

Install the necessary packages:
```sh
npm install @react-navigation/native @react-navigation/stack
```

Set up the navigation using Expo Router.

```tsx
// App.tsx
import { registerRootComponent } from 'expo';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './src/store';
import Dashboard from './src/screens/Dashboard';
import ConsultationList from './src/screens/ConsultationList';
import ConsultationDetails from './src/screens/ConsultationDetails';
import CreateConsultation from './src/screens/CreateConsultation';
import PatientProfile from './src/screens/PatientProfile';
import Messaging from './src/screens/Messaging';
import Notifications from './src/screens/Notifications';

const Stack = createStackNavigator();

const App = () => (
  <Provider store={store}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="ConsultationList" component={ConsultationList} />
        <Stack.Screen name="ConsultationDetails" component={ConsultationDetails} />
        <Stack.Screen name="CreateConsultation" component={CreateConsultation} />
        <Stack.Screen name="PatientProfile" component={PatientProfile} />
        <Stack.Screen name="Messaging" component={Messaging} />
        <Stack.Screen name="Notifications" component={Notifications} />
      </Stack.Navigator>
    </NavigationContainer>
  </Provider>
);

registerRootComponent(App);
```

### Screens

#### Auth Screens (Login/Signup)

```tsx
// src/screens/Login.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../store/slices/authSlice';
import { RootState } from '../store';

const Login: React.FC = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const handleLogin = () => {
    dispatch(login({ email, password }));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</

Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Login" onPress={handleLogin} disabled={loading} />
      <Button title="Sign Up" onPress={() => navigation.navigate('Signup')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default Login;
```

#### Other Screens
Implement similar structures for other screens, following the pattern above. For instance, `ConsultationList`, `ConsultationDetails`, etc., each having their own components and styles.

### Conclusion
You now have a structured approach using Redux Toolkit for state management, Axios for API requests, and Expo Router for navigation in a React Native app. This setup provides a solid foundation for further development, such as implementing additional screens, handling state changes, and consuming API endpoints. Let me know if you need further assistance with any specific part of the project.