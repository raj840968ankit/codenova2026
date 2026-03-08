import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../config/axios";

export const AcceptInvite = () => {

    const { token } = useParams();
    const navigate = useNavigate();

    const [message, setMessage] = useState("Processing invitation...");

    useEffect(() => {

        const processInvite = async () => {

            try {

                // 1️⃣ Check if user logged in
                const profileRes = await axios.get("/users/profile");

                if (!profileRes.data.user) {
                    navigate("/login");
                    return;
                }

                // 2️⃣ Confirm invitation
                const confirmRes = await axios.post("/projects/invite/confirm", {
                    token
                });

                setMessage(confirmRes.data.message);

                setTimeout(() => {
                    navigate("/");
                }, 2000);

            } catch (error) {

                console.error(error);

                navigate("/login");

            }

        };

        processInvite();

    }, [token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-xl text-center">
                <h2 className="text-2xl font-bold mb-4">Project Invitation</h2>
                <p>{message}</p>
            </div>
        </div>
    );

};