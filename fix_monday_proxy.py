#!/usr/bin/env python3
"""
Fix Monday.com proxy to handle multiple domains correctly
"""

import re

def fix_monday_proxy(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # 1. Add helper function before the first proxy route
    helper_function = '''// Helper function to determine the correct Monday.com domain based on the path
function getMondayDomain(path) {
  if (path.startsWith('/workforms/') || path.startsWith('/forms/')) {
    return 'https://forms.monday.com';
  } else if (path.startsWith('/assets/') || path.startsWith('/images/')) {
    return 'https://cdn.monday.com';
  } else if (path.startsWith('/traces')) {
    return 'https://forms.monday.com';
  } else if (path.startsWith('/cdn-cgi/')) {
    return 'https://forms.monday.com';
  } else {
    // Default to forms.monday.com
    return 'https://forms.monday.com';
  }
}

'''
    
    # Find position to insert (before "// Proxy GET requests for Monday.com resources")
    insert_marker = '// Proxy GET requests for Monday.com resources'
    if insert_marker in content and 'function getMondayDomain' not in content:
        content = content.replace(insert_marker, helper_function + insert_marker)
    
    # 2. Fix GET proxy route - simpler approach
    content = content.replace(
        "const targetPath = req.params[0];\n    const targetUrl = `https://forms.monday.com/${targetPath}`;",
        "const targetPath = '/' + req.params[0];\n    const mondayDomain = getMondayDomain(targetPath);\n    const targetUrl = mondayDomain + targetPath;"
    )

    # 3. Fix GET referer
    content = content.replace(
        "'Referer': 'https://forms.monday.com/'",
        "'Referer': mondayDomain + '/'",
        1
    )

    # 4. Fix POST origin and referer
    content = content.replace(
        "'Origin': 'https://forms.monday.com',\n        'Referer': 'https://forms.monday.com/'",
        "'Origin': mondayDomain,\n        'Referer': mondayDomain + '/'"
    )
    
    with open(file_path, 'w') as f:
        f.write(content)
    
    print('✅ Monday.com proxy fixed successfully')

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        fix_monday_proxy(sys.argv[1])
    else:
        print('Usage: python3 fix_monday_proxy.py <path_to_app.js>')

