import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css';
import logo7 from '../assets/logo3.png';

const LoginPage = () => {   
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
        const response = await axios.post('https://routely-website-backend.onrender.com/api/users/login', formData);

        
        if (response.status === 200) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user)); 
            
            setLoading(false);
            navigate('/home');
        }

    } catch (err) {
        setLoading(false);
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
};

    return (
        <>
            <img
                src={logo7}
                alt="Routely Logo"
                className="logo7"
                onClick={() => navigate('/')}
            />
            <div className="login-container">
                <form className="login-form" onSubmit={handleSubmit}>
                    <h2>Welcome Back!</h2>
                    <p>Log in to find your next ride.</p>

                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Logging In...' : 'Log In'}
                    </button>

                    <p className="register-link">
                        Don't have an account? <Link to="/register">Sign Up</Link>
                    </p>
                </form>
            </div>
        </>
    );
};

export default LoginPage;