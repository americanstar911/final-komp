// =====================================================================
// ФАЙЛ: src/components/Navbar.jsx
// НАХОДИТСЯ: в папке src/components/ (переиспользуемые компоненты)
// ЗАЧЕМ НУЖЕН: это ВЕРХНЯЯ НАВИГАЦИОННАЯ ПАНЕЛЬ, которая показывается
//   на каждой странице приложения (её <Navbar /> вставлен в AppContent в App.jsx).
//
// ЧТО ОСОБЕННОГО:
//   Navbar показывает РАЗНЫЕ ссылки в зависимости от роли пользователя:
//     — Гость (не залогинен): Login, Register
//     — Обычный юзер: Cart, Orders, Logout
//     — Админ: Admin, Logout (Cart и Orders для админа НЕ показываются,
//       потому что админ не покупает)
//   Это называется "role-based rendering" — условный рендер по роли.
//   Требование Week 13 — Requirement 2.
// =====================================================================

// Link — это "умная" ссылка из react-router-dom. Она работает как <a href>,
// но НЕ перезагружает страницу — вместо этого меняет URL и React Router
// подменяет компонент внутри <Routes>. Это и есть SPA-навигация.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAppSelector } from '../store';
import { selectCartCount } from '../store/cartSlice';
import ConfirmModal from './ConfirmModal';

// -------------------------------------------------------------------
// САМ КОМПОНЕНТ NAVBAR
// -------------------------------------------------------------------

export default function Navbar() {
    const { user: currentLoggedInUser, logout: logoutCurrentUser } = useAuth();
    const { theme: currentActiveTheme, toggleTheme: toggleLightDarkTheme } = useTheme();
    const totalCartUnitCount = useAppSelector(selectCartCount);

    const visitorIsAdmin = currentLoggedInUser && currentLoggedInUser.role === 'admin';
    const visitorIsRegularUser = currentLoggedInUser && currentLoggedInUser.role !== 'admin';

    // State для модалки подтверждения логаута
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Открываем модалку вместо сразу логаута
    const handleLogoutButtonClick = () => {
        setIsLogoutModalOpen(true);
    };

    // Пользователь подтвердил — логаутим
    const handleConfirmLogout = () => {
        setIsLogoutModalOpen(false);
        logoutCurrentUser();
    };

    // Пользователь передумал — закрываем модалку
    const handleCancelLogout = () => {
        setIsLogoutModalOpen(false);
    };

    const handleThemeToggleButtonClick = () => {
        toggleLightDarkTheme();
    };

    return (
        <header className="topbar">
            <div className="container-wide">
                <nav className="nav-min">

                    {/* ЛЕВАЯ ЧАСТЬ — только Products, без категорий */}
                    <div className="nav-left">
                        <Link to="/products">Products</Link>
                    </div>

                    {/* ЦЕНТР — логотип */}
                    <div className="brand">
                        <Link to="/">
                            <span className="brand-main">Shop.</span>
                            <span className="brand-sub">Collection</span>
                        </Link>
                    </div>

                    {/* ПРАВАЯ ЧАСТЬ — по роли */}
                    <div className="nav-right">
                        {visitorIsRegularUser && (
                            <>
                                <Link to="/cart">
                                    Cart {totalCartUnitCount > 0 ? `(${totalCartUnitCount})` : ''}
                                </Link>
                                <Link to="/orders">Orders</Link>
                                <button onClick={handleLogoutButtonClick} className="nav-btn">
                                    Logout
                                </button>
                            </>
                        )}

                        {visitorIsAdmin && (
                            <>
                                <Link to="/admin">Admin</Link>
                                <button onClick={handleLogoutButtonClick} className="nav-btn">
                                    Logout
                                </button>
                            </>
                        )}

                        {!currentLoggedInUser && (
                            <>
                                <Link to="/login">Login</Link>
                                <Link to="/register">Register</Link>
                            </>
                        )}

                        <button onClick={handleThemeToggleButtonClick} className="nav-btn">
                            {currentActiveTheme === 'light' ? 'Dark' : 'Light'}
                        </button>
                    </div>
                </nav>
            </div>

            {/* Модалка подтверждения выхода */}
            <ConfirmModal
                isOpen={isLogoutModalOpen}
                message="Are you sure you want to log out?"
                onConfirm={handleConfirmLogout}
                onCancel={handleCancelLogout}
            />
        </header>
    );
}
