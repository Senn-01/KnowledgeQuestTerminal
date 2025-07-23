import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { StorageService } from '../../services/storageService';
import { RarityCalculator } from '../../utils/rarityCalculator';
import type { LearningSession } from '../../types';

export function VaultScreen() {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<LearningSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<LearningSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rarityFilter, setRarityFilter] = useState('all');

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, searchQuery, categoryFilter, rarityFilter]);

  const loadSessions = () => {
    const allSessions = StorageService.getSessions();
    setSessions(allSessions);
    if (allSessions.length > 0 && !selectedSession) {
      setSelectedSession(allSessions[0]);
    }
  };

  const applyFilters = () => {
    let filtered = sessions;

    // Search filter
    if (searchQuery.trim()) {
      filtered = StorageService.searchVault(searchQuery);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(session => session.category === categoryFilter);
    }

    // Rarity filter
    if (rarityFilter !== 'all') {
      filtered = filtered.filter(session => session.rarity === rarityFilter);
    }

    setFilteredSessions(filtered);
  };

  const handleExportAll = () => {
    const data = StorageService.exportVault();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'knowledge-vault.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportSession = (sessionId: string) => {
    const content = StorageService.exportSession(sessionId);
    if (content) {
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedSession?.topic || 'session'}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatMarkdown = (content: string) => {
    // Simple markdown formatting for display
    return content
      .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold text-[var(--terminal-green)] mb-4">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold text-[var(--terminal-green)] mb-3">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="text-md font-bold text-[var(--terminal-green)] mb-2">$1</h3>')
      .replace(/^\*\*(.+)\*\*$/gm, '<strong>$1</strong>')
      .replace(/^\* (.+)$/gm, '<li class="ml-4">• $1</li>')
      .replace(/\[\[(.+?)\]\]/g, '<span class="text-blue-400 underline cursor-pointer">$1</span>')
      .replace(/\n/g, '<br>');
  };

  const getUniqueCategories = () => {
    const categories = Array.from(new Set(sessions.map(s => s.category)));
    return categories.sort();
  };

  const getRarityCount = (rarity: string) => {
    return sessions.filter(s => s.rarity === rarity).length;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-[var(--terminal-green)] mb-2">
          KNOWLEDGE VAULT
        </h1>
        <p className="text-gray-400">
          Your accumulated wisdom, searchable and exportable
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-[var(--terminal-gray)] terminal-border rounded-lg p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--terminal-bg)] border border-[var(--terminal-green)] text-[var(--terminal-green)] pr-10"
                placeholder="Search knowledge vault..."
              />
              <div className="absolute right-3 top-3 text-[var(--terminal-green)]">
                🔍
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="bg-[var(--terminal-bg)] border border-[var(--terminal-green)] text-[var(--terminal-green)]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {getUniqueCategories().map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="bg-[var(--terminal-bg)] border border-[var(--terminal-green)] text-[var(--terminal-green)]">
                <SelectValue placeholder="All Rarities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rarities</SelectItem>
                <SelectItem value="unique">Unique ({getRarityCount('unique')})</SelectItem>
                <SelectItem value="legendary">Legendary ({getRarityCount('legendary')})</SelectItem>
                <SelectItem value="rare">Rare ({getRarityCount('rare')})</SelectItem>
                <SelectItem value="normal">Normal ({getRarityCount('normal')})</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleExportAll}
              className="bg-[var(--terminal-green)] text-[var(--terminal-bg)] font-bold hover:glow"
            >
              📥 Export
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {sessions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 text-lg mb-4">
            Your knowledge vault is empty
          </p>
          <p className="text-gray-500">
            Complete learning sessions in the Chat to start building your vault
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Categories Sidebar */}
          <div className="lg:col-span-2">
            <div className="bg-[var(--terminal-gray)] terminal-border rounded-lg p-4">
              <h3 className="font-bold text-[var(--terminal-green)] mb-3">Categories</h3>
              <div className="space-y-2 text-sm">
                {getUniqueCategories().map(category => {
                  const count = sessions.filter(s => s.category === category).length;
                  return (
                    <div
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`flex justify-between cursor-pointer p-1 rounded transition-colors ${
                        categoryFilter === category 
                          ? 'bg-[var(--terminal-bg)] text-[var(--terminal-green)]'
                          : 'hover:text-[var(--terminal-green)]'
                      }`}
                    >
                      <span>{category}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                  );
                })}
                <div
                  onClick={() => setCategoryFilter('all')}
                  className={`flex justify-between cursor-pointer p-1 rounded transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-[var(--terminal-bg)] text-[var(--terminal-green)]'
                      : 'hover:text-[var(--terminal-green)]'
                  }`}
                >
                  <span>All Categories</span>
                  <span className="text-gray-400">{sessions.length}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Titles List */}
          <div className="lg:col-span-4">
            <div className="bg-[var(--terminal-gray)] terminal-border rounded-lg">
              <div className="p-4 border-b border-[var(--terminal-green)]">
                <h3 className="font-bold text-[var(--terminal-green)]">
                  Knowledge Entries ({filteredSessions.length})
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {filteredSessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`border-b border-gray-600 p-3 cursor-pointer transition-colors group ${
                      selectedSession?.id === session.id
                        ? 'bg-[var(--terminal-bg)]'
                        : 'hover:bg-[var(--terminal-bg)]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[var(--terminal-green)] group-hover:text-yellow-400 truncate">
                        {session.topic}
                      </h4>
                      <span
                        className={`w-3 h-3 rounded-full border-2 ${RarityCalculator.getRarityGlowClass(session.rarity)}`}
                        style={{ borderColor: RarityCalculator.getRarityColor(session.rarity) }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{session.date}</div>
                    <div className="text-xs text-gray-300">{session.difficultyName}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="lg:col-span-6">
            {selectedSession ? (
              <div className="bg-[var(--terminal-gray)] terminal-border rounded-lg">
                <div className="p-4 border-b border-[var(--terminal-green)] flex justify-between items-center">
                  <h3 className="font-bold text-[var(--terminal-green)]">
                    {selectedSession.topic}
                  </h3>
                  <div className="flex space-x-2">
                    <span
                      className="px-2 py-1 text-white text-xs rounded"
                      style={{ backgroundColor: RarityCalculator.getRarityColor(selectedSession.rarity) }}
                    >
                      {selectedSession.rarity.toUpperCase()}
                    </span>
                    <button
                      onClick={() => handleExportSession(selectedSession.id)}
                      className="text-[var(--terminal-green)] hover:text-yellow-400"
                    >
                      📄
                    </button>
                  </div>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div className="prose prose-invert prose-green max-w-none text-sm">
                    <div className="mb-4 text-gray-300">
                      <strong>Date:</strong> {selectedSession.date}<br />
                      <strong>Difficulty:</strong> {selectedSession.difficultyName}<br />
                      <strong>Category:</strong> {selectedSession.category}<br />
                      <strong>Rarity:</strong>{' '}
                      <span style={{ color: RarityCalculator.getRarityColor(selectedSession.rarity) }}>
                        {selectedSession.rarity}
                      </span><br />
                      <strong>Final Score:</strong> {selectedSession.finalScore}/10
                    </div>

                    {selectedSession.vaultContent ? (
                      <div
                        className="text-gray-300 space-y-4"
                        dangerouslySetInnerHTML={{
                          __html: formatMarkdown(selectedSession.vaultContent)
                        }}
                      />
                    ) : (
                      <div className="space-y-4 text-gray-300">
                        <div>
                          <h4 className="text-[var(--terminal-green)] font-bold mb-2">What I Learned</h4>
                          <p>{selectedSession.aiExplanation}</p>
                        </div>

                        {selectedSession.trials && (
                          <div>
                            <h4 className="text-[var(--terminal-green)] font-bold mb-2">My Understanding</h4>
                            <p>{selectedSession.trials.articulation.text}</p>
                          </div>
                        )}

                        {selectedSession.trials && (
                          <div>
                            <h4 className="text-[var(--terminal-green)] font-bold mb-2">Trial Results</h4>
                            <ul className="list-disc list-inside space-y-1">
                              <li>Articulation: {selectedSession.trials.articulation.score}/10</li>
                              <li>Gauntlet: {selectedSession.trials.gauntlet.score}/{selectedSession.trials.gauntlet.answers.length}</li>
                              <li>Lightning: {selectedSession.trials.lightning.score}/{selectedSession.trials.lightning.answers.length}</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[var(--terminal-gray)] terminal-border rounded-lg p-8 text-center">
                <p className="text-gray-400">Select a knowledge entry to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
