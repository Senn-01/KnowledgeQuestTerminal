# Knowledge Quest Terminal

> A gamified learning web application that transforms education into an RPG-like experience with AI-powered teaching, skill trees, and rarity-based progression.

![Knowledge Quest Terminal](https://img.shields.io/badge/Status-Complete-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![React](https://img.shields.io/badge/React-18+-blue)

## ✨ Features

### 🎮 Gamified Learning Experience
- **Terminal Aesthetic**: Retro-inspired interface with Monaco font and terminal green theme
- **Diablo 4 Rarity System**: Normal, Rare, Legendary, and Unique knowledge classifications
- **DOOM Difficulty Names**: I'm Too Young to Die, Hey Not Too Rough, Hurt Me Plenty, Ultra-Violence, Nightmare

### 🧠 AI-Powered Education
- **OpenAI GPT-4o Integration**: Advanced AI explanations tailored to difficulty levels
- **Adaptive Learning**: Content adjusts from beginner to expert levels
- **Real-time Evaluation**: AI assessment of user understanding with detailed feedback

### 🏆 Three Learning Phases
1. **Articulation Chamber** (3 minutes): Explain your understanding in your own words
2. **The Gauntlet** (5 minutes): Multiple choice questions testing comprehension
3. **Lightning Round** (2 minutes): Rapid-fire true/false statements

### 🌟 Visual Progress Tracking
- **Constellation View**: Interactive skill tree showing learned topics as connected nodes
- **Category Organization**: Auto-categorization into Sciences, Mathematics, Technology, Humanities, Arts, Skills, Languages
- **Connection Mapping**: AI-detected relationships between topics

### 📚 Knowledge Vault
- **Markdown Archive**: Comprehensive session summaries in searchable format
- **Export Functionality**: Download individual entries or entire vault
- **Local Persistence**: All data stored securely in browser storage

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ 
- OpenAI API Key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/knowledge-quest-terminal.git
cd knowledge-quest-terminal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Add your OpenAI API key
export OPENAI_API_KEY="your-openai-api-key-here"
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5000`

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with hot module replacement
- **UI Components**: shadcn/ui with Tailwind CSS
- **State Management**: React hooks + React Query
- **Routing**: Wouter for lightweight client-side routing

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: PostgreSQL with Drizzle ORM (optional)
- **AI Integration**: OpenAI API via secure server proxy
- **Session Storage**: In-memory with database fallback

### Key Design Decisions
- **Monorepo Structure**: Organized client/, server/, and shared/ directories
- **Type Safety**: Full TypeScript implementation with shared types
- **Local-First**: Primary data storage in browser localStorage
- **Secure AI Access**: Server-side OpenAI proxy prevents key exposure

## 📁 Project Structure

```
knowledge-quest-terminal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   └── index.html
├── server/                 # Express backend
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API routes
│   └── storage.ts         # Data storage layer
├── shared/                # Shared types and schemas
│   └── schema.ts
└── package.json
```

## 🎯 Usage

1. **Start Learning**: Click "Begin Quest" and enter any topic you want to learn
2. **Choose Difficulty**: Select from 5 difficulty levels (beginner to expert)
3. **Study**: Read the AI-generated explanation carefully
4. **Take Trials**: Complete all three timed assessment phases
5. **View Results**: See your rarity rating and performance breakdown
6. **Explore Constellation**: Visualize your learning progress and topic connections
7. **Access Vault**: Search and export your knowledge archive

## 🛠️ Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Environment Variables
- `OPENAI_API_KEY` - Your OpenAI API key for AI features
- `DATABASE_URL` - PostgreSQL connection string (optional)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4o API
- shadcn/ui for beautiful components
- Tailwind CSS for styling system
- Lucide React for icons
- The Replit community for development platform

## 🔮 Future Enhancements

- [ ] Multiplayer learning challenges
- [ ] Achievement system with badges
- [ ] Study streak tracking
- [ ] Topic recommendation engine
- [ ] Social learning features
- [ ] Mobile app version

---

**Built with ❤️ using React, TypeScript, and OpenAI**