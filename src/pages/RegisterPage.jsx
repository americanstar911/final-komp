import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';
import api from '../api/api';

export default function RegisterPage() {
    const [fullNameInputValue, setFullNameInputValue] = useState('');
    const [emailInputValue, setEmailInputValue] = useState('');
    const [passwordInputValue, setPasswordInputValue] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isRegisteringNewUser, setIsRegisteringNewUser] = useState(false);

    const { loginUser } = useAuth();
    const dispatchReduxAction = useAppDispatch();
    const navigateToRoute = useNavigate();

    const handleRegisterFormSubmit = async (formSubmitEvent) => {
        formSubmitEvent.preventDefault();

        setErrorMessage('');

        if (passwordInputValue.length < 6) {
            const validationMessage = 'Password must be at least 6 characters';
            setErrorMessage(validationMessage);
            dispatchReduxAction(
                addNotification({
                    message: `Registration failed: ${validationMessage}`,
                    type: 'error',
                })
            );
            return;
        }

        setIsRegisteringNewUser(true);

        try {
            const response = await api.post('/auth/register', {
                fullName: fullNameInputValue,
                email: emailInputValue,
                password: passwordInputValue,
                role: 'USER',
            });

            const { token, user } = response.data;

            dispatchReduxAction(
                addNotification({
                    message: `Account created! Welcome, ${user.fullName || user.full_name}!`,
                    type: 'success',
                })
            );

            loginUser(user, token);
            navigateToRoute('/products');
        } catch (networkError) {
            setErrorMessage('Registration failed');
            dispatchReduxAction(
                addNotification({
                    message: networkError.response?.data?.message || 'Registration failed',
                    type: 'error',
                })
            );
        }

        setIsRegisteringNewUser(false);
    };

    return (
        <div className="auth-page">
            <h2>Create Account</h2>
            {errorMessage && <p className="auth-error">{errorMessage}</p>}
            <form onSubmit={handleRegisterFormSubmit}>
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        value={fullNameInputValue}
                        onChange={(event) => setFullNameInputValue(event.target.value)}
                        required
                    />
                </div>
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
                <button type="submit" className="btn-add" disabled={isRegisteringNewUser}>
                    {isRegisteringNewUser ? 'Creating...' : 'Register'}
                </button>
            </form>
            <p className="auth-switch">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}
