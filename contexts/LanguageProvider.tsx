import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'tl' | 'en'; // tl = Tagalog/Taglish, en = English

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LANGUAGE_KEY = '@app_language';

// Translations - Tagalog/Taglish as primary, English as secondary
const translations: Record<Language, Record<string, string>> = {
  tl: {
    // Login Screen
    'login.email': 'Email',
    'login.password': 'Password',
    'login.signIn': 'Mag-sign In',
    'login.createAccount': 'Gumawa ng Account',
    'login.biometric': 'Mag-login gamit ang Biometric',
    'login.or': 'O',
    'login.continueGoogle': 'Magpatuloy gamit ang Google',
    'login.continueFacebook': 'Magpatuloy gamit ang Facebook',
    'login.continueGuest': 'Magpatuloy bilang Guest',
    'login.error': 'Error',
    'login.fillAllFields': 'Pakipunan ang lahat ng fields',
    'login.invalidEmail': 'Pakienter ang valid na email address',
    'login.failed': 'Hindi Makapag-login',
    'login.noCredentials': 'Walang nakatagong credentials. Mag-login muna ng normal.',
    'login.invalidCredentials': 'Hindi valid ang nakatagong credentials. Mag-login ng normal.',
    'login.biometricFailed': 'Hindi nagtagumpay ang biometric authentication.',
    'login.biometricUnavailable': 'Hindi available ang biometric authentication.',
    'login.googleFailed': 'Hindi Makapag-login sa Google',
    'login.facebookFailed': 'Hindi Makapag-login sa Facebook',
    'login.guestError': 'Hindi makapagpatuloy bilang guest. Pakisubukan ulit.',
    
    // Guest Agreement Modal
    'guest.title': 'Kasunduan para sa Guest Access',
    'guest.message': 'Bilang guest, ang iyong mga report ay pansamantala lamang at mawawala kapag nag-logout ka. Pakisang-ayunan ang aming mga patakaran para makapagpatuloy.',
    'guest.agreementRequired': 'Kailangan ng Kasunduan',
    'guest.agreementMessage': 'Pakisang-ayunan ang Terms of Service at Privacy Policy para makapagpatuloy bilang guest.',
    'guest.agreeTerms': 'Sumasang-ayon ako sa',
    'guest.termsOfService': 'Terms of Service',
    'guest.and': 'at',
    'guest.privacyPolicy': 'Privacy Policy',
    'guest.cancel': 'Kanselahin',
    'guest.continue': 'Magpatuloy',
    
    // Onboarding
    'onboarding.skip': 'Laktawan',
    'onboarding.next': 'Susunod',
    'onboarding.getStarted': 'Magsimula Na',
    'onboarding.slide1.title': 'Mag-report ng Insidente',
    'onboarding.slide1.description': 'Direktang i-report ang mga krimen, sunog, at sakuna. Gamit ang GPS, matutukoy gad ng mga awtoridad ang iyong exact location',
    'onboarding.slide2.title': 'Kumuha ng Ebidensya',
    'onboarding.slide2.description': 'Kumuha ng litrato o video bilang ebidensya. Ang iyong media ay ligtas na ina-upload at naka-attach sa iyong report.',
    'onboarding.slide3.title': 'I-track ang Status',
    'onboarding.slide3.description': 'Makakuha ng updates sa iyong mga report. Malaman kung kailan may naka-assign na opisyal at tumutugon sa iyong insidente.',
    'onboarding.slide4.title': 'Manatiling Ligtas',
    'onboarding.slide4.description': 'Tumulong na panatilihing ligtas ang Camarines Norte. Ang iyong mga report ay tumutulong sa mga awtoridad na mas mabilis na tumugon sa mga emergency.',
    
    // Language
    'language.select': 'Pumili ng Wika',
    'language.tagalog': 'Tagalog',
    'language.english': 'English',
    'language.title': 'Wika ng App',
    'language.description': 'Piliin ang wika ng app',

    // Common
    'common.back': '← Bumalik',
    'common.save': 'I-save',
    'common.cancel': 'Kanselahin',
    'common.submit': 'Isumite',
    'common.continue': 'Magpatuloy',
    'common.error': 'Error',
    'common.success': 'Tagumpay',
    'common.loading': 'Naglo-load...',
    'common.required': 'Kinakailangan',
    'common.logout': 'Mag-logout',

    // Welcome Screen
    'welcome.title': 'Mabuhay!',
    'welcome.subtitle': 'Mag-report ng insidente sa Camarines Norte',
    'welcome.signIn': 'Mag-sign In',
    'welcome.createAccount': 'Gumawa ng Account',
    'welcome.continueGuest': 'Magpatuloy bilang Guest',

    // Sign Up Screen
    'signup.title': 'Gumawa ng Account',
    'signup.fullName': 'Buong Pangalan',
    'signup.dateOfBirth': 'Petsa ng Kapanganakan',
    'signup.email': 'Email Address',
    'signup.phone': 'Phone Number',
    'signup.phonePlaceholder': '09XX XXX XXXX',
    'signup.password': 'Password',
    'signup.confirmPassword': 'Kumpirmahin ang Password',
    'signup.agreeTerms': 'Sumasang-ayon ako sa',
    'signup.alreadyHaveAccount': 'May account na? Mag-sign in',
    'signup.error.fillAllFields': 'Pakipunan ang lahat ng fields',
    'signup.error.agreeTerms': 'Pakisang-ayunan ang Terms of Service at Privacy Policy para makapagpatuloy.',
    'signup.error.minAge': 'Dapat ay 13 taong gulang ka man lang para makapag-register',
    'signup.error.invalidAge': 'Pakienter ang valid na petsa ng kapanganakan',
    'signup.error.nameTooShort': 'Ang pangalan ay dapat may 2 characters man lang',
    'signup.error.invalidEmail': 'Pakienter ang valid na email address',
    'signup.error.invalidPhone': 'Pakienter ang valid na Philippine mobile number (09XX-XXX-XXXX)',
    'signup.error.passwordTooShort': 'Ang password ay dapat may 6 characters man lang',
    'signup.error.passwordMismatch': 'Hindi magkatugma ang mga password',
    'signup.verificationRequired': 'Kailangan ng Verification',
    'signup.verificationMessage': 'Isang 6-digit code ang ipinadala sa iyong email. Pakiverify ang iyong account para makapagpatuloy.',

    // Home Screen
    'home.greeting': 'Kumusta',
    'home.guestUser': 'Guest User',
    'home.reportIncident': 'Mag-report ng Insidente',
    'home.selectAgency': 'Pumili ng agency para mag-report:',
    'home.crimeReport': 'Krimen',
    'home.crimeDesc': 'I-report sa PNP',
    'home.fireReport': 'Sunog',
    'home.fireDesc': 'I-report sa BFP',
    'home.disasterReport': 'Sakuna',
    'home.disasterDesc': 'I-report sa PDRRMO',
    'home.recentReports': 'Mga Kamakailang Report',
    'home.viewAll': 'Tingnan Lahat',
    'home.noReports': 'Wala pang mga report',
    'home.stats': 'Mga Estadistika',
    'home.totalReports': 'Kabuuang Reports',
    'home.pending': 'Pending',
    'home.resolved': 'Nalutas',

    // Reports Screen
    'reports.title': 'Aking mga Report',
    'reports.noReports': 'Wala ka pang mga report',
    'reports.noReportsDesc': 'Ang iyong mga naisumiteng report ay lalabas dito',
    'reports.status.pending': 'Pending',
    'reports.status.acknowledged': 'Natanggap',
    'reports.status.dispatched': 'Naipadala',
    'reports.status.responding': 'Tumutugon',
    'reports.status.resolved': 'Nalutas',
    'reports.status.closed': 'Sarado',
    'reports.filter.all': 'Lahat',
    'reports.filter.pending': 'Pending',
    'reports.filter.active': 'Aktibo',
    'reports.filter.resolved': 'Nalutas',

    // Profile Screen
    'profile.title': 'Profile',
    'profile.guestAccount': '⚠️ Guest Account',
    'profile.guestWarning': 'Gumagamit ka ng pansamantalang guest account. Mawawala ang iyong mga report kapag nag-logout o nagsara ng app. Gumawa ng account para ma-save ang iyong mga report at makatanggap ng updates.',
    'profile.createAccount': 'Gumawa ng Account',
    'profile.personalDetails': 'Personal na Detalye',
    'profile.displayName': 'Display Name',
    'profile.enterName': 'Ilagay ang iyong pangalan',
    'profile.email': 'Email',
    'profile.emailCannotChange': 'Hindi mababago ang email',
    'profile.phoneNumber': 'Phone Number',
    'profile.dateOfBirth': 'Petsa ng Kapanganakan',
    'profile.selectDOB': 'Pumili ng Petsa ng Kapanganakan',
    'profile.savePersonalDetails': 'I-save ang Personal na Detalye',
    'profile.preferences': 'Mga Kagustuhan',
    'profile.biometricLogin': 'Biometric Login',
    'profile.biometricDesc': 'I-save ang credentials para sa biometric login. Mag-login ng normal muna pagkatapos i-enable.',
    'profile.notifications': 'Mga Notification',
    'profile.notificationsDesc': 'Makatanggap ng updates tungkol sa iyong mga report',
    'profile.showStats': 'Ipakita ang Estadistika',
    'profile.showStatsDesc': 'Ipakita ang public stats sa home screen',
    'profile.savePreferences': 'I-save ang mga Kagustuhan',
    'profile.signOut': 'Mag-sign Out',
    'profile.signOutConfirm': 'Sigurado ka bang gusto mong mag-logout?',
    'profile.signOutGuestTitle': '⚠️ Logout bilang Guest',
    'profile.signOutGuestMessage': 'Mawawala ang iyong mga report kung mag-logout ka. Hindi na mababawi ang guest accounts. Sigurado ka ba?',
    'profile.appInfo': 'iReport Camarines Norte',
    'profile.version': 'Version',
    'profile.success': 'Tagumpay',
    'profile.personalDetailsSaved': 'Na-update na ang personal na detalye',
    'profile.preferencesSaved': 'Na-update na ang mga kagustuhan',
    'profile.error': 'Error',
    'profile.saveFailed': 'Hindi na-save',
    'profile.invalidDate': 'Hindi Valid na Petsa',
    'profile.invalidDateMessage': 'Pakienter ang valid na petsa ng kapanganakan',
    'profile.ageRestriction': 'Limitasyon sa Edad',
    'profile.ageRestrictionMessage': 'Dapat ay 13 taong gulang ka man lang para gamitin ang app na ito',
    'profile.selectYear': '📅 Pumili ng Taon',
    'profile.selectMonth': '📆 Pumili ng Buwan',
    'profile.selectDay': '📍 Pumili ng Araw',

    // Incident Form
    'form.crimeReport': 'Report ng Krimen',
    'form.fireReport': 'Report ng Sunog',
    'form.disasterReport': 'Report ng Sakuna',
    'form.incidentReport': 'Report ng Insidente',
    'form.incidentDetails': 'Mga Detalye ng Insidente',
    'form.reportInfo': '📋 Impormasyon ng Report',
    'form.yourInfo': '👤 Iyong Impormasyon',
    'form.fullName': 'Buong Pangalan *',
    'form.enterFullName': 'Ilagay ang iyong buong pangalan',
    'form.age': 'Edad *',
    'form.enterAge': 'Ilagay ang iyong edad',
    'form.contactNumber': 'Contact Number *',
    'form.contactHelper': 'Kinakailangan para makontak ka ng mga responder tungkol sa insidenteng ito',
    'form.yourLocation': '📍 Iyong Kasalukuyang Lokasyon',
    'form.incidentLocation': '🚨 Lokasyon ng Insidente',
    'form.description': 'Paglalarawan ng Insidente *',
    'form.descriptionPlaceholder': 'Ilarawan kung ano ang nangyari, kailan nangyari, at iba pang mahahalagang detalye...',
    'form.quickSelect': 'Mabilis na Pagpili:',
    'form.orTypeBelow': 'O mag-type sa ibaba:',
    'form.submitReport': 'Isumite ang Report',
    'form.submitting': 'Isinusumite...',
    'form.evidence': 'Ebidensya',
    'form.photos': 'litrato/video',
    'form.error.nameRequired': 'Pakienter ang iyong pangalan.',
    'form.error.nameTooShort': 'Ang pangalan ay dapat may 2 characters man lang.',
    'form.error.nameTooLong': 'Ang pangalan ay dapat mas maikli sa 100 characters.',
    'form.error.ageRequired': 'Pakienter ang valid na edad.',
    'form.error.ageInvalid': 'Ang edad ay dapat nasa pagitan ng 13 at 120.',
    'form.error.phoneRequired': 'Pakienter ang iyong contact number para makontak ka ng mga responder.',
    'form.error.phoneInvalid': 'Pakienter ang valid na Philippine mobile number (hal., 09171234567).',
    'form.error.descriptionRequired': 'Pakimagbigay ng paglalarawan ng insidente.',
    'form.error.descriptionTooShort': 'Pakimagbigay ng hindi bababa sa 10 characters na naglalarawan ng insidente.',
    'form.error.descriptionTooLong': 'Ang paglalarawan ay dapat mas maikli sa 5000 characters.',
    'form.crime.theft': 'Nakawan/Robbery na nangyayari',
    'form.crime.suspicious': 'Kahina-hinalang tao/aktibidad',
    'form.crime.assault': 'Pisikal na pag-atake/away',
    'form.crime.vandalism': 'Vandalism/pinsala sa property',
    'form.crime.drugs': 'Aktibidad na may kinalaman sa droga',
    'form.crime.domestic': 'Gulo sa tahanan',
    'form.fire.building': 'Sunog sa gusali/bahay',
    'form.fire.vehicle': 'Sunog sa sasakyan',
    'form.fire.electrical': 'Sunog mula sa kuryente',
    'form.fire.grass': 'Sunog sa damuhan/kagubatan',
    'form.fire.smoke': 'Usok/amoy ng nasusunog',
    'form.fire.gas': 'Gas leak',
    'form.disaster.flood': 'Pagbaha sa lugar',
    'form.disaster.landslide': 'Landslide/mudslide',
    'form.disaster.tree': 'Nabuwal na puno na humaharang sa daan',
    'form.disaster.storm': 'Pinsala sa istruktura mula sa bagyo',
    'form.disaster.powerlines': 'Nahulog na linya ng kuryente',
    'form.disaster.earthquake': 'Pinsala mula sa lindol',

    // Confirm Report
    'confirm.title': 'Kumpirmahin ang Report',
    'confirm.reviewDetails': 'Suriin ang mga detalye ng iyong report bago isumite',
    'confirm.reportType': 'Uri ng Report',
    'confirm.reporter': 'Nag-uulat',
    'confirm.location': 'Lokasyon',
    'confirm.description': 'Paglalarawan',
    'confirm.evidence': 'Ebidensya',
    'confirm.items': 'mga item',
    'confirm.submit': 'Isumite ang Report',
    'confirm.submitting': 'Isinusumite...',

    // Report Success
    'success.title': 'Naisumite na ang Report!',
    'success.message': 'Ang iyong report ay naisumite na sa mga awtoridad.',
    'success.trackingId': 'Tracking ID',
    'success.whatNext': 'Ano ang susunod?',
    'success.step1': 'Susuriin ng mga awtoridad ang iyong report',
    'success.step2': 'Makakatanggap ka ng notification kapag may update',
    'success.step3': 'Maaari mong i-track ang status sa "Aking mga Report"',
    'success.goHome': 'Bumalik sa Home',
    'success.viewReports': 'Tingnan ang Aking mga Report',

    // Tabs
    'tabs.home': 'Home',
    'tabs.reports': 'Aking mga Report',
    'tabs.profile': 'Profile',
  },
  en: {
    // Login Screen
    'login.email': 'Email',
    'login.password': 'Password',
    'login.signIn': 'Sign In',
    'login.createAccount': 'Create Account',
    'login.biometric': 'Login with Biometric',
    'login.or': 'OR',
    'login.continueGoogle': 'Continue with Google',
    'login.continueFacebook': 'Continue with Facebook',
    'login.continueGuest': 'Continue as Guest',
    'login.error': 'Error',
    'login.fillAllFields': 'Please fill in all fields',
    'login.invalidEmail': 'Please enter a valid email address',
    'login.failed': 'Login Failed',
    'login.noCredentials': 'No saved credentials found. Please login normally first.',
    'login.invalidCredentials': 'Saved credentials are invalid. Please login normally.',
    'login.biometricFailed': 'Biometric authentication was not successful.',
    'login.biometricUnavailable': 'Biometric authentication is not available.',
    'login.googleFailed': 'Google Login Failed',
    'login.facebookFailed': 'Facebook Login Failed',
    'login.guestError': 'Failed to continue as guest. Please try again.',
    
    // Guest Agreement Modal
    'guest.title': 'Guest Access Agreement',
    'guest.message': 'As a guest, your reports will be temporary and lost if you logout. Please agree to our policies to continue.',
    'guest.agreementRequired': 'Agreement Required',
    'guest.agreementMessage': 'Please agree to the Terms of Service and Privacy Policy to continue as guest.',
    'guest.agreeTerms': 'I agree to the',
    'guest.termsOfService': 'Terms of Service',
    'guest.and': 'and',
    'guest.privacyPolicy': 'Privacy Policy',
    'guest.cancel': 'Cancel',
    'guest.continue': 'Continue',
    
    // Onboarding
    'onboarding.skip': 'Skip',
    'onboarding.next': 'Next',
    'onboarding.getStarted': 'Get Started',
    'onboarding.slide1.title': 'Report Incidents',
    'onboarding.slide1.description': 'Quickly report crimes, fires, and disasters to the right authorities with accurate GPS location tagging.',
    'onboarding.slide2.title': 'Capture Evidence',
    'onboarding.slide2.description': 'Take photos or videos as evidence. Your media is securely uploaded and attached to your report.',
    'onboarding.slide3.title': 'Track Status',
    'onboarding.slide3.description': 'Get updates on your reports. Know when officers are assigned and responding to your incident.',
    'onboarding.slide4.title': 'Stay Safe',
    'onboarding.slide4.description': 'Help keep Camarines Norte safe. Your reports help authorities respond faster to emergencies.',
    
    // Language
    'language.select': 'Select Language',
    'language.tagalog': 'Tagalog',
    'language.english': 'English',
    'language.title': 'App Language',
    'language.description': 'Choose the app language',

    // Common
    'common.back': '← Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.submit': 'Submit',
    'common.continue': 'Continue',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.loading': 'Loading...',
    'common.required': 'Required',
    'common.logout': 'Logout',

    // Welcome Screen
    'welcome.title': 'Welcome!',
    'welcome.subtitle': 'Report incidents in Camarines Norte',
    'welcome.signIn': 'Sign In',
    'welcome.createAccount': 'Create Account',
    'welcome.continueGuest': 'Continue as Guest',

    // Sign Up Screen
    'signup.title': 'Create Account',
    'signup.fullName': 'Full Name',
    'signup.dateOfBirth': 'Date of Birth',
    'signup.email': 'Email Address',
    'signup.phone': 'Phone Number',
    'signup.phonePlaceholder': '09XX XXX XXXX',
    'signup.password': 'Password',
    'signup.confirmPassword': 'Confirm Password',
    'signup.agreeTerms': 'I agree to the',
    'signup.alreadyHaveAccount': 'Already have an account? Sign in',
    'signup.error.fillAllFields': 'Please fill in all fields',
    'signup.error.agreeTerms': 'Please agree to the Terms of Service and Privacy Policy to continue.',
    'signup.error.minAge': 'You must be at least 13 years old to register',
    'signup.error.invalidAge': 'Please enter a valid date of birth',
    'signup.error.nameTooShort': 'Name must be at least 2 characters',
    'signup.error.invalidEmail': 'Please enter a valid email address',
    'signup.error.invalidPhone': 'Please enter a valid Philippine mobile number (09XX-XXX-XXXX)',
    'signup.error.passwordTooShort': 'Password must be at least 6 characters',
    'signup.error.passwordMismatch': 'Passwords do not match',
    'signup.verificationRequired': 'Verification Required',
    'signup.verificationMessage': 'A 6-digit code has been sent to your email. Please verify your account to continue.',

    // Home Screen
    'home.greeting': 'Hello',
    'home.guestUser': 'Guest User',
    'home.reportIncident': 'Report an Incident',
    'home.selectAgency': 'Select an agency to report to:',
    'home.crimeReport': 'Crime',
    'home.crimeDesc': 'Report to PNP',
    'home.fireReport': 'Fire',
    'home.fireDesc': 'Report to BFP',
    'home.disasterReport': 'Disaster',
    'home.disasterDesc': 'Report to PDRRMO',
    'home.recentReports': 'Recent Reports',
    'home.viewAll': 'View All',
    'home.noReports': 'No reports yet',
    'home.stats': 'Statistics',
    'home.totalReports': 'Total Reports',
    'home.pending': 'Pending',
    'home.resolved': 'Resolved',

    // Reports Screen
    'reports.title': 'My Reports',
    'reports.noReports': 'No reports yet',
    'reports.noReportsDesc': 'Your submitted reports will appear here',
    'reports.status.pending': 'Pending',
    'reports.status.acknowledged': 'Acknowledged',
    'reports.status.dispatched': 'Dispatched',
    'reports.status.responding': 'Responding',
    'reports.status.resolved': 'Resolved',
    'reports.status.closed': 'Closed',
    'reports.filter.all': 'All',
    'reports.filter.pending': 'Pending',
    'reports.filter.active': 'Active',
    'reports.filter.resolved': 'Resolved',

    // Profile Screen
    'profile.title': 'Profile',
    'profile.guestAccount': '⚠️ Guest Account',
    'profile.guestWarning': 'You\'re using a temporary guest account. Your reports will be lost if you logout or close the app. Create an account to save your reports permanently and receive updates.',
    'profile.createAccount': 'Create Account',
    'profile.personalDetails': 'Personal Details',
    'profile.displayName': 'Display Name',
    'profile.enterName': 'Enter your name',
    'profile.email': 'Email',
    'profile.emailCannotChange': 'Email cannot be changed',
    'profile.phoneNumber': 'Phone Number',
    'profile.dateOfBirth': 'Date of Birth',
    'profile.selectDOB': 'Select Date of Birth',
    'profile.savePersonalDetails': 'Save Personal Details',
    'profile.preferences': 'Preferences',
    'profile.biometricLogin': 'Biometric Login',
    'profile.biometricDesc': 'Save credentials for biometric login. Login normally once after enabling.',
    'profile.notifications': 'Notifications',
    'profile.notificationsDesc': 'Receive updates about your reports',
    'profile.showStats': 'Show Statistics',
    'profile.showStatsDesc': 'Display public stats on home screen',
    'profile.savePreferences': 'Save Preferences',
    'profile.signOut': 'Sign Out',
    'profile.signOutConfirm': 'Are you sure you want to logout?',
    'profile.signOutGuestTitle': '⚠️ Logout as Guest',
    'profile.signOutGuestMessage': 'Your reports will be permanently lost if you logout. Guest accounts cannot be recovered. Are you sure?',
    'profile.appInfo': 'iReport Camarines Norte',
    'profile.version': 'Version',
    'profile.success': 'Success',
    'profile.personalDetailsSaved': 'Personal details updated successfully',
    'profile.preferencesSaved': 'Preferences updated successfully',
    'profile.error': 'Error',
    'profile.saveFailed': 'Failed to save',
    'profile.invalidDate': 'Invalid Date',
    'profile.invalidDateMessage': 'Please enter a valid date of birth',
    'profile.ageRestriction': 'Age Restriction',
    'profile.ageRestrictionMessage': 'You must be at least 13 years old to use this app',
    'profile.selectYear': '📅 Select Year',
    'profile.selectMonth': '📆 Select Month',
    'profile.selectDay': '📍 Select Day',

    // Incident Form
    'form.crimeReport': 'Crime Report',
    'form.fireReport': 'Fire Report',
    'form.disasterReport': 'Disaster Report',
    'form.incidentReport': 'Incident Report',
    'form.incidentDetails': 'Incident Details',
    'form.reportInfo': '📋 Report Information',
    'form.yourInfo': '👤 Your Information',
    'form.fullName': 'Full Name *',
    'form.enterFullName': 'Enter your full name',
    'form.age': 'Age *',
    'form.enterAge': 'Enter your age',
    'form.contactNumber': 'Contact Number *',
    'form.contactHelper': 'Required so responders can contact you about this incident',
    'form.yourLocation': '📍 Your Current Location',
    'form.incidentLocation': '🚨 Incident Location',
    'form.description': 'Incident Description *',
    'form.descriptionPlaceholder': 'Describe what happened, when it happened, and any other relevant details...',
    'form.quickSelect': 'Quick Select:',
    'form.orTypeBelow': 'Or type your own below:',
    'form.submitReport': 'Submit Report',
    'form.submitting': 'Submitting...',
    'form.evidence': 'Evidence',
    'form.photos': 'photo(s)/video(s)',
    'form.error.nameRequired': 'Please enter your name.',
    'form.error.nameTooShort': 'Name must be at least 2 characters.',
    'form.error.nameTooLong': 'Name must be less than 100 characters.',
    'form.error.ageRequired': 'Please enter a valid age.',
    'form.error.ageInvalid': 'Age must be between 13 and 120.',
    'form.error.phoneRequired': 'Please enter your contact number so responders can reach you.',
    'form.error.phoneInvalid': 'Please enter a valid Philippine mobile number (e.g., 09171234567).',
    'form.error.descriptionRequired': 'Please provide a description of the incident.',
    'form.error.descriptionTooShort': 'Please provide at least 10 characters describing the incident.',
    'form.error.descriptionTooLong': 'Description must be less than 5000 characters.',
    'form.crime.theft': 'Theft/Robbery in progress',
    'form.crime.suspicious': 'Suspicious person/activity',
    'form.crime.assault': 'Physical assault/fight',
    'form.crime.vandalism': 'Vandalism/property damage',
    'form.crime.drugs': 'Drug-related activity',
    'form.crime.domestic': 'Domestic disturbance',
    'form.fire.building': 'Building/house fire',
    'form.fire.vehicle': 'Vehicle fire',
    'form.fire.electrical': 'Electrical fire',
    'form.fire.grass': 'Grass/forest fire',
    'form.fire.smoke': 'Smoke/burning smell',
    'form.fire.gas': 'Gas leak',
    'form.disaster.flood': 'Flooding in area',
    'form.disaster.landslide': 'Landslide/mudslide',
    'form.disaster.tree': 'Fallen tree blocking road',
    'form.disaster.storm': 'Structural damage from storm',
    'form.disaster.powerlines': 'Power lines down',
    'form.disaster.earthquake': 'Earthquake damage',

    // Confirm Report
    'confirm.title': 'Confirm Report',
    'confirm.reviewDetails': 'Review your report details before submitting',
    'confirm.reportType': 'Report Type',
    'confirm.reporter': 'Reporter',
    'confirm.location': 'Location',
    'confirm.description': 'Description',
    'confirm.evidence': 'Evidence',
    'confirm.items': 'items',
    'confirm.submit': 'Submit Report',
    'confirm.submitting': 'Submitting...',

    // Report Success
    'success.title': 'Report Submitted!',
    'success.message': 'Your report has been submitted to the authorities.',
    'success.trackingId': 'Tracking ID',
    'success.whatNext': 'What happens next?',
    'success.step1': 'Authorities will review your report',
    'success.step2': 'You will receive a notification when there\'s an update',
    'success.step3': 'You can track the status in "My Reports"',
    'success.goHome': 'Go to Home',
    'success.viewReports': 'View My Reports',

    // Tabs
    'tabs.home': 'Home',
    'tabs.reports': 'My Reports',
    'tabs.profile': 'Profile',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('tl'); // Default to Tagalog
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved language preference on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        if (savedLanguage === 'en' || savedLanguage === 'tl') {
          setLanguageState(savedLanguage);
        }
        // If no saved preference, keep default (Tagalog)
      } catch (error) {
        console.error('Failed to load language preference:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadLanguage();
  }, []);

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  // Don't render children until language is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
