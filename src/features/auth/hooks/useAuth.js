import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import * as authApi from "../services/authApi";
import toast from "react-hot-toast";

export const useAuth = () => {
    const queryClient = useQueryClient();
    const token = localStorage.getItem("token");

    const {
        data: user,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["user"],
        queryFn: authApi.getProfile,
        retry: false,
        enabled: !!token,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 60,   // 1 hour
    });

    return {
        user,
        isLoading,
        isAuthenticated: !!user,
        role: user?.role,
        error,
    };
};

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.login,
        onSuccess: async (user) => {
            // Set partial data from login response first for immediate feedback
            queryClient.setQueryData(["user"], user);
            // Immediately invalidate to fetch the full profile with institution details
            await queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success(`Welcome back, ${user.name}!`);
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Login failed. Please check your credentials.");
        }
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async () => {
            authApi.logout();
        },
        onSuccess: () => {
            queryClient.setQueryData(["user"], null);
            queryClient.clear();
            toast.success("Logged out successfully");
            navigate("/login", { replace: true });
        },
    });
};

export const useSignup = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.signup,
        onSuccess: async (user) => {
            queryClient.setQueryData(["user"], user);
            await queryClient.invalidateQueries({ queryKey: ["user"] });
            toast.success("Account created successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Signup failed. Please try again.");
        }
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: authApi.forgotPassword,
    });
};

export const useResetPassword = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.resetPassword,
        onSuccess: async (user) => {
            queryClient.setQueryData(["user"], user);
            await queryClient.invalidateQueries({ queryKey: ["user"] });
        },
    });
};

export const useUpdatePassword = () => {
    return useMutation({
        mutationFn: authApi.updateMyPassword,
        onSuccess: () => {
            toast.success("Password updated successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Password update failed.");
        }
    });
};

export const useVerifyEmail = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: authApi.verifyEmail,
        onSuccess: (user) => {
            queryClient.setQueryData(["user"], user);
            toast.success("Email verified successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Verification failed. Please check your code.");
        }
    });
};

export const useResendVerification = () => {
    return useMutation({
        mutationFn: authApi.resendVerification,
        onSuccess: (data) => {
            toast.success(data?.message || "Verification code sent to your email!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to resend verification code.");
        }
    });
};

export const useCancelSignup = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: authApi.cancelSignup,
        onSuccess: () => {
            localStorage.removeItem("token");
            queryClient.setQueryData(["user"], null);
            queryClient.clear();
            toast.success("Registration cancelled successfully.");
            navigate("/", { replace: true });
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to cancel registration.");
        }
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authApi.updateProfile,
        onSuccess: (updatedUser) => {
            queryClient.setQueryData(["user"], updatedUser);
            toast.success("Profile updated successfully!");
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || "Failed to update profile.");
        }
    });
};
