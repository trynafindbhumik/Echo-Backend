import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🚨 Echo Safety API Documentation',
      version: '1.0.0',
      description: `
High-reliability Emergency SOS, Live Spatial Location Tracking, Geofenced Bystander Response, and Safety Helplines REST & WebSocket API.

---

### ⚡ Socket.io Real-Time WebSocket Events Engine

The backend provides a real-time WebSocket connection engine for location streaming and instant incident notifications.

#### **Client to Server Events**:
- \`join:nearby_incidents\`: Join nearby incidents spatial channel. Payload: \`{ latitude: number, longitude: number }\`
- \`leave:nearby_incidents\`: Leave nearby incidents spatial channel. Payload: \`{}\`
- \`sos:location_update\`: Stream live victim GPS position during active SOS. Payload: \`{ alertId: string, latitude: number, longitude: number, accuracy?: number, speed?: number, heading?: number }\`

#### **Server to Client Broadcast Events**:
- \`sos:created\`: Pushed to \`nearby_incidents\` room when a nearby SOS is triggered.
- \`sos:responder_updated\`: Pushed to \`nearby_incidents\` and \`alert:{alertId}\` rooms when a responder accepts an incident.
- \`sos:audio_uploaded\`: Pushed to \`alert:{alertId}\` room when a 10s audio snippet is uploaded to Cloudinary.
- \`track:position_changed\`: Pushed to \`alert:{alertId}\` room when live tracking position changes.
`,
      contact: {
        name: 'Echo Safety Dev Team',
      },
    },
    servers: [
      ...(process.env.RENDER_EXTERNAL_URL || process.env.APP_URL
        ? [{ url: `${process.env.RENDER_EXTERNAL_URL || process.env.APP_URL}/api/v1`, description: 'Production Server' }]
        : [{ url: 'https://echo-backend-tagn.onrender.com/api/v1', description: 'Production Server (Render)' }]),
      {
        url: 'http://localhost:5000/api/v1',
        description: 'Development Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT authorization token (without Bearer prefix)',
        },
      },
      schemas: {
        SendOtpRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
              description: 'Email address to send the 6-digit OTP verification code',
            },
          },
        },
        VerifyOtpRequest: {
          type: 'object',
          required: ['email', 'otp'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            otp: {
              type: 'string',
              example: '123456',
              description: '6-digit OTP verification code',
            },
            fcmToken: {
              type: 'string',
              example: 'eX8K9f2m...',
              description: 'Optional FCM token for push notifications',
            },
          },
        },
        GoogleAuthRequest: {
          type: 'object',
          properties: {
            idToken: {
              type: 'string',
              example: 'eyJhbGciOiJSUzI1NiIs...',
              description: 'Google OAuth2 ID Token received from Google Sign-In SDK',
            },
            fcmToken: {
              type: 'string',
              example: 'eX8K9f2m...',
              description: 'Firebase Cloud Messaging token for push notifications',
            },
            email: {
              type: 'string',
              example: 'alex@example.com',
            },
            name: {
              type: 'string',
              example: 'Alex Johnson',
            },
            avatarUrl: {
              type: 'string',
              example: 'https://lh3.googleusercontent.com/a/default-avatar',
            },
          },
        },
        RefreshTokenRequest: {
          type: 'object',
          required: ['refreshToken'],
          properties: {
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIs...',
              description: 'Valid JWT refresh token',
            },
          },
        },
        FcmTokenRequest: {
          type: 'object',
          required: ['fcmToken'],
          properties: {
            fcmToken: {
              type: 'string',
              example: 'eX8K9f2m...',
              description: 'Firebase Cloud Messaging device token',
            },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              example: 'Rachel Miller',
            },
            phoneNumber: {
              type: 'string',
              example: '+1 (555) 019-2834',
            },
            gender: {
              type: 'string',
              example: 'Female',
            },
            hasCompletedEmergencySetup: {
              type: 'boolean',
              example: true,
            },
            isSilentSosEnabled: {
              type: 'boolean',
              example: false,
            },
          },
        },
        AddContactRequest: {
          type: 'object',
          required: ['name', 'phoneNumber', 'relationship'],
          properties: {
            name: {
              type: 'string',
              example: 'John Miller',
            },
            phoneNumber: {
              type: 'string',
              example: '+15550123456',
            },
            relationship: {
              type: 'string',
              example: 'Parent',
            },
            isPrimary: {
              type: 'boolean',
              example: true,
            },
          },
        },
        TriggerSosRequest: {
          type: 'object',
          required: ['latitude', 'longitude'],
          properties: {
            latitude: {
              type: 'number',
              example: 28.6139,
            },
            longitude: {
              type: 'number',
              example: 77.2090,
            },
            address: {
              type: 'string',
              example: 'Connaught Place, New Delhi, India',
            },
            isSilent: {
              type: 'boolean',
              example: false,
            },
          },
        },
        CancelFalseAlarmRequest: {
          type: 'object',
          properties: {
            reason: {
              type: 'string',
              example: 'accidental_touch',
            },
            pin: {
              type: 'string',
              example: '1234',
            },
          },
        },
        ReportFakeAlertRequest: {
          type: 'object',
          required: ['reason'],
          properties: {
            reason: {
              type: 'string',
              example: 'Accidental trigger / Spam report',
            },
            details: {
              type: 'string',
              example: 'User triggered test alert in safe area',
            },
          },
        },
        StartTrackSessionRequest: {
          type: 'object',
          properties: {
            durationHours: {
              type: 'number',
              example: 2,
            },
            contactIds: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['cnt_101'],
            },
          },
        },
        PostLocationRequest: {
          type: 'object',
          required: ['latitude', 'longitude'],
          properties: {
            latitude: { type: 'number', example: 28.6139 },
            longitude: { type: 'number', example: 77.2090 },
            alertId: { type: 'string', example: 'alt_98765' },
            entityType: { type: 'string', enum: ['victim', 'bystander'], example: 'bystander' },
          },
        },
        BatchLocationRequest: {
          type: 'object',
          required: ['locations'],
          properties: {
            alertId: { type: 'string', example: 'alt_98765' },
            entityType: { type: 'string', enum: ['victim', 'bystander'], example: 'bystander' },
            locations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  latitude: { type: 'number', example: 28.6139 },
                  longitude: { type: 'number', example: 77.2090 },
                  timestamp: { type: 'string', example: '2026-09-07T00:40:00.000Z' },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      '/auth/send-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Send 6-digit OTP verification code to email',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SendOtpRequest' },
              },
            },
          },
          responses: {
            200: { description: 'OTP verification code sent to email successfully' },
            400: { description: 'Invalid email input' },
          },
        },
      },
      '/auth/verify-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Verify SMS/Email OTP code & issue JWT credentials',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VerifyOtpRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Authentication successful, returns access & refresh tokens' },
            400: { description: 'Invalid or expired OTP code' },
          },
        },
      },
      '/auth/google': {
        post: {
          tags: ['Authentication'],
          summary: 'Authenticate via Google Sign-In OAuth ID Token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/GoogleAuthRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Google authentication successful, returns JWT tokens and user profile' },
            400: { description: 'Bad request or missing required parameters' },
            401: { description: 'Invalid or expired Google ID Token' },
          },
        },
      },
      '/auth/refresh-token': {
        post: {
          tags: ['Authentication'],
          summary: 'Refresh access JWT credential token using a valid refresh token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RefreshTokenRequest' },
              },
            },
          },
          responses: {
            200: { description: 'New access token issued successfully' },
            401: { description: 'Invalid or expired refresh token' },
          },
        },
      },
      '/auth/fcm-token': {
        post: {
          tags: ['Authentication'],
          summary: 'Update device Firebase Cloud Messaging (FCM) push notification token',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/FcmTokenRequest' },
              },
            },
          },
          responses: {
            200: { description: 'FCM token updated successfully' },
            401: { description: 'Unauthorized access token' },
          },
        },
      },
      '/users/me': {
        get: {
          tags: ['User Profile Management'],
          summary: 'Get authenticated user profile and setup preferences',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'User profile details returned successfully' },
            401: { description: 'Unauthorized' },
          },
        },
        patch: {
          tags: ['User Profile Management'],
          summary: 'Update user profile info and emergency configuration',
          security: [{ BearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Profile updated successfully' },
          },
        },
        put: {
          tags: ['User Profile Management'],
          summary: 'Update user profile info (PUT alias)',
          security: [{ BearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Profile updated successfully' },
          },
        },
      },
      '/users/profile': {
        get: {
          tags: ['User Profile Management'],
          summary: 'Get user profile (alias path)',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'User profile details returned' },
          },
        },
        patch: {
          tags: ['User Profile Management'],
          summary: 'Update user profile (alias path)',
          security: [{ BearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProfileRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Profile updated' },
          },
        },
      },
      '/contacts': {
        get: {
          tags: ['Emergency Contacts'],
          summary: 'List all trusted emergency contacts configured for user',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'Array of trusted contacts' },
          },
        },
        post: {
          tags: ['Emergency Contacts'],
          summary: 'Add a new trusted emergency contact',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AddContactRequest' },
              },
            },
          },
          responses: {
            201: { description: 'Emergency contact created' },
          },
        },
      },
      '/contacts/{contactId}': {
        delete: {
          tags: ['Emergency Contacts'],
          summary: 'Delete a trusted emergency contact by ID',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'contactId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Contact deleted successfully' },
          },
        },
      },
      '/sos/trigger': {
        post: {
          tags: ['Emergency SOS Lifecycle'],
          summary: 'Trigger high-priority emergency SOS alert with live GPS coordinates',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/TriggerSosRequest' },
              },
            },
          },
          responses: {
            201: { description: 'Emergency SOS alert activated, FCM push & SMS dispatched' },
          },
        },
      },
      '/sos/{alertId}/audio': {
        post: {
          tags: ['Emergency SOS Lifecycle'],
          summary: 'Upload 10-second emergency recorded audio snippet (.m4a/.wav) to Cloudinary',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'alertId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    file: {
                      type: 'string',
                      format: 'binary',
                      description: '10-second audio snippet file (.m4a / .wav / .aac)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Audio snippet uploaded to Cloudinary & broadcasted via WebSocket' },
          },
        },
      },
      '/sos/{alertId}/resolve': {
        post: {
          tags: ['Emergency SOS Lifecycle'],
          summary: 'Mark victim safe & resolve active SOS emergency incident',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'alertId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'SOS alert resolved successfully' },
          },
        },
      },
      '/sos/{alertId}/cancel-false-alarm': {
        post: {
          tags: ['Emergency SOS Lifecycle'],
          summary: 'Cancel active SOS alert triggered accidentally as false alarm',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'alertId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CancelFalseAlarmRequest' },
              },
            },
          },
          responses: {
            200: { description: 'False alarm cancelled and stand-down notification dispatched' },
          },
        },
      },
      '/alerts/nearby': {
        get: {
          tags: ['Bystander Incident Feed'],
          summary: 'PostGIS spatial radius query for active nearby emergency alerts',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'latitude',
              in: 'query',
              required: true,
              schema: { type: 'number', example: 28.6139 },
            },
            {
              name: 'longitude',
              in: 'query',
              required: true,
              schema: { type: 'number', example: 77.2090 },
            },
            {
              name: 'radiusKm',
              in: 'query',
              schema: { type: 'number', default: 8, example: 8 },
            },
          ],
          responses: {
            200: { description: 'List of active nearby incidents sorted by distance' },
          },
        },
      },
      '/alerts/{alertId}/respond': {
        post: {
          tags: ['Bystander Incident Feed'],
          summary: 'Mark bystander "En Route" to incident location',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'alertId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Response status acknowledged and broadcasted via WebSocket' },
          },
        },
      },
      '/alerts/{alertId}/report-fake': {
        post: {
          tags: ['Bystander Incident Feed'],
          summary: 'Report a fake or suspicious SOS alert for moderation audit',
          security: [{ BearerAuth: [] }],
          parameters: [
            {
              name: 'alertId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReportFakeAlertRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Report submitted for moderation audit' },
          },
        },
      },
      '/track/start': {
        post: {
          tags: ['Live Location Sharing'],
          summary: 'Create temporary web location tracking session',
          security: [{ BearerAuth: [] }],
          requestBody: {
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/StartTrackSessionRequest' },
              },
            },
          },
          responses: {
            201: { description: 'Tracking session created with shareable URL' },
          },
        },
      },
      '/track/location': {
        post: {
          tags: ['Live Location Sharing'],
          summary: 'HTTPS REST Location Update Fallback (when WebSockets disconnect)',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PostLocationRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Location updated in Redis & broadcasted via Socket.io' },
          },
        },
      },
      '/track/location/batch': {
        post: {
          tags: ['Live Location Sharing'],
          summary: 'HTTPS REST Batched Location Sync (when cellular network is restored)',
          security: [{ BearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/BatchLocationRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Batch locations processed successfully' },
          },
        },
      },
      '/track/{sessionId}': {
        get: {
          tags: ['Live Location Sharing'],
          summary: 'Public web tracking session details',
          parameters: [
            {
              name: 'sessionId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            200: { description: 'Public tracking session status' },
          },
        },
      },
      '/helplines': {
        get: {
          tags: ['Safety Helplines'],
          summary: 'Fetch official emergency helplines list with local offline caching support',
          responses: {
            200: {
              description: 'List of emergency helplines (Police 100, Emergency 112, Women Helpline 1091, Ambulance 108)',
            },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export const setupSwagger = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Echo Safety API Documentation',
  }));
};
