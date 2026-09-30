// Static team logins. Edit LOGIN_IDS to rename the five accounts.
// To change the shared password run:  node -e "console.log(require('crypto').createHash('sha256').update('YOUR-PASSWORD').digest('hex'))"
// and paste the result into PASSWORD_SHA256. (Anything in a static site is visible to visitors, so this is a light gate, not strong security.)
window.STUDIO_LOGINS={
 ids:['AKK-001','AKK-002','AKK-003','AKK-004','AKK-005'],
 passwordSha256:'37e3f7df29d7ed6692c88d42d665ade1bfbe1d573eb85aaeb0f946d7fb826591'
};
