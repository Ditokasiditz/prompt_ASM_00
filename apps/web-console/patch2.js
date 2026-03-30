const fs = require('fs');
const content = fs.readFileSync('src/app/(protected)/issues/page.tsx', 'utf8');

const newContent = content.replace(
    /\/\/fetch\(\`\$\{API_BASE\}\/api\/issues\`\)\s*\.then\(res => res\.json\(\)\)\s*\.then\(\(data: Issue\[\]\) => setIssuesData\(data\)\)\s*\.catch\(err => console\.error\(err\)\)/g,
    ''
);

fs.writeFileSync('src/app/(protected)/issues/page.tsx', newContent);
console.log('Fixed syntax error!');
