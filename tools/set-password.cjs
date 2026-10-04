// Run: node tools/set-password.cjs ; then enter password through stdin.
// Prints no password. Writes only a salt and SHA-256 digest to gate-config.js.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
process.stderr.write('Enter the new password, then press Enter (terminal input may be visible):\n');
process.stdin.setEncoding('utf8');let input='';process.stdin.on('data',chunk=>{input+=chunk;if(input.includes('\n')){const password=input.split(/\r?\n/)[0];if(password.length<8){process.stderr.write('Password must contain at least 8 characters.\n');process.exit(1);}const salt=crypto.randomBytes(16).toString('hex'),hash=crypto.createHash('sha256').update(salt+':'+password).digest('hex');fs.writeFileSync(path.join(__dirname,'../gate-config.js'),'window.VISUAL_GATE = '+JSON.stringify({salt,hash})+';\n');process.stderr.write('Updated gate-config.js. Commit and redeploy to apply. This is a UI gate, not secure authentication.\n');process.exit(0);}});
