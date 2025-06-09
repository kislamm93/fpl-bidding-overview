import React, { useRef, useEffect } from 'react';
import groupStageData from '@/data/group_stage.json';
import TopMenuBar from '@/components/TopMenuBar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown } from 'lucide-react';
import teamsData from '@/data/teams.json';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import koStageData from '@/data/ko_stage.json';

interface Match {
  day: string;
  start_time: string;
  end_time: string;
  ground: string;
  team_1: string;
  team_2: string;
  match_round: string;
  group: string;
  match?: string;
}

const getGroupColor = (group: string) => {
  return group === 'A' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
};

const getGroundColor = (ground: string) => {
  const colors: { [key: string]: string } = {
    'Ground 1': 'bg-emerald-100 text-emerald-800',
    'Ground 2': 'bg-amber-100 text-amber-800',
  };
  return colors[ground] || 'bg-slate-100 text-slate-800';
};

const TeamLogo: React.FC<{ teamName: string }> = ({ teamName }) => {
  return (
    <img
      src={`/${teamName}.png`}
      alt={`${teamName} logo`}
      className="w-6 h-6 object-contain"
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.src = '/placeholder.svg';
      }}
    />
  );
};

const TeamName: React.FC<{ teamName: string }> = ({ teamName }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="font-medium text-slate-900 truncate">
            {teamName}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{teamName}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const groupOptions = [
  { value: 'ALL', label: 'All Groups' },
  { value: 'A', label: 'Group A' },
  { value: 'B', label: 'Group B' },
];

const Fixtures: React.FC = () => {
  const matchesByDay = groupStageData.reduce((acc: { [key: string]: Match[] }, match) => {
    if (!acc[match.day]) {
      acc[match.day] = [];
    }
    acc[match.day].push(match);
    return acc;
  }, {});
  const sortedDays = Object.keys(matchesByDay).sort();

  const [openDays, setOpenDays] = React.useState<{ [key: string]: boolean }>(() => {
    const initial: { [key: string]: boolean } = {};
    if (sortedDays.length > 0) initial[sortedDays[0]] = true;
    return initial;
  });
  const [selectedGroup, setSelectedGroup] = React.useState<'A' | 'B' | 'ALL'>('ALL');
  const [selectedTeams, setSelectedTeams] = React.useState<string[]>([]);
  const [teamSearchOpen, setTeamSearchOpen] = React.useState(false);
  const teamDropdownRef = useRef<HTMLDivElement | null>(null);
  const [tabValue, setTabValue] = React.useState('group-stage');

  useEffect(() => {
    if (!teamSearchOpen) return;
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (teamDropdownRef.current && !teamDropdownRef.current.contains(event.target as Node)) {
        setTeamSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [teamSearchOpen]);

  const filterMatch = (match: Match) => {
    const groupOk = selectedGroup === 'ALL' || match.group === selectedGroup;
    const teamsOk =
      selectedTeams.length === 0 || selectedTeams.includes(match.team_1) || selectedTeams.includes(match.team_2);
    return groupOk && teamsOk;
  };

  const handleClearFilters = () => {
    setSelectedGroup('ALL');
    setSelectedTeams([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <TopMenuBar />
      <div className="container mx-auto px-4 pt-24 pb-8">
        <Tabs value={tabValue} onValueChange={setTabValue} defaultValue="group-stage">
          <TabsList className="mb-6 flex gap-4 bg-transparent shadow-none p-0">
            <TabsTrigger
              value="group-stage"
              className="text-lg px-8 py-3 rounded-lg font-bold border-2 transition-all duration-200 shadow-sm
                data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-700
                data-[state=inactive]:bg-blue-50 data-[state=inactive]:text-blue-700 data-[state=inactive]:border-blue-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Group Stage
            </TabsTrigger>
            <TabsTrigger
              value="knockout-stage"
              className="text-lg px-8 py-3 rounded-lg font-bold border-2 transition-all duration-200 shadow-sm
                data-[state=active]:bg-green-600 data-[state=active]:text-white data-[state=active]:border-green-700
                data-[state=inactive]:bg-green-50 data-[state=inactive]:text-green-700 data-[state=inactive]:border-green-200
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            >
              Knockout Stage
            </TabsTrigger>
          </TabsList>
          <TabsContent value="group-stage">
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-start md:items-end">
              <div>
                <div className="font-semibold mb-2">Group</div>
                <div className="flex gap-2">
                  {groupOptions.map(opt => (
                    <button
                      key={opt.value}
                      className={`px-4 py-2 rounded-lg font-semibold border transition-colors text-base ${selectedGroup === opt.value ? (opt.value === 'A' ? 'bg-blue-600 text-white border-blue-700' : opt.value === 'B' ? 'bg-green-600 text-white border-green-700' : 'bg-slate-700 text-white border-slate-800') : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'}`}
                      onClick={() => setSelectedGroup(opt.value as 'A' | 'B' | 'ALL')}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-full max-w-xs">
                <div className="font-semibold mb-2">Teams</div>
                <div>
                  <button
                    className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white text-left text-sm hover:bg-slate-50"
                    onClick={() => setTeamSearchOpen(true)}
                    type="button"
                  >
                    {selectedTeams.length === 0 ? 'Search teams...' : `${selectedTeams.length} team(s) selected`}
                  </button>
                  {teamSearchOpen && (
                    <div ref={teamDropdownRef} className="absolute z-50 mt-2 w-full max-w-xs">
                      <Command>
                        <CommandInput placeholder="Search teams..." />
                        <CommandList>
                          <CommandEmpty>No teams found.</CommandEmpty>
                          <CommandGroup heading="Teams">
                            {teamsData.map((team) => (
                              <CommandItem
                                key={team.team}
                                onSelect={() => {
                                  setSelectedTeams(prev =>
                                    prev.includes(team.team)
                                      ? prev.filter(t => t !== team.team)
                                      : [...prev, team.team]
                                  );
                                  setTeamSearchOpen(false);
                                }}
                                className={selectedTeams.includes(team.team) ? 'bg-blue-100 text-blue-800' : ''}
                              >
                                {team.team}
                                {selectedTeams.includes(team.team) && (
                                  <span className="ml-auto text-xs">Selected</span>
                                )}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                        <CommandSeparator />
                        <button className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-700" onClick={() => setTeamSearchOpen(false)}>Close</button>
                      </Command>
                    </div>
                  )}
                </div>
                {selectedTeams.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTeams.map(t => (
                      <span key={t} className="inline-flex items-center bg-blue-100 text-blue-800 rounded px-2 py-0.5 text-xs">
                        {t}
                        <button
                          className="ml-1 text-blue-800 hover:text-blue-900"
                          onClick={() => setSelectedTeams(prev => prev.filter(team => team !== t))}
                          aria-label={`Remove ${t}`}
                          type="button"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 flex items-end justify-end">
                <button
                  className="px-4 py-2 rounded-lg font-semibold border border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200"
                  onClick={handleClearFilters}
                  type="button"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            {sortedDays.map((day) => {
              const filteredMatches = matchesByDay[day].filter(filterMatch);
              if (filteredMatches.length === 0) return null;
              return (
                <Collapsible
                  key={day}
                  open={openDays[day]}
                  onOpenChange={() => setOpenDays(prev => ({ ...prev, [day]: !prev[day] }))}
                  className="mb-3"
                >
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-3 border border-slate-200 hover:bg-slate-50 transition-colors">
                      <h2 className="text-lg font-semibold text-slate-800">
                        {new Date(day).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h2>
                      <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${openDays[day] ? 'transform rotate-180' : ''}`} />
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredMatches.map((match, index) => (
                        <div
                          key={index}
                          className={`rounded-lg shadow-sm p-3 border ${
                            index % 4 === 0 || index % 4 === 1
                              ? 'bg-white border-slate-200'
                              : 'bg-blue-50/50 border-blue-100'
                          }`}
                        >
                          <div className="flex items-center justify-center text-sm mb-2 min-h-[2rem]">
                            <div className="w-1/3 flex justify-end items-center pr-2">
                              <TeamName teamName={match.team_1} />
                            </div>
                            <div className="flex-none flex items-center gap-2">
                              <TeamLogo teamName={match.team_1} />
                              <span className="text-slate-400">vs</span>
                              <TeamLogo teamName={match.team_2} />
                            </div>
                            <div className="w-1/3 flex justify-start items-center pl-2">
                              <TeamName teamName={match.team_2} />
                            </div>
                          </div>
                          <div className="flex items-center justify-center gap-2 mt-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getGroupColor(match.group)}`}>
                              Group {match.group}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-800">
                              {match.start_time}
                            </span>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getGroundColor(match.ground)}`}>
                              {match.ground}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </TabsContent>
          <TabsContent value="knockout-stage">
            <div className="w-full max-w-screen-md mx-auto px-4 py-8">
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-semibold shadow-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  All matches will be played on {new Date('2025-06-22').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              </div>
              {(() => {
                const stages = [
                  { label: 'Qualifier', color: 'bg-blue-50 border-blue-100', matches: koStageData.filter(m => m.round === 'Qualifier') },
                  { label: 'Semifinal', color: 'bg-purple-50 border-purple-100', matches: koStageData.filter(m => m.round === 'Semifinal') },
                  { label: 'Final', color: 'bg-red-50 border-red-100', matches: koStageData.filter(m => m.round === 'Final') },
                ];
                const [open, setOpen] = React.useState({
                  Qualifier: true,
                  Semifinal: true,
                  Final: true,
                });
                return (
                  <div className="flex flex-col gap-6">
                    {stages.map(stage => {
                      let timeRange = '';
                      if (stage.matches.length > 0) {
                        const first = stage.matches[0];
                        const allSameTime = stage.matches.every(m => m.start_time === first.start_time && m.end_time === first.end_time);
                        if (allSameTime) {
                          timeRange = `${first.start_time} - ${first.end_time}`;
                        }
                      }
                      return (
                        <Collapsible
                          key={stage.label}
                          open={open[stage.label]}
                          onOpenChange={() => setOpen(o => ({ ...o, [stage.label]: !o[stage.label] }))}
                          className="mb-2"
                        >
                          <CollapsibleTrigger className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-bold text-lg border-2 ${
                            stage.label === 'Qualifier' ? 'bg-blue-100 border-blue-200 text-blue-900' :
                            stage.label === 'Semifinal' ? 'bg-purple-100 border-purple-200 text-purple-900' :
                            'bg-red-100 border-red-200 text-red-900'
                          }`}>
                            <span>{stage.label}</span>
                            <div className="flex-1" />
                            {timeRange && (
                              <span className="text-base font-semibold text-slate-700 mr-4 whitespace-nowrap">{timeRange}</span>
                            )}
                            <ChevronDown className={`w-5 h-5 transition-transform ${open[stage.label] ? 'rotate-180' : ''}`} />
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2">
                            <div className="flex flex-col gap-4">
                              {stage.matches.map((match, idx) => (
                                <div
                                  key={idx}
                                  className={`rounded-lg shadow-sm p-4 border flex items-center gap-3 justify-between ${stage.color}`}
                                >
                                  <div className="flex items-center gap-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getGroundColor(match.ground)}`}>{match.ground}</span>
                                    <span className="flex items-center gap-2 text-base font-medium">
                                      <span>{match.team_1}</span>
                                      <span className="mx-2 text-slate-400">vs</span>
                                      <span>{match.team_2}</span>
                                    </span>
                                  </div>
                                  {(stage.label === 'Qualifier' || stage.label === 'Semifinal') && match.match && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ml-2 ${
                                      stage.label === 'Qualifier'
                                        ? 'bg-blue-200 text-blue-900'
                                        : 'bg-purple-200 text-purple-900'
                                    }`}>
                                      {match.match.replace(/_/g, '')}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Fixtures; 