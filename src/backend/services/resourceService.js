/**
 * Resource Service - Handles RBAC filtering for documents
 * 
 * Access Rules:
 * 1. All Employees / New Hires stakeholder:
 *    - Viewable by ANY ROLE
 *    - Country restriction applies (must match user's country or be "All Countries")
 * 
 * 2. Leaders stakeholder:
 *    - Only viewable by: TEAM_MANAGER, SUPER_ADMIN, OWNER
 *    - NOT viewable by: MEMBER
 *    - Country restriction applies
 */

class ResourceService {
  /**
   * Check if user can view a document based on RBAC rules
   * @param {Object} user - User object with role and country
   * @param {Object} document - Document object with stakeholder and country
   * @returns {boolean} - Whether user can view the document
   */
  static canViewDocument(user, document) {
    if (!user || !document) return false;

    const userRole = user.roles?.name || user.role;
    const userCountry = user.country || 'US';
    const docStakeholder = document.stakeholder?.trim() || '';
    const docCountry = document.country?.trim() || 'All Countries';

    console.log(`🔍 Checking access for user ${user.email}:`, {
      userRole,
      userCountry,
      docStakeholder,
      docCountry
    });

    // Check country restriction first
    const countryMatches = docCountry === 'All Countries' || docCountry === 'All countries' || userCountry === docCountry;
    if (!countryMatches) {
      console.log(`❌ Country mismatch: user=${userCountry}, doc=${docCountry}`);
      return false;
    }

    // Check stakeholder-based access
    if (docStakeholder === 'All Employees' || docStakeholder === 'New Hires') {
      // Anyone can view these (country already checked)
      console.log(`✅ All Employees/New Hires - accessible to all roles`);
      return true;
    }

    if (docStakeholder === 'Leaders') {
      // Only TEAM_MANAGER, SUPER_ADMIN, OWNER can view
      const allowedRoles = ['TEAM_MANAGER', 'SUPER_ADMIN', 'OWNER'];
      const hasAccess = allowedRoles.includes(userRole);
      console.log(`${hasAccess ? '✅' : '❌'} Leaders document - role=${userRole}, allowed=${allowedRoles.includes(userRole)}`);
      return hasAccess;
    }

    // Default: deny access if stakeholder is unknown
    console.log(`❌ Unknown stakeholder: ${docStakeholder}`);
    return false;
  }

  /**
   * Filter documents based on user's RBAC permissions
   * @param {Array} documents - Array of document objects
   * @param {Object} user - User object with role and country
   * @returns {Array} - Filtered documents that user can view
   */
  static filterDocumentsByAccess(documents, user) {
    if (!Array.isArray(documents)) return [];
    if (!user) return [];

    console.log(`📋 Filtering ${documents.length} documents for user ${user.email}`);

    const filtered = documents.filter(doc => this.canViewDocument(user, doc));

    console.log(`✅ Filtered to ${filtered.length} accessible documents`);
    return filtered;
  }

  /**
   * Get user's accessible documents from CSV data
   * @param {Array} documents - All documents from CSV
   * @param {Object} user - User object
   * @returns {Object} - Organized documents by category with RBAC applied
   */
  static getAccessibleDocuments(documents, user) {
    if (!Array.isArray(documents) || !user) {
      return { categories: [], totalDocuments: 0 };
    }

    // Filter documents by access
    const accessibleDocs = this.filterDocumentsByAccess(documents, user);

    // Organize by category
    const categoryMap = new Map();

    accessibleDocs.forEach(doc => {
      const categoryKey = doc.category?.toLowerCase().replace(/\s+/g, '-') || 'uncategorized';
      const categoryName = doc.category || 'Uncategorized';

      if (!categoryMap.has(categoryKey)) {
        categoryMap.set(categoryKey, {
          id: categoryKey,
          name: categoryName,
          stakeholder: doc.stakeholder,
          documents: []
        });
      }

      categoryMap.get(categoryKey).documents.push({
        id: `${categoryKey}-${categoryMap.get(categoryKey).documents.length}`,
        name: doc.name,
        country: doc.country,
        owner: doc.owner,
        link: doc.link,
        stakeholder: doc.stakeholder,
        category: categoryName
      });
    });

    const categories = Array.from(categoryMap.values());

    return {
      categories,
      totalDocuments: accessibleDocs.length,
      accessibleCount: accessibleDocs.length,
      userRole: user.roles?.name || user.role,
      userCountry: user.country || 'US'
    };
  }

  /**
   * Get role hierarchy level for comparison
   * @param {string} role - Role name
   * @returns {number} - Role level (higher = more permissions)
   */
  static getRoleLevel(role) {
    const roleLevels = {
      'OWNER': 4,
      'SUPER_ADMIN': 3,
      'ADMIN': 2,
      'TEAM_MANAGER': 2,
      'MANAGER': 1,
      'MEMBER': 0
    };
    return roleLevels[role] || 0;
  }

  /**
   * Check if user has leadership role
   * @param {Object} user - User object
   * @returns {boolean}
   */
  static isLeader(user) {
    const userRole = user.roles?.name || user.role;
    return ['OWNER', 'SUPER_ADMIN', 'ADMIN', 'TEAM_MANAGER', 'MANAGER'].includes(userRole);
  }
}

module.exports = { ResourceService };

