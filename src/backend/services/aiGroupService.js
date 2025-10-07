// AI-powered group intelligence service
// JavaScript version converted from TypeScript

const { GroupService } = require('./groupService');
const { UserService } = require('./userService');
const { GroupType, GroupVisibility, MembershipStatus } = require('./permissionService');

class AIGroupService {
  
  // Analyze user behavior and recommend groups
  static async getGroupRecommendations(user) {
    try {
      const recommendations = [];
      
      // Get user's current groups and activity
      const userGroups = user.groupMemberships?.map(m => m.groupId) || [];
      const allGroups = await GroupService.getGroups({});
      
      // Filter out groups user is already in
      const availableGroups = allGroups.groups.filter(group => 
        !userGroups.includes(group.id) && group.visibility === GroupVisibility.PUBLIC
      );

      // Generate role-based recommendations
      const roleRecommendations = this.getRoleBasedRecommendations(user, availableGroups, userGroups);
      recommendations.push(...roleRecommendations);

      // Generate department-based recommendations
      const deptRecommendations = this.getDepartmentRecommendations(user, availableGroups);
      recommendations.push(...deptRecommendations);

      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
        
    } catch (error) {
      console.error('Error getting group recommendations:', error);
      return [];
    }
  }
  
  // Generate group creation suggestions based on user input
  static async suggestGroupCreation(groupName, description, user) {
    try {
      const suggestions = {
        recommendedType: GroupType.CUSTOM,
        recommendedVisibility: GroupVisibility.PRIVATE,
        suggestedMembers: [],
        suggestedPermissions: [],
        aiInsights: []
      };

      // Analyze group name and description for type suggestions
      const nameLower = groupName.toLowerCase();
      const descLower = description?.toLowerCase() || '';

      if (nameLower.includes('project') || descLower.includes('project')) {
        suggestions.recommendedType = GroupType.PROJECT;
        suggestions.aiInsights.push('Detected project-related keywords - suggesting PROJECT type');
      } else if (nameLower.includes('team') || nameLower.includes('department')) {
        suggestions.recommendedType = GroupType.DEPARTMENT;
        suggestions.aiInsights.push('Detected team/department keywords - suggesting DEPARTMENT type');
      } else if (nameLower.includes('temp') || descLower.includes('temporary')) {
        suggestions.recommendedType = GroupType.TEMPORARY;
        suggestions.aiInsights.push('Detected temporary keywords - suggesting TEMPORARY type');
      }

      // Visibility suggestions based on content
      if (descLower.includes('public') || descLower.includes('open')) {
        suggestions.recommendedVisibility = GroupVisibility.PUBLIC;
        suggestions.aiInsights.push('Detected public/open keywords - suggesting PUBLIC visibility');
      } else if (descLower.includes('private') || descLower.includes('confidential')) {
        suggestions.recommendedVisibility = GroupVisibility.PRIVATE;
        suggestions.aiInsights.push('Detected private/confidential keywords - suggesting PRIVATE visibility');
      }

      return suggestions;
    } catch (error) {
      console.error('Error suggesting group creation:', error);
      return {
        recommendedType: GroupType.CUSTOM,
        recommendedVisibility: GroupVisibility.PRIVATE,
        suggestedMembers: [],
        suggestedPermissions: [],
        aiInsights: ['Error generating suggestions - using defaults']
      };
    }
  }
  
  // Analyze group health and suggest improvements
  static async analyzeGroupHealth(groupId) {
    try {
      const group = await GroupService.getGroupById(groupId);
      if (!group) throw new Error('Group not found');
      
      const members = await GroupService.getGroupMembers(groupId);
      const analysis = {
        healthScore: 0,
        insights: [],
        recommendations: [],
        metrics: {
          memberCount: members.length,
          activeMembers: members.filter(m => m.status === MembershipStatus.ACTIVE).length,
          engagementScore: 0,
          diversityScore: 0
        }
      };

      // Calculate health score based on various factors
      let score = 50; // Base score

      // Member count analysis
      if (members.length === 0) {
        analysis.insights.push('Group has no members');
        analysis.recommendations.push('Invite team members to join the group');
        score -= 30;
      } else if (members.length < 3) {
        analysis.insights.push('Group has very few members');
        analysis.recommendations.push('Consider inviting more members for better collaboration');
        score -= 15;
      } else if (members.length > 20) {
        analysis.insights.push('Large group - may benefit from sub-groups');
        analysis.recommendations.push('Consider creating sub-groups for better organization');
        score -= 5;
      } else {
        analysis.insights.push('Group has a healthy member count');
        score += 20;
      }

      // Activity analysis (mock data for now)
      const mockEngagementScore = Math.floor(Math.random() * 100);
      analysis.metrics.engagementScore = mockEngagementScore;
      
      if (mockEngagementScore < 30) {
        analysis.insights.push('Low engagement detected');
        analysis.recommendations.push('Schedule regular team meetings or activities');
        score -= 20;
      } else if (mockEngagementScore > 70) {
        analysis.insights.push('High engagement - great team activity!');
        score += 15;
      }

      // Diversity analysis (mock)
      const mockDiversityScore = Math.floor(Math.random() * 100);
      analysis.metrics.diversityScore = mockDiversityScore;
      
      if (mockDiversityScore < 40) {
        analysis.insights.push('Limited role diversity in the group');
        analysis.recommendations.push('Consider inviting members from different departments');
      } else {
        analysis.insights.push('Good diversity across team roles');
        score += 10;
      }

      // Group age analysis
      const groupAge = Date.now() - group.createdAt.getTime();
      const daysOld = Math.floor(groupAge / (1000 * 60 * 60 * 24));
      
      if (daysOld < 7) {
        analysis.insights.push('New group - still establishing dynamics');
        analysis.recommendations.push('Set clear group goals and expectations');
      } else if (daysOld > 365) {
        analysis.insights.push('Established group with long history');
        analysis.recommendations.push('Consider refreshing group objectives');
      }

      // Ensure score is within bounds
      analysis.healthScore = Math.max(0, Math.min(100, score));

      // Add overall assessment
      if (analysis.healthScore >= 80) {
        analysis.insights.unshift('Excellent group health - well-functioning team');
      } else if (analysis.healthScore >= 60) {
        analysis.insights.unshift('Good group health with room for improvement');
      } else if (analysis.healthScore >= 40) {
        analysis.insights.unshift('Moderate group health - needs attention');
      } else {
        analysis.insights.unshift('Poor group health - requires immediate action');
      }

      return analysis;
    } catch (error) {
      console.error('Error analyzing group health:', error);
      return {
        healthScore: 0,
        insights: ['Error analyzing group health'],
        recommendations: ['Please try again later'],
        metrics: {
          memberCount: 0,
          activeMembers: 0,
          engagementScore: 0,
          diversityScore: 0
        }
      };
    }
  }

