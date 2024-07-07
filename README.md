# Telemedicine Application

## Overview

This Telemedicine Application is a comprehensive solution designed to facilitate virtual medical consultations between doctors and patients. It includes features for user authentication, patient and doctor management, appointment scheduling, and secure messaging. The application is built using React Native with Expo for the frontend and a robust backend API to manage all functionalities.

## Features

1. **User Authentication**: 
   - Login
   - Signup
   - Password reset
   - Forgot password
   - Logout

2. **Patient Management**: 
   - Patient registration
   - Viewing patient details
   - Updating patient information

3. **Doctor Management**:
   - Doctor registration
   - Viewing doctor profiles
   - Managing consultation timeslots
   - Handling consultations, vital signs, prescriptions, and treatments

4. **Post Management**:
   - Creating posts with title, description, and image
   - Viewing and displaying posts
   - Detailed post view including comments and sharing functionality
   - The purpose of the post is for the doctors to educate the public

5. **Prescription Management**:
   - Displaying all prescriptions given by a doctor
   - Detailed view of each prescription including medication details

6. **Prescription Management**:
   - Displaying all consultation from the doctor
   - Detailed view of each consultation including medication details

## Installation

### Prerequisites

- Node.js
- Expo CLI
- A code editor (e.g., Visual Studio Code)

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/TabotCharlesBessong/kido_medical_mobile.git
   cd kido_medical_mobile
   ```

2. **Install dependencies**:
   ```bash
   yarn install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory and add your environment variables. Example:
   ```
   BASE_URL=http://localhost:5000/api
   ```

4. **Run the application**:
   ```bash
   expo start
   ```

### Backend Setup

Ensure that you have the backend API running. Refer to the backend repository for setup instructions.

## Running the Application

1. **Start the Expo development server**:
   ```bash
   npx expo start
   ```

2. **Run on Android/iOS emulator or physical device**:
   - Follow the instructions displayed in the terminal to run the app on your preferred platform.
   - For physical devices, use the Expo Go app available on the Play Store/App Store to scan the QR code.


## Contributing

We welcome contributions from the community! If you would like to contribute, please fork the repository and submit a pull request. Ensure your code follows the project's coding standards and includes relevant tests.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more information.

## Contact

For any questions or feedback, please contact us at [ebezebeatrice@gmail.com].

---

This README provides a comprehensive guide to understanding, setting up, and running the Telemedicine Application. Feel free to modify and expand it based on your project's specific needs.