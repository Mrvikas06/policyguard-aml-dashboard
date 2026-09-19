import db from './init.js';

db.prepare(`
  UPDATE users 
  SET name = 'Vikas Kumar Singh', role = 'compliance_lead' 
  WHERE email = 'vikas@policyguard.ai'
`).run();

console.log("User updated successfully!");
