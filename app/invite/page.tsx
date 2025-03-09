"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { acceptTeamInvitation } from "@/lib/api"
import { supabase } from "@/lib/initSupabase"
import { useSessionContext } from "@supabase/auth-helpers-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, XCircle, Loader2 } from "lucide-react"

export default function InvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const { session } = useSessionContext()
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "unauthenticated">("loading")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    async function handleInvitation() {
      if (!token) {
        setStatus("error")
        setErrorMessage("Invalid invitation token")
        return
      }

      if (!session) {
        setStatus("unauthenticated")
        return
      }

      try {
        await acceptTeamInvitation(token)
        setStatus("success")
      } catch (error: any) {
        console.error("Error accepting invitation:", error)
        setStatus("error")
        setErrorMessage(error.message || "Failed to accept invitation")
      }
    }

    handleInvitation()
  }, [token, session])

  const handleLogin = async () => {
    router.push(`/?redirectTo=${encodeURIComponent(`/invite?token=${token}`)}`)
  }

  const handleGoHome = () => {
    router.push("/")
  }

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h1 className="text-2xl font-bold">Processing invitation...</h1>
            <p className="text-muted-foreground">Please wait while we process your invitation.</p>
          </div>
        </Card>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <XCircle className="h-12 w-12 text-amber-500" />
            <h1 className="text-2xl font-bold">Authentication Required</h1>
            <p className="text-muted-foreground">
              You need to sign in or create an account to accept this invitation.
            </p>
            <div className="flex gap-2">
              <Button onClick={handleLogin}>Sign in</Button>
              <Button variant="outline" onClick={handleGoHome}>Go to Home</Button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-full max-w-md p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <XCircle className="h-12 w-12 text-destructive" />
            <h1 className="text-2xl font-bold">Invitation Error</h1>
            <p className="text-muted-foreground">
              {errorMessage || "This invitation is invalid or has expired."}
            </p>
            <Button onClick={handleGoHome}>Go to Home</Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <div className="flex flex-col items-center gap-4 text-center">
          <Check className="h-12 w-12 text-green-500" />
          <h1 className="text-2xl font-bold">Invitation Accepted</h1>
          <p className="text-muted-foreground">
            You have successfully joined the team.
          </p>
          <Button onClick={handleGoHome}>Go to Dashboard</Button>
        </div>
      </Card>
    </div>
  )
}