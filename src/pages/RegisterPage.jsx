import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { useAuth } from '../context/AuthContext';
import { useAppDispatch } from '../store';
import { addNotification } from '../store/notificationSlice';

export default function RegisterPage({ usersApi }) {
    const [fullNameInputValue, setFullNameInputValue] = useState('');
    const [emailInputValue, setEmailInputValue] = useState('');
    const [passwordInputValue, setPasswordInputValue] = useState('');

    const [errorMessage, setErrorMessage] = useState('');

    const [isRegisteringNewUser, setIsRegisteringNewUser] = useState(false);

    const { loginUser } = useAuth();

    const dispatchReduxAction = useAppDispatch();

    const navigateToRoute = useNavigate();

    const handleFullNameInputChange = (inputChangeEvent) => {
        setFullNameInputValue(inputChangeEvent.target.value);
    };

    const handleEmailInputChange = (inputChangeEvent) => {
        setEmailInputValue(inputChangeEvent.target.value);
    };

    const handlePasswordInputChange = (inputChangeEvent) => {
        setPasswordInputValue(inputChangeEvent.target.value);
    };

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
            const emailCheckResponse = await fetch(`${usersApi}?email=${emailInputValue}`);
            const usersAlreadyUsingThisEmail = await emailCheckResponse.json();

            if (usersAlreadyUsingThisEmail.length > 0) {
                setErrorMessage('Email already registered');
                dispatchReduxAction(
                    addNotification({
                        message: 'Registration failed: Email already registered',
                        type: 'error',
                    })
                );
                setIsRegisteringNewUser(false);
                return;
            }

            const bcryptPasswordHash = await bcrypt.hash(passwordInputValue, 10);

            const newUserPayload = {
                full_name: fullNameInputValue,
                email: emailInputValue,
                password_hash: bcryptPasswordHash,
                role: 'user',
            };

            const createUserResponse = await fetch(usersApi, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUserPayload),
            });
            const createdUserRecord = await createUserResponse.json();

            const safeUserObjectForSession = {
                id: createdUserRecord.id,
                full_name: createdUserRecord.full_name,
                email: createdUserRecord.email,
                role: createdUserRecord.role,
            };

            dispatchReduxAction(
                addNotification({
                    message: `Account created! Welcome, ${safeUserObjectForSession.full_name}!`,
                    type: 'success',
                })
            );

            loginUser(safeUserObjectForSession);

            navigateToRoute('/products');
        } catch (networkError) {
            setErrorMessage('Registration failed');
            dispatchReduxAction(
                addNotification({
                    message: 'Registration failed: Network error',
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
                        onChange={handleFullNameInputChange}
                        required
                    />
                </div>
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
                <button type="submit" className="btn-add" disabled={isRegisteringNewUser}>
                    {isRegisteringNewUser ? 'Loading...' : 'Register'}
                </button>
            </form>
            <p className="auth-switch">
                Already have an account? <Link to="/login">Login</Link>
            </p>
        </div>
    );
}
