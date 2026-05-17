# 🎨 RepoGuardian AI - Frontend

**Modern React + TypeScript frontend for autonomous repository intelligence**

---

## 📋 Overview

The RepoGuardian AI frontend is a modern, responsive web application built with:
- React 19 with TypeScript for type safety
- Tailwind CSS 4.0 for beautiful, responsive design
- Zustand for lightweight state management
- Framer Motion for smooth animations
- Axios for API communication
- Vite for lightning-fast development

---

## 🏗️ Architecture

### Project Structure
```
src/
├── components/              # Reusable UI components
│   ├── ui/                 # Base UI components
│   │   ├── Button.tsx     # Button component
│   │   ├── Card.tsx       # Card component
│   │   ├── Input.tsx      # Input component
│   │   ├── Modal.tsx      # Modal component
│   │   ├── Toast.tsx      # Toast notifications
│   │   └── index.ts       # Exports
│   ├── Layout.tsx         # Main layout wrapper
│   ├── ScrollProgress.tsx # Scroll indicator
│   └── ScrollToTop.tsx    # Auto scroll to top
│
├── pages/                  # Route pages
│   ├── Home.tsx           # Landing page
│   ├── Dashboard.tsx      # Main dashboard
│   ├── Repositories.tsx   # Repository management
│   ├── AIAnalysis.tsx     # AI insights display
│   ├── ImpactAnalysis.tsx # Impact visualization
│   ├── SelfHealing.tsx    # Self-healing workflow
│   └── CodeSearch.tsx     # Semantic search
│
├── lib/                    # Utilities
│   ├── api.client.ts      # Axios API client
│   └── utils.ts           # Helper functions
│
├── store/                  # State management
│   └── useAppStore.ts     # Zustand store
│
├── types/                  # TypeScript types
│   └── api.types.ts       # API type definitions
│
├── App.tsx                 # Main app component
├── main.tsx                # Entry point
└── index.css               # Global styles
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Create `.env` file:
```env
VITE_API_URL_DEV=http://127.0.0.1:8000
VITE_API_URL_PROD=https://your-production-url.com
VITE_MODE=development
```

### 3. Start Development Server
```bash
npm run dev
```

Application runs at: `http://localhost:5173`

### 4. Build for Production
```bash
npm run build
```

### 5. Preview Production Build
```bash
npm run preview
```

---

## 🎨 Pages

### 1. Home (`/`)
**Landing page with feature showcase**

Features:
- Hero section with animated visuals
- Feature cards with hover effects
- Call-to-action sections
- Responsive footer

Components:
- Hero banner with gradient effects
- Feature grid (6 features)
- CTA section
- Footer with links

### 2. Dashboard (`/dashboard`)
**Real-time monitoring and metrics**

Features:
- System status overview
- Repository statistics
- Risk score display
- Quick action buttons

Metrics Displayed:
- Total repositories
- AI insights count
- Current risk score
- Vulnerability status

### 3. Repositories (`/repositories`)
**Repository management interface**

Features:
- Clone from GitHub URL
- Upload ZIP files
- Sync with GitHub
- Repository list view

Actions:
- Add new repository
- Sync existing repository
- View repository details
- Delete repository

### 4. AI Analysis (`/ai-analysis`)
**AI-powered code insights**

Features:
- Trigger AI analysis
- View explanations
- See risk assessments
- Review suggestions
- View fixed code

Display:
- Analysis results
- Risk breakdown
- Suggested fixes
- Code comparisons

### 5. Impact Analysis (`/impact`)
**Dependency impact visualization**

Features:
- Analyze code changes
- View affected files
- See dependency chains
- Risk score calculation

Visualization:
- Affected files list
- Dependency depth
- Risk level indicators
- Semantic context

### 6. Self-Healing (`/self-heal`)
**Autonomous fix workflow**

Features:
- Trigger self-healing
- View fix status
- See validation results
- Review commits

Workflow:
1. Detect changes
2. Generate fixes
3. Validate syntax
4. Apply or rollback
5. Show results

### 7. Code Search (`/search`)
**Semantic code search**

Features:
- Natural language queries
- Semantic search results
- Context-aware results
- File navigation

Search:
- Query input
- Results display
- Relevance scoring
- Quick navigation

---

## 🎨 UI Components

### Base Components (`components/ui/`)

#### Button
```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="lg">
  Click Me
</Button>

// Variants: primary, secondary, outline, ghost
// Sizes: sm, md, lg
```

#### Card
```tsx
import { Card, CardContent } from '@/components/ui';

<Card>
  <CardContent>
    Your content here
  </CardContent>
</Card>
```

#### Input
```tsx
import { Input } from '@/components/ui';

<Input 
  type="text" 
  placeholder="Enter text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

#### Modal
```tsx
import { Modal } from '@/components/ui';

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
  <h2>Modal Title</h2>
  <p>Modal content</p>
</Modal>
```

#### Toast
```tsx
import { Toast } from '@/components/ui';

<Toast 
  message="Success!" 
  type="success" 
  isVisible={showToast}
  onClose={() => setShowToast(false)}
/>

// Types: success, error, warning, info
```

---

## 🔧 State Management

### Zustand Store (`store/useAppStore.ts`)

```tsx
import { useAppStore } from '@/store/useAppStore';

