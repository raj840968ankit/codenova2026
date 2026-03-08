// import nodemailer from "nodemailer";

// export const transporter = nodemailer.createTransport({
//     service: "gmail",
//     auth: {
//         user: process.env.MAIL_USER,
//         pass: process.env.MAIL_PASS,
//     },
// });

// export const sendResetPasswordMail = async (email, resetLink) => {
//     await transporter.sendMail({
//         from: `"CodeNova" <${process.env.MAIL_USER}>`,
//         to: email,
//         subject: "Reset your password",
//         html: `
//             <div style="font-family: Arial, sans-serif;">
//                 <h2>Password Reset Request</h2>
//                 <p>Click the button below to reset your password.</p>
//                 <a 
//                     href="${resetLink}" 
//                     style="
//                         display:inline-block;
//                         padding:12px 20px;
//                         background:#2563eb;
//                         color:#fff;
//                         text-decoration:none;
//                         border-radius:6px;
//                         margin-top:10px;
//                     "
//                 >
//                     Reset Password
//                 </a>
//                 <p style="margin-top:20px;">
//                     This link will expire in 30 minutes.
//                 </p>
//             </div>
//         `,
//     });
// };



import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendResetPasswordMail = async (email, resetLink) => {
    try {
        const msg = {
            to: email,
            from: `"Codenova" <${process.env.MAIL_USER}>`,
            subject: "Reset your password",
            html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Password Reset Request</h2>
                <p>Click the button below to reset your password.</p>
                <a 
                    href="${resetLink}" 
                    style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#2563eb;
                        color:#fff;
                        text-decoration:none;
                        border-radius:6px;
                        margin-top:10px;
                    "
                >
                    Reset Password
                </a>
                <p style="margin-top:20px;">
                    This link will expire in 30 minutes.
                </p>
            </div>
        `,
        };

        await sgMail.send(msg);
    }
    catch (error) {
        console.error(error.message);
    }
};

export const sendProjectInvitationMail = async (
    email,
    projectName,
    inviterEmail,
    acceptLink,
    rejectLink
) => {

    try {

        const msg = {
            to: email,
            from: `"Codenova" <${process.env.MAIL_USER}>`,
            subject: `Invitation to join project ${projectName}`,
            html: `
            <div style="font-family: Arial, sans-serif;">
                <h2>Project Invitation</h2>

                <p>You have been invited to collaborate on the project:</p>

                <h3>${projectName}</h3>

                <p>Invited by: <strong>${inviterEmail}</strong></p>

                <p>Please choose an option below:</p>

                <a 
                    href="${acceptLink}" 
                    style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#16a34a;
                        color:#fff;
                        text-decoration:none;
                        border-radius:6px;
                        margin-right:10px;
                    "
                >
                    Accept Invitation
                </a>

                <a 
                    href="${rejectLink}" 
                    style="
                        display:inline-block;
                        padding:12px 20px;
                        background:#dc2626;
                        color:#fff;
                        text-decoration:none;
                        border-radius:6px;
                    "
                >
                    Reject Invitation
                </a>

                <p style="margin-top:20px;">
                    This invitation was sent from the CodeNova collaborative workspace.
                </p>

            </div>
            `
        };

        await sgMail.send(msg);

    } catch (error) {
        console.error(error.message);
    }

};



export const sendInvitationAcceptedMail = async (
    adminEmail,
    projectName,
    acceptedUserEmail
) => {

    try {

        const msg = {
            to: adminEmail,
            from: `"Codenova" <${process.env.MAIL_USER}>`,
            subject: `Invitation Accepted - ${projectName}`,
            html: `
            <div style="font-family: Arial, sans-serif;">

                <h2>Invitation Accepted</h2>

                <p>
                    <strong>${acceptedUserEmail}</strong> has accepted the invitation 
                    to join your project <strong>${projectName}</strong>.
                </p>

                <p>
                    The user has now been successfully added to your project workspace.
                </p>

            </div>
            `
        };

        await sgMail.send(msg);

    } catch (error) {
        console.error(error.message);
    }

};


export const sendInvitationRejectedMail = async (
    adminEmail,
    projectName,
    rejectedUserEmail
) => {

    try {

        const msg = {
            to: adminEmail,
            from: `"Codenova" <${process.env.MAIL_USER}>`,
            subject: `Invitation Declined - ${projectName}`,
            html: `
            <div style="font-family: Arial, sans-serif;">

                <h2>Invitation Declined</h2>

                <p>
                    <strong>${rejectedUserEmail}</strong> has declined the invitation 
                    to join your project <strong>${projectName}</strong>.
                </p>

            </div>
            `
        };

        await sgMail.send(msg);

    } catch (error) {
        console.error(error.message);
    }

};