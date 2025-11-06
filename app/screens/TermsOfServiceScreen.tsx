import React from 'react';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Colors } from '../../constants/colors';

export default function TermsOfServiceScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={Colors.text.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.lastUpdated}>Last Updated: November 6, 2025</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing and using iReport Camarines Norte ("the App"), you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the App.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          iReport Camarines Norte is an emergency incident reporting application that allows residents to report crimes, fires, and disasters to the Philippine National Police (PNP), Bureau of Fire Protection (BFP), and Provincial Disaster Risk Reduction Management Office (PDRRMO).
        </Text>

        <Text style={styles.sectionTitle}>3. User Responsibilities</Text>
        <Text style={styles.paragraph}>
          As a user, you agree to:
        </Text>
        <Text style={styles.bulletPoint}>• Provide accurate and truthful information in all reports</Text>
        <Text style={styles.bulletPoint}>• Use the App only for legitimate emergency reporting purposes</Text>
        <Text style={styles.bulletPoint}>• Not submit false, misleading, or fraudulent reports</Text>
        <Text style={styles.bulletPoint}>• Not abuse, harass, or threaten emergency responders</Text>
        <Text style={styles.bulletPoint}>• Maintain the confidentiality of your account credentials</Text>
        <Text style={styles.bulletPoint}>• Comply with all applicable laws and regulations</Text>

        <Text style={styles.sectionTitle}>4. Prohibited Activities</Text>
        <Text style={styles.paragraph}>
          You must NOT:
        </Text>
        <Text style={styles.bulletPoint}>• Submit false emergency reports (punishable by law)</Text>
        <Text style={styles.bulletPoint}>• Use the App to harass, stalk, or threaten others</Text>
        <Text style={styles.bulletPoint}>• Attempt to hack, disrupt, or compromise the App's security</Text>
        <Text style={styles.bulletPoint}>• Upload malicious content, viruses, or harmful code</Text>
        <Text style={styles.bulletPoint}>• Impersonate others or create fake accounts</Text>
        <Text style={styles.bulletPoint}>• Use the App for commercial purposes without authorization</Text>
        <Text style={styles.bulletPoint}>• Spam or flood the system with excessive reports</Text>

        <Text style={styles.sectionTitle}>5. Emergency Use</Text>
        <Text style={styles.paragraph}>
          Important Notice:
        </Text>
        <Text style={styles.bulletPoint}>• For life-threatening emergencies requiring immediate response, call 911 directly</Text>
        <Text style={styles.bulletPoint}>• The App is a supplementary reporting tool and should not replace direct emergency calls</Text>
        <Text style={styles.bulletPoint}>• Response times may vary depending on agency availability and incident priority</Text>
        <Text style={styles.bulletPoint}>• We do not guarantee immediate response to all reports</Text>

        <Text style={styles.sectionTitle}>6. Account Registration</Text>
        <Text style={styles.paragraph}>
          Registered users must:
        </Text>
        <Text style={styles.bulletPoint}>• Be at least 13 years old</Text>
        <Text style={styles.bulletPoint}>• Provide accurate personal information</Text>
        <Text style={styles.bulletPoint}>• Keep account credentials secure</Text>
        <Text style={styles.bulletPoint}>• Notify us immediately of any unauthorized access</Text>
        <Text style={styles.paragraph}>
          Guest users can report incidents without registration but with limited features.
        </Text>

        <Text style={styles.sectionTitle}>7. Content and Media</Text>
        <Text style={styles.paragraph}>
          When you upload photos, videos, or other content:
        </Text>
        <Text style={styles.bulletPoint}>• You grant us permission to use, store, and share the content with emergency responders</Text>
        <Text style={styles.bulletPoint}>• You confirm that you have the right to upload the content</Text>
        <Text style={styles.bulletPoint}>• You understand that content may be used as evidence in investigations</Text>
        <Text style={styles.bulletPoint}>• You agree not to upload inappropriate, offensive, or illegal content</Text>

        <Text style={styles.sectionTitle}>8. Data Usage and Privacy</Text>
        <Text style={styles.paragraph}>
          Your use of the App is also governed by our Privacy Policy. By using the App, you consent to:
        </Text>
        <Text style={styles.bulletPoint}>• Collection of location data for incident reporting</Text>
        <Text style={styles.bulletPoint}>• Sharing of incident information with relevant emergency agencies</Text>
        <Text style={styles.bulletPoint}>• Storage of your reports and media on secure servers</Text>

        <Text style={styles.sectionTitle}>9. Disclaimer of Warranties</Text>
        <Text style={styles.paragraph}>
          The App is provided "AS IS" without warranties of any kind. We do not guarantee:
        </Text>
        <Text style={styles.bulletPoint}>• Uninterrupted or error-free service</Text>
        <Text style={styles.bulletPoint}>• Immediate response to all reports</Text>
        <Text style={styles.bulletPoint}>• Specific outcomes or resolutions</Text>
        <Text style={styles.bulletPoint}>• Accuracy of location data or geocoding</Text>

        <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by law, iReport Camarines Norte, the Provincial Government, and emergency response agencies shall not be liable for:
        </Text>
        <Text style={styles.bulletPoint}>• Delays in emergency response</Text>
        <Text style={styles.bulletPoint}>• Damages resulting from use or inability to use the App</Text>
        <Text style={styles.bulletPoint}>• Loss of data or service interruptions</Text>
        <Text style={styles.bulletPoint}>• Actions taken by emergency responders</Text>

        <Text style={styles.sectionTitle}>11. Legal Consequences</Text>
        <Text style={styles.paragraph}>
          False reporting is a criminal offense. Users who submit false emergency reports may face:
        </Text>
        <Text style={styles.bulletPoint}>• Criminal prosecution under Philippine law</Text>
        <Text style={styles.bulletPoint}>• Fines and imprisonment</Text>
        <Text style={styles.bulletPoint}>• Permanent ban from the App</Text>
        <Text style={styles.bulletPoint}>• Civil liability for damages caused</Text>

        <Text style={styles.sectionTitle}>12. Account Termination</Text>
        <Text style={styles.paragraph}>
          We reserve the right to suspend or terminate accounts that:
        </Text>
        <Text style={styles.bulletPoint}>• Violate these Terms of Service</Text>
        <Text style={styles.bulletPoint}>• Submit false or abusive reports</Text>
        <Text style={styles.bulletPoint}>• Engage in prohibited activities</Text>
        <Text style={styles.bulletPoint}>• Pose a security risk to the system</Text>

        <Text style={styles.sectionTitle}>13. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We may modify these Terms of Service at any time. Continued use of the App after changes constitutes acceptance of the updated terms. We will notify users of significant changes through the App or email.
        </Text>

        <Text style={styles.sectionTitle}>14. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by the laws of the Republic of the Philippines. Any disputes shall be resolved in the courts of Camarines Norte.
        </Text>

        <Text style={styles.sectionTitle}>15. Contact Information</Text>
        <Text style={styles.paragraph}>
          For questions about these Terms, contact us at:
        </Text>
        <Text style={styles.bulletPoint}>• Email: support@ireport-camnorte.gov.ph</Text>
        <Text style={styles.bulletPoint}>• Address: Provincial Capitol, Camarines Norte</Text>
        <Text style={styles.bulletPoint}>• Phone: (054) XXX-XXXX</Text>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using iReport Camarines Norte, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
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
