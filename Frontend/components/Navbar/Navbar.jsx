import { useState } from 'react';
import { BiMenu, BiX, BiUser, BiHome, BiBook, BiEnvelope, BiCog, BiCalendar, BiNews } from 'react-icons/bi';
import { useNavigate, Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({ isLoggedIn, onLogout, userRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavbar_3050 = () => {
    setIsOpen(!isOpen);
  };

  const handleLoginClick_3050 = () => {
    navigate('/login');
  };

  const handleLogoutClick_3050 = () => {
    onLogout();
    navigate('/');
  };

  const handleProfileClick_3050 = () => {
    navigate('/profile');
  };

  const handleAdminClick_3050 = () => {
    navigate('/admin/dashboard');
  };

  const scrollToSection_3050 = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <header id="home_3050">
      <h1>SCAN</h1>
      <div className={`navbar-container_3050 ${isOpen ? 'active_3050' : ''}`}>
        <BiX className="navbar-close-icon_3050" onClick={handleNavbar_3050} />
        <nav className="nav-links_3050">
          <ul className="link-style_3050">
            <li>
              <Link 
                to="/" 
                onClick={() => window.scrollTo(0, 0)}
              >
                <BiHome className="nav-icon_3050" /> Home
              </Link>
            </li>
            <li>
              <Link 
                to="/" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  setTimeout(() => {
                    const element = document.getElementById('about');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >
                <BiBook className="nav-icon_3050" /> About
              </Link>
            </li>
            <li>
              <Link 
                to="/" 
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/');
                  setTimeout(() => {
                    const element = document.getElementById('contact');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  }, 100);
                }}
              >
                <BiEnvelope className="nav-icon_3050" /> Contact
              </Link>
            </li>
            {isLoggedIn && userRole === 'no' && (
              <>
                <li>
                  <Link to="/events">
                    <BiCalendar className="nav-icon_3050" /> Events
                  </Link>
                </li>
                <li>
                  <Link to="/notices">
                    <BiNews className="nav-icon_3050" /> Notices
                  </Link>
                </li>
                <li>
                  <Link to="/profile" onClick={handleProfileClick_3050}>
                    <BiUser className="profile-icon_3050" /> Profile
                  </Link>
                </li>
              </>
            )}
            {isLoggedIn && userRole === 'yes' && (
              <li>
                <Link to="/admin/dashboard" onClick={handleAdminClick_3050}>
                  <BiCog className="profile-icon_3050" /> Admin
                </Link>
              </li>
            )}
          </ul>
        </nav>
        {isLoggedIn ? (
          <button className="logout-btn_3050" onClick={handleLogoutClick_3050}>
            Log Out
          </button>
        ) : (
          <button className="login-btn_3050" onClick={handleLoginClick_3050}>
            Log In
          </button>
        )}
      </div>
      <BiMenu className="navbar-menu-icon_3050" onClick={handleNavbar_3050} />
    </header>
  );
};

export default Navbar;