function MyComponent() {
  const { 
    repositories, 
    addRepository,
    aiAnalysis,
    setAIAnalysis,
    impactAnalysis,
    setImpactAnalysis
  } = useAppStore();

  // Use state and actions
}
```

**Store Structure**:
```typescript
{
  repositories: Repository[],
  currentRepo: Repository | null,
  aiAnalysis: AIAnalysis | null,
  impactAnalysis: ImpactAnalysis | null,
  isLoading: boolean,
  error: string | null,
  
  // Actions
  addRepository: (repo: Repository) => void,
  setCurrentRepo: (repo: Repository) => void,
  setAIAnalysis: (analysis: AIAnalysis) => void,
  setImpactAnalysis: (analysis: ImpactAnalysis) => void,
  setLoading: (loading: boolean) => void,
  setError: (error: string) => void,
}
```

---

## 🌐 API Client

### Usage (`lib/api.client.ts`)

```tsx
import { api } from '@/lib/api.client';

// Clone repository
const result = await api.cloneRepo({ 
  repo_url: 'https://github.com/user/repo.git' 
});

// Analyze impact
const impact = await api.analyzeImpact({ 
  repo_id: 'abc-123' 
});

// Trigger self-healing
const healing = await api.triggerSelfHeal({ 
  repo_id: 'abc-123' 
});

// Semantic search
const results = await api.queryEmbeddings({
  query: 'authentication function',
  repo_id: 'abc-123'
});
```

**Available Methods**:
- `cloneRepo(data)` - Clone from GitHub
- `uploadRepo(file)` - Upload ZIP
- `syncRepo(repoId)` - Sync with GitHub
- `analyzeImpact(data)` - Impact analysis
- `storeEmbeddings(repoId)` - Generate embeddings
- `queryEmbeddings(data)` - Semantic search
- `analyzeCode(data)` - AI analysis
- `analyzeCodeManual(data)` - Manual AI analysis
- `triggerSelfHeal(data)` - Self-healing
- `healthCheck()` - Health check

---

## 🎨 Styling

### Tailwind CSS

**Theme Colors**:
```css
Primary: Red (#dc2626)
Background: Black (#000000)
Text: White (#ffffff)
Accent: Red shades
```

**Custom Classes**:
```css
.glass-card {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(220, 38, 38, 0.2);
}
```

**Responsive Design**:
- Mobile-first approach
- Breakpoints: sm, md, lg, xl, 2xl
- Fluid typography
- Flexible layouts

---

## 🎭 Animations

### Framer Motion

**Page Transitions**:
```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  Content
</motion.div>
```

**Hover Effects**:
```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Interactive Element
</motion.div>
```

**Scroll Animations**:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
>
  Scroll-triggered Content
</motion.div>
```

---

## 🧪 Testing

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npx tsc --noEmit
```

### Build Test
```bash
npm run build
```

---

## 📦 Build & Deploy

### Production Build
```bash
npm run build
```

Output: `dist/` directory

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables
Set in deployment platform:
- `VITE_API_URL_PROD` - Production API URL
- `VITE_MODE` - Set to "production"

---

## 🔧 Configuration

### Vite Config (`vite.config.ts`)
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8000'
    }
  }
});
```

### TypeScript Config (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "jsx": "react-jsx",
    "strict": true,
    "moduleResolution": "bundler"
  }
}
```

### Tailwind Config (`tailwind.config.js`)
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#dc2626',
      }
    }
  }
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. API Connection Failed
```bash
# Check backend is running
curl http://localhost:8000/health

# Verify .env configuration
VITE_API_URL_DEV=http://127.0.0.1:8000
```

#### 2. Build Errors
```bash
# Clear cache
rm -rf node_modules
rm package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
```

#### 3. TypeScript Errors
```bash
# Check types
npx tsc --noEmit

# Update type definitions
npm update @types/react @types/react-dom
```

#### 4. Styling Issues
```bash
# Rebuild Tailwind
npm run build

# Check Tailwind config
npx tailwindcss -i ./src/index.css -o ./dist/output.css
```

---

## 📈 Performance

### Optimization Tips
1. **Code Splitting**: Use React.lazy() for route-based splitting
2. **Image Optimization**: Use WebP format, lazy loading
3. **Bundle Size**: Analyze with `npm run build -- --analyze`
4. **Caching**: Configure service worker for offline support
5. **CDN**: Serve static assets from CDN

### Lighthouse Scores
Target:
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 90+

---

## 🚀 Development

### Adding New Pages
1. Create component in `src/pages/`
2. Add route in `App.tsx`
3. Update navigation in `Layout.tsx`
4. Add to sidebar menu

### Adding New Components
1. Create in `src/components/`
2. Export from `index.ts` if in `ui/`
3. Add TypeScript types
4. Document props

### Code Style
- Use TypeScript strictly
- Follow React best practices
- Use functional components
- Implement proper error handling
- Add loading states

---

## 📚 Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Vite Documentation](https://vitejs.dev/)

---

## 🤝 Contributing

See main [README.md](../README.md) for contribution guidelines.

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) for details.

---

<div align="center">

**Built with React ⚛️ + TypeScript 💙**

[⬆ Back to Main README](../README.md)

</div>
