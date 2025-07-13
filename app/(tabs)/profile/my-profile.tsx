import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/redux/store';
import { CustomText, AppButton } from '@/components';
import { logout, setAuthUser } from '@/redux/slice/authSlice';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { fetchPatientProfile, clearPatientProfileError } from '@/redux/slice/patientProfileSlice';
import { fetchDoctorProfileById, clearDoctorProfileError, setDoctorProfile } from '@/redux/slice/doctorProfileSlice';
import { COLORS } from '@/utils/constants';

const MyProfileScreen = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const dispatch: AppDispatch = useDispatch();

  const authUser = useSelector((state: RootState) => state.auth.user);
  const authIsLoading = useSelector((state: RootState) => state.auth.isLoading); // For general auth loading
  const patientProfile = useSelector((state: RootState) => state.patientProfile.profile);
  const patientIsLoading = useSelector((state: RootState) => state.patientProfile.isLoading);
  const patientError = useSelector((state: RootState) => state.patientProfile.error);
  const doctorProfile = useSelector((state: RootState) => state.doctorProfile.profile);
  const doctorIsLoading = useSelector((state: RootState) => state.doctorProfile.isLoading);
  const doctorError = useSelector((state: RootState) => state.doctorProfile.error);

  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  // Fetch profiles based on role and existence
  useEffect(() => {
    const loadProfiles = async () => {
      if (authUser && authUser.id) {
        // Fetch patient profile if user is a patient or has a patient profile ID
        if (authUser.role === 'PATIENT' && authUser.patientProfileId) {
          await dispatch(fetchPatientProfile(authUser.id)).unwrap(); // Pass user ID as patient ID (assuming correlation)
        } else if (authUser.role === 'DOCTOR' && authUser.doctorProfileId) {
          // Fetch doctor profile if user is a doctor and has a doctor profile ID
          await dispatch(fetchDoctorProfileById(authUser.doctorProfileId)).unwrap();
        }
      }
      setInitialLoadComplete(true);
    };
    if (!initialLoadComplete) {
        loadProfiles();
    }
  }, [authUser, dispatch, initialLoadComplete]);

  // Handle errors from profile fetches
  useEffect(() => {
    if (patientError) {
      Alert.alert(t('common.error'), patientError);
      dispatch(clearPatientProfileError());
    }
    if (doctorError) {
      Alert.alert(t('common.error'), doctorError);
      dispatch(clearDoctorProfileError());
    }
  }, [patientError, doctorError, dispatch, t]);

  const handleLogout = () => {
    Alert.alert(
      t('profile.logoutConfirmTitle'),
      t('profile.logoutConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.logout'), onPress: () => {
          dispatch(logout());
          router.replace('/auth/login'); // Redirect to login
        }},
      ]
    );
  };

  const handleCreatePatientProfile = () => {
    router.push('/profile/create-doctor'); // Adjust path as needed based on your routing
  };

  const handleCreateDoctorProfile = () => {
    router.push('/profile/create-doctor'); // Adjust path as needed
  };

  const handleEditProfile = () => {
    // Navigate to an edit screen, passing current profile data
    if (authUser?.role === 'PATIENT' && patientProfile) {
      router.push({ pathname: '/profile/edit-patient', params: patientProfile });
    } else if (authUser?.role === 'DOCTOR' && doctorProfile) {
      router.push({ pathname: '/profile/edit-doctor', params: doctorProfile });
    } else {
      Alert.alert(t('common.info'), t('profile.noProfileToEdit'));
    }
  };

  if (!authUser || authIsLoading || !initialLoadComplete || patientIsLoading || doctorIsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <CustomText type="body1" >{t('profile.loadingProfile')}</CustomText>
      </View>
    );
  }

  // --- Render based on User Role and Profile Existence ---
  const renderPatientProfile = () => (
    <View style={styles.profileSection}>
      <CustomText type="h3" >{t('profile.patientDetails')}</CustomText>
      <CustomText type="body3">{t('patientProfile.genderLabel')}: {patientProfile?.gender}</CustomText>
      <CustomText type="body3">{t('patientProfile.ageLabel')}: {patientProfile?.age}</CustomText>
      <CustomText type="body3">{t('patientProfile.address1Label')}: {patientProfile?.address1}</CustomText>
      {patientProfile?.address2 && <CustomText type="body3">{t('patientProfile.address2Label')}: {patientProfile?.address2}</CustomText>}
      {patientProfile?.occupation && <CustomText type="body3">{t('patientProfile.occupationLabel')}: {patientProfile?.occupation}</CustomText>}
      <CustomText type="body3">{t('patientProfile.phoneNumberLabel')}: {patientProfile?.phoneNumber}</CustomText>
      {patientProfile?.tribe && <CustomText type="body3">{t('patientProfile.tribeLabel')}: {patientProfile?.tribe}</CustomText>}
      {patientProfile?.religion && <CustomText type="body3">{t('patientProfile.religionLabel')}: {patientProfile?.religion}</CustomText>}
      <AppButton
        title={t('profile.editPatientProfile')}
        onPress={handleEditProfile}
        backgroundColor={COLORS.secondary}
        textColor={COLORS.dark}
        containerStyle={styles.editButton}
      />
    </View>
  );

  const renderDoctorProfile = () => (
    <View style={styles.profileSection}>
      <CustomText type="h3" >{t('profile.doctorDetails')}</CustomText>
      <CustomText type="body3">{t('doctorProfile.specializationLabel')}: {doctorProfile?.specialization}</CustomText>
      <CustomText type="body3">{t('doctorProfile.feeLabel')}: ${doctorProfile?.fee}</CustomText>
      <CustomText type="body3">{t('profile.verificationStatus')}: {doctorProfile?.verificationStatus}</CustomText>
      {doctorProfile?.documents && (
        <TouchableOpacity onPress={() => Alert.alert('View Document', 'Implement document viewer here.')}>
          <CustomText type='body3' >{t('profile.viewDocuments')}</CustomText>
        </TouchableOpacity>
      )}
      <AppButton
        title={t('profile.editDoctorProfile')}
        onPress={handleEditProfile}
        backgroundColor={COLORS.secondary}
        textColor={COLORS.dark}
        containerStyle={styles.editButton}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <CustomText type="h1" >{t('profile.myProfile')}</CustomText>

        <View style={styles.profileSection}>
          <CustomText type="h2" >{t('profile.basicInfo')}</CustomText>
          <CustomText type="body3">{t('profile.name')}: {authUser?.firstname} {authUser?.lastname}</CustomText>
          <CustomText type="body3">{t('profile.email')}: {authUser?.email}</CustomText>
          <CustomText type="body3">{t('profile.role')}: {authUser?.role}</CustomText>
        </View>

        {/* Conditional rendering for Patient profile */}
        {authUser?.role === 'PATIENT' && !patientProfile && !patientIsLoading && (
          <View style={styles.callToAction}>
            <CustomText type="body2" >
              {t('profile.completePatientProfilePrompt')}
            </CustomText>
            <AppButton
              title={t('profile.completePatientProfileButton')}
              onPress={handleCreatePatientProfile}
              backgroundColor={COLORS.primary}
              containerStyle={styles.actionButton}
            />
            <CustomText type="body2" >
              {t('profile.wantToBeDoctorPrompt')}
            </CustomText>
            <AppButton
              title={t('profile.becomeDoctorButton')}
              onPress={handleCreateDoctorProfile}
              backgroundColor={COLORS.accent}
              textColor={COLORS.white}
              containerStyle={styles.actionButton}
            />
          </View>
        )}
        {authUser?.role === 'PATIENT' && patientProfile && renderPatientProfile()}

        {/* Conditional rendering for Doctor profile */}
        {(authUser?.role === 'PENDING_DOCTOR' || (authUser?.role === 'PATIENT' && !patientProfile)) && (
          <View style={styles.callToAction}>
             <CustomText type="body2">
              {t('profile.becomeDoctorPrompt')}
            </CustomText>
            <AppButton
              title={t('profile.becomeDoctorButton')}
              onPress={handleCreateDoctorProfile}
              backgroundColor={COLORS.accent}
              textColor={COLORS.white}
              containerStyle={styles.actionButton}
            />
          </View>
        )}
        {authUser?.role === 'DOCTOR' && doctorProfile && renderDoctorProfile()}
        {authUser?.role === 'DOCTOR' && !doctorProfile && !doctorIsLoading && (
            <View style={styles.callToAction}>
                <CustomText type="body2">
                    {t('profile.doctorProfileMissing')}
                </CustomText>
                <AppButton
                    title={t('profile.createDoctorProfileNow')}
                    onPress={handleCreateDoctorProfile}
                    backgroundColor={COLORS.primary}
                    containerStyle={styles.actionButton}
                />
            </View>
        )}
        {/* If user is PENDING_DOCTOR and has submitted doctor profile, just show pending status */}
        {authUser?.role === 'PENDING_DOCTOR' && doctorProfile && (
            <View style={styles.profileSection}>
                <CustomText type="h3">{t('profile.doctorVerification')}</CustomText>
                <CustomText type="body3">{t('profile.verificationStatus')}: {doctorProfile.verificationStatus}</CustomText>
                <CustomText type="body3">{t('profile.pendingVerificationMessage')}</CustomText>
            </View>
        )}


        <AppButton
          title={t('common.logout')}
          onPress={handleLogout}
          backgroundColor={COLORS.danger}
          containerStyle={styles.logoutButton}
        />
      </ScrollView>
    </View>
  );
};

