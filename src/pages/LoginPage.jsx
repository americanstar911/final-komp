import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';
import api from '../api/api';

export default function LoginPage() {
    const [emailInputValue, setEmailInputValue] = useState('');
    const [passwordInputValue, setPasswordInputValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const { loginUser } = useAuth();
    const dispatchReduxAction = useAppDispatch();
    const navigateToRoute = useNavigate();

    const handleLoginFormSubmit = async (formSubmitEvent) => {
        formSubmitEvent.preventDefault();

        setErrorMessage('');
        setIsLoggingIn(true);

        try {
            const response = await api.post('/auth/login', {
                email: emailInputValue,
                password: passwordInputValue,
            });

            const { token, user } = response.data;
            loginUser(user, token);

            if (String(user.role).toLowerCase() === 'admin') {
                navigateToRoute('/admin');
            } else {
                navigateToRoute('/products');
            }
        } catch (networkError) {
            setErrorMessage('Login failed');
            dispatchReduxAction(
                addNotification({ message: 'Login failed: wrong email or password', type: 'error' })
            );
        }

        setIsLoggingIn(false);
    };

    return (
        <div className="auth-page">
            <h2>Login</h2>
            {errorMessage && <p className="auth-error">{errorMessage}</p>}
            <form onSubmit={handleLoginFormSubmit}>
                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        value={emailInputValue}
                        onChange={(event) => setEmailInputValue(event.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={passwordInputValue}
                        onChange={(event) => setPasswordInputValue(event.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-add" disabled={isLoggingIn}>
                    {isLoggingIn ? 'Loading...' : 'Login'}
                </button>
            </form>
            <p className="auth-switch">
                Don&apos;t have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}