  // Suggest user assignments for a group
  static async suggestUserAssignments(groupId, searchTerm) {
    try {
      const group = await GroupService.getGroupById(groupId);
      if (!group) return [];
      
      const currentMembers = await GroupService.getGroupMembers(groupId);
      const currentMemberIds = currentMembers.map(m => m.userId);
      
      // Get all users
      const allUsers = await UserService.getUsers({ limit: 100 });
      
      // Filter out current members and apply search
      let filteredUsers = allUsers.users.filter(user => 
        !currentMemberIds.includes(user.id)
      );
      
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter(user =>
          user.name?.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower)
        );
      }
      
      // Generate AI-powered suggestions
      const suggestions = filteredUsers.map(user => {
        const suggestion = this.analyzeUserGroupFit(user, group, currentMembers);
        return {
          user,
          fitScore: suggestion.score,
          reasons: suggestion.reasons,
          suggestedRole: suggestion.role,
          aiInsight: suggestion.insight
        };
      });
      
      // Sort by fit score and return top suggestions
      return suggestions
        .sort((a, b) => b.fitScore - a.fitScore)
        .slice(0, 10);
        
    } catch (error) {
      console.error('Error suggesting user assignments:', error);
      return [];
    }
  }
  
  // Private helper methods for AI logic
  static getRoleBasedRecommendations(user, allGroups, userGroups) {
    const recommendations = [];
    
    // Recommend groups based on user role
    if (user.role === 'TEAM_MANAGER') {
      const managerGroups = allGroups.filter(g => 
        g.type === GroupType.DEPARTMENT || g.type === GroupType.FUNCTIONAL
      );
      
      managerGroups.forEach(group => {
        recommendations.push({
          group,
          score: 85,
          reason: 'Recommended for team managers',
          category: 'role-based',
          aiInsight: 'As a team manager, this group will help you collaborate with other leaders'
        });
      });
    }
    
    return recommendations.slice(0, 3);
  }
  
  static getDepartmentRecommendations(user, allGroups) {
    const recommendations = [];
    
    // Recommend department groups
    const deptGroups = allGroups.filter(g => g.type === GroupType.DEPARTMENT);
    
    deptGroups.forEach(group => {
      recommendations.push({
        group,
        score: 70,
        reason: 'Department collaboration opportunity',
        category: 'department',
        aiInsight: 'Join your department group for better team coordination'
      });
    });
    
    return recommendations.slice(0, 2);
  }
  
  static analyzeUserGroupFit(user, group, currentMembers) {
    let score = 50; // Base score
    const reasons = [];
    
    // Role compatibility
    if (user.role === 'TEAM_MANAGER' && group.type === GroupType.DEPARTMENT) {
      score += 30;
      reasons.push('Management role fits department group');
    }
    
    if (user.role === 'MEMBER' && group.type === GroupType.PROJECT) {
      score += 20;
      reasons.push('Good fit for project collaboration');
    }
    
    // Experience level (mock analysis)
    if (user.loginCount > 50) {
      score += 15;
      reasons.push('Experienced user - valuable contributor');
    }
    
    // Group size consideration
    if (currentMembers.length < 5) {
      score += 10;
      reasons.push('Group needs more members');
    }
    
    const suggestedRole = user.role === 'TEAM_MANAGER' ? 'Contributor/Leader' : 'Contributor';
    
    return {
      score: Math.min(100, score),
      reasons,
      role: suggestedRole,
      insight: `${user.name} shows ${score}% compatibility with this group based on role and experience.`
    };
  }
}

module.exports = {
  AIGroupService
};
