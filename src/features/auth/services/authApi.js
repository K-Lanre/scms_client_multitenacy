import api from '../../../lib/api';

/**
 * Auth API service
 * All calls go to /auth/* endpoints.
 */

export const login = async ({ email, password }) => {

    const { data } = await api.post('/auth/login', { email, password });

    // Persist token so the interceptor can attach it going forward
    localStorage.setItem('token', data.token);
    return data.data.user;
};

export const signup = async (formData) => {
    const { data } = await api.post('/auth/signup', formData);
    localStorage.setItem('token', data.token);
    return data.data.user;
};

export const logout = () => {
    localStorage.removeItem('token');
};

export const forgotPassword = async (email) => {
    const { data } = await api.post('/auth/forgotPassword', { email });
    return data;
};

export const resetPassword = async ({ token, password, passwordConfirm }) => {
    const { data } = await api.patch(`/auth/resetPassword/${token}`, {
        password,
        passwordConfirm,
    });
    localStorage.setItem('token', data.token);
    return data.data.user;
};

export const updateMyPassword = async ({ passwordCurrent, password, passwordConfirm }) => {
    const { data } = await api.patch('/auth/updateMyPassword', {
        passwordCurrent,
        password,
        passwordConfirm,
    });
    localStorage.setItem('token', data.token);
    return data.data.user;
};

export const getProfile = async () => {
    const { data } = await api.get('/auth/profile');
    return data.data.user;
};

export const verifyEmail = async (token) => {
    const { data } = await api.post('/auth/verify-email', { token });
    return data.data.user;
};

export const resendVerification = async () => {
    const { data } = await api.post('/auth/resend-verification');
    return data;
};

export const cancelSignup = async () => {
    const { data } = await api.post('/auth/cancel-signup');
    return data;
};

export const updateProfile = async (formData) => {
    const { data } = await api.patch('/auth/update-profile', formData);
    return data.data.user;
};
