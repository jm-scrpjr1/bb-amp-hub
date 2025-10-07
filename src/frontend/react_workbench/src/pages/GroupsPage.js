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

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Groups</h1>
          <button
            onClick={testChatAPI}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Test Chat API
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Error: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Groups List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Available Groups</h2>
            {loading ? (
              <p className="text-gray-600">Loading groups...</p>
            ) : groups.length === 0 ? (
              <p className="text-gray-600">No groups found. The backend is running with sample data.</p>
            ) : (
              <div className="space-y-3">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedGroup?.id === group.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <h3 className="font-medium text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600">{group.description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                        {group.type}
                      </span>
                      <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {group.visibility}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group Details & Health Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Group Analysis</h2>
            {selectedGroup ? (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">{selectedGroup.name}</h3>
                <p className="text-gray-600 mb-4">{selectedGroup.description}</p>

                <button
                  onClick={() => analyzeGroupHealth(selectedGroup.id)}
                  disabled={loadingHealth}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 mb-4"
                >
                  {loadingHealth ? 'Analyzing...' : 'Analyze Group Health'}
                </button>

                {healthAnalysis && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2">Health Analysis</h4>
                    <div className="mb-3">
                      <span className="text-sm text-gray-600">Health Score: </span>
                      <span className={`font-bold ${
                        healthAnalysis.healthScore >= 80 ? 'text-green-600' :
                        healthAnalysis.healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {healthAnalysis.healthScore}/100
                      </span>
                    </div>

                    <div className="mb-3">
                      <h5 className="font-medium text-sm mb-1">Insights:</h5>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {healthAnalysis.insights.map((insight, index) => (
                          <li key={index}>{insight}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-sm mb-1">Recommendations:</h5>
                      <ul className="text-sm text-gray-600 list-disc list-inside">
                        {healthAnalysis.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Members: </span>
                        <span className="font-medium">{healthAnalysis.metrics.memberCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Active: </span>
                        <span className="font-medium">{healthAnalysis.metrics.activeMembers}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Engagement: </span>
                        <span className="font-medium">{healthAnalysis.metrics.engagementScore}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Diversity: </span>
                        <span className="font-medium">{healthAnalysis.metrics.diversityScore}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-600">Select a group to view details and analyze its health.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default GroupsPage;
