import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import AuthProvider from './context/auth';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home'

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route exact path='/register' element={<Register />} />
          <Route exact path='/login' element={<Login />} />
          <Route exact path='/' element={<PrivateRoute />}>
            <Route exact path='/' element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
