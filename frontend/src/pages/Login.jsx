import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../config/axios.js";
import { UserContext } from "../context/user.context.jsx";

// 👉 OAuth Icons
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // Forgot password states
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [mailSent, setMailSent] = useState(false);

    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/users/login", {
                email,
                password,
            });

            setUser(response.data.user);
            navigate("/");
        } catch (error) {
            if (error.response?.data?.errors) {
                alert(error.response.data.errors);
            }
            console.error("❌ Login failed:", error);
        }
    };

    // 👉 OAuth redirect handlers
    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/users/google`;
    };

    const handleGithubLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/users/github`;
    };

    // Forgot password handlers (UI only for now)
    const handleForgotConfirm = async () => {
        if (!forgotEmail) return;

        try {
            await axios.post("/users/forgot-password", {
                email: forgotEmail,
            });

            // Always show success (security best practice)
            setMailSent(true);
        } catch (error) {
            console.error("❌ Forgot password error:", error);
            // Still show success to avoid email enumeration
            setMailSent(true);
        }
    };

    const handleForgotClose = () => {
        setShowForgotModal(false);
        setForgotEmail("");
        setMailSent(false);
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
                <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-10 border border-gray-700">
                    <h2 className="text-4xl font-bold text-white mb-8 text-center">
                        Sign In
                    </h2>

                    {/* Email/Password Login */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 mb-2" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter your password"
                            />

                            {/* Forgot password */}
                            <div className="mt-2 text-right">
                                <button
                                    type="button"
                                    onClick={() => setShowForgotModal(true)}
                                    className="text-sm text-blue-400 hover:underline"
                                >
                                    Forgot password?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 ease-in-out"
                        >
                            Login
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center justify-center">
                        <span className="text-gray-400 text-sm tracking-wide">
                            ------ or login with ------
                        </span>
                    </div>

                    {/* OAuth Buttons */}
                    <div className="flex items-center justify-center gap-6">
                        <button
                            onClick={handleGoogleLogin}
                            aria-label="Login with Google"
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                        >
                            <FcGoogle size={26} />
                        </button>

                        <button
                            onClick={handleGithubLogin}
                            aria-label="Login with GitHub"
                            className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 transition"
                        >
                            <FaGithub size={24} className="text-white" />
                        </button>
                    </div>

                    <p className="mt-6 text-gray-400 text-center">
                        Don&apos;t have an account?{" "}
                        <Link to="/register" className="text-blue-400 hover:underline">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>

            {/* ================= Forgot Password Modal ================= */}
            {showForgotModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 px-4">
                    <div className="w-full max-w-sm bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
                        {!mailSent ? (
                            <>
                                <h3 className="text-xl font-semibold text-white mb-4 text-center">
                                    Forgot Password
                                </h3>

                                <input
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    placeholder="Enter your registered email"
                                    className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={handleForgotClose}
                                        className="px-4 py-2 text-gray-300 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleForgotConfirm}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                        Confirm
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text-gray-300 text-center mb-6">
                                    A reset password mail has been sent to your registered email.
                                </p>
                                <div className="flex justify-center">
                                    <button
                                        onClick={handleForgotClose}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                    >
                                        OK
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};
