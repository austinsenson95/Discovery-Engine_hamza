import { Routes, Route } from 'react-router'
import Layout from './components/Layout'
import Home from './pages/Home'
import Blueprint from './pages/Blueprint'
import Journey from './pages/Journey'
import Profile from './pages/Profile'
import Credits from './pages/Credits'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import AuthGuard from './components/AuthGuard'
import { AuthProvider } from './context/AuthContext'
import { UserProvider } from './context/UserContext'

export default function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route element={<AuthGuard><Layout /></AuthGuard>}>
            <Route path="/" element={<Home />} />
            <Route path="/blueprint" element={<Blueprint />} />
            <Route path="/journey" element={<Journey />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </UserProvider>
    </AuthProvider>
  )
}
