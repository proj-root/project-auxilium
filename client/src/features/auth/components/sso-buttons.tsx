import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaGithub } from "react-icons/fa";

export function GoogleSSOButton() {
  return (
    <Button variant={'outline'} className="cursor-pointer" disabled={true} title='Coming Soon...'>
      <FcGoogle className="size-4" />
      Continue with Google
    </Button>
  )
}

export function GitHubSSOButton() {
  return (
    <Button variant={'outline'} className="cursor-pointer" disabled={true} title='Coming Soon...'>
      <FaGithub className="size-4" />
      Continue with Github
    </Button>
  )
}