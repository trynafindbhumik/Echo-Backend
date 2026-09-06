import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '🚨 Echo Safety API Documentation',
      version: '1.0.0',
      description: 'High-reliability Emergency SOS, Live Location Tracking, and Geofenced Bystander Response REST & WebSocket API',
      contact: {
        name: 'Echo Safety Dev Team',
      },
    },
    servers: [
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
        VerifyOtpRequest: {
          type: 'object',
          properties: {
            phoneNumber: {
              type: 'string',
              example: '+919278272016',
            },
            otp: {
              type: 'string',
              example: '123456',
              description: '6-digit OTP code (use 123456 for dev testing)',
            },
            firebaseIdToken: {
              type: 'string',
              example: 'eyJhbGciOiJSUzI1NiIs...',
              description: 'Firebase ID Token issued by Firebase Phone Auth on client',
            },
            fcmToken: {
              type: 'string',
              example: 'eX8K9f2m...',
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
              example: 37.7749,
            },
            longitude: {
              type: 'number',
              example: -122.4194,
            },
            address: {
              type: 'string',
              example: '742 Market St, San Francisco, CA',
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
            latitude: { type: 'number', example: 37.7749 },
            longitude: { type: 'number', example: -122.4194 },
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
                  latitude: { type: 'number', example: 37.7749 },
                  longitude: { type: 'number', example: -122.4194 },
                  timestamp: { type: 'string', example: '2026-09-07T00:40:00.000Z' },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      '/auth/verify-otp': {
        post: {
          tags: ['Authentication'],
          summary: 'Verify SMS OTP & issue JWT credentials',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/VerifyOtpRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Authentication successful, returns JWT tokens' },
            400: { description: 'Invalid or expired OTP code' },
          },
        },
      },
      '/users/me': {
        get: {
          tags: ['User Management'],
          summary: 'Get authenticated user profile',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'User profile object' },
            401: { description: 'Unauthorized access' },
          },
        },
        patch: {
          tags: ['User Management'],
          summary: 'Update user profile & emergency preferences',
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
      '/contacts': {
        get: {
          tags: ['Emergency Contacts'],
          summary: 'List user emergency contacts',
          security: [{ BearerAuth: [] }],
          responses: {
            200: { description: 'Array of trusted contacts' },
          },
        },
        post: {
          tags: ['Emergency Contacts'],
          summary: 'Add trusted emergency contact',
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
          summary: 'Delete trusted contact',
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
            200: { description: 'Contact deleted' },
          },
        },
      },
      '/sos/trigger': {
        post: {
          tags: ['Emergency SOS Lifecycle'],
          summary: 'Trigger high-priority emergency SOS alert',
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
            201: { description: 'Emergency SOS alert activated and dispatched via FCM' },
          },
        },
      },
      '/sos/{alertId}/audio': {
        post: {
          tags: ['Emergency SOS Lifecycle'],
          summary: 'Upload emergency recorded audio snippet (.m4a/.wav) to Cloudinary',
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
                      description: 'Emergency audio file (.m4a / .wav)',
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Audio recorded URL returned' },
          },
        },
      },
      '/sos/{alertId}/resolve': {
        post: {
          tags: ['Emergency SOS Lifecycle'],
          summary: 'Mark victim safe & resolve active SOS alert',
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
            200: { description: 'Alert resolved' },
          },
        },
      },
      '/sos/{alertId}/cancel-false-alarm': {
        post: {
          tags: ['Emergency SOS Lifecycle'],
          summary: 'Cancel active SOS alert marked as accidental false alarm',
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
            200: { description: 'False alarm cancelled and stand-down alert sent' },
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
              schema: { type: 'number', example: 37.7749 },
            },
            {
              name: 'longitude',
              in: 'query',
              required: true,
              schema: { type: 'number', example: -122.4194 },
            },
            {
              name: 'radiusKm',
              in: 'query',
              schema: { type: 'number', default: 8, example: 8 },
            },
          ],
          responses: {
            200: { description: 'List of nearby incidents sorted by distance' },
          },
        },
      },
      '/alerts/{alertId}/respond': {
        post: {
          tags: ['Bystander Incident Feed'],
          summary: 'Mark bystander "En Route" to incident',
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
            200: { description: 'Response acknowledged' },
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
