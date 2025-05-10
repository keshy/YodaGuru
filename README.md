# Spiritual Connect

<div align="center">
  <img src="generated-icon.png" alt="Spiritual Connect Logo" width="120" height="120"/>
  <h3>Connect with your spiritual traditions and festivals</h3>
</div>

## 📑 Overview

Spiritual Connect is a comprehensive application designed to help users stay connected with their religious traditions, festivals, and spiritual practices. The app provides personalized content based on your selected faith tradition, reminds you of upcoming religious festivals, offers detailed ritual procedures with voice synthesis, and allows community contributions.

### ✨ Key Features

- **Personalized Religious Content**: Daily spiritual content based on your faith tradition
- **Festival Calendar**: Track upcoming religious festivals with customizable reminders
- **"Priest Mode"**: Audio-guided ritual procedures with ElevenLabs voice synthesis
- **Community Contributions**: Upload ritual documents that are AI-categorized for the right festivals
- **Multi-Faith Support**: Designed for multiple religious traditions from day one

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Firebase account (for authentication)
- OpenAI API key (for content generation and document analysis)
- ElevenLabs API key (for voice synthesis)

### Environment Variables

The following environment variables are required:

```
DATABASE_URL=postgresql://username:password@localhost:5432/db_name
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
OPENAI_API_KEY=your_openai_api_key
```

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/spiritual-connect.git
   cd spiritual-connect
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up the database:
   ```
   npm run db:push
   ```

4. Start the development server:
   ```
   npm run dev
   ```

## 🏗️ Architecture

### Frontend
- Built with React, TypeScript, and Vite
- State management with React Query
- UI components with shadcn/ui and Tailwind CSS
- Routing with wouter

### Backend
- Express.js server with TypeScript
- PostgreSQL database with Drizzle ORM
- Firebase authentication
- OpenAI for content generation and document processing
- ElevenLabs for voice synthesis

## 👥 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Push to your branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please contact [support@spiritualconnect.com](mailto:support@spiritualconnect.com) or open an issue on this repository.