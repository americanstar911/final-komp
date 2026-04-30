import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { ThemeProvider } from './src/context/ThemeContext';
import Navbar from './src/components/Navbar';
import ToastContainer from './src/components/ToastContainer';
import HomePage from './src/pages/HomePage';
import LoginPage from './src/pages/LoginPage';
import RegisterPage from './src/pages/RegisterPage';
import ProductsPage from './src/pages/ProductsPage';
import ProductFormPage from './src/pages/ProductFormPage';
import CartPage from './src/pages/CartPage';
import OrdersPage from './src/pages/OrdersPage';
import AdminPage from './src/pages/AdminPage';
import CategoryFormPage from './src/pages/CategoryFormPage';

const API_BASE = 'http://localhost:3001';

const PRODUCTS_API = `${API_BASE}/products`;
const USERS_API = `${API_BASE}/users`;
const ORDERS_API = `${API_BASE}/orders`;
const CATEGORIES_API = `${API_BASE}/categories`;

function PrivateRoute({ children }) {
    const { user: currentLoggedInUser } = useAuth();

    if (!currentLoggedInUser) return <Navigate to="/login" />;

    return children;
}

function AdminRoute({ children }) {
    const { user: currentLoggedInUser } = useAuth();

    if (!currentLoggedInUser || currentLoggedInUser.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
}

function UserOnlyRoute({ children }) {
    const { user: currentLoggedInUser } = useAuth();

    if (!currentLoggedInUser) return <Navigate to="/login" />;

    if (currentLoggedInUser.role === 'admin') return <Navigate to="/admin" />;

    return children;
}

function NotFoundPage() {
    return (
        <div className="not-found-page">
            <h2>404 - Page Not Found</h2>
            <p>The page you are looking for does not exist.</p>
        </div>
    );
}

function AppContent() {
    return (
        <BrowserRouter>
            <div className="app">
                <Navbar />
                <ToastContainer />
                <main className="app-container">
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/login" element={<LoginPage usersApi={USERS_API} />} />
                        <Route path="/register" element={<RegisterPage usersApi={USERS_API} />} />
                        <Route path="/products" element={
                            <ProductsPage
                                productsApi={PRODUCTS_API}
                                categoriesApi={CATEGORIES_API}
                            />
                        } />

                        <Route path="/cart" element={
                            <UserOnlyRoute>
                                <CartPage ordersApi={ORDERS_API} />
                            </UserOnlyRoute>
                        } />

                        <Route path="/orders" element={
                            <PrivateRoute>
                                <OrdersPage ordersApi={ORDERS_API} />
                            </PrivateRoute>
                        } />

                        <Route path="/admin" element={
                            <AdminRoute>
                                <AdminPage
                                    productsApi={PRODUCTS_API}
                                    usersApi={USERS_API}
                                    ordersApi={ORDERS_API}
                                    categoriesApi={CATEGORIES_API}
                                />
                            </AdminRoute>
                        } />

                        <Route path="/products/new" element={
                            <AdminRoute>
                                <ProductFormPage
                                    productsApi={PRODUCTS_API}
                                    categoriesApi={CATEGORIES_API}
                                />
                            </AdminRoute>
                        } />

                        <Route path="/products/:id/edit" element={
                            <AdminRoute>
                                <ProductFormPage
                                    productsApi={PRODUCTS_API}
                                    categoriesApi={CATEGORIES_API}
                                />
                            </AdminRoute>
                        } />

                        <Route path="/admin/categories/new" element={
                            <AdminRoute>
                                <CategoryFormPage categoriesApi={CATEGORIES_API} />
                            </AdminRoute>
                        } />

                        <Route path="/admin/categories/:id/edit" element={
                            <AdminRoute>
                                <CategoryFormPage categoriesApi={CATEGORIES_API} />
                            </AdminRoute>
                        } />

                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </main>
            </div>
        </BrowserRouter>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <CartProvider>
                    <AppContent />
                </CartProvider>
            </ThemeProvider>
        </AuthProvider>
    );
}
