import { useState } from "react";
import BattleScreen from "./ui/battleUI/BattleScreen.tsx";
import BaseCamp from "./ui/campsUI/BaseCamp.tsx";
import "./App.css";

type GameScreen = "camp" | "battle";

function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>("battle");
  const [depth, setDepth] = useState<1 | 2 | 3 | 4 | 5>(1);

  return (
    <div className="app-container">
      {currentScreen === "camp" && <BaseCamp />}
      {currentScreen === "battle" && (
        <BattleScreen depth={depth} onDepthChange={setDepth} />
      )}

      {/* Debug: Screen switcher */}
      <div className="debug-screen-switcher">
        <button
          onClick={() => setCurrentScreen("camp")}
          className={`debug-screen-btn ${currentScreen === "camp" ? "debug-screen-btn--active" : ""}`}
        >
          Camp
        </button>
        <button
          onClick={() => setCurrentScreen("battle")}
          className={`debug-screen-btn ${currentScreen === "battle" ? "debug-screen-btn--active" : ""}`}
        >
          Battle
        </button>
      </div>
    </div>
  );
}

export default App;
