const fs = require('fs');

const path = 'j:/study KMITL/4th Year/ASM_final_project/prompt_ASM_00/apps/web-console/src/app/(protected)/issues/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add Icons
content = content.replace(
    'import { ChevronDown, X } from "lucide-react"',
    'import { ChevronDown, X, Activity, Loader2 } from "lucide-react"'
);

// 2. Add isScanning state
content = content.replace(
    'const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)',
    'const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)\n    const [isScanning, setIsScanning] = useState(false)'
);

// 3. Add handleScanAll and adjust fetch logic
const originalEffects = `    useEffect(() => {
        // Fetch dashboard summary for the Score and Grade
        fetch(\`\${API_BASE}/api/dashboard/summary\`)
            .then(res => res.json())
            .then(data => setDashboardData(data))
            .catch(err => console.error(err))

        // Fetch issues
        fetch(\`\${API_BASE}/api/issues\`)
            .then(res => res.json())
            .then((data: Issue[]) => setIssuesData(data))
            .catch(err => console.error(err))
    }, [])`;

const newEffectsAndFunctions = `    const fetchIssues = () => {
        fetch(\`\${API_BASE}/api/issues\`)
            .then(res => res.json())
            .then((data: Issue[]) => setIssuesData(data))
            .catch(err => console.error(err))
    }

    const handleScanAll = async () => {
        if (isScanning) return
        setIsScanning(true)
        try {
            const res = await fetch(\`\${API_BASE}/api/scanner/run-all\`, { method: 'POST' })
            if (!res.ok) throw new Error('Scan failed')
            fetchIssues()
        } catch (error) {
            console.error('Error running scan:', error)
            alert('Failed to run scanner')
        } finally {
            setIsScanning(false)
        }
    }

    useEffect(() => {
        fetch(\`\${API_BASE}/api/dashboard/summary\`)
            .then(res => res.json())
            .then(data => setDashboardData(data))
            .catch(err => console.error(err))
        fetchIssues()
    }, [])`;

content = content.replace(originalEffects, newEffectsAndFunctions);
if (!content.includes('handleScanAll')) {
    console.error("Effect replacement failed, using fallback...");
    // Just inject the handleScanAll before useEffect
    content = content.replace('useEffect(() => {', newEffectsAndFunctions.split('useEffect(() => {')[0] + '\n    useEffect(() => {');
    // Also inject fetchIssues
    content = content.replace('        // Fetch issues\r\n        fetch(`${API_BASE}/api/issues`)', '        // Fetch issues\r\n        fetchIssues(); //fetch(`${API_BASE}/api/issues`)');
}

// 4. GUI replace Title with Button
const oldTitle = '<h2 className="text-4xl font-extrabold tracking-tight mb-8 mt-2">Issues</h2>';
const newTitleBox = `
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 mt-2">
                        <h2 className="text-4xl font-extrabold tracking-tight">Issues</h2>
                        
                        <div className="flex flex-col items-end">
                            <button 
                                onClick={handleScanAll}
                                disabled={isScanning}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isScanning ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Activity className="w-5 h-5" />
                                )}
                                {isScanning ? 'Scanning All Assets...' : 'Run Auto-Scan'}
                            </button>
                            <span className="text-[11px] text-muted-foreground mt-1.5 font-medium uppercase tracking-wider">
                                Find vulnerability of every asset
                            </span>
                        </div>
                    </div>
`;
content = content.replace(oldTitle, newTitleBox);

fs.writeFileSync(path, content, 'utf8');
console.log("Patch successfully applied!");
