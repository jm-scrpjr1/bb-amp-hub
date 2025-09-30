import { UserWithPermissions, GroupInfo, GroupType, GroupVisibility, Permission } from './permissions';
import { GroupService } from './group-service';
import { UserService } from './user-service';

// AI-powered group intelligence service
export class AIGroupService {
  
  // Analyze user behavior and recommend groups
  static async getGroupRecommendations(user: UserWithPermissions): Promise<GroupRecommendation[]> {
    try {
      const recommendations: GroupRecommendation[] = [];
      
      // Get user's current groups and activity
      const userGroups = user.groupMemberships?.map(m => m.groupId) || [];
      const allGroups = await GroupService.getGroups({});
      
      // AI Logic 1: Department-based recommendations
      if (user.team?.name) {
        const departmentGroups = allGroups.filter(g => 
          g.type === GroupType.DEPARTMENT && 
          !userGroups.includes(g.id) &&
          g.visibility === GroupVisibility.PUBLIC
        );
        
        departmentGroups.forEach(group => {
          recommendations.push({
            group,
            score: 0.8,
            reason: `Recommended for ${user.team?.name} team members`,
            category: 'department',
            aiInsight: `Based on your team affiliation, this group could enhance collaboration with ${group.name}.`
          });
        });
      }
      
      // AI Logic 2: Role-based recommendations
      const roleBasedGroups = this.getRoleBasedRecommendations(user, allGroups, userGroups);
      recommendations.push(...roleBasedGroups);
      
      // AI Logic 3: Activity-based recommendations
      const activityBasedGroups = this.getActivityBasedRecommendations(user, allGroups, userGroups);
      recommendations.push(...activityBasedGroups);
      
      // AI Logic 4: Skill-based recommendations (future enhancement)
      const skillBasedGroups = this.getSkillBasedRecommendations(user, allGroups, userGroups);
      recommendations.push(...skillBasedGroups);
      
      // Sort by score and return top recommendations
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
        
    } catch (error) {
      console.error('Error getting group recommendations:', error);
      return [];
    }
  }
  
  // Suggest optimal group settings for new groups
  static async getGroupCreationSuggestions(
    creator: UserWithPermissions,
    groupName: string,
    description?: string
  ): Promise<GroupCreationSuggestion> {
    try {
      const suggestions: GroupCreationSuggestion = {
        recommendedType: GroupType.FUNCTIONAL,
        recommendedVisibility: GroupVisibility.PUBLIC,
        suggestedMembers: [],
        suggestedPermissions: [],
        aiInsights: []
      };
      
      // AI Logic: Analyze group name and description for type suggestion
      const nameAnalysis = this.analyzeGroupNameForType(groupName, description);
      suggestions.recommendedType = nameAnalysis.type;
      suggestions.aiInsights.push(nameAnalysis.insight);
      
      // AI Logic: Suggest visibility based on creator role and group type
      const visibilityAnalysis = this.analyzeOptimalVisibility(creator, suggestions.recommendedType);
      suggestions.recommendedVisibility = visibilityAnalysis.visibility;
      suggestions.aiInsights.push(visibilityAnalysis.insight);
      
      // AI Logic: Suggest initial members based on creator's network
      const memberSuggestions = await this.suggestInitialMembers(creator, suggestions.recommendedType);
      suggestions.suggestedMembers = memberSuggestions.members;
      suggestions.aiInsights.push(memberSuggestions.insight);
      
      // AI Logic: Suggest permissions based on group type and creator role
      const permissionSuggestions = this.suggestGroupPermissions(creator, suggestions.recommendedType);
      suggestions.suggestedPermissions = permissionSuggestions.permissions;
      suggestions.aiInsights.push(permissionSuggestions.insight);
      
      return suggestions;
      
    } catch (error) {
      console.error('Error getting group creation suggestions:', error);
      return {
        recommendedType: GroupType.FUNCTIONAL,
        recommendedVisibility: GroupVisibility.PUBLIC,
        suggestedMembers: [],
        suggestedPermissions: [],
        aiInsights: ['Unable to generate AI suggestions at this time.']
      };
    }
  }
  
