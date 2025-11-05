# iReport Firestore Data Model

This document outlines the data structure for the iReport application using Google Firestore. The model is designed for efficient queries and scalability, leveraging denormalization where appropriate.

---

## 1. `users`

Stores information for all authenticated users, including Residents, Field Officers, and Chiefs. The user's Firebase Authentication UID will be used as the document ID.

-   **Collection**: `users`
-   **Document ID**: `{userId}` (Firebase Auth UID)

#### Fields:
```json
{
  "displayName": "Juan Dela Cruz", // string
  "email": "juan.delacruz@email.com", // string (unique)
  "role": "Resident", // string: "Resident", "Field Officer", "Chief"
  "agency": "PNP", // string: "PNP", "BFP", "PDRRMO" (null for Residents)
  "phoneNumber": "+639171234567", // string
  "isVerified": true, // boolean (for email/phone verification)
  "createdAt": "2025-11-04T09:17:00Z" // timestamp
}
```

---

## 2. `incidents`

The primary collection for all incident reports, whether submitted by a registered Resident or an anonymous Guest.

-   **Collection**: `incidents`
-   **Document ID**: Auto-generated

#### Fields:
```json
{
  "incidentType": "Crime", // string: "Crime", "Fire", "Disaster"
  "agency": "PNP", // string: "PNP", "BFP", "PDRRMO" (Determined by incidentType)
  "status": "Pending", // string: "Pending", "Assigned", "On-Scene", "Resolved", "Closed"
  "location": {
    "latitude": 14.123,
    "longitude": 121.456
  }, // GeoPoint
  "address": {
    "street": "Rizal Ave",
    "barangay": "Brgy. 1",
    "municipality": "Daet"
  }, // object
  "createdAt": "2025-11-04T09:20:00Z", // timestamp
  "submittedBy": {
    "userId": "some_user_uid_or_guest", // string
    "displayName": "Juan Dela Cruz" // string (Denormalized for quick display)
  },
  "assignedTo": {
    "userId": "officer_uid_abc", // string (null if unassigned)
    "displayName": "Maria Santos" // string (Denormalized)
  }
}
```

### Subcollections within `incidents`

#### a. `media`

Stores references to uploaded photos or videos for an incident.

-   **Subcollection**: `incidents/{incidentId}/media`
-   **Document ID**: Auto-generated

```json
{
  "url": "https://firebasestorage.googleapis.com/...", // string (Cloud Storage URL)
  "type": "photo", // string: "photo", "video"
  "uploadedAt": "2025-11-04T09:21:00Z" // timestamp
}
```

#### b. `updates`

A log of status changes and notes from Field Officers or Desk Officers.

-   **Subcollection**: `incidents/{incidentId}/updates`
-   **Document ID**: Auto-generated

```json
{
  "text": "Assigned to Officer Maria Santos.", // string
  "authorId": "desk_officer_system_id", // string
  "timestamp": "2025-11-04T09:25:00Z" // timestamp
},
{
  "text": "Officer en route to location.", // string
  "authorId": "officer_uid_abc", // string
  "timestamp": "2025-11-04T09:30:00Z" // timestamp
}
```

#### c. `finalReport`

A single document containing the detailed final report, with a structure that varies based on the agency.

-   **Subcollection**: `incidents/{incidentId}/finalReport`
-   **Document ID**: A fixed ID, e.g., `report_details`

```json
// Example for a PNP Final Report
{
  "reportId": "PNP-2025-11-001", // string
  "narrative": "Detailed narrative of the incident and resolution...", // string
  "victimName": "...",
  "suspectName": "...",
  "caseStatus": "Closed",
  "completedBy": "officer_uid_abc",
  "completedAt": "2025-11-04T11:00:00Z"
}
```

---

## 3. `agencies`

Stores static information about each emergency response agency. This avoids hardcoding agency details in the app.

-   **Collection**: `agencies`
-   **Document ID**: `PNP`, `BFP`, `PDRRMO`

#### Fields:
```json
{
  "name": "Philippine National Police", // string
  "contactNumber": "(054) 123-4567", // string
  "address": "Camp Crame, Quezon City" // string
}
```

---

## 4. `notifications`

Stores push notifications sent to users.

-   **Collection**: `notifications`
-   **Document ID**: Auto-generated

#### Fields:
```json
{
  "recipientId": "resident_uid_xyz", // string (ID of the user to notify)
  "title": "Incident Status Updated", // string
  "body": "Your report for 'Fire' has been assigned to a field officer.", // string
  "incidentId": "incident_id_abc", // string (For deeplinking)
  "isRead": false, // boolean
  "createdAt": "2025-11-04T09:25:00Z" // timestamp
}
```
