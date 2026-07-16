export function resetPasswordEmail(user, resetLink) {
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;">
      <div style="background:#8B5CF6;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">CatVac</h1>
      </div>
      <div style="padding:30px;background:white;">
        <h2 style="color:#1F2937;">Reset Your Password</h2>
        <p style="color:#6B7280;">Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}"
           style="display:inline-block;background:#8B5CF6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Reset Password
        </a>
      </div>
    </div>
  `
}
