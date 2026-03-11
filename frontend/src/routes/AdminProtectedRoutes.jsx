import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import axios from '../config/axios.js';


export const AdminProtectedRoute = ({ children }) => {

    const navigate = useNavigate()

    useEffect(() => {

        const checkAdmin = async () => {

            try {

                await axios.get("/admin/verify");

            } catch {

                navigate("/login");

            }

        };

        checkAdmin();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return children;

};