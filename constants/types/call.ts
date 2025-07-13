import { User } from "./auth";
import { Appointment } from "./appointment";
// import { Call } from '@stream-io/video-react-native-sdk'; // REMOVED: Stream SDK's Call object is no longer stored in Redux state

export type CallStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export interface CallRecord {
  id: string;
  appointmentId: string;
  appointment?: Appointment;
  doctorId: string;
  doctor?: User;
  patientId: string;
  patient?: User;
  status: CallStatus;
  streamCallId: string; // The Stream.io Video call ID (channel ID in Stream's terms)
  createdAt: string;
  updatedAt: string;
}

export interface InitiateCallResponseData {
  call: CallRecord;
  streamToken: string;
  channelId: string; // This is the streamCallId from Stream's perspective
}

export interface InitiateCallApiResponse {
  success: boolean;
  message: string;
  data?: InitiateCallResponseData;
}

export interface CreateCallPayload {
  appointmentId: string;
}

export interface EndCallPayload {
  callId: string; // Backend's CallRecord ID
}

export interface CallApiResponse {
  success: boolean;
  message: string;
  data?: CallRecord | CallRecord[];
}

// Updated CallState to only hold serializable data
export interface CallState {
  currentBackendCallRecord: CallRecord | null; // The backend's record of the active call
  // streamSdkCallInstance: Call | null; // REMOVED: Stream SDK's actual Call object is no longer stored in Redux
  allCalls: CallRecord[];
  callStatus:
    | "idle"
    | "initiating"
    | "joining"
    | "connected"
    | "failed"
    | "ended"
    | "leaving";
  callError: string | null;
  isLoading: boolean; // NEW: Added general isLoading
}
