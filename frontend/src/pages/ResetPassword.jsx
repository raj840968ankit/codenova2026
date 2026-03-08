import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../config/axios.js";

export const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            return setError("Passwords do not match");
        }

        try {
            setLoading(true);

            await axios.post(`/users/reset-password/${token}`, {
                password,
                confirmPassword,
            });

            setSuccess(true);

            // Redirect to login after short delay
            setTimeout(() => {
                navigate("/login");
            }, 2500);
        } catch (err) {
            setError(
                err.response?.data?.error ||
                "Reset link is invalid or expired"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <div className="w-full max-w-md bg-gray-800 rounded-2xl shadow-2xl p-10 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    Reset Password
                </h2>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 mb-2">
                                New Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter new password"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 mb-2">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                                className="w-full px-4 py-3 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Confirm new password"
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm text-center">
                                {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                ) : (
                    <div className="text-center">
                        <p className="text-green-400 mb-4">
                            Password reset successful 🎉
                        </p>
                        <p className="text-gray-400 text-sm">
                            Redirecting to login page...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