export default MyProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background || '#F7F7F7',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background || '#F7F7F7',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text || '#333',
  },
  mainHeader: {
    marginBottom: 30,
    textAlign: 'center',
    color: COLORS.primary,
  },
  profileSection: {
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    marginBottom: 10,
    color: COLORS.dark || '#333',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray || '#EEE',
    paddingBottom: 5,
  },
  viewDocLink: {
    color: COLORS.info,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  callToAction: {
    backgroundColor: COLORS.infoLight || '#E0F7FA', // A light background for prompts
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.info || '#00BCD4',
  },
  callToActionText: {
    textAlign: 'center',
    marginBottom: 15,
    color: COLORS.dark || '#333',
  },
  actionButton: {
    width: '80%',
    marginBottom: 10,
  },
  editButton: {
    marginTop: 20,
    width: '80%',
    alignSelf: 'center',
    backgroundColor: COLORS.accent || '#FFC107',
    color: COLORS.dark,
  },
  logoutButton: {
    marginTop: 30,
    marginBottom: 20,
    width: '80%',
    alignSelf: 'center',
  },
  // Re-use from other screens
  pickerContainer: {
    width: '100%',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },
  pickerLabel: {
    paddingLeft: 10,
    paddingTop: 8,
    color: COLORS.dark,
  },
  picker: {
    width: '100%',
    height: 50,
    color: COLORS.text,
  },
  inputField: {
    marginBottom: 15,
    width: '100%',
  },
  errorText: {
    color: COLORS.danger,
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
    fontSize: 12,
  },
});