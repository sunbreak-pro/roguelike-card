import BattleScreen from "./ui/battleUI/BattleScreen.tsx";
import BaseCamp from "./ui/campsUI/BaseCamp.tsx";
import { Guild } from "./ui/campsUI/Guild/Guild.tsx";
import {
  GameStateProvider,
  useGameState,
} from "./domain/camps/contexts/GameStateContext.tsx";
import { PlayerProvider } from "./domain/camps/contexts/PlayerContext.tsx";
import { InventoryProvider } from "./domain/camps/contexts/InventoryContext.tsx";
import "./App.css";

/**
 * AppContent Component
 * Handles screen routing based on GameState
 */
function AppContent() {
  const { gameState, setDepth, returnToCamp } = useGameState();
  const { currentScreen, depth, battleMode, battleConfig } = gameState;

  return (
    <div className="app-container">
      {/* BaseCamp Screen */}
      {currentScreen === "camp" && <BaseCamp />}

      {/* Battle Screen */}
      {currentScreen === "battle" && (
        <BattleScreen
          depth={depth}
          onDepthChange={setDepth}
          // battleMode, enemyIds, onBattleEnd will be added in Phase 2
        />
      )}

      {/* Guild Screen */}
      {currentScreen === "guild" && <Guild />}
      {currentScreen === "shop" && (
        <div className="facility-placeholder">
          <button className="back-button" onClick={returnToCamp}>
            ← Back to Camp
          </button>
          <h1>Shop (Coming Soon)</h1>
        </div>
      )}
      {currentScreen === "blacksmith" && (
        <div className="facility-placeholder">
          <button className="back-button" onClick={returnToCamp}>
            ← Back to Camp
          </button>
          <h1>Blacksmith (Coming Soon)</h1>
        </div>
      )}
      {currentScreen === "sanctuary" && (
        <div className="facility-placeholder">
          <button className="back-button" onClick={returnToCamp}>
            ← Back to Camp
          </button>
          <h1>Sanctuary (Coming Soon)</h1>
        </div>
      )}
      {currentScreen === "library" && (
        <div className="facility-placeholder">
          <button className="back-button" onClick={returnToCamp}>
            ← Back to Camp
          </button>
          <h1>Library (Coming Soon)</h1>
        </div>
      )}
      {currentScreen === "storage" && (
        <div className="facility-placeholder">
          <button className="back-button" onClick={returnToCamp}>
            ← Back to Camp
          </button>
          <h1>Storage (Coming Soon)</h1>
        </div>
      )}
      {currentScreen === "dungeon" && (
        <div className="facility-placeholder">
          <button className="back-button" onClick={returnToCamp}>
            ← Back to Camp
          </button>
          <h1>Dungeon Gate (Coming Soon)</h1>
        </div>
      )}
    </div>
  );
}

/**
 * Main App Component
 * Wraps AppContent with all necessary Context Providers
 */
function App() {
  return (
    <GameStateProvider>
      <PlayerProvider>
        <InventoryProvider>
          <AppContent />
        </InventoryProvider>
      </PlayerProvider>
    </GameStateProvider>
  );
}

export default App;
