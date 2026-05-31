import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blueprint from './pages/Blueprint'
import Journey from './pages/Journey'
import Profile from './pages/Profile'
import Credits from './pages/Credits'
import { UserProvider } from './context/UserContext'

export default function App() {
  return (
    <UserProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/blueprint" element={<Blueprint />} />
          <Route path="/journey" element={<Journey />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </UserProvider>
  )
}
