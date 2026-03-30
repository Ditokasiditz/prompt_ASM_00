// Define what each Python module maps to in the Database structure
// You can add more modules here as you develop them in Python.
export const SCANNER_MODULES = [
  {
    moduleName: 'ftp_anon',
    title: 'Anonymous FTP Enabled',
    severity: 'Medium',
    impact: 5.0,
    factor: 'Network Security',
    description: 'FTP service allows anonymous login which could disclose sensitive information.'
  },
  {
    moduleName: 'directory_listing',
    title: 'Directory Listing Enabled',
    severity: 'Low',
    impact: 2.0,
    factor: 'Application Security',
    description: 'Web server allows directory listing, exposing files or structure.'
  }
];
