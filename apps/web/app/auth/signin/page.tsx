import React from 'react'
import SignInForm from './signInPage'
import { BACKEND_URL } from '@/lib/constants'

const SignInPage = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-96 flex flex-col justify-center items-center ">
      <h1 className="text-center text-2xl font-bold mb-4">
        Sign In Page
      </h1>

      <SignInForm />
      <hr />
      <a href={`${BACKEND_URL}/auth/google/login`} className="text-blue-500 hover:underline">Sign In with Google</a>
    </div>
  )
}

export default SignInPage