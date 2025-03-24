/**
* Template used from https://tailwindui.com/components/application-ui/forms/sign-in-forms
* This is used for the update the profile.
* This only will show up email/password accounts inside the dashboard.
* Will check if the user is using a Google account and prevent them from changing anything.
* This will update both email and password at the same time. Or one at a time.
* Current password is required to change any account email or password.
*/

import React, {useRef, useState} from "react";
import {useAuth} from '../../contexts/AuthContext'
import { Link } from "react-router-dom";
import Q from '../icons/Q';

//State variables
export default function UpdateProfile() {
  const newEmailRef = useRef()
  const currentPasswordRef = useRef()
  const newPasswordRef = useRef()
  const confirmNewPasswordRef = useRef()
  const displayNameRef = useRef()
  const {currentUser, updateEmail, updatePassword, isGoogleAuth, reAuthUser} = useAuth()
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPasswordDefault, setCurrentPasswordDefault] = useState('')
  const [newPasswordDefault, setNewPasswordDefault] = useState('')
  const [confirmNewPasswordDefault, setConfirmNewPasswordDefault] = useState('')

//Handles form submit
  async function handleSubmit(e) {
    e.preventDefault()

    setError('')
    setMessage('')
//If the user if a Google account, stop and return an error
    if(isGoogleAuth){     
        return setError("Can not update Google account")
    }
    if(newPasswordRef.current.value !== confirmNewPasswordRef.current.value){
        return setError("New Passwords do not match")
    }
//This will check to see if the user entered their current password correctly
    let reAuth = true
    await reAuthUser(currentPasswordRef.current.value)
      .catch(error => {
        reAuth = false
      })
    //If re-authentication fails
    if(!reAuth){
      return setError("Current password is incorrect")
    }
     
    const promises = []
    setLoading(true)
// If there is a new password entered, add to the promises list
    if(newPasswordRef.current.value){
      promises.push(reAuthUser(currentPasswordRef.current.value).then(() => {
        return updatePassword(newPasswordRef.current.value)}))
  }
// If there is a new email entered, add to the promises list
    if(newEmailRef.current.value !== currentUser.email){
        promises.push(updateEmail(newEmailRef.current.value))
    }

// If there is a new display name entered, add to the promises list
    if (displayNameRef.current.value !== currentUser.email) {
      promises.push(updateProfile(currentUser, {
        displayName: displayNameRef.current.value
      }).then(() => {
        setMessage("Display name updated successfully")
      }).catch((error) => {
        setError("Failed to update display name: " +error.message)
      }))
    }

//Fulfilling the promises
    await Promise.all(promises).then(() => {
        setMessage('Profile has been updated')
        setCurrentPasswordDefault('')
        setNewPasswordDefault('')
        setConfirmNewPasswordDefault('')
    }).catch(error => {
        console.log(error.code)
        setError("Failed to update account. (Try logging out and updating again)")
    }).finally(() => {
        setLoading(false)
    })
    }

  return (
    <>
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
          <div className='flex flex-row justify-center align-middle -xl:ml-16'>
              <Q />
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-300 -md:text-lg -xl:ml-16">
              Update Profile
            </h2>
            {error && <label className="block mt-3 font-semi-bold text-center text-black bg-red-400 py-3 tracking-tight -xl:ml-16">{error}</label>}
            {message && <label className="block mt-3 font-semi-bold text-center text-black bg-green-400 py-3 tracking-tight -xl:ml-16">{message}</label>}
          </div>
          <div className="mt-4 bg-gray-300 shadow-md rounded-lg px-10 py-1 tracking-tight -xl:ml-16">
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <input type="hidden" name="remember" defaultValue="true" />
              <div className="-space-y-px rounded-md shadow-sm">
              <div> 
                  {/* TO DO: MODIFY DISPLAY NAME TO INCLUDE USERS WHO SIGN IN VIA GOOGLE */}
                  <label htmlFor="displayName" className="sr-only">
                    Display Name 
                  </label>
                  <label className="block mt-3 font-semibold text-left">New Display Name</label>
                  <input
                    type="text"
                    id="displayName"
                    ref={displayNameRef}
                    defaultValue={currentUser.displayName || ''}
                    className="mt-3 relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter new display name"
                  />
                </div>
                <div>
                  <label htmlFor="email-address" className="sr-only">
                    New Email
                  </label>
                  <label className="block mt-3 font-semibold text-left">New Email address</label>
                  <input
                    id="new-email-address"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className=" mt-3 relative block w-full appearance-none rounded-none rounded-t-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    defaultValue={currentUser.email}
                    ref={newEmailRef}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Current Password
                  </label>
                  <label className="block mt-3 font-semibold text-left">Current Password</label>
                  <input
                    id="current-password"
                    name="password"
                    type="password"
                    required
                    value={currentPasswordDefault}
                    onChange={(e) => setCurrentPasswordDefault(e.target.value)}
                    className=" mt-3 relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    ref={currentPasswordRef}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    New Password
                  </label>
                  <label className="block mt-3 font-semibold text-left">New Password</label>
                  <input
                    id="new-password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Leave blank to keep the same"
                    value={newPasswordDefault}
                    onChange={(e) => setNewPasswordDefault(e.target.value)}
                    className=" mt-3 relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    ref={newPasswordRef}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Confirm New Password
                  </label>
                  <label className="block mt-3 font-semibold text-left">Confirm New Password</label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    autoComplete="current-password"
                    value={confirmNewPasswordDefault}
                    onChange={(e) => setConfirmNewPasswordDefault(e.target.value)}
                    className=" mt-3 relative block w-full appearance-none rounded-none rounded-b-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                    placeholder="Leave blank to keep the same"
                    ref={confirmNewPasswordRef}
                  />
                </div>
              </div>
              <div>
                <button
                  disabled={loading}
                  type="submit"
                  className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Update
                </button>
              </div>
              <p className="mt-2 text-center text-sm">
              <Link className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline" to="/dashboard">Dashboard</Link>
            </p>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}