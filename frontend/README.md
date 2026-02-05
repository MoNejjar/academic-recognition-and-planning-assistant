# Frontend Developer Guide

## Overview

React + TypeScript + Vite application with three role-based interfaces:
1. **Landing Page** (`/`): Role selection portal (Student, Staff, Professor)
2. **Student Portal** (`/student/*`): 4-step submission wizard
3. **Staff/Professor Dashboard** (`/staff/*`): Task management with AI analytics

**Stack**: React 18.3 | Vite 5.4 | TypeScript 5.6 | React Router 6.30 | Tailwind CSS 3.4 | Radix UI

## Architecture

### State Management
- **No Redux/Zustand** - uses React's built-in state
- **UserContext** - tracks user role from landing page selection
- **Local state** (`useState`) for component-level state
- **Lifted state** in `StudentDashboard` manages wizard flow

### Routing
Nested routing with React Router 6:
```
/ (LandingPage - Role Selection)
/student/* (StudentDashboard)
  /student/ (PersonalDataPage)
  /student/mapping (MappingUploadPage)
  /student/catalogue (CatalogueUploadPage)
  /student/review (FinalReviewPage)
/staff/* (Layout with sidebar)
  /staff/kanban (KanbanPage - Overview)
  /staff/tasks (TasksPage - List)
  /staff/tasks/:id (TaskDetailPageModern)
  /staff/archive (ArchivePage)
  /staff/testing (TestingPage)
```

## Directory Structure

**`src/`**
- **`main.tsx`** - Vite entry
- **`App.tsx`** - Root router with UserProvider
- **`types.ts`** - Shared TypeScript interfaces

**Pages**:
- **`pages/`**
  - `LandingPage.tsx` - Role selection with TUM branding
  - Student: `StudentDashboard.tsx`, `PersonalDataPage`, `MappingUploadPage`, `CatalogueUploadPage`, `FinalReviewPage`
  - Staff: `StaffDashboard.tsx`, `TasksPage`, `TaskDetailPageModern`, `KanbanPage`, `ArchivePage`, `AnalyticsPage`

**Components**:
- **`components/`**
  - `layout/Layout.tsx` - Staff sidebar with TUM logo
  - `common/SharedComponents.tsx` - Tooltip, CollapsibleSection, Badge, etc.
  - `common/CommentThread.tsx` - Professor-Staff discussion
  - `common/StatusBadges.tsx` - Task status indicators
  - `analytics/ModuleCardModern.tsx` - AI analysis display
  - `chatbot/FloatingChat.tsx` - Chatbot widget
  - `ui/` - Radix UI component wrappers

**Context & Services**:
- **`context/UserContext.tsx`** - User role management
- **`services/`** - API calls (analyticsApi, chatbot, courseMatching, reporting)
- **`data/taskManager.ts`** - Task fetching and caching
- **`styles/tumStyles.ts`** - TUM color constants
- **`assets/tum-logo.svg`** - Official TUM logo


## Core Workflows

### Student Submission
```
LandingPage → Select "Student" → setUserRole('student')
  ↓
StudentDashboard mounts
  ↓
PersonalDataPage → setPersonalData() → navigate('/student/mapping')
  ↓
MappingUploadPage → Upload PDF → POST /api/course-matching/extract-mapping → navigate('/student/catalogue')
  ↓
CatalogueUploadPage → Edit courses → navigate('/student/review')
  ↓
FinalReviewPage → POST /api/submissions/submit → Success
```

### Staff/Professor Task Review
```
LandingPage → Select "Staff" or "Professor" → setUserRole()
  ↓
TasksPage → GET /api/tasks/tasks → Display list
  ↓
Click task → navigate(`/staff/tasks/${taskId}`)
  ↓
TaskDetailPageModern:
  - Loads task + final verdict (if exists)
  - Displays ModuleCardModern with AI analysis
  - CommentThread for discussion
  - Action buttons (Approve/Reject/Hold)
  ↓
Approve/Reject → FinalVerdictModal → POST comment + PATCH status
```