  // Analyze group health and suggest improvements
  static async analyzeGroupHealth(groupId: string): Promise<GroupHealthAnalysis> {
    try {
      const group = await GroupService.getGroupById(groupId);
      if (!group) throw new Error('Group not found');
      
      const members = await GroupService.getGroupMembers(groupId);
      const analysis: GroupHealthAnalysis = {
        healthScore: 0,
        insights: [],
        recommendations: [],
        metrics: {
          memberCount: members.length,
          activeMembers: members.filter(m => m.status === 'ACTIVE').length,
          engagementScore: 0,
          diversityScore: 0
        }
      };
      
      // Calculate health metrics
      analysis.metrics.engagementScore = this.calculateEngagementScore(members);
      analysis.metrics.diversityScore = this.calculateDiversityScore(members);
      
      // Calculate overall health score
      analysis.healthScore = this.calculateOverallHealthScore(analysis.metrics);
      
      // Generate insights and recommendations
      analysis.insights = this.generateHealthInsights(analysis.metrics, group);
      analysis.recommendations = this.generateHealthRecommendations(analysis.metrics, group);
      
      return analysis;
      
    } catch (error) {
      console.error('Error analyzing group health:', error);
      return {
        healthScore: 0,
        insights: ['Unable to analyze group health at this time.'],
        recommendations: [],
        metrics: {
          memberCount: 0,
          activeMembers: 0,
          engagementScore: 0,
          diversityScore: 0
        }
      };
    }
  }
  
