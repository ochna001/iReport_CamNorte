import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.lastUpdated}>Last Updated: November 6, 2025</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to iReport Camarines Norte. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our emergency incident reporting application.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect the following types of information:
        </Text>
        <Text style={styles.bulletPoint}>• Personal Information: Name, date of birth, email address, and phone number (for registered users)</Text>
        <Text style={styles.bulletPoint}>• Location Data: GPS coordinates and address information when reporting incidents</Text>
        <Text style={styles.bulletPoint}>• Media Files: Photos and videos you upload as evidence</Text>
        <Text style={styles.bulletPoint}>• Device Information: Device type, operating system, and app version</Text>
        <Text style={styles.bulletPoint}>• Usage Data: Incident reports, timestamps, and app interactions</Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          Your information is used to:
        </Text>
        <Text style={styles.bulletPoint}>• Process and route incident reports to appropriate agencies (PNP, BFP, PDRRMO)</Text>
        <Text style={styles.bulletPoint}>• Enable emergency responders to locate and respond to incidents</Text>
        <Text style={styles.bulletPoint}>• Provide you with status updates on your reports</Text>
        <Text style={styles.bulletPoint}>• Improve our services and app functionality</Text>
        <Text style={styles.bulletPoint}>• Comply with legal obligations and law enforcement requests</Text>

        <Text style={styles.sectionTitle}>4. Data Sharing</Text>
        <Text style={styles.paragraph}>
          We share your information only with:
        </Text>
        <Text style={styles.bulletPoint}>• Emergency Response Agencies: PNP, BFP, and PDRRMO officers who need to respond to your reports</Text>
        <Text style={styles.bulletPoint}>• Government Authorities: When required by law or for public safety</Text>
        <Text style={styles.bulletPoint}>• Service Providers: Supabase (our secure database provider) under strict confidentiality agreements</Text>
        <Text style={styles.paragraph}>
          We do NOT sell your personal information to third parties.
        </Text>

        <Text style={styles.sectionTitle}>5. Data Security</Text>
        <Text style={styles.paragraph}>
          We implement industry-standard security measures:
        </Text>
        <Text style={styles.bulletPoint}>• End-to-end encryption for data transmission</Text>
        <Text style={styles.bulletPoint}>• Secure cloud storage with Supabase</Text>
        <Text style={styles.bulletPoint}>• Row-level security policies to protect your data</Text>
        <Text style={styles.bulletPoint}>• Regular security audits and updates</Text>
        <Text style={styles.bulletPoint}>• Biometric authentication for account access</Text>

        <Text style={styles.sectionTitle}>6. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.bulletPoint}>• Access your personal data</Text>
        <Text style={styles.bulletPoint}>• Request correction of inaccurate information</Text>
        <Text style={styles.bulletPoint}>• Delete your account and associated data</Text>
        <Text style={styles.bulletPoint}>• Opt-out of non-essential communications</Text>
        <Text style={styles.bulletPoint}>• Export your data in a portable format</Text>

        <Text style={styles.sectionTitle}>7. Guest Users</Text>
        <Text style={styles.paragraph}>
          Guest users can report incidents without creating an account. However:
        </Text>
        <Text style={styles.bulletPoint}>• Reports are temporary and may be deleted after resolution</Text>
        <Text style={styles.bulletPoint}>• Limited ability to track report status</Text>
        <Text style={styles.bulletPoint}>• Location and incident data are still collected for emergency response</Text>

        <Text style={styles.sectionTitle}>8. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your data for:
        </Text>
        <Text style={styles.bulletPoint}>• Active incidents: Until resolved and closed</Text>
        <Text style={styles.bulletPoint}>• Historical records: Up to 5 years for statistical and legal purposes</Text>
        <Text style={styles.bulletPoint}>• Account data: Until you request deletion</Text>

        <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our app is intended for users 13 years and older. We do not knowingly collect information from children under 13. If you are a parent and believe your child has provided us with personal information, please contact us.
        </Text>

        <Text style={styles.sectionTitle}>10. Changes to This Policy</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy periodically. We will notify you of significant changes through the app or via email. Continued use of the app after changes constitutes acceptance of the updated policy.
        </Text>

        <Text style={styles.sectionTitle}>11. Contact Us</Text>
        <Text style={styles.paragraph}>
          For privacy concerns or questions, contact us at:
        </Text>
        <Text style={styles.bulletPoint}>• Email: privacy@ireport-camnorte.gov.ph</Text>
        <Text style={styles.bulletPoint}>• Address: Provincial Capitol, Camarines Norte</Text>
        <Text style={styles.bulletPoint}>• Phone: (054) XXX-XXXX</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using iReport Camarines Norte, you acknowledge that you have read and understood this Privacy Policy.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.secondary,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 22,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 14,
    color: Colors.text.primary,
    lineHeight: 22,
    marginBottom: 8,
    paddingLeft: 10,
  },
  footer: {
    marginTop: 30,
    padding: 16,
    backgroundColor: Colors.accent,
    borderRadius: 8,
  },
  footerText: {
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
