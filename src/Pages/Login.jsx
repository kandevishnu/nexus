import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, getDefaultRoute } from '../routes/AuthContext'; // Adjust path if needed

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { setAuth } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log("--- 1. Login Started ---");
        setError('');
        setIsLoading(true);

        try {
            console.log("--- 2. Sending Fetch Request ---");
            // 1. Call the Login Endpoint
            const response = await fetch('/api/token/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: username, password }), 
            });

            console.log("--- 3. Fetch Response Received. Status:", response.status);

            if (!response.ok) {
                console.log("--- 3a. Response was not OK ---");
                throw new Error('Invalid Username or Password');
            }

            console.log("--- 4. Parsing JSON ---");
            const data = await response.json();
            console.log("--- 5. JSON Parsed:", data);

            // 2. Save tokens
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);

            const userRole = data.role ? data.role.toLowerCase() : null;
            console.log("--- 6. Role determined:", userRole);

            // 3. Update Auth Context
            console.log("--- 7. Updating Auth Context ---");
            setAuth({
                isAuthenticated: true,
                role: userRole,
                user: { username: username, ...data.user }, 
                loading: false,
            });

            // 4. Navigate
            const targetRoute = getDefaultRoute(userRole);
            console.log("--- 8. Navigating to:", targetRoute);
            navigate(targetRoute);

        } catch (err) {
            console.error("--- ERROR CAUGHT ---", err);
            setError(err.message || 'Something went wrong');
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
        } finally {
            console.log("--- 9. Finally Block Executed (Stopping Loader) ---");
            setIsLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Nexus Login</h2>
                
                {error && <div style={styles.error}>{error}</div>}
                
                <form onSubmit={handleLogin} style={styles.form}>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Username / Email</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Enter your ID"
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={styles.input}
                            placeholder="Enter your password"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        style={isLoading ? { ...styles.button, ...styles.buttonDisabled } : styles.button}
                    >
                        {isLoading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// Styles
const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f4f6f8',
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        padding: '2rem',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    title: {
        textAlign: 'center',
        marginBottom: '1.5rem',
        color: '#333',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    inputGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    label: {
        fontSize: '0.9rem',
        color: '#666',
        fontWeight: 'bold',
    },
    input: {
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '4px',
        fontSize: '1rem',
    },
    button: {
        marginTop: '1rem',
        padding: '0.75rem',
        backgroundColor: '#007bff',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
    },
    buttonDisabled: {
        backgroundColor: '#a0cfff',
        cursor: 'not-allowed',
    },
    error: {
        backgroundColor: '#ffebee',
        color: '#c62828',
        padding: '0.75rem',
        borderRadius: '4px',
        marginBottom: '1rem',
        textAlign: 'center',
        fontSize: '0.9rem',
    }
};

export default LoginPage;