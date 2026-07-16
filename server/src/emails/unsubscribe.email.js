export function unsubscribeEmail(user) {
  return `
    <div style="max-width:600px;margin:0 auto;font-family:Arial,Helvetica,sans-serif;">
      <div style="padding:30px;text-align:center;">
        <h2 style="color:#1F2937;">You've Been Unsubscribed</h2>
        <p style="color:#6B7280;">You will no longer receive reminder emails from CatVac.</p>
        <p style="color:#9CA3AF;font-size:12px;">You can re-subscribe in your account settings.</p>
      </div>
    </div>
  `
}
