import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'

import './App.css'

function App() {

  return (
    <>
      <h1>Hi</h1>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  )
}

export default App
