import { useState } from 'react'
import * as Icons from 'lucide-react'
import { balancedPlateGroups, foodGroupQuestions, gameCatalog, healthyFoodQuestions, healthyVsUnhealthyItems, memoryPairs, snackQuestions } from '../data/gameCatalog'
import { postGameResult } from '../services/progressService'

const Icon = ({ name, size = 18 }) => { const Component = Icons[name] || Icons.Circle; return <Component size={size} strokeWidth={1.8} /> }
const GameButton = ({ children, icon, ...props }) => <button className="button button-primary" {...props}>{icon && <Icon name={icon} size={16} />}{children}</button>

function Result({ result, onBack }) {
  return <div className="modal-card quiz-modal"><span className="topic-icon icon-sage"><Icon name="CheckCircle2" size={22} /></span><p className="eyebrow">Game complete</p><h2>Nice work!</h2><div className="quiz-result"><strong>Score:</strong><span>{result.score} / {result.totalQuestions}</span><strong>Points earned:</strong><span>{result.pointsEarned} Nutrition Points</span></div><GameButton onClick={onBack} icon="ArrowLeft">Back to Games</GameButton></div>
}

function GameFrame({ title, eyebrow, progress, error, children, onBack }) {
  return <div className="modal-card quiz-modal"><button className="modal-close" onClick={onBack} aria-label="Close game"><Icon name="X" size={19} /></button><p className="eyebrow">{eyebrow}</p><h2>{title}</h2>{progress !== undefined && <div className="progress-track"><span className="progress-fill fill-sage" style={{ width: `${progress}%` }} /></div>}{children}{error && <p role="alert">{error}</p>}</div>
}

function useGameSubmit(child, gameId, totalQuestions, onResult) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const submit = async (score) => {
    if (!child?.id) { setError('Your child login has expired. Please log in again.'); return }
    setSubmitting(true); setError('')
    try { const data = await postGameResult({ childId: child.id, gameId, score, totalQuestions, pointsEarned: score * 10 }); onResult({ score, totalQuestions, pointsEarned: score * 10, saved: data.progress }) } catch (submitError) { setError(submitError.message || 'Unable to save your result. Please try again.') } finally { setSubmitting(false) }
  }
  return { submitting, error, submit }
}

export function HealthyFoodQuizGame({ child, onBack }) {
  const [index, setIndex] = useState(0); const [answers, setAnswers] = useState([]); const [result, setResult] = useState(null)
  const { submitting, error, submit } = useGameSubmit(child, 'healthy-food-quiz', healthyFoodQuestions.length, setResult)
  if (result) return <Result result={result} onBack={onBack} />
  const question = healthyFoodQuestions[index]; const selected = answers[index]; const last = index === healthyFoodQuestions.length - 1
  const choose = (answer) => setAnswers((current) => { const next = [...current]; next[index] = answer; return next })
  const finish = () => submit(healthyFoodQuestions.reduce((score, current, questionIndex) => score + (answers[questionIndex] === current.correctAnswer ? 1 : 0), 0))
  return <GameFrame title={question.question} eyebrow={`Question ${index + 1} of ${healthyFoodQuestions.length}`} progress={((index + 1) / healthyFoodQuestions.length) * 100} error={error} onBack={onBack}><div className="quiz-options">{question.options.map((option, optionIndex) => <button key={option} onClick={() => choose(option)} className={selected === option ? 'correct' : ''}><span>{String.fromCharCode(65 + optionIndex)}</span>{option}</button>)}</div>{last ? <GameButton onClick={finish} disabled={!selected || submitting} icon="Check">{submitting ? 'Submitting...' : 'Submit Quiz'}</GameButton> : <GameButton onClick={() => setIndex((current) => current + 1)} disabled={!selected} icon="ArrowRight">Next</GameButton>}</GameFrame>
}

function ChoiceGame({ child, onBack, title, gameId, items, prompt, labels }) {
  const [index, setIndex] = useState(0); const [answers, setAnswers] = useState([]); const [result, setResult] = useState(null)
  const { submitting, error, submit } = useGameSubmit(child, gameId, items.length, setResult)
  if (result) return <Result result={result} onBack={onBack} />
  const current = items[index]; const selected = answers[index]; const last = index === items.length - 1
  const choose = (answer) => setAnswers((existing) => { const next = [...existing]; next[index] = answer; return next })
  const finish = () => submit(items.reduce((score, item, itemIndex) => score + (answers[itemIndex] === item.answer ? 1 : 0), 0))
  return <GameFrame title={title} eyebrow={`${prompt(index, current)} · ${index + 1} of ${items.length}`} progress={((index + 1) / items.length) * 100} error={error} onBack={onBack}><h3 className="game-question">{current.item || current.prompt}</h3><div className="quiz-options">{(labels || current.options || [current.answer, current.answer === 'Healthy' ? 'Unhealthy' : 'Healthy']).map((option) => <button key={option} onClick={() => choose(option)} className={selected === option ? 'correct' : ''}><span>{option === current.answer ? 'A' : 'B'}</span>{option}</button>)}</div>{last ? <GameButton onClick={finish} disabled={!selected || submitting} icon="Check">{submitting ? 'Submitting...' : 'Submit Game'}</GameButton> : <GameButton onClick={() => setIndex((currentIndex) => currentIndex + 1)} disabled={!selected} icon="ArrowRight">Next</GameButton>}</GameFrame>
}