  // Smart user assignment suggestions
  static async suggestUserAssignments(
    groupId: string,
    searchTerm?: string
  ): Promise<UserAssignmentSuggestion[]> {
    try {
      const group = await GroupService.getGroupById(groupId);
      if (!group) return [];
      
      const allUsers = await UserService.getUsers();
      const currentMembers = await GroupService.getGroupMembers(groupId);
      const currentMemberIds = currentMembers.map(m => m.userId);
      
      // Filter out current members
      const availableUsers = allUsers.filter(u => !currentMemberIds.includes(u.id));
      
      // Apply search filter if provided
      const filteredUsers = searchTerm 
        ? availableUsers.filter(u => 
            u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : availableUsers;
      
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
  private static getRoleBasedRecommendations(
    user: UserWithPermissions, 
    allGroups: GroupInfo[], 
    userGroups: string[]
  ): GroupRecommendation[] {
    const recommendations: GroupRecommendation[] = [];
    
    // Logic based on user role
    switch (user.role) {
      case 'ADMIN':
      case 'OWNER':
        const adminGroups = allGroups.filter(g => 
          g.type === GroupType.FUNCTIONAL && 
          !userGroups.includes(g.id)
        );
        adminGroups.forEach(group => {
          recommendations.push({
            group,
            score: 0.7,
            reason: 'Administrative oversight recommended',
            category: 'role-based',
            aiInsight: 'Your administrative role suggests involvement in cross-functional initiatives.'
          });
        });
        break;
        
      case 'TEAM_MANAGER':
        const managerGroups = allGroups.filter(g => 
          g.type === GroupType.PROJECT && 
          !userGroups.includes(g.id)
        );
        managerGroups.forEach(group => {
          recommendations.push({
            group,
            score: 0.6,
            reason: 'Project management alignment',
            category: 'role-based',
            aiInsight: 'As a team manager, this project group could benefit from your leadership.'
          });
        });
        break;
    }
    
    return recommendations;
  }
  
  private static getActivityBasedRecommendations(
    user: UserWithPermissions, 
    allGroups: GroupInfo[], 
    userGroups: string[]
  ): GroupRecommendation[] {
    // Placeholder for activity-based logic
    // In a real implementation, this would analyze user's recent activities,
    // document access patterns, collaboration history, etc.
    return [];
  }
  
  private static getSkillBasedRecommendations(
    user: UserWithPermissions, 
    allGroups: GroupInfo[], 
    userGroups: string[]
  ): GroupRecommendation[] {
    // Placeholder for skill-based logic
    // In a real implementation, this would analyze user's skills, certifications,
    // project history, and match with group requirements
    return [];
  }
  
  private static analyzeGroupNameForType(name: string, description?: string): {
    type: GroupType;
    insight: string;
  } {
    const text = `${name} ${description || ''}`.toLowerCase();
    
    if (text.includes('hr') || text.includes('human') || text.includes('people')) {
      return {
        type: GroupType.DEPARTMENT,
        insight: 'Detected HR/People-related keywords - suggesting Department type for organizational alignment.'
      };
    }
    
    if (text.includes('project') || text.includes('initiative') || text.includes('campaign')) {
      return {
        type: GroupType.PROJECT,
        insight: 'Detected project-related keywords - suggesting Project type for time-bound collaboration.'
      };
    }
    
    if (text.includes('temp') || text.includes('short') || text.includes('quick')) {
      return {
        type: GroupType.TEMPORARY,
        insight: 'Detected temporary keywords - suggesting Temporary type for short-term objectives.'
      };
    }
    
    return {
      type: GroupType.FUNCTIONAL,
      insight: 'Suggesting Functional type for cross-departmental collaboration and ongoing activities.'
    };
  }
  
  private static analyzeOptimalVisibility(
    creator: UserWithPermissions, 
    groupType: GroupType
  ): {
    visibility: GroupVisibility;
    insight: string;
  } {
    // Admin/Owner users typically create public groups
    if (creator.role === 'ADMIN' || creator.role === 'OWNER') {
      return {
        visibility: GroupVisibility.PUBLIC,
        insight: 'Suggesting Public visibility to leverage your administrative reach and encourage broad participation.'
      };
    }
    
    // Department groups are usually public
    if (groupType === GroupType.DEPARTMENT) {
      return {
        visibility: GroupVisibility.PUBLIC,
        insight: 'Department groups typically benefit from public visibility for organizational transparency.'
      };
    }
    
    // Project groups can be restricted
    if (groupType === GroupType.PROJECT) {
      return {
        visibility: GroupVisibility.RESTRICTED,
        insight: 'Project groups often work better with restricted access to maintain focus and confidentiality.'
      };
    }
    
    return {
      visibility: GroupVisibility.PUBLIC,
      insight: 'Public visibility recommended to maximize collaboration opportunities.'
    };
  }
  
  private static async suggestInitialMembers(
    creator: UserWithPermissions, 
    groupType: GroupType
  ): Promise<{
    members: string[];
    insight: string;
  }> {
    try {
      const allUsers = await UserService.getUsers();
      const suggestions: string[] = [];
      
      // Suggest team members if creator has a team
      if (creator.team) {
        const teamMembers = allUsers.filter(u => u.teamId === creator.teamId && u.id !== creator.id);
        suggestions.push(...teamMembers.slice(0, 3).map(u => u.id));
      }
      
      // Suggest other managers for cross-functional groups
      if (groupType === GroupType.FUNCTIONAL) {
        const managers = allUsers.filter(u => u.role === 'TEAM_MANAGER' && u.id !== creator.id);
        suggestions.push(...managers.slice(0, 2).map(u => u.id));
      }
      
      return {
        members: suggestions,
        insight: `Suggested ${suggestions.length} initial members based on your team and the group type.`
      };
      
    } catch (error) {
      return {
        members: [],
        insight: 'Unable to suggest initial members at this time.'
      };
    }
  }
  
  private static suggestGroupPermissions(
    creator: UserWithPermissions, 
    groupType: GroupType
  ): {
    permissions: Permission[];
    insight: string;
  } {
    const permissions: Permission[] = [];
    
    // Base permissions for all groups
    permissions.push(Permission.VIEW_GROUP_CONTENT);
    
    // Type-specific permissions
    switch (groupType) {
      case GroupType.DEPARTMENT:
        permissions.push(Permission.VIEW_HR_CONTENT, Permission.SUBMIT_TICKETS);
        break;
      case GroupType.PROJECT:
        permissions.push(Permission.CREATE_CONTENT, Permission.MANAGE_PROJECT_RESOURCES);
        break;
      case GroupType.FUNCTIONAL:
        permissions.push(Permission.CREATE_CONTENT, Permission.VIEW_ANALYTICS);
        break;
    }
    
    return {
      permissions,
      insight: `Suggested ${permissions.length} permissions optimized for ${groupType} groups.`
    };
  }
  
  private static calculateEngagementScore(members: any[]): number {
    // Placeholder calculation - in real implementation would analyze:
    // - Recent activity, message frequency, document access, etc.
    const activeMembers = members.filter(m => m.status === 'ACTIVE').length;
    return Math.min(100, (activeMembers / Math.max(1, members.length)) * 100);
  }
  
  private static calculateDiversityScore(members: any[]): number {
    // Placeholder calculation - in real implementation would analyze:
    // - Role diversity, department diversity, skill diversity, etc.
    const uniqueRoles = new Set(members.map(m => m.role)).size;
    return Math.min(100, (uniqueRoles / Math.max(1, members.length)) * 100);
  }
  
  private static calculateOverallHealthScore(metrics: any): number {
    const weights = {
      memberCount: 0.2,
      engagement: 0.4,
      diversity: 0.4
    };
    
    const memberScore = Math.min(100, (metrics.memberCount / 10) * 100); // Optimal around 10 members
    
    return Math.round(
      (memberScore * weights.memberCount) +
      (metrics.engagementScore * weights.engagement) +
      (metrics.diversityScore * weights.diversity)
    );
  }
  
  private static generateHealthInsights(metrics: any, group: GroupInfo): string[] {
    const insights: string[] = [];
    
    if (metrics.memberCount < 3) {
      insights.push('Group has very few members - consider inviting more participants for better collaboration.');
    }
    
    if (metrics.engagementScore < 50) {
      insights.push('Low engagement detected - members may benefit from more interactive activities.');
    }
    
    if (metrics.diversityScore < 30) {
      insights.push('Limited role diversity - adding members from different departments could enhance perspectives.');
    }
    
    return insights;
  }
  
  private static generateHealthRecommendations(metrics: any, group: GroupInfo): string[] {
    const recommendations: string[] = [];
    
    if (metrics.memberCount < 5) {
      recommendations.push('Recruit 2-3 additional members to reach optimal group size.');
    }
    
    if (metrics.engagementScore < 60) {
      recommendations.push('Schedule regular group activities or discussions to boost engagement.');
    }
    
    return recommendations;
  }
  
  private static analyzeUserGroupFit(user: UserWithPermissions, group: GroupInfo, currentMembers: any[]): {
    score: number;
    reasons: string[];
    role: string;
    insight: string;
  } {
    let score = 50; // Base score
    const reasons: string[] = [];
    
    // Role compatibility
    if (user.role === 'TEAM_MANAGER' && group.type === GroupType.PROJECT) {
      score += 20;
      reasons.push('Management experience valuable for project groups');
    }
    
    // Team diversity
    const currentTeams = new Set(currentMembers.map(m => m.teamId));
    if (user.teamId && !currentTeams.has(user.teamId)) {
      score += 15;
      reasons.push('Adds team diversity to the group');
    }
    
    // Department alignment
    if (group.type === GroupType.DEPARTMENT && user.team?.name) {
      score += 10;
      reasons.push('Department alignment detected');
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

// Type definitions for AI features
export interface GroupRecommendation {
  group: GroupInfo;
  score: number;
  reason: string;
  category: 'department' | 'role-based' | 'activity-based' | 'skill-based';
  aiInsight: string;
}

export interface GroupCreationSuggestion {
  recommendedType: GroupType;
  recommendedVisibility: GroupVisibility;
  suggestedMembers: string[];
  suggestedPermissions: Permission[];
  aiInsights: string[];
}

export interface GroupHealthAnalysis {
  healthScore: number;
  insights: string[];
  recommendations: string[];
  metrics: {
    memberCount: number;
    activeMembers: number;
    engagementScore: number;
    diversityScore: number;
  };
}

export interface UserAssignmentSuggestion {
  user: UserWithPermissions;
  fitScore: number;
  reasons: string[];
  suggestedRole: string;
  aiInsight: string;
}
