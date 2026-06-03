import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMail, FiLock, FiArrowRight, FiLoader, FiBriefcase, FiEye, FiEyeOff } from "react-icons/fi";
import { useSignup } from "../hooks/useAuth";
import toast from "react-hot-toast";
import api from "../../../lib/api";
import { useState } from "react";

const Register = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();

  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const signupMutation = useSignup();
  const navigate = useNavigate();
  const password = watch("password", "");

  const onSubmit = async (data) => {
    try {
      const payload = {
        name: data.fullName,
        email: data.email,
        password: data.password,
        passwordConfirm: data.confirmPassword,
        institutionCode: data.institutionCode,
      };

      await signupMutation.mutateAsync(payload);
      toast.success(
        "Account created successfully! Please verify your email.",
      );
      navigate("/verify-email");
    } catch (err) {
      console.error("Registration failed:", err);
      toast.error(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Create Your Account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Start your membership journey today
        </p>
      </div>

      <form
        className="space-y-4 bg-white p-8 rounded-xl shadow-sm border border-gray-100"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Your Institution
            </label>
            <div className="relative group">
              <FiBriefcase className="absolute left-3 top-3.5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="Search your cooperative name..."
                autoComplete="off"
                className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.institutionCode ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                onChange={async (e) => {
                  const val = e.target.value;
                  setSearchTerm(val);
                  if (val.length > 1) {
                    try {
                      const res = await api.get(`/institutions/public?query=${val}`);
                      setSuggestions(res.data.data.institutions);
                      setShowSuggestions(true);
                    } catch (err) {
                      console.error("Search failed:", err);
                    }
                  } else {
                    setSuggestions([]);
                  }
                }}
                value={searchTerm}
              />

              {/* Hidden input for react-hook-form */}
              <input
                type="hidden"
                {...register("institutionCode", { required: "Please select an institution from the list" })}
              />

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                  {suggestions.map((inst) => (
                    <div
                      key={inst.id}
                      className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex justify-between items-center group/item transition-colors"
                      onClick={() => {
                        setSearchTerm(inst.name);
                        setValue("institutionCode", inst.code);
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                    >
                      <div>
                        <p className="text-sm font-bold text-gray-800 group-hover/item:text-blue-700">{inst.name}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{inst.code}</p>
                      </div>
                      <FiArrowRight className="text-gray-300 group-hover/item:text-blue-500 group-hover/item:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {errors.institutionCode && (
              <p className="text-xs text-red-600 mt-1 font-bold">
                {errors.institutionCode.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3.5 text-gray-400" />
              <input
                {...register("fullName", {
                  required: "Full Name is required",
                })}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none"
                placeholder="e.g. John Doe"
              />
            </div>
            {errors.fullName && (
              <p className="text-xs text-red-600 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3.5 text-gray-400" />
              <input
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                })}
                type="email"
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none"
                placeholder="you@example.com"
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                {...register("password", {
                  required: "Required",
                  minLength: { value: 6, message: "Min 6 chars" },
                })}
                type={showPassword ? "text" : "password"}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none"
                placeholder="••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-3.5 text-gray-400" />
              <input
                {...register("confirmPassword", {
                  required: "Required",
                  validate: (value) => value === password || "Match failed",
                })}
                type={showConfirmPassword ? "text" : "password"}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 outline-none"
                placeholder="••••••"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-600 mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={signupMutation.isPending}
            className="w-full flex items-center justify-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold transition-all shadow-md disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {signupMutation.isPending ? (
              <FiLoader className="animate-spin" />
            ) : (
              <>
                Create Account <FiArrowRight className="ml-2" />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm">
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-bold text-blue-600 hover:text-blue-500 hover:underline transition-all"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
