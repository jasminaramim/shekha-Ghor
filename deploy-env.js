import { execSync } from 'child_process';

const mongoUri = "mongodb+srv://shekhaghor:RPsYa4j7SrACYvi7@cluster0.ssmpl.mongodb.net/shekhaghor?retryWrites=true&w=majority&appName=Cluster0";
const jwtSecret = "shekhaghor_secret_jwt_key_2026";

console.log("Removing old MONGODB_URI...");
try { execSync('npx vercel env rm MONGODB_URI production -y', { stdio: 'inherit' }); } catch(e) {}

console.log("Adding new MONGODB_URI...");
execSync(`echo ${mongoUri} | npx vercel env add MONGODB_URI production`, { shell: 'cmd.exe', stdio: 'inherit' });

console.log("Removing old JWT_SECRET...");
try { execSync('npx vercel env rm JWT_SECRET production -y', { stdio: 'inherit' }); } catch(e) {}

console.log("Adding new JWT_SECRET...");
execSync(`echo ${jwtSecret} | npx vercel env add JWT_SECRET production`, { shell: 'cmd.exe', stdio: 'inherit' });

console.log("Deploying...");
execSync('npx vercel@latest deploy --prod --yes', { stdio: 'inherit' });
