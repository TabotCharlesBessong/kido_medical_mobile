export interface StreamUserCredentials {
  userId: string;
  token: string; // The Stream-signed JWT token
  userName?: string;
  userImage?: string;
}

export interface StreamState {
  // videoClient: any | null; // REMOVED: StreamVideoClient instance is no longer stored in Redux state
  streamUser: StreamUserCredentials | null; // Credentials received from backend
  isConnected: boolean; // Indicates if Stream Video client is connected and user is authenticated with Stream
  isLoading: boolean; // For initial connection process
  error: string | null;
}
