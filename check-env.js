const fs = require('fs');

const envContent = fs.readFileSync('.env', 'utf8');
const match = envContent.match(/DATABASE_URL="postgresql:\/\/([^:]+):([^@]+)@(.+)"/);

if (!match) {
  console.log("❌ Could not find/parse DATABASE_URL line at all.");
  process.exit(1);
}

const [, username, password, rest] = match;

const needsEncoding = /[^A-Za-z0-9\-_.~]/.test(password);
console.log("Username:", username);
console.log("Password length:", password.length);
console.log("Password contains special characters that need encoding:", needsEncoding);

if (needsEncoding) {
  const encodedPassword = encodeURIComponent(password);
  const newUrl = `DATABASE_URL="postgresql://${username}:${encodedPassword}@${rest}"`;
  const newContent = envContent.replace(/DATABASE_URL="postgresql:\/\/.+"/, newUrl);
  fs.writeFileSync('.env', newContent);
  console.log("✅ Rewrote .env with the password properly URL-encoded.");
} else {
  console.log("Password has no characters needing encoding — this isn't the issue.");
}