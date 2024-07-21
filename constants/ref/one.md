Let's start by organizing your Redux setup with separate files for reducers and actions. We'll also configure Axios with interceptors for handling the token.

### 1. Redux Setup

#### a. Slice (authSlice.ts)
```typescript
import { createSlice } from "@reduxjs/toolkit";
import { IUser } from "@/constants/types";

interface AuthState {
  currentUser: IUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    signInStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signInSuccess: (state, action) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
    signInFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    signUpStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    signUpSuccess: (state, action) => {
      state.currentUser = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;
    },
    signUpFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    forgotPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    resetPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state, action) => {
      state.loading = false;
      state.error = null;
    },
    resetPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  signInFailure,
  signInStart,
  signInSuccess,
  signUpFailure,
  signUpStart,
  signUpSuccess,
  forgotPasswordFailure,
  forgotPasswordStart,
  forgotPasswordSuccess,
  resetPasswordFailure,
  resetPasswordStart,
  resetPasswordSuccess
} = authSlice.actions;

export default authSlice.reducer;
```

#### b. Actions (authActions.ts)
```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  signInStart,
  signInSuccess,
  signInFailure,
  signUpStart,
  signUpSuccess,
  signUpFailure,
} from "./authSlice";

const API_URL = "http://192.168.1.152:5000/api/user"; // Adjust the URL accordingly

export const signIn = createAsyncThunk(
  "auth/signIn",
  async (values: { email: string; password: string }, { dispatch }) => {
    dispatch(signInStart());
    try {
      const response = await axios.post(`${API_URL}/login`, values);
      const data = response.data;
      if (data.success) {
        await AsyncStorage.setItem("userToken", data.data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(data.data.user));
        dispatch(signInSuccess({ user: data.data.user, token: data.data.token }));
      } else {
        dispatch(signInFailure(data.message));
      }
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  }
);

export const signUp = createAsyncThunk(
  "auth/signUp",
  async (values: { email: string; password: string }, { dispatch }) => {
    dispatch(signUpStart());
    try {
      const response = await axios.post(`${API_URL}/register`, values);
      const data = response.data;
      if (data.success) {
        await AsyncStorage.setItem("userToken", data.data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(data.data.user));
        dispatch(signUpSuccess({ user: data.data.user, token: data.data.token }));
      } else {
        dispatch(signUpFailure(data.message));
      }
    } catch (error) {
      dispatch(signUpFailure(error.message));
    }
  }
);
```

### 2. Axios Instance with Interceptors

#### axiosInstance.ts
```typescript
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const instance = axios.create({
  baseURL: "http://192.168.1.152:5000/api", // Adjust the URL accordingly
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;
```

### 3. Updating Submit Functions

#### For Login:
```typescript
import { signIn } from "@/redux/actions/authActions";
import { useDispatch } from "react-redux";

const handleSubmit = async (
  values: SigninValues,
  actions: FormikHelpers<SigninValues>
) => {
  const dispatch = useDispatch();
  dispatch(signIn(values));
};
```

#### For Signup:
```typescript
import { signUp } from "@/redux/actions/authActions";
import { useDispatch } from "react-redux";

const handleSubmit = async (
  values: SignupValues,
  actions: FormikHelpers<SignupValues>
) => {
  const dispatch = useDispatch();
  dispatch(signUp(values));
};
```

### 4. Example of Secure API Request with Axios Instance

#### createPatient.ts
```typescript
import instance from "@/utils/axiosInstance";

const createPatient = async (values: CompleteValues) => {
  try {
    const response = await instance.post("/patient/create", values);
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
};
```

#### In your component:
```typescript
const handleSubmit = async (
  values: CompleteValues,
  actions: FormikHelpers<CompleteValues>
) => {
  try {
    setLoading(true);
    setErrorMessage("");
    const data = await createPatient(values);
    if (data.success) {
      setLoading(false);
      router.push("(tabs)");
    } else {
      setErrorMessage(data.message);
    }
  } catch (error) {
    setErrorMessage(error.message);
    setLoading(false);
  }
};
```

This structure separates concerns, making your code more maintainable and organized. It also ensures that API requests are made securely and consistently using Axios interceptors. You can follow similar patterns for other actions and reducers as needed.


Let's extend the Redux setup by adding slices, actions, and async operations for the patient, doctor, post creation, and timeslot management. Here's how you can structure the Redux Toolkit setup:

### 1. Patient Slice

