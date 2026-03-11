import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "../config/axios";
import { useEffect } from "react";


export const Admin = () => {

    const navigate = useNavigate();

    const [showUsersModal, setShowUsersModal] = useState(false);
    const [users, setUsers] = useState([]);

    const [contacts, setContacts] = useState([]);
    const [feedback, setFeedback] = useState([]);

    const [showContactsModal, setShowContactsModal] = useState(false);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);

    const [notifications, setNotifications] = useState({ contacts: 0, feedback: 0 });

    const fetchUsers = async () => {

        const token = localStorage.getItem("adminToken");

        const res = await axios.get("/admin/users", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        setUsers(res.data);
        setShowUsersModal(true);
    };

    const deleteUser = async (id) => {


        await axios.delete(`/admin/user/${id}`);

        setUsers(prev => prev.filter(u => u._id !== id));
    };

    const logout = async () => {

        await axios.get("/admin/logout");

        navigate("/login");

    };

    const fetchContacts = async () => {

        const res = await axios.get("/admin/contacts");

        setContacts(res.data);

        setShowContactsModal(true);
    };

    const fetchFeedback = async () => {

        const res = await axios.get("/admin/feedback");

        setFeedback(res.data);

        setShowFeedbackModal(true);
    };

    const deleteContact = async (id) => {

        await axios.delete(`/admin/contact/${id}`);

        setContacts(prev => prev.filter(c => c._id !== id));
    };

    const deleteFeedback = async (id) => {

        await axios.delete(`/admin/feedback/${id}`);

        setFeedback(prev => prev.filter(f => f._id !== id));
    };

    const fetchNotifications = async () => {

        try {
            const res = await axios.get("/admin/notifications");
            setNotifications(res.data);
        } catch (error) {
            console.error(error);
        }

    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (

        <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 font-inter">

            <button
                onClick={logout}
                className="absolute top-4 right-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md"
            >
                Logout
            </button>

            <div className="container mx-auto px-4 py-8">

                <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
                    Admin Dashboard
                </h1>

                <div className="flex justify-center gap-6">

                    <button
                        onClick={fetchUsers}
                        className="flex flex-col items-center justify-center p-6 bg-white border border-blue-300 rounded-xl shadow-lg hover:bg-blue-50 hover:border-blue-500 transform hover:scale-105"
                    >

                        View Users

                    </button>

                    <button
                        onClick={fetchContacts}
                        className="relative flex flex-col items-center justify-center p-6 bg-white border border-blue-300 rounded-xl shadow-lg hover:bg-blue-50 hover:border-blue-500"
                    >

                        View Contacts

                        {notifications.contacts > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {notifications.contacts}
                            </span>
                        )}

                    </button>

                    <button
                        onClick={fetchFeedback}
                        className="relative flex flex-col items-center justify-center p-6 bg-white border border-blue-300 rounded-xl shadow-lg hover:bg-blue-50 hover:border-blue-500"
                    >

                        View Feedback

                        {notifications.feedback > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                                {notifications.feedback}
                            </span>
                        )}

                    </button>

                </div>

            </div>

            {/* USERS MODAL */}

            {showUsersModal && (

                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">

                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">

                        <h2 className="text-2xl font-bold mb-6 text-center">
                            All Users
                        </h2>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">

                            {users.map((u) => (
                                <div
                                    key={u._id}
                                    className="flex justify-between items-center border p-3 rounded-lg"
                                >

                                    <span>{u.email}</span>

                                    <button
                                        onClick={() => deleteUser(u._id)}
                                        className="text-red-500"
                                    >
                                        <i className="ri-delete-bin-6-line"></i>
                                    </button>

                                </div>
                            ))}

                        </div>

                        <button
                            onClick={() => setShowUsersModal(false)}
                            className="mt-6 w-full bg-gray-200 py-2 rounded-lg"
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}

            {showContactsModal && (

                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">

                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">

                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Contacts
                        </h2>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">

                            {contacts.map(c => (

                                <div key={c._id} className="border p-3 rounded-lg flex justify-between">

                                    <div>
                                        <p className="font-semibold">{c.email}</p>
                                        <p className="text-sm text-gray-600">{c.message}</p>
                                    </div>

                                    <button
                                        onClick={() => deleteContact(c._id)}
                                        className="text-red-500"
                                    >
                                        <i className="ri-delete-bin-6-line"></i>
                                    </button>

                                </div>

                            ))}

                        </div>

                        <button
                            onClick={() => {
                                setShowContactsModal(false);
                                fetchNotifications();
                            }}
                            className="mt-4 w-full bg-gray-200 py-2 rounded-lg"
                        >
                            Close
                        </button>

                    </div>
                </div>
            )}

            {showFeedbackModal && (

                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-70 z-50">

                    <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">

                        <h2 className="text-2xl font-bold mb-4 text-center">
                            Feedback
                        </h2>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto">

                            {feedback.map(f => (

                                <div key={f._id} className="border p-3 rounded-lg flex justify-between">

                                    <p className="text-gray-700">{f.message}</p>

                                    <button
                                        onClick={() => deleteFeedback(f._id)}
                                        className="text-red-500"
                                    >
                                        <i className="ri-delete-bin-6-line"></i>
                                    </button>

                                </div>

                            ))}

                        </div>

                        <button
                            onClick={() => {
                                setShowFeedbackModal(false)
                                fetchNotifications();
                            }}
                            className="mt-4 w-full bg-gray-200 py-2 rounded-lg"
                        >
                            Close
                        </button>

                    </div>
                </div>
            )}

        </main>

    );
};