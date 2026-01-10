// PromotionTab: Displays promotion exam information and start button

import { usePlayer } from "../../../domain/camps/contexts/PlayerContext";
import { useGameState } from "../../../domain/camps/contexts/GameStateContext";
import { getNextExam, canTakeExam } from "../../../domain/camps/data/PromotionData";

const PromotionTab = () => {
  const { player, updateClassGrade } = usePlayer();
  const { startBattle, returnToCamp } = useGameState();

  // Get next available exam
  const exam = getNextExam(player.playerClass, player.classGrade);

  // If no exam available (max rank reached)
  if (!exam) {
    return (
      <div className="promotion-unavailable">
        <h2>🏆 Congratulations!</h2>
        <p>You have achieved the highest rank.</p>
        <div className="current-grade-display">
          <span className="grade-label">Current Rank:</span>
          <span className="grade-value">{player.classGrade}</span>
        </div>
        <p className="flavor-text">
          You stand at the pinnacle of your class. There are no more exams to take.
        </p>
      </div>
    );
  }

  // Check requirements
  const cardCount = player.deck.length;
  const canTake = canTakeExam(exam, cardCount, player.gold);
  const meetsCardRequirement = cardCount >= exam.requiredCardCount;
  const meetsGoldRequirement = exam.requiredGold
    ? player.gold >= exam.requiredGold
    : true;

  /**
   * Handle exam start
   */
  const handleStartExam = () => {
    if (!canTake) return;

    startBattle(
      {
        enemyIds: [exam.enemyId],
        backgroundType: "arena",
        onWin: handleExamPassed,
        onLose: handleExamFailed,
      },
      "exam"
    );
  };

  /**
   * Handle exam passed
   */
  const handleExamPassed = () => {
    // Promote to next grade
    updateClassGrade(exam.nextGrade);

    // TODO: Apply stat bonuses
    // TODO: Give reward items

    // Return to camp
    returnToCamp();

    // TODO: Show success notification
  };

  /**
   * Handle exam failed
   */
  const handleExamFailed = () => {
    // Return to camp with 1 HP (no other penalties)
    // Note: Exam doesn't consume exploration count
    returnToCamp();

    // TODO: Show failure notification
  };

  return (
    <div className="promotion-tab">
      {/* Current → Next Grade Display */}
      <div className="grade-progression">
        <div className="grade-box current">
          <span className="grade-label">Current Rank</span>
          <span className="grade-name">{exam.currentGrade}</span>
        </div>
        <div className="arrow">→</div>
        <div className="grade-box next">
          <span className="grade-label">Next Rank</span>
          <span className="grade-name">{exam.nextGrade}</span>
        </div>
      </div>

      {/* Exam Requirements */}
      <section className="exam-section">
        <h3 className="section-title">📋 Requirements</h3>
        <div className="requirements-list">
          <div className={`requirement ${meetsCardRequirement ? "met" : "unmet"}`}>
            <span className="requirement-icon">
              {meetsCardRequirement ? "✓" : "✗"}
            </span>
            <span className="requirement-text">
              Cards Owned: {cardCount} / {exam.requiredCardCount}
            </span>
          </div>
          {exam.requiredGold && (
            <div className={`requirement ${meetsGoldRequirement ? "met" : "unmet"}`}>
              <span className="requirement-icon">
                {meetsGoldRequirement ? "✓" : "✗"}
              </span>
              <span className="requirement-text">
                Gold: {player.gold} / {exam.requiredGold}G
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Exam Description */}
      <section className="exam-section">
        <h3 className="section-title">📜 Exam Details</h3>
        <p className="exam-description">{exam.description}</p>
      </section>

      {/* Recommendations */}
      <section className="exam-section">
        <h3 className="section-title">💡 Recommendations</h3>
        <div className="recommendations">
          <div className="recommendation-item">
            <span className="stat-label">HP:</span>
            <span className="stat-value">{exam.recommendations.hp}+</span>
          </div>
          <div className="recommendation-item">
            <span className="stat-label">AP:</span>
            <span className="stat-value">{exam.recommendations.ap}+</span>
          </div>
        </div>
        <p className="recommendation-note">
          These are suggested minimum stats. Higher stats increase your chances.
        </p>
      </section>

      {/* Rewards */}
      <section className="exam-section">
        <h3 className="section-title">🎁 Rewards</h3>
        <ul className="rewards-list">
          <li>Promotion to {exam.nextGrade}</li>
          <li>{exam.rewards.statBonus}</li>
        </ul>
      </section>

      {/* Warnings */}
      <div className="exam-warnings">
        <div className="warning-item">
          <span className="warning-icon">⚠️</span>
          <span className="warning-text">
            Starting the exam will begin a battle immediately.
          </span>
        </div>
        <div className="warning-item">
          <span className="warning-icon">ℹ️</span>
          <span className="warning-text">
            Promotion exams do not consume exploration count.
          </span>
        </div>
        <div className="warning-item">
          <span className="warning-icon">💚</span>
          <span className="warning-text">
            You will return to camp with 1 HP if defeated.
          </span>
        </div>
      </div>

      {/* Start Button */}
      <button
        className={`start-exam-button ${canTake ? "enabled" : "disabled"}`}
        onClick={handleStartExam}
        disabled={!canTake}
      >
        {canTake ? "Start Promotion Exam" : "Requirements Not Met"}
      </button>
    </div>
  );
};

export default PromotionTab;
