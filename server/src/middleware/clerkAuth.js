import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'

const clerkAuth = ClerkExpressWithAuth({
  apiKey: process.env.CLERK_SECRET_KEY,
})

export default clerkAuth
