#!/usr/bin/env python3
"""
Add the JavaScript interceptor to the Monday.com proxy
"""

def add_interceptor(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if interceptor already exists
    if 'Monday.com form interceptor loaded' in content:
        print('⚠️  Interceptor already exists, skipping...')
        return
    
    # The interceptor script to inject
    interceptor_code = """    // Inject script to intercept all fetch and XMLHttpRequest calls
    const interceptScript = `<script>
(function() {
  const PROXY_BASE = '${process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api'}';
  const MONDAY_DOMAINS = [
    'https://forms.monday.com',
    'https://cdn.monday.com',
    'https://forms-cdn.monday.com',
    'https://api.monday.com'
  ];
  console.log('🚀 Monday.com form interceptor loaded');

  function shouldProxy(url) {
    if (typeof url !== 'string') return false;
    return MONDAY_DOMAINS.some(domain => url.startsWith(domain));
  }

  function proxyUrl(url) {
    for (const domain of MONDAY_DOMAINS) {
      if (url.startsWith(domain)) {
        const path = url.substring(domain.length);
        const proxiedUrl = PROXY_BASE + '/monday-form-proxy' + path;
        console.log('🔄 Proxying:', url, '→', proxiedUrl);
        return proxiedUrl;
      }
    }
    return url;
  }

  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (shouldProxy(url)) {
      url = proxyUrl(url);
    }
    return originalFetch.call(this, url, options);
  };

  // Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (shouldProxy(url)) {
      url = proxyUrl(url);
    }
    return originalOpen.call(this, method, url, ...rest);
  };
})();
</script>`;

    // Inject the intercept script right after the first <meta> tag in <head>
    // This ensures it loads before any other scripts
    html = html.replace(
      /(<head[^>]*>)/i,
      `$1${interceptScript}`
    );

"""
    
    # Find the location to insert (after "let html = response.data;")
    old_code = """    let html = response.data;

    // Remove X-Frame-Options and CSP headers that would block embedding
    // Replace all Monday.com URLs with our proxy URLs
    html = html.replace(
      /<head>/i,
      `<head><base href="https://forms.monday.com/">`
    );"""
    
    new_code = """    let html = response.data;

    // Inject script to intercept all fetch and XMLHttpRequest calls
    const interceptScript = `<script>
(function() {
  const PROXY_BASE = '${process.env.REACT_APP_API_URL || 'https://api.boldbusiness.com/api'}';
  const MONDAY_DOMAINS = [
    'https://forms.monday.com',
    'https://cdn.monday.com',
    'https://forms-cdn.monday.com',
    'https://api.monday.com'
  ];
  console.log('🚀 Monday.com form interceptor loaded');

  function shouldProxy(url) {
    if (typeof url !== 'string') return false;
    return MONDAY_DOMAINS.some(domain => url.startsWith(domain));
  }

  function proxyUrl(url) {
    for (const domain of MONDAY_DOMAINS) {
      if (url.startsWith(domain)) {
        const path = url.substring(domain.length);
        const proxiedUrl = PROXY_BASE + '/monday-form-proxy' + path;
        console.log('🔄 Proxying:', url, '→', proxiedUrl);
        return proxiedUrl;
      }
    }
    return url;
  }

  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    if (shouldProxy(url)) {
      url = proxyUrl(url);
    }
    return originalFetch.call(this, url, options);
  };

  // Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...rest) {
    if (shouldProxy(url)) {
      url = proxyUrl(url);
    }
    return originalOpen.call(this, method, url, ...rest);
  };
})();
</script>`;

    // Inject the intercept script right after the first <meta> tag in <head>
    // This ensures it loads before any other scripts
    html = html.replace(
      /(<head[^>]*>)/i,
      \`$1\${interceptScript}\`
    );"""
    
    if old_code in content:
        content = content.replace(old_code, new_code)
        print('✅ Interceptor script injected successfully')
    else:
        print('❌ Could not find the insertion point')
        return
    
    with open(file_path, 'w') as f:
        f.write(content)

if __name__ == '__main__':
    import sys
    if len(sys.argv) > 1:
        add_interceptor(sys.argv[1])
    else:
        print('Usage: python3 add_interceptor.py <path_to_app.js>')

