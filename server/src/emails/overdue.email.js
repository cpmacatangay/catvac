export function overdueEmail(catName, vaccine) {
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;">
      <div style="background:#8B5CF6;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">CatVac</h1>
      </div>
      <div style="padding:30px;background:white;">
        <h2 style="color:#1F2937;">Overdue: ${vaccine.name}</h2>
        <p style="color:#6B7280;">${catName}'s ${vaccine.name} vaccine is overdue.</p>
        <a href="${process.env.FRONTEND_ORIGIN}/dashboard"
           style="display:inline-block;background:#DC2626;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;">
          Mark as Administered
        </a>
      </div>
    </div>
  `
}
