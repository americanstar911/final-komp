import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';

export default function LoginPage({ usersApi }) {
    const [emailInputValue, setEmailInputValue] = useState('');

    const [passwordInputValue, setPasswordInputValue] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const { loginUser } = useAuth();

    const dispatchReduxAction = useAppDispatch();

    const navigateToRoute = useNavigate();

    const handleEmailInputChange = (inputChangeEvent) => {
        setEmailInputValue(inputChangeEvent.target.value);
    };

    const handlePasswordInputChange = (inputChangeEvent) => {
        setPasswordInputValue(inputChangeEvent.target.value);
    };

    const handleLoginFormSubmit = async (formSubmitEvent) => {
        formSubmitEvent.preventDefault();

        setErrorMessage('');
        setIsLoggingIn(true);

        try {
            const usersByEmailResponse = await fetch(`${usersApi}?email=${emailInputValue}`);

            const matchingUsersList = await usersByEmailResponse.json();

            if (matchingUsersList.length === 0) {
                setErrorMessage('User not found');
                dispatchReduxAction(
                    addNotification({ message: 'Login failed: User not found', type: 'error' })
                );
                setIsLoggingIn(false);
                return;
            }

            const foundUserRecord = matchingUsersList[0];

            const passwordMatchesHash = await bcrypt.compare(
                passwordInputValue,
                foundUserRecord.password_hash
            );

            if (!passwordMatchesHash) {
                setErrorMessage('Wrong password');
                dispatchReduxAction(
                    addNotification({ message: 'Login failed: Wrong password', type: 'error' })
                );
                setIsLoggingIn(false);
                return;
            }

            const safeUserObjectForSession = {
                id: foundUserRecord.id,
                full_name: foundUserRecord.full_name,
                email: foundUserRecord.email,
                role: foundUserRecord.role,
            };

            loginUser(safeUserObjectForSession);

            if (safeUserObjectForSession.role === 'admin') {
                navigateToRoute('/admin');
            } else {
                navigateToRoute('/products');
            }
        } catch (networkError) {
            setErrorMessage('Login failed');
            dispatchReduxAction(
                addNotification({ message: 'Login failed: Network error', type: 'error' })
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
                        onChange={handleEmailInputChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input
                        type="password"
                        value={passwordInputValue}
                        onChange={handlePasswordInputChange}
                        required
                    />
                </div>
                <button type="submit" className="btn-add" disabled={isLoggingIn}>
                    {isLoggingIn ? 'Loading...' : 'Login'}
                </button>
            </form>
            <p className="auth-switch">
                Don't have an account? <Link to="/register">Register</Link>
            </p>
        </div>
    );
}
