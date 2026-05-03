# Event Tracking System

A comprehensive event and leave request management system for educational institutions. This platform enables students to submit leave requests and event applications through a structured approval workflow involving Advisors, Heads of Department (HOD), and Principals.

## Features

- **Multi-Role Authentication**: Separate portals for Students, Advisors, HODs, and Principals
- **Request Submission**: Students can submit leave/event requests with detailed information
- **Approval Workflow**: Automated approval chain (Advisor → HOD → Principal)
- **Real-time Updates**: Polling mechanism for instant status updates
- **Profile Management**: Student profile management with profile pictures
- **Dashboard Analytics**: Visual dashboards with statistics and charts
- **Email Notifications**: Automated email notifications for status changes
- **Secure Authentication**: Spring Security-based authentication system
- **AI Integration**: Google Gemini AI integration for enhanced features

## Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Build tool and dev server
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **Recharts** - Charting library
- **Google GenAI** - AI integration

### Backend
- **Spring Boot 3.5.10** - Java framework
- **Java 17** - Programming language
- **MongoDB** - NoSQL database
- **Spring Security** - Authentication and authorization
- **Spring Mail** - Email functionality
- **Lombok** - Reduce boilerplate code
- **Maven** - Build tool

## Prerequisites

- **Node.js** (v18 or higher) - For frontend
- **Java 17** - For backend
- **Maven** - For backend build
- **MongoDB** - Database
- **Google Gemini API Key** - For AI features

## Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd demo/demo
```

2. Configure MongoDB connection in `src/main/resources/application.properties`:
```properties
spring.data.mongodb.uri=mongodb://localhost:27017/event_tracker
```

3. Configure email settings in `application.properties`:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

4. Build and run the backend:
```bash
./mvnw spring-boot:run
```

The backend will start on `http://localhost:8080`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file and add your Gemini API key:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

4. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

### For Students
1. Select the Student portal
2. Login with your credentials
3. Submit leave/event requests from the dashboard
4. Track request status in real-time
5. Manage your profile information

### For Advisors
1. Select the Advisor portal
2. Login with your credentials
3. Review requests assigned to you
4. Approve, reject, or forward requests to HOD
5. Add comments for each action

### For HODs
1. Select the HOD portal
2. Login with your credentials
3. Review pending requests from advisors
4. Approve, reject, or forward requests to Principal
5. Add comments for each action

### For Principals
1. Select the Principal portal
2. Login with your credentials
3. Review pending requests from HODs
4. Approve or reject requests
5. Add comments for each action

## Project Structure

```
event-tracking-system/
├── frontend/                 # React frontend application
│   ├── components/          # React components
│   │   ├── AdminDashboard.tsx
│   │   ├── AuthForm.tsx
│   │   ├── PortalSelection.tsx
│   │   ├── StudentDashboard.tsx
│   │   └── StudentProfilePage.tsx
│   ├── services/            # API services
│   │   ├── api.ts
│   │   └── gemini.ts
│   ├── App.tsx              # Main application component
│   ├── types.ts             # TypeScript type definitions
│   └── package.json
├── demo/                    # Spring Boot backend
│   └── demo/
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/    # Java source code
│       │   │   └── resources/ # Configuration files
│       │   └── test/       # Test files
│       ├── pom.xml          # Maven configuration
│       └── mvnw             # Maven wrapper
└── README.md                # This file
```

## API Endpoints

The backend provides RESTful API endpoints for:
- User authentication and authorization
- Leave request CRUD operations
- Request status updates
- Profile management
- File uploads (profile pictures)

## Environment Variables

### Frontend (.env.local)
- `GEMINI_API_KEY` - Google Gemini API key for AI features

### Backend (application.properties)
- `spring.data.mongodb.uri` - MongoDB connection string
- `spring.mail.host` - SMTP server host
- `spring.mail.port` - SMTP server port
- `spring.mail.username` - Email username
- `spring.mail.password` - Email password/app password

## Building for Production

### Frontend
```bash
cd frontend
npm run build
```
The built files will be in the `dist` directory.

### Backend
```bash
cd demo/demo
./mvnw clean package
```
The JAR file will be in the `target` directory.

## Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- Built with React and Spring Boot
- Icons by Lucide React
- Charts by Recharts
- AI features powered by Google Gemini
