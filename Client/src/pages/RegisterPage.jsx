import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import './RegisterPage.css'
import logo3 from '../assets/logo3.png';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setformData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false); 

    const handleChange = (e) => {
        setformData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match. Please check the password you have typed.');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            return;
        }

        setLoading(true);

        try {
            const userData = {
                name: `${formData.firstName} ${formData.lastName}`.trim(),
                email: formData.email,
                password: formData.password,
            };

            await axios.post('https://routely-website-backend.onrender.com/api/users/register', userData);

            setLoading(false);
            setSuccess('Successfully registered! Redirecting to login...');
            
           
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <>
            <img src={logo3} alt="Routely Logo" className="logo1" onClick={() => navigate('/')} />
            <div className="register-container">
                <form className="register-form" onSubmit={handleSubmit}>
                    <h2>Create Your Account</h2>
                    <p>Find the best ride, every time.</p>

                    {error && <div className="error-message">{error}</div>}
                    {success && <div className="success-message">{success}</div>}

                    <div className="form-group-inline">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label htmlFor="middleName">Middle Name (Optional)</label>
                            <input type="text" id="middleName" name="middleName" value={formData.middleName} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Re-type Password</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Registering...' : 'Register'}
                    </button>

                    <p className="login-link">
                        Already have an account? <Link to="/login">Log In</Link>
                    </p>
                </form>
            </div>
        </>
    );
};

export default Register;
