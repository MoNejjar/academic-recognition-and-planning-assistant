# Frontend Developer Guide

## Overview

React + TypeScript + Vite application with dual interfaces:
1. **Student Portal** (`/student/*`): 4-step submission wizard (personal data → mapping upload → content entry → review/submit)
2. **Staff Dashboard** (`/staff/*`): Task list + detail view with AI analytics

**Stack**: React 18.3 | Vite 5.4 | TypeScript 5.6 | React Router 6.30 | Tailwind CSS 3.4 | Radix UI

## Architecture

### State Management
- **No Redux/Zustand** - uses React's built-in state
- **Local state** (`useState`) for most components
- **Lifted state** in `StudentDashboard` manages wizard flow
- **Context** (`CourseMatchingContext`) exists but minimally used

### Routing
Nested routing with React Router 6:
```
/ (LandingPage)
/student/* (StudentDashboard)
  /student/ (PersonalDataPage)
  /student/mapping (MappingUploadPage)
  /student/catalogue (CatalogueUploadPage)
  /student/review (FinalReviewPage)
/staff/* (Layout with sidebar)
  /staff/tasks (TasksPage)
  /staff/tasks/:id (TaskDetailPage)
  /staff/testing (TestingPage)
```

## Directory Structure

**`src/`**
- **`main.tsx`** - Vite entry
- **`App.tsx`** - Root router (LandingPage, StudentDashboard, StaffDashboard w/ Layout)
- **`types.ts`** - Shared TypeScript interfaces (PersonalData, TUMModuleMapping, SourceCourse)

**Pages**:
- **`pages/`**
  - Student: `StudentDashboard.tsx` (router + state), `PersonalDataPage`, `MappingUploadPage`, `CatalogueUploadPage`, `FinalReviewPage`
  - Staff: `StaffDashboard.tsx` (router), `TasksPage` (list), `TaskDetailPage`, `AnalyticsPage`, `KanbanPage`, `TestingPage`
  - `LandingPage.tsx` (home)

**Components**:
- **`components/`**
  - `layout/` - Layout (staff sidebar), SideMenuLayout
  - `SideMenu.tsx` - Student wizard navigation
  - `HealthCheck.tsx` - Backend health indicator
  - `common/` - Shared UI (Button, Card, Input, etc.)
  - `chatbot/` - FloatingChat, ChatWindow
  - `analytics/` - AnalyticsDashboard, LearningOutcomeCard
  - `course-matching/`, `reporting/`, `ui/` (Radix wrappers)

**Services & Data**:
- **`services/`** - API calls (analyticsApi.ts, chatbot/, courseMatching/, reporting/)
- **`data/`** - taskManager.ts (fetch + localStorage), mockAnalyticsData, mockTUMModules
- **`context/`** - CourseMatchingContext (mostly unused)
- **`hooks/`** - useChat.ts
- **`utils/`** - caseConversion.ts (snake↔camel), debug.ts
- **`styles/`** - tumStyles.ts (color constants)
- **`constants/`** - App constants


## Core Workflows

### Student Submission
```
StudentDashboard mounts
  ↓
PersonalDataPage → setPersonalData() → navigate('/student/mapping')
  ↓
MappingUploadPage → Upload PDF → POST /api/course-matching/extract-mapping → setTumModules() → navigate('/student/catalogue')
  ↓
CatalogueUploadPage → Fetch TUM content → Edit courses → onContentConfirmed() → navigate('/student/review')
  ↓
FinalReviewPage → Display all → Submit → POST /api/submissions/submit → Success → navigate('/student')
```

### Staff Task Management
```
TasksPage → useEffect(loadTasks) → GET /api/tasks/tasks → Display list + filters (client-side)
  ↓
Click task → navigate(`/staff/tasks/${taskId}`)
  ↓
TaskDetailPage → useEffect(loadTaskDetail) → GET /api/tasks/{id} → Display analytics
  ↓
Approve/Reject → PATCH /api/tasks/{id}/status → Update → Navigate back
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
| Modify student wizard flow | `pages/StudentDashboard.tsx` (state management) |
| Change wizard steps | `pages/PersonalDataPage`, `MappingUploadPage`, etc. |
| Modify task list | `pages/TasksPage.tsx` |
| Change task detail view | `pages/TaskDetailPage.tsx` |
| Add analytics visualization | `components/analytics/` |
| Modify API calls | `data/taskManager.ts`, `services/` |
| Change types | `types.ts` |
| Add UI component | `components/common/` or `components/ui/` |
| Modify colors | `styles/tumStyles.ts` |
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
