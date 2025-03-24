/**
* Template used from https://tailwindui.com/components/application-ui/forms/sign-in-forms
* This is used for the update the profile.
* This only will show up email/password accounts inside the dashboard.
* Will check if the user is using a Google account and prevent them from changing anything.
* This will update both email and password at the same time. Or one at a time.
* Current password is required to change any account email or password.
*/

import React, { useRef, useState } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { Link } from "react-router-dom";
import Q from '../icons/Q';

//  Import profile images
import frog from "../../assets/frog.png";
import hamster from "../../assets/hamster.png";
import koala from "../../assets/koala.png";

// Store them in an array for rendering
const profileImages = [
  { name: "Frog", src: frog },
  { name: "Hamster", src: hamster },
  { name: "Koala", src: koala }
];

export default function UpdateProfile() {
  const newEmailRef = useRef();
  const currentPasswordRef = useRef();
  const newPasswordRef = useRef();
  const confirmNewPasswordRef = useRef();
  const displayNameRef = useRef();
  const { currentUser, updateEmail, updatePassword, isGoogleAuth, reAuthUser } = useAuth();

  const [selectedImage, setSelectedImage] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentPasswordDefault, setCurrentPasswordDefault] = useState('');
  const [newPasswordDefault, setNewPasswordDefault] = useState('');
  const [confirmNewPasswordDefault, setConfirmNewPasswordDefault] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setMessage('');

    if (isGoogleAuth) return setError("Can not update Google account");
    if (newPasswordRef.current.value !== confirmNewPasswordRef.current.value) {
      return setError("New Passwords do not match");
    }

    let reAuth = true;
    await reAuthUser(currentPasswordRef.current.value).catch(() => {
      reAuth = false;
    });

    if (!reAuth) return setError("Current password is incorrect");

    const promises = [];
    setLoading(true);

    if (newPasswordRef.current.value) {
      promises.push(
        reAuthUser(currentPasswordRef.current.value).then(() =>
          updatePassword(newPasswordRef.current.value)
        )
      );
    }

    if (newEmailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(newEmailRef.current.value));
    }

    if (displayNameRef.current.value !== currentUser.email) {
      setMessage(`Display name updated to ${displayNameRef.current.value}`);
    }

    await Promise.all(promises)
      .then(() => {
        setMessage('Profile updated successfully (image saved visually only).');
        setCurrentPasswordDefault('');
        setNewPasswordDefault('');
        setConfirmNewPasswordDefault('');
      })
      .catch((error) => {
        console.log(error.code);
        setError("Failed to update account. (Try logging out and updating again)");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <div className='flex justify-center'><Q /></div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-300">
            Update Profile
          </h2>
          {error && <div className="text-center bg-red-400 py-2 mt-2">{error}</div>}
          {message && <div className="text-center bg-green-400 py-2 mt-2">{message}</div>}
        </div>
        <div className="mt-4 bg-gray-300 shadow-md rounded-lg px-10 py-4">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block font-semibold">New Display Name</label>
              <input
                type="text"
                ref={displayNameRef}
                defaultValue={currentUser.displayName || ''}
                className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">New Email address</label>
              <input
                type="email"
                required
                defaultValue={currentUser.email}
                ref={newEmailRef}
                className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">Current Password</label>
              <input
                type="password"
                required
                value={currentPasswordDefault}
                onChange={(e) => setCurrentPasswordDefault(e.target.value)}
                ref={currentPasswordRef}
                className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">New Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep the same"
                value={newPasswordDefault}
                onChange={(e) => setNewPasswordDefault(e.target.value)}
                ref={newPasswordRef}
                className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold">Confirm New Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep the same"
                value={confirmNewPasswordDefault}
                onChange={(e) => setConfirmNewPasswordDefault(e.target.value)}
                ref={confirmNewPasswordRef}
                className="mt-1 block w-full border border-gray-300 px-3 py-2 rounded-md"
              />
            </div>

            {/* Profile Picture Selector */}
            <div>
              <label className="block mt-5 font-semibold">Select Profile Picture</label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {profileImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    className={`p-1 rounded-full border-4 transition ${
                      selectedImage === img.src ? 'border-indigo-600' : 'border-transparent'
                    }`}
                    onClick={() => setSelectedImage(img.src)}
                  >
                    <img
                      src={img.src}
                      alt={img.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  </button>
                ))}
              </div>
              {selectedImage && (
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-700">You selected:</p>
                  <img src={selectedImage} alt="Selected" className="w-16 h-16 mx-auto rounded-full border" />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2 rounded-md mt-4 hover:bg-indigo-700"
            >
              Update
            </button>

            <p className="text-center mt-3">
              <Link to="/dashboard" className="text-indigo-600 hover:underline">
                Dashboard
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