#### a. Patient Slice (patientSlice.ts)
```typescript
import { createSlice } from "@reduxjs/toolkit";
import { IPatient } from "@/constants/types";

interface PatientState {
  patients: IPatient[];
  loading: boolean;
  error: string | null;
}

const initialState: PatientState = {
  patients: [],
  loading: false,
  error: null,
};

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    createPatientStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPatientSuccess: (state, action) => {
      state.patients.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    createPatientFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createPatientStart,
  createPatientSuccess,
  createPatientFailure,
} = patientSlice.actions;

export default patientSlice.reducer;
```

#### b. Patient Actions (patientActions.ts)
```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import instance from "@/utils/axiosInstance";
import {
  createPatientStart,
  createPatientSuccess,
  createPatientFailure,
} from "./patientSlice";

export const createPatient = createAsyncThunk(
  "patient/createPatient",
  async (values: { name: string; age: number; gender: string }, { dispatch }) => {
    dispatch(createPatientStart());
    try {
      const response = await instance.post("/patient/create", values);
      const data = response.data;
      if (data.success) {
        dispatch(createPatientSuccess(data.data));
      } else {
        dispatch(createPatientFailure(data.message));
      }
    } catch (error) {
      dispatch(createPatientFailure(error.message));
    }
  }
);
```

### 2. Doctor Slice

#### a. Doctor Slice (doctorSlice.ts)
```typescript
import { createSlice } from "@reduxjs/toolkit";
import { IDoctor } from "@/constants/types";

interface DoctorState {
  doctors: IDoctor[];
  loading: boolean;
  error: string | null;
}

const initialState: DoctorState = {
  doctors: [],
  loading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    createDoctorStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createDoctorSuccess: (state, action) => {
      state.doctors.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    createDoctorFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createDoctorStart,
  createDoctorSuccess,
  createDoctorFailure,
} = doctorSlice.actions;

export default doctorSlice.reducer;
```

#### b. Doctor Actions (doctorActions.ts)
```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import instance from "@/utils/axiosInstance";
import {
  createDoctorStart,
  createDoctorSuccess,
  createDoctorFailure,
} from "./doctorSlice";

export const createDoctor = createAsyncThunk(
  "doctor/createDoctor",
  async (values: { name: string; specialization: string }, { dispatch }) => {
    dispatch(createDoctorStart());
    try {
      const response = await instance.post("/doctor/create", values);
      const data = response.data;
      if (data.success) {
        dispatch(createDoctorSuccess(data.data));
      } else {
        dispatch(createDoctorFailure(data.message));
      }
    } catch (error) {
      dispatch(createDoctorFailure(error.message));
    }
  }
);
```

### 3. Post Slice

#### a. Post Slice (postSlice.ts)
```typescript
import { createSlice } from "@reduxjs/toolkit";
import { IPost } from "@/constants/types";

interface PostState {
  posts: IPost[];
  loading: boolean;
  error: string | null;
}

const initialState: PostState = {
  posts: [],
  loading: false,
  error: null,
};

const postSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    createPostStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createPostSuccess: (state, action) => {
      state.posts.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    createPostFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createPostStart,
  createPostSuccess,
  createPostFailure,
} = postSlice.actions;

export default postSlice.reducer;
```

#### b. Post Actions (postActions.ts)
```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import instance from "@/utils/axiosInstance";
import {
  createPostStart,
  createPostSuccess,
  createPostFailure,
} from "./postSlice";

export const createPost = createAsyncThunk(
  "post/createPost",
  async (values: { title: string; description: string; imageUrl: string }, { dispatch }) => {
    dispatch(createPostStart());
    try {
      const response = await instance.post("/post/create", values);
      const data = response.data;
      if (data.success) {
        dispatch(createPostSuccess(data.data));
      } else {
        dispatch(createPostFailure(data.message));
      }
    } catch (error) {
      dispatch(createPostFailure(error.message));
    }
  }
);
```

### 4. Timeslot Slice

#### a. Timeslot Slice (timeslotSlice.ts)
```typescript
import { createSlice } from "@reduxjs/toolkit";
import { ITimeslot } from "@/constants/types";

interface TimeslotState {
  timeslots: ITimeslot[];
  loading: boolean;
  error: string | null;
}

const initialState: TimeslotState = {
  timeslots: [],
  loading: false,
  error: null,
};

const timeslotSlice = createSlice({
  name: "timeslot",
  initialState,
  reducers: {
    createTimeslotStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    createTimeslotSuccess: (state, action) => {
      state.timeslots.push(action.payload);
      state.loading = false;
      state.error = null;
    },
    createTimeslotFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  createTimeslotStart,
  createTimeslotSuccess,
  createTimeslotFailure,
} = timeslotSlice.actions;

export default timeslotSlice.reducer;
```

