const fs = require('fs')
const envVars = fs.readFileSync('.env.local', 'utf8').split('\n').reduce((acc, line) => {
  if (line.includes('=')) {
    const [key, val] = line.split('=')
    acc[key.trim()] = val.trim()
  }
  return acc
}, {})

fetch(envVars.NEXT_PUBLIC_SUPABASE_URL + '/rest/v1/?apikey=' + envVars.SUPABASE_SERVICE_ROLE_KEY)
.then(r => r.text())
.then(j => fs.writeFileSync('schema.json', j))
.catch(console.error)
