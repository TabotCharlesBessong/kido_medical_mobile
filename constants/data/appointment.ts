// utils/randomData.js

interface Appointment {
  id: number;
  doctor: string;
  date: string;
  time: string;
}

interface AppointmentsScreenProps {
  // Props if any
}

interface RenderAppointmentItemProps {
  item: Appointment;
}
export const generateRandomAppointments = () => {
  const doctors = [
    "Dr. Smith - Cardiology",
    "Dr. Doe - Dermatology",
    "Dr. Brown - Pediatrics",
    "Dr. White - Neurology",
    "Dr. Green - General Medicine",
  ];

  const dates = [
    "June 12, 2024",
    "June 15, 2024",
    "June 20, 2024",
    "June 25, 2024",
    "June 30, 2024",
  ];

  const times = ["10:00 AM", "02:00 PM", "04:00 PM", "08:00 AM", "11:00 AM"];

  const generateRandomId = () => Math.floor(Math.random() * 1000).toString();

  const generateAppointments = (count:number) => {
    return Array.from({ length: count }, () => ({
      id: generateRandomId(),
      doctor: doctors[Math.floor(Math.random() * doctors.length)],
      date: dates[Math.floor(Math.random() * dates.length)],
      time: times[Math.floor(Math.random() * times.length)],
    }));
  };

  return {
    upcoming: generateAppointments(6),
    past: generateAppointments(4),
  };
};