#### b. Timeslot Actions (timeslotActions.ts)
```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import instance from "@/utils/axiosInstance";
import {
  createTimeslotStart,
  createTimeslotSuccess,
  createTimeslotFailure,
} from "./timeslotSlice";

export const createTimeslot = createAsyncThunk(
  "timeslot/createTimeslot",
  async (values: { doctorId: string; date: string; time: string }, { dispatch }) => {
    dispatch(createTimeslotStart());
    try {
      const response = await instance.post("/timeslot/create", values);
      const data = response.data;
      if (data.success) {
        dispatch(createTimeslotSuccess(data.data));
      } else {
        dispatch(createTimeslotFailure(data.message));
      }
    } catch (error) {
      dispatch(createTimeslotFailure(error.message));
    }
  }
);
```

### 5. Integration with Components

#### a. Patient Creation Example
```typescript
import { createPatient } from "@/redux/actions/patientActions";
import { useDispatch } from "react-redux";

const handleSubmit = async (
  values: CompleteValues,
  actions: FormikHelpers<CompleteValues>
) => {
  const dispatch = useDispatch();
  dispatch(createPatient(values));
};
```

#### b. Doctor Creation Example
```typescript
import { createDoctor } from "@/redux/actions/doctorActions";
import { useDispatch } from "react-redux";

const handleSubmit = async (
  values: DoctorValues,
  actions: FormikHelpers<DoctorValues>
) => {
  const dispatch = useDispatch();
  dispatch(createDoctor(values));
};
```

#### c. Post Creation Example
```typescript
import { createPost } from "@/redux/actions/postActions";
import { useDispatch } from "react-redux";

const handleSubmit = async (
  values: PostValues,
  actions: FormikHelpers<PostValues>
) => {
  const dispatch = useDispatch();
  dispatch(createPost(values));
};
```

#### d. Timeslot Creation Example
```typescript
import { createTimeslot } from "@/redux/actions/timeslotActions";
import { useDispatch } from "react-redux";

const handleSubmit = async (
  values: TimeslotValues,
  actions: FormikHelpers<TimeslotValues>
) => {
  const dispatch = useDispatch();
  dispatch(createTimeslot(values));
};
```

This setup ensures that you have separate files for reducers and actions for each part of your application, adhering to the best practices of Redux Toolkit. Each entity (patient, doctor, post, timeslot) has its own slice and actions to manage

 the state and asynchronous operations effectively.

#### test ref
```ts
const handleSubmit = async (
    values: RegisterDoctorValues,
    actions: FormikHelpers<RegisterDoctorValues>
  ) => {
    console.log("Submitting values:", values);
    try {
      setLoading(true);
      setErrorMessage("");

      // Get the bearer token from async storage
      const token = await AsyncStorage.getItem("userToken");
      console.log("Bearer token:", token);

      // Create an instance of axios with default headers
      const instance = axios.create({
        baseURL: baseUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      // Add request interceptor to handle authorization
      instance.interceptors.request.use(
        async (config) => {
          // Refresh the bearer token if expired or not available
          const newToken = await AsyncStorage.getItem("userToken");
          if (newToken) {
            config.headers.Authorization = `Bearer ${newToken}`;
          }
          return config;
        },
        (error) => {
          return Promise.reject(error);
        }
      );

      // Add response interceptor to handle errors
      instance.interceptors.response.use(
        (response) => {
          return response;
        },
        (error) => {
          if (error.response) {
            // Handle HTTP errors
            console.log("HTTP error response:", error.response.data);
            setErrorMessage(error.response.data.message);
          } else {
            // Handle network errors
            console.log("Network error:", error.message);
            setErrorMessage(error.message);
          }
          return Promise.reject(error);
        }
      );

      // Make the API request
      const res = await instance.post("/doctor/create", values);
      console.log("API response:", res);
      const data = res.data;
      console.log("API response data:", data);

      // Handle success and redirect
      if (data.success === false) {
        setErrorMessage(data.message);
      } else {
        if (res.status === 200) {
          router.push("(tabs)");
        }
      }
    } catch (error) {
      console.log("Error:", error);
      setErrorMessage((error as TypeError).message);
    } finally {
      setLoading(false);
      actions.setSubmitting(false);
    }
  };
```