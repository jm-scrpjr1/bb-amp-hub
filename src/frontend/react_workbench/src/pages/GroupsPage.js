import React, { useState, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { apiService } from '../services/apiService';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [healthAnalysis, setHealthAnalysis] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);
      const response = await apiService.getGroups();
      setGroups(response.groups || []);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const analyzeGroupHealth = async (groupId) => {
    try {
      setLoadingHealth(true);
      const response = await apiService.getGroupHealth(groupId);
      setHealthAnalysis(response.analysis);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error analyzing group health:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  const testChatAPI = async () => {
    try {
      const response = await apiService.sendChatMessage('Hello ARIA, can you help me with group management?');
      alert(`ARIA Response: ${response.response}`);
    } catch (err) {
      alert(`Chat Error: ${err.message}`);
    }
  };

  // Separate groups by type (no more country groups)
  const departmentGroups = groups.filter(group => group.type === 'DEPARTMENT');
  const otherGroups = groups.filter(group => group.type !== 'DEPARTMENT');

  const getGroupIcon = (type, name) => {
    if (type === 'DEPARTMENT') {
      switch (name.toLowerCase()) {
        case 'hr': return '👥';
        case 'finance': return '💰';
        case 'it': return '💻';
        case 'sales': return '📈';
        case 'marketing': return '📢';
        case 'developers': return '⚡';
        default: return '🏢';
      }
    } else if (type === 'FUNCTIONAL') {
      switch (name.toLowerCase()) {
        case 'philippines': return '🇵🇭';
        case 'colombia': return '🇨🇴';
        case 'mexico': return '🇲🇽';
        case 'united states': return '🇺🇸';
        case 'india': return '🇮🇳';
        default: return '🌍';
      }
    }
    return '👥';
  };

  const GroupCard = ({ group, isSelected, onClick }) => (
    <div
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected
          ? 'border-purple-500 bg-purple-50 shadow-md'
          : 'border-gray-200 hover:border-purple-300'
      }`}
      onClick={() => onClick(group)}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getGroupIcon(group.type, group.name)}</span>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{group.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{group.description}</p>
          <div className="flex gap-2 mt-3">
            <span className={`inline-block text-xs px-2 py-1 rounded-full ${
              group.type === 'DEPARTMENT'
                ? 'bg-blue-100 text-blue-800'
                : group.type === 'FUNCTIONAL'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {group.type === 'DEPARTMENT' ? 'Department' : group.type === 'FUNCTIONAL' ? 'Country' : group.type}
            </span>
            <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
              {group.visibility}
            </span>
            {group.isActive && (
              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Groups & Teams</h1>
            <p className="text-gray-600 mt-2">Manage your organization's departments and country teams</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={loadGroups}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Refresh Groups
            </button>
            <button
              onClick={testChatAPI}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Chat API
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>Error: {error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Department Groups */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🏢</span>
              <h2 className="text-xl font-semibold text-gray-900">Department Groups</h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                {departmentGroups.length}
              </span>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Loading departments...</span>
              </div>
            ) : departmentGroups.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No department groups found.</p>
            ) : (
              <div className="space-y-3">
                {departmentGroups.map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    isSelected={selectedGroup?.id === group.id}
                    onClick={setSelectedGroup}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Group Details & Health Analysis */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">📊</span>
              <h2 className="text-xl font-semibold text-gray-900">Group Analysis</h2>
            </div>
            {selectedGroup ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{getGroupIcon(selectedGroup.type, selectedGroup.name)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{selectedGroup.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedGroup.type === 'DEPARTMENT' ? 'Department' :
                       selectedGroup.type === 'FUNCTIONAL' ? 'Country Team' : selectedGroup.type}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-700">{selectedGroup.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="text-sm text-blue-600 font-medium">Type</div>
                    <div className="text-blue-900 font-semibold">
                      {selectedGroup.type === 'DEPARTMENT' ? 'Department' :
                       selectedGroup.type === 'FUNCTIONAL' ? 'Country Team' : selectedGroup.type}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-sm text-green-600 font-medium">Visibility</div>
                    <div className="text-green-900 font-semibold">{selectedGroup.visibility}</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3">
                    <div className="text-sm text-purple-600 font-medium">Status</div>
                    <div className="text-purple-900 font-semibold">
                      {selectedGroup.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3">
                    <div className="text-sm text-orange-600 font-medium">Auto Approve</div>
                    <div className="text-orange-900 font-semibold">
                      {selectedGroup.autoApprove ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => analyzeGroupHealth(selectedGroup.id)}
                  disabled={loadingHealth}
                  className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mb-4 flex items-center justify-center gap-2"
                >
                  {loadingHealth ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Analyze Group Health</span>
                    </>
                  )}
                </button>

                {healthAnalysis && (
                  <div className="mt-4 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <span>📈</span>
                      <span>Health Analysis</span>
                    </h4>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Health Score</span>
                        <span className={`font-bold text-lg ${
                          healthAnalysis.healthScore >= 80 ? 'text-green-600' :
                          healthAnalysis.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {healthAnalysis.healthScore}/100
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            healthAnalysis.healthScore >= 80 ? 'bg-green-600' :
                            healthAnalysis.healthScore >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${healthAnalysis.healthScore}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <span>💡</span>
                        <span>Insights</span>
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {healthAnalysis.insights.map((insight, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{insight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mb-4">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <span>🎯</span>
                        <span>Recommendations</span>
                      </h5>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {healthAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-white rounded-lg p-3">
                        <span className="text-gray-600">Members</span>
                        <div className="font-semibold text-lg text-gray-900">{healthAnalysis.metrics.memberCount}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <span className="text-gray-600">Active</span>
                        <div className="font-semibold text-lg text-gray-900">{healthAnalysis.metrics.activeMembers}</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <span className="text-gray-600">Engagement</span>
                        <div className="font-semibold text-lg text-gray-900">{healthAnalysis.metrics.engagementScore}%</div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <span className="text-gray-600">Diversity</span>
                        <div className="font-semibold text-lg text-gray-900">{healthAnalysis.metrics.diversityScore}%</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <span className="text-6xl mb-4 block">👥</span>
                <p className="text-gray-600 text-lg">Select a group to view details and analyze its health</p>
                <p className="text-gray-500 text-sm mt-2">Choose from departments or country teams above</p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Stats */}
        {!loading && groups.length > 0 && (
          <div className="mt-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-4">Organization Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold">{groups.length}</div>
                <div className="text-purple-200">Total Groups</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{departmentGroups.length}</div>
                <div className="text-purple-200">Departments</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{groups.filter(g => g.isActive).length}</div>
                <div className="text-purple-200">Active Groups</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default GroupsPage;