## Quick Reference

### API Integration

**Environment**: `VITE_API_URL=http://localhost:8000` (in `.env`)
**Access**: `import.meta.env.VITE_API_URL`

**Case Conversion**: Backend uses `snake_case`, frontend uses `camelCase`
- Backend models have `Field(alias="camelCase")` for compatibility
- Or use `snakeToCamel()` utility (in `utils/caseConversion.ts`)

### Styling

**TUM Colors** (`styles/tumStyles.ts`):
```tsx
const TUM_COLORS = {
    primary: '#3069d6',  // TUM blue
    secondary: '#072140', // Dark blue
    gray80: '#1F2937', gray50: '#6B7280',
    success: '#10B981', warning: '#F59E0B', error: '#EF4444'
};
```

**Tailwind Usage**:
- Layout: `flex`, `grid`, `items-center`, `justify-between`
- Spacing: `p-4`, `m-4`, `gap-4`
- Typography: `text-sm`, `font-bold`
- Responsive: `hidden md:block`, `flex-col md:flex-row`

### UI Components (Radix)

Wrapped in `components/ui/`:
```tsx
import { Button } from '@/components/ui/button';
<Button variant="outline" size="sm">Click</Button>
```

## Development

### Setup
```bash
cd frontend
npm install
# Create .env: VITE_API_URL=http://localhost:8000
npm run dev  # http://localhost:3000
npm run build  # Production build
```

### Adding Features

**New Page**:
1. Create `pages/NewPage.tsx`
2. Add route: `<Route path="new-page" element={<NewPage />} />`
3. Navigate: `navigate('/staff/new-page')`

**New API Call**:
```tsx
// services/newApi.ts
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const getData = async () => {
    const res = await fetch(`${API_URL}/api/endpoint`);
    return await res.json();
};
```

**New Component**:
```tsx
interface Props { title: string; onAction: () => void; }
export default function NewComponent({ title, onAction }: Props) {
    return <div onClick={onAction}>{title}</div>;
}
```

**New Type**:
```tsx
// types.ts
export interface NewType {
    id: string;
    name: string;
    status: 'active' | 'inactive';
}
```

## Key Locations for Common Tasks

| Task | Location |
|------|----------|
| Modify role selection | `pages/LandingPage.tsx` |
| Change user role logic | `context/UserContext.tsx` |
| Modify student wizard flow | `pages/StudentDashboard.tsx` (state management) |
| Change wizard steps | `pages/PersonalDataPage`, `MappingUploadPage`, etc. |
| Modify task list | `pages/TasksPage.tsx` |
| Change task detail view | `pages/TaskDetailPageModern.tsx` |
| Modify AI analysis display | `components/analytics/ModuleCardModern.tsx` |
| Edit discussion feature | `components/common/CommentThread.tsx` |
| Modify API calls | `data/taskManager.ts`, `services/` |
| Change types | `types.ts` |
| Add reusable UI | `components/common/SharedComponents.tsx` |
| Add Radix component | `components/ui/` |
| Modify colors | `styles/tumStyles.ts` |
| Update TUM logo | `assets/tum-logo.svg` |
| Configure build | `vite.config.ts`, `tailwind.config.js` |

## Troubleshooting

- **Port in use**: `npm run dev -- --port 3001`
- **API calls fail**: Check `VITE_API_URL` in `.env`, verify backend running
- **TypeScript errors**: Run `npm run lint`, check `tsconfig.json`
- **State not updating**: Use `setState`, don't mutate; check `useEffect` deps
- **Navigation fails**: Verify route paths match `navigate()` calls

## Best Practices

1. **Type all props/state** with interfaces
2. **Extract logic into hooks** for reuse
3. **Keep components < 300 lines** - split if larger
4. **Handle errors gracefully** - try/catch + user-friendly messages
5. **Use semantic HTML** - `<main>`, `<section>`, `<article>`
6. **Prefer `useMemo`/`useCallback`** for expensive operations
7. **Test manually** with `TestingPage` at `/staff/testing`
