export function preDueEmail(catName, vaccine) {
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;">
      <div style="background:#8B5CF6;padding:20px;text-align:center;">
        <h1 style="color:white;margin:0;">CatVac</h1>
      </div>
      <div style="padding:30px;background:white;">
        <h2 style="color:#1F2937;">Upcoming: ${vaccine.name}</h2>
        <p style="color:#6B7280;">${catName}'s ${vaccine.name} vaccine is due soon.</p>
        <p style="color:#6B7280;">Due date: ${new Date(vaccine.dueDate).toDateString()}</p>
      </div>
    </div>
  `
}