export function HealthyVsUnhealthyGame({ child, onBack }) { return <ChoiceGame child={child} onBack={onBack} title="Healthy vs Unhealthy" gameId="healthy-vs-unhealthy" items={healthyVsUnhealthyItems} prompt={() => 'Choose a category'} labels={['Healthy', 'Unhealthy']} /> }
export function FoodGroupGame({ child, onBack }) { return <ChoiceGame child={child} onBack={onBack} title="Food Group Challenge" gameId="food-group-challenge" items={foodGroupQuestions} prompt={() => 'Choose the food group'} labels={['Fruit', 'Vegetable', 'Grain', 'Protein', 'Dairy']} /> }
export function SnackGame({ child, onBack }) { return <ChoiceGame child={child} onBack={onBack} title="Healthy Snack Challenge" gameId="healthy-snack-challenge" items={snackQuestions} prompt={() => 'Choose the healthier option'} labels={undefined} /> }

export function BalancedPlateGame({ child, onBack }) {
  const [selected, setSelected] = useState({}); const [result, setResult] = useState(null)
  const { submitting, error, submit } = useGameSubmit(child, 'balanced-plate', Object.keys(balancedPlateGroups).length, setResult)
  if (result) return <Result result={result} onBack={onBack} />
  const groups = Object.entries(balancedPlateGroups); const score = groups.filter(([group]) => selected[group]).length
  return <GameFrame title="Build a Balanced Plate" eyebrow="Choose one food from each group" progress={(score / groups.length) * 100} error={error} onBack={onBack}><div className="plate-choices">{groups.map(([group, foods]) => <div key={group}><strong>{group}</strong><div className="quiz-options">{foods.map((food) => <button key={food} onClick={() => setSelected((current) => ({ ...current, [group]: food }))} className={selected[group] === food ? 'correct' : ''}>{food}</button>)}</div></div>)}</div><GameButton onClick={() => submit(score)} disabled={score !== groups.length || submitting} icon="Check">{submitting ? 'Submitting...' : 'Submit Plate'}</GameButton></GameFrame>
}

export function NutritionMemoryGame({ child, onBack }) {
  const cards = [...memoryPairs, ...memoryPairs].sort(() => 0.5 - Math.random()); const [flipped, setFlipped] = useState([]); const [matched, setMatched] = useState([]); const [attempts, setAttempts] = useState(0); const [result, setResult] = useState(null)
  const { submitting, error, submit } = useGameSubmit(child, 'nutrition-memory', memoryPairs.length, setResult)
  const choose = (index) => { if (flipped.length === 2 || flipped.includes(index) || matched.includes(cards[index])) return; const next = [...flipped, index]; setFlipped(next); if (next.length === 2) { setAttempts((current) => current + 1); if (cards[next[0]] === cards[next[1]]) { setMatched((current) => [...current, cards[index]]); setFlipped([]) } else setTimeout(() => setFlipped([]), 650) } }
  if (result) return <Result result={result} onBack={onBack} />
  const done = matched.length === memoryPairs.length
  return <GameFrame title="Nutrition Memory Game" eyebrow={`Matched ${matched.length} of ${memoryPairs.length} pairs · ${attempts} attempts`} error={error} onBack={onBack}><div className="memory-grid">{cards.map((card, index) => <button key={`${card}-${index}`} className="memory-card" onClick={() => choose(index)}>{flipped.includes(index) || matched.includes(card) ? card : '?'}</button>)}</div>{done && <GameButton onClick={() => submit(Math.max(0, memoryPairs.length - Math.min(attempts - memoryPairs.length, memoryPairs.length)))} disabled={submitting} icon="Check">{submitting ? 'Submitting...' : 'Submit Game'}</GameButton>}</GameFrame>
}

export function GameHub({ child }) {
  const [activeGame, setActiveGame] = useState(null)
  const gameComponents = {
    'healthy-food-quiz': HealthyFoodQuizGame,
    'healthy-vs-unhealthy': HealthyVsUnhealthyGame,
    'balanced-plate': BalancedPlateGame,
    'nutrition-memory': NutritionMemoryGame,
    'food-group-challenge': FoodGroupGame,
    'healthy-snack-challenge': SnackGame,
  }
  return <><div className="section-header"><div><p className="eyebrow">Play & practise</p><h1>Games & activities</h1><p className="section-description">Short, thoughtful challenges that turn nutrition knowledge into confidence.</p></div></div><div className="game-grid">{gameCatalog.map((game) => <div className="game-card" key={game.gameId}><div className="game-card-top"><span className="topic-icon icon-sage"><Icon name={game.icon} size={21} /></span><span className="difficulty">{game.category}</span></div><h2>{game.title}</h2><p>{game.description}</p><div className="game-meta"><span>{game.estimatedTime}</span><span>Interactive game</span></div><GameButton variant="outline" onClick={() => setActiveGame(game.gameId)} icon="ArrowRight">Start game</GameButton></div>)}</div>{activeGame && <div className="modal-backdrop"><div className="game-modal-frame">{(() => { const Component = gameComponents[activeGame]; return <Component child={child} onBack={() => setActiveGame(null)} /> })()}</div></div>}</>
}
