import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blueprint from './pages/Blueprint'
import Journey from './pages/Journey'
import Profile from './pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blueprint" element={<Blueprint />} />
        <Route path="/journey" element={<Journey />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
