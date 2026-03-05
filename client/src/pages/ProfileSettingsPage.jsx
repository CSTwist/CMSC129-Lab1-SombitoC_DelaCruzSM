import React from "react";
import ProfileForm from "../components/ProfileForm";
import Header from "../components/Header";
import '../styles/ProfileSettings.css'; 

function ProfileSettings({ user }) {
    return (
        <div className="profile-page-container">
            <Header user={user} />
            <div className="profile-page-content mt-4 p-4 d-flex flex-column align-items-center">
                <ProfileForm user={user} />
            </div>
        </div>
    );
}

export default ProfileSettings;