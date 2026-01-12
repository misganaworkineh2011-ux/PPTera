import { NextResponse } from "next/server";

// Account deletion is disabled to prevent credit abuse
// Users who delete and re-register could exploit free credits
export async function DELETE() {
  return NextResponse.json(
    { 
      error: "Account deletion is currently disabled. Please contact support at support@pptmaster.app if you need assistance with your account." 
    }, 
    { status: 403 }
  );
}
