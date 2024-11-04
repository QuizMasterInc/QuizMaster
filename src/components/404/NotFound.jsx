/**
 * This component simply contains the error 404 page.
 * This gets displayed when a user enters a route that is not recognized by the application.
 * This also allows users to go back home via a button. 
 */
import React from "react";
import { Link } from "react-router-dom";
import Q from "../icons/Q";

const NotFound = () => (
  <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div className="sm:max-w-lg sm:mx-auto py-10">
      <div className="sm:flex sm:items-center sm:justify-center">
        <div className="text-center sm:text-left">
          <div className="flex items-center justify-center p-6">
            <Q />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">404 Page Not Found</h1>
          <div className="mt-6 flex items-center  sm:justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default NotFound;
