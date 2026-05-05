import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { addNotification } from '../store/notificationSlice';
import { setAllItems, selectCartItems } from '../store/cartSlice';

const AuthContext = createContext();

function normalizeUser(userObjectOrNull) {
    if (!userObjectOrNull) return null;

    return {
        id: userObjectOrNull.id,
        full_name: userObjectOrNull.fullName || userObjectOrNull.full_name,
        email: userObjectOrNull.email,
        role: String(userObjectOrNull.role || 'user').toLowerCase(),
    };
}

function buildCartStorageKeyForUser(userObjectOrNull) {
    if (!userObjectOrNull) return 'cart:guest';

    return `cart:${userObjectOrNull.id}`;
}

function readSavedCartFromStorage(cartStorageKey) {
    try {
        const savedCartJsonString = localStorage.getItem(cartStorageKey);

        if (!savedCartJsonString) return [];

        const parsedCartArray = JSON.parse(savedCartJsonString);

        return Array.isArray(parsedCartArray) ? parsedCartArray : [];
    } catch (storageParseError) {
        return [];
    }
}

export function AuthProvider({ children }) {
    const dispatchReduxAction = useAppDispatch();

    const currentCartItemsLiveSnapshot = useAppSelector(selectCartItems);

    const [currentLoggedInUser, setCurrentLoggedInUser] = useState(() => {
        const savedUserJson = localStorage.getItem('user');

        if (savedUserJson) return normalizeUser(JSON.parse(savedUserJson));

        return null;
    });

    const hasRestoredInitialCartRef = useRef(false);

    useEffect(() => {
        if (hasRestoredInitialCartRef.current) return;

        hasRestoredInitialCartRef.current = true;

        const initialCartStorageKey = buildCartStorageKeyForUser(currentLoggedInUser);

        const initiallySavedCartItems = readSavedCartFromStorage(initialCartStorageKey);

        dispatchReduxAction(setAllItems(initiallySavedCartItems));
    }, [currentLoggedInUser, dispatchReduxAction]);

    const hasMountedForAutoSaveRef = useRef(false);

    useEffect(() => {
        if (!hasMountedForAutoSaveRef.current) {
            hasMountedForAutoSaveRef.current = true;
            return;
        }

        const activeCartStorageKey = buildCartStorageKeyForUser(currentLoggedInUser);
        localStorage.setItem(
            activeCartStorageKey,
            JSON.stringify(currentCartItemsLiveSnapshot)
        );
    }, [currentCartItemsLiveSnapshot, currentLoggedInUser]);

    const loginUser = (userDataToStore, tokenToStore) => {
        const safeUserObjectForSession = normalizeUser(userDataToStore);

        const previousOwnerCartKey = buildCartStorageKeyForUser(currentLoggedInUser);
        localStorage.setItem(
            previousOwnerCartKey,
            JSON.stringify(currentCartItemsLiveSnapshot)
        );

        const incomingUserCartKey = buildCartStorageKeyForUser(safeUserObjectForSession);
        const incomingUserSavedCartItems = readSavedCartFromStorage(incomingUserCartKey);

        dispatchReduxAction(setAllItems(incomingUserSavedCartItems));

        setCurrentLoggedInUser(safeUserObjectForSession);

        localStorage.setItem('user', JSON.stringify(safeUserObjectForSession));
        localStorage.setItem('token', tokenToStore);

        dispatchReduxAction(
            addNotification({
                message: `Welcome back, ${safeUserObjectForSession.full_name}!`,
                type: 'success',
            })
        );
    };

    const logoutCurrentUser = () => {
        const leavingUserCartKey = buildCartStorageKeyForUser(currentLoggedInUser);
        localStorage.setItem(
            leavingUserCartKey,
            JSON.stringify(currentCartItemsLiveSnapshot)
        );

        dispatchReduxAction(setAllItems([]));

        setCurrentLoggedInUser(null);

        localStorage.removeItem('user');
        localStorage.removeItem('token');

        dispatchReduxAction(
            addNotification({
                message: 'You have been logged out.',
                type: 'info',
            })
        );
    };

    return (
        <AuthContext.Provider
            value={{
                user: currentLoggedInUser,
                loginUser,
                logout: logoutCurrentUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
