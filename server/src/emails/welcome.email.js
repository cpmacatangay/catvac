export function welcomeEmail(user) {
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;">
      <div style="background:#8B5CF6;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">CatVac</h1>
      </div>
      <div style="padding:30px;background:white;">
        <h2 style="color:#1F2937;">Welcome to CatVac!</h2>
        <p style="color:#6B7280;">Start adding your cats and their vaccine schedules. We'll remind you when vaccines are due.</p>
        <a href="${process.env.FRONTEND_ORIGIN}/dashboard"
           style="display:inline-block;background:#8B5CF6;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Get Started
        </a>
      </div>
    </div>
  `
}
