export async function sendStaffRegistrationEmail(toEmail: string, name: string, role: string, rawPassword: string) {
  const apiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@email.foxses.com'

  if (!apiKey) {
    console.error('RESEND_API_KEY is not defined in environment variables.')
    return false
  }

  const subject = `Welcome to Tutor Space - Your ${role.toUpperCase()} Account is Ready`
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e4e4e7; border-radius: 8px; background-color: #ffffff; color: #1f2937;">
      <h2 style="color: #615fff; margin-bottom: 20px; font-weight: bold;">Welcome to Tutor Space, ${name}!</h2>
      <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
        An administrative account has been created for you on the <strong>Tutor Space Admin Panel</strong>.
      </p>
      <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
        <p style="margin: 8px 0; font-size: 16px;"><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>Email:</strong> ${toEmail}</p>
        <p style="margin: 8px 0; font-size: 16px;"><strong>Password:</strong> <span style="font-family: monospace; font-weight: bold; background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">${rawPassword}</span></p>
      </div>
      <p style="font-size: 16px; color: #4b5563; line-height: 1.6;">
        You can log in to your dashboard here: <a href="http://localhost:3000/admin/login" style="color: #615fff; font-weight: bold; text-decoration: none;">Tutor Space Admin Login</a>
      </p>
      <p style="font-size: 14px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
        For security reasons, we highly recommend changing your password after your first login.
      </p>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Tutor Space <${fromEmail}>`,
        to: toEmail,
        subject: subject,
        html: htmlContent,
      }),
    })

    if (!res.ok) {
      const errData = await res.json()
      console.error('Resend API error:', errData)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to send registration email:', error)
    return false
  }
}
