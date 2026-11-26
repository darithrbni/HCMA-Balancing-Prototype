import { useCallback, useRef, useState } from 'react';
import {
  DEFAULT_CONFIG,
  createDefaultGameState,
  cloneConfig,
} from './constants/defaultConfig';
import { executeActivity } from './utils/gameEngine';
import { ActivityPanel } from './components/ActivityPanel';
import { ConfigModal } from './components/ConfigModal';
import { CutsceneScreen } from './components/CutsceneScreen';
import { FinalSummaryScreen } from './components/FinalSummaryScreen';
import { StatsPanel } from './components/StatsPanel';
import { SubActivityModal } from './components/SubActivityModal';
import { TimeTrackerPanel } from './components/TimeTrackerPanel';
import type {
  ActivityKey,
  BalancingConfig,
  CategoryKey,
  Cutscene,
  GameState,
} from './types/game';

export default function App() {
  const [balancingConfig, setBalancingConfig] = useState<BalancingConfig>(() =>
    cloneConfig(DEFAULT_CONFIG),
  );
  const [gameState, setGameState] = useState<GameState>(() =>
    createDefaultGameState(),
  );
  const [configOpen, setConfigOpen] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey | null>(null);
  const [cutsceneQueue, setCutsceneQueue] = useState<Cutscene[]>([]);
  const processingRef = useRef(false);

  const skipCutscene = useCallback(() => {
    setCutsceneQueue((queue) => queue.slice(1));
  }, []);

  const handleCategoryClick = useCallback((category: CategoryKey) => {
    setActiveCategory(category);
  }, []);

  const handleExecute = useCallback(
    (activityKey: ActivityKey) => {
      if (
        processingRef.current ||
        configOpen ||
        cutsceneQueue.length > 0 ||
        gameState.isFinished
      ) {
        return;
      }

      const result = executeActivity(activityKey, gameState, balancingConfig);
      if (!result) return;

      processingRef.current = true;
      setGameState(result.nextState);
      setCutsceneQueue(result.cutscenes);
      setActiveCategory(null);
      window.setTimeout(() => {
        processingRef.current = false;
      }, 0);
    },
    [balancingConfig, configOpen, cutsceneQueue.length, gameState],
  );

  const handleApplyConfig = useCallback((config: BalancingConfig) => {
    setBalancingConfig(cloneConfig(config));
    setConfigOpen(false);
    setHasStarted(true);
    processingRef.current = false;
  }, []);

  const handleOpenConfig = useCallback(() => {
    setActiveCategory(null);
    setConfigOpen(true);
  }, []);

  const handleResetSimulation = useCallback(() => {
    setGameState(createDefaultGameState());
    setCutsceneQueue([]);
    setActiveCategory(null);
    processingRef.current = false;
  }, []);

  if (cutsceneQueue.length > 0) {
    return (
      <CutsceneScreen
        key={cutsceneQueue[0].id}
        cutscene={cutsceneQueue[0]}
        onSkip={skipCutscene}
      />
    );
  }

  const locked =
    configOpen || activeCategory !== null || gameState.isFinished;

  return (
    <div className="app-shell">
      <div className="main-grid">
        <ActivityPanel
          gameState={gameState}
          config={balancingConfig}
          locked={locked}
          onCategoryClick={handleCategoryClick}
          onActivityClick={handleExecute}
          onOpenConfig={handleOpenConfig}
          onReset={handleResetSimulation}
        />
        <StatsPanel gameState={gameState} config={balancingConfig} />
      </div>

      <TimeTrackerPanel gameState={gameState} />

      {gameState.isFinished && (
        <FinalSummaryScreen
          gameState={gameState}
          config={balancingConfig}
          onOpenConfig={handleOpenConfig}
          onReset={handleResetSimulation}
        />
      )}

      {configOpen && (
        <ConfigModal
          initialConfig={balancingConfig}
          isFirstRun={!hasStarted}
          onApply={handleApplyConfig}
          onClose={() => {
            if (hasStarted) setConfigOpen(false);
          }}
        />
      )}

      {activeCategory !== null && !gameState.isFinished && (
        <SubActivityModal
          category={activeCategory}
          gameState={gameState}
          config={balancingConfig}
          onSelect={handleExecute}
          onCancel={() => setActiveCategory(null)}
        />
      )}
    </div>
  );
}
