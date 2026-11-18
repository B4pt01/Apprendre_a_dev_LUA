import { Navigate, Route, Routes } from 'react-router-dom'
import { Shell } from './components/Shell'
import ComparePage from './pages/ComparePage'
import GlossaryPage from './pages/GlossaryPage'
import Home from './pages/Home'
import LessonPage from './pages/LessonPage'
import MemosPage from './pages/MemosPage'
import NotFound from './pages/NotFound'
import Parcours from './pages/Parcours'
import PlaygroundPage from './pages/PlaygroundPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route path="/" element={<Home />} />
        <Route path="/parcours" element={<Parcours />} />
        <Route path="/parcours/:trackId" element={<Parcours />} />
        <Route path="/lecon/:slug" element={<LessonPage />} />
        <Route path="/glossaire" element={<GlossaryPage />} />
        <Route path="/memos" element={<MemosPage />} />
        <Route path="/memos/:id" element={<MemosPage />} />
        <Route path="/playground" element={<PlaygroundPage />} />
        <Route path="/comparaison" element={<ComparePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
