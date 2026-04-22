import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Home,
  Star,
  Fish,
  Waves,
  Anchor,
  Droplets
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fisher-Yates shuffle algorithm for better true randomization
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// --- DATA ---
const VOCAB_DATA = [
  // Chores
  { es: 'Poner la mesa', en: 'To set the table' },
  { es: 'Hacer la cama', en: 'To make the bed' },
  { es: 'Pasar la aspiradora', en: 'To vacuum' },
  { es: 'Ordenar la habitación', en: 'To organize the room' },
  { es: 'Planchar', en: 'To iron' },
  { es: 'Poner la lavadora', en: 'To do laundry' },
  { es: 'Lavar la ropa', en: 'To wash clothes' },
  { es: 'Sacar la basura', en: 'To take out the trash' },
  { es: 'Cocinar', en: 'To cook' },
  { es: 'Lavar los platos', en: 'To wash the dishes' },
  { es: 'Sacar a pasear al perro', en: 'To walk the dog' },
  { es: 'Hacer la compra', en: 'To go grocery shopping' },
  // Hacer vs Poner phrases
  { es: 'Hacer la tarea', en: 'To do homework' },
  { es: 'Hacer un pastel', en: 'To make a cake' },
  { es: 'Hacer ejercicio', en: 'To exercise' },
  { es: 'Poner la televisión', en: 'To turn on the TV' },
  { es: 'Poner los cubiertos', en: 'To place the silverware' },
  { es: 'Poner la calefacción', en: 'To turn on the heat' },
  // Frequency words
  { es: 'Todos los días', en: 'Every day' },
  { es: 'Siempre', en: 'Always' },
  { es: 'A menudo', en: 'Often' },
  { es: 'A veces', en: 'Sometimes' },
  { es: 'Casi siempre', en: 'Almost always' },
  { es: 'Casi nunca', en: 'Rarely / almost never' },
  { es: 'Nunca', en: 'Never' },
  { es: 'Dos veces por semana', en: 'Twice a week' },
  { es: 'Tres veces por semana', en: 'Three times a week' },
  { es: 'Cuatro veces por semana', en: 'Four times a week' },
];

const GRAMMAR_DATA = [
  // Ser
  { question: 'Mi casa _______ bonita.', options: ['es', 'está', 'tiene que'], answer: 'es', rule: 'Ser: Permanent traits / descriptions' },
  { question: 'La mesa _______ grande.', options: ['es', 'está', 'tiene que'], answer: 'es', rule: 'Ser: Characteristics' },
  { question: 'La cocina _______ luminosa.', options: ['es', 'está', 'tiene que'], answer: 'es', rule: 'Ser: Characteristics' },
  { question: 'El jardín _______ grande.', options: ['es', 'está', 'tiene que'], answer: 'es', rule: 'Ser: Characteristics' },
  { question: 'Mi lámpara _______ nueva.', options: ['es', 'está', 'tiene que'], answer: 'es', rule: 'Ser: Characteristics' },
  { question: 'El dormitorio _______ muy pequeño.', options: ['es', 'está', 'tiene que'], answer: 'es', rule: 'Ser: Characteristics' },
  // Estar
  { question: 'El baño _______ sucio.', options: ['es', 'está', 'tiene que'], answer: 'está', rule: 'Estar: Temporary conditions' },
  { question: 'Mi cuarto _______ ordenado.', options: ['es', 'está', 'tiene que'], answer: 'está', rule: 'Estar: States / things that can change' },
  { question: 'La sala _______ desordenada.', options: ['es', 'está', 'tiene que'], answer: 'está', rule: 'Estar: Temporary conditions' },
  { question: 'Las ventanas _______ limpias.', options: ['son', 'están', 'tienen que'], answer: 'están', rule: 'Estar: Temporary conditions' },
  { question: 'Los platos _______ muy sucios.', options: ['son', 'están', 'tienen que'], answer: 'están', rule: 'Estar: Temporary conditions' },
  { question: 'La ropa _______ limpia ahora.', options: ['es', 'está', 'tiene que'], answer: 'está', rule: 'Estar: Temporary conditions' },
  // Tener que
  { question: 'Yo _______ limpiar el garaje.', options: ['tengo que', 'soy', 'estoy'], answer: 'tengo que', rule: 'Tener que + infinitive: Obligation (I have to)' },
  { question: 'Tú _______ limpiar el dormitorio.', options: ['tienes que', 'eres', 'estás'], answer: 'tienes que', rule: 'Tener que + infinitive: Obligation (You have to)' },
  { question: 'Mis hermanos _______ pasar la aspiradora.', options: ['son', 'están', 'tienen que'], answer: 'tienen que', rule: 'Tener que + infinitive: Obligation (They have to)' },
  { question: 'Nosotros _______ limpiar el garaje.', options: ['somos', 'estamos', 'tenemos que'], answer: 'tenemos que', rule: 'Tener que + infinitive: Obligation (We have to)' },
  { question: 'Yo _______ planchar mi ropa.', options: ['tengo que', 'soy', 'estoy'], answer: 'tengo que', rule: 'Tener que + infinitive: Obligation (I have to)' },
  { question: 'Ella _______ poner la lavadora hoy.', options: ['tiene que', 'es', 'está'], answer: 'tiene que', rule: 'Tener que + infinitive: Obligation (She has to)' },
  { question: 'Ustedes _______ sacar la basura esta noche.', options: ['son', 'están', 'tienen que'], answer: 'tienen que', rule: 'Tener que + infinitive: Obligation (You all have to)' },
  // Hacer vs Poner
  { question: 'Yo siempre _______ los cubiertos en la mesa.', options: ['hago', 'pongo', 'tengo'], answer: 'pongo', rule: 'Poner: To put/set' },
  { question: '¿Ustedes _______ la compra en el supermercado?', options: ['hacen', 'ponen', 'tienen'], answer: 'hacen', rule: 'Hacer: To do/make' },
  { question: 'Nosotros _______ la televisión para ver las noticias.', options: ['hacemos', 'ponemos', 'somos'], answer: 'ponemos', rule: 'Poner: To turn on/set' },
  { question: 'Yo _______ un pastel de chocolate para el postre.', options: ['hago', 'pongo', 'estoy'], answer: 'hago', rule: 'Hacer: To make/create' },
  { question: 'Tú _______ la cama por la mañana.', options: ['haces', 'pones', 'tienes'], answer: 'haces', rule: 'Hacer: To make (the bed)' },
  { question: 'Mi madre _______ la lavadora los sábados.', options: ['hace', 'pone', 'tiene'], answer: 'pone', rule: 'Poner: To turn on/start (appliances)' },
  { question: 'Nosotros _______ mucho ejercicio en el parque.', options: ['hacemos', 'ponemos', 'somos'], answer: 'hacemos', rule: 'Hacer: To do (exercise)' },
  { question: 'Él _______ la cama todos los días.', options: ['hace', 'pone', 'tiene'], answer: 'hace', rule: 'Hacer: To make (the bed)' },
  { question: 'Ellos _______ la mesa para la cena.', options: ['hacen', 'ponen', 'tienen'], answer: 'ponen', rule: 'Poner: To set (the table)' },
];

const TRANSLATION_DATA = [
  // Original translations
  { en: 'I set the table every day.', es: 'Yo pongo la mesa todos los días.' },
  { en: 'I always vacuum.', es: 'Yo siempre paso la aspiradora.' },
  { en: 'I iron sometimes.', es: 'Yo plancho a veces.' },
  { en: 'I always make my bed.', es: 'Yo siempre hago mi cama.' },
  { en: 'I often do laundry.', es: 'Yo a menudo pongo la lavadora.' },
  { en: 'I never cook.', es: 'Yo nunca cocino.' },
  { en: 'I wash the dishes three times per week.', es: 'Yo lavo los platos tres veces por semana.' },
  { en: 'I take the dog for a walk four times per week.', es: 'Yo saco a pasear el perro cuatro veces por semana.' },
  { en: 'I rarely go grocery shopping.', es: 'Yo casi nunca hago la compra.' },
  { en: 'I almost always take out the trash.', es: 'Yo casi siempre saco la basura.' },
  { en: 'I organize my room twice a week.', es: 'Yo ordeno mi cuarto dos veces por semana.' },
  
  // New creative combinations using same vocabulary and patterns
  { en: 'I almost always make my bed.', es: 'Yo casi siempre hago mi cama.' },
  { en: 'I do laundry every day.', es: 'Yo pongo la lavadora todos los días.' },
  { en: 'I rarely take out the trash.', es: 'Yo casi nunca saco la basura.' },
  { en: 'I cook twice a week.', es: 'Yo cocino dos veces por semana.' },
  { en: 'I vacuum four times a week.', es: 'Yo paso la aspiradora cuatro veces por semana.' },
  { en: 'I set the table three times a week.', es: 'Yo pongo la mesa tres veces por semana.' },
  { en: 'I never iron.', es: 'Yo nunca plancho.' },
  { en: 'I never wash the dishes.', es: 'Yo nunca lavo los platos.' },
];

// --- COMPONENTS ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="w-full bg-slate-200 rounded-full h-4 mb-6 overflow-hidden border-2 border-cyan-200">
    <motion.div 
      className="bg-gradient-to-r from-teal-400 to-blue-500 h-full rounded-full"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ type: 'spring', stiffness: 50 }}
    />
  </div>
);

const SuccessScreen = ({ onHome, score, total }: { onHome: () => void, score?: number, total?: number }) => {
  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, colors: ['#06b6d4', '#14b8a6', '#0ea5e9', '#3b82f6', '#fb7185'], origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, colors: ['#06b6d4', '#14b8a6', '#0ea5e9', '#3b82f6', '#fb7185'], origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl text-center max-w-md w-full border-4 border-teal-400 relative z-10"
    >
      <div className="bg-rose-100 p-6 rounded-full mb-6">
        <Star className="w-20 h-20 text-rose-400 fill-rose-400" />
      </div>
      <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">¡Excelente!</h2>
      <p className="text-xl text-slate-600 mb-8 font-medium">
        You completed the challenge!
        {score !== undefined && total !== undefined && (
          <span className="block mt-2 text-2xl font-bold text-teal-600">Score: {score}/{total}</span>
        )}
      </p>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onHome}
        className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:shadow-xl transition-all"
      >
        <Home className="w-6 h-6" />
        Back to Menu
      </motion.button>
    </motion.div>
  );
};

// --- MINI GAMES ---

const Flashcards = ({ onComplete }: { onComplete: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cards] = useState(() => shuffleArray(VOCAB_DATA));

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(c => c + 1), 150);
    } else {
      onComplete();
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-lg">
      <ProgressBar current={currentIndex} total={cards.length} />
      
      <div className="w-full aspect-[4/3] perspective-1000 mb-8">
        <motion.div
          className="w-full h-full relative preserve-3d cursor-pointer"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* Front */}
          <div className="absolute w-full h-full backface-hidden bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl border-4 border-cyan-400 flex flex-col items-center justify-center p-8 text-center">
            <span className="text-sm font-bold text-cyan-500 uppercase tracking-wider mb-4">Spanish</span>
            <h3 className="text-4xl font-black text-slate-800">{cards[currentIndex].es}</h3>
            <p className="text-cyan-400 mt-8 text-sm font-medium animate-pulse">Tap to flip</p>
          </div>
          
          {/* Back */}
          <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl shadow-xl border-4 border-cyan-300 flex flex-col items-center justify-center p-8 text-center rotate-y-180">
            <span className="text-sm font-bold text-cyan-100 uppercase tracking-wider mb-4">English</span>
            <h3 className="text-4xl font-black text-white">{cards[currentIndex].en}</h3>
          </div>
        </motion.div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNext}
        className="w-full bg-teal-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-2 relative z-10"
      >
        {currentIndex === cards.length - 1 ? 'Finish' : 'Next Card'}
        <ArrowRight className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

const GrammarQuiz = ({ onComplete }: { onComplete: (score: number) => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [questions] = useState(() => 
    shuffleArray(GRAMMAR_DATA).map(q => ({
      ...q,
      options: shuffleArray(q.options)
    }))
  );

  const currentQ = questions[currentIndex];

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
    if (option === currentQ.answer) {
      setScore(s => s + 1);
      confetti({ particleCount: 30, spread: 60, origin: { y: 0.8 } });
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setSelected(null);
      setCurrentIndex(c => c + 1);
    } else {
      onComplete(score);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-xl relative z-10">
      <ProgressBar current={currentIndex} total={questions.length} />
      
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6 border-4 border-teal-400">
        <h3 className="text-2xl font-bold text-slate-800 mb-6 leading-relaxed">
          {currentQ.question.split('_______').map((part, i, arr) => (
            <React.Fragment key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block px-4 py-1 mx-2 bg-teal-50 border-b-4 border-teal-300 rounded-lg text-teal-700 font-black min-w-[80px] text-center">
                  {selected || '?'}
                </span>
              )}
            </React.Fragment>
          ))}
        </h3>

        <div className="grid gap-4">
          {currentQ.options.map((option) => {
            const isCorrect = option === currentQ.answer;
            const isSelected = option === selected;
            
            let btnClass = "bg-white border-slate-200 text-slate-700 hover:bg-teal-50 hover:border-teal-300";
            if (selected) {
              if (isCorrect) btnClass = "bg-emerald-100 border-emerald-500 text-emerald-800";
              else if (isSelected) btnClass = "bg-rose-100 border-rose-500 text-rose-800";
              else btnClass = "bg-white border-slate-200 text-slate-400 opacity-50";
            }

            return (
              <motion.button
                key={option}
                whileHover={!selected ? { scale: 1.02 } : {}}
                whileTap={!selected ? { scale: 0.98 } : {}}
                onClick={() => handleSelect(option)}
                disabled={!!selected}
                className={cn(
                  "p-4 rounded-2xl border-4 font-bold text-xl text-left flex items-center justify-between transition-colors",
                  btnClass
                )}
              >
                {option}
                {selected && isCorrect && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
                {selected && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-rose-500" />}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 24 }}
              className="bg-cyan-50 p-4 rounded-xl border-2 border-cyan-200"
            >
              <p className="text-cyan-800 font-medium flex items-center gap-2">
                <Fish className="w-5 h-5" />
                {currentQ.rule}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selected && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleNext}
          className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-2"
        >
          {currentIndex === questions.length - 1 ? 'Finish' : 'Next Question'}
          <ArrowRight className="w-6 h-6" />
        </motion.button>
      )}
    </div>
  );
};

const SentenceBuilder = ({ onComplete }: { onComplete: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentences] = useState(() => shuffleArray(TRANSLATION_DATA));
  const currentS = sentences[currentIndex];
  
  const [words, setWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    // Initialize words for current sentence
    const correctWords = currentS.es.replace('.', '').split(' ');
    // Add some distractors (dummy words) to make it a bit challenging but not overwhelming
    const distractors = ['hace', 'el', 'la', 'está'].filter(w => !correctWords.includes(w)).slice(0, 2);
    const allWords = shuffleArray([...correctWords, ...distractors]);
    
    setWords(allWords);
    setSelectedWords([]);
    setIsCorrect(null);
  }, [currentIndex, currentS]);

  const handleWordClick = (word: string, index: number) => {
    if (isCorrect !== null) return;
    
    // Remove from available, add to selected
    const newWords = [...words];
    newWords.splice(index, 1);
    setWords(newWords);
    setSelectedWords([...selectedWords, word]);
  };

  const handleSelectedClick = (word: string, index: number) => {
    if (isCorrect !== null) return;
    
    // Remove from selected, add back to available
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setWords([...words, word]);
  };

  const checkAnswer = () => {
    const attempt = selectedWords.join(' ') + '.';
    if (attempt === currentS.es) {
      setIsCorrect(true);
      confetti({ particleCount: 40, spread: 70, origin: { y: 0.7 } });
    } else {
      setIsCorrect(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < sentences.length - 1) {
      setCurrentIndex(c => c + 1);
    } else {
      onComplete();
    }
  };

  const resetAttempt = () => {
    setIsCorrect(null);
    setWords(shuffleArray([...words, ...selectedWords]));
    setSelectedWords([]);
  };

  return (
    <div className="flex flex-col w-full max-w-2xl relative z-10">
      <ProgressBar current={currentIndex} total={sentences.length} />
      
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-6 border-4 border-blue-400">
        <div className="text-center mb-8">
          <span className="text-blue-500 font-bold uppercase tracking-wider text-sm mb-2 block">Translate this</span>
          <h3 className="text-3xl font-black text-slate-800">{currentS.en}</h3>
        </div>

        {/* Drop zone */}
        <div className="min-h-[100px] p-4 bg-cyan-50/50 border-4 border-dashed border-cyan-300 rounded-2xl mb-8 flex flex-wrap gap-3 items-start content-start">
          {selectedWords.length === 0 && (
            <span className="text-cyan-700/50 font-medium w-full text-center mt-4">Tap words below to build the sentence</span>
          )}
          <AnimatePresence>
            {selectedWords.map((word, i) => (
              <motion.button
                key={`sel-${word}-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleSelectedClick(word, i)}
                className="bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-lg shadow-md hover:bg-blue-600 transition-colors"
              >
                {word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Word bank */}
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <AnimatePresence>
            {words.map((word, i) => (
              <motion.button
                key={`word-${word}-${i}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleWordClick(word, i)}
                className="bg-white border-2 border-slate-200 text-slate-700 px-5 py-3 rounded-xl font-bold text-lg shadow-sm hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                {word}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          {isCorrect === null ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={checkAnswer}
              disabled={selectedWords.length === 0}
              className="flex-1 bg-cyan-600 disabled:bg-slate-300 text-white py-4 rounded-2xl font-bold text-xl shadow-lg transition-colors"
            >
              Check Answer
            </motion.button>
          ) : isCorrect ? (
            <motion.button
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={handleNext}
              className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-2"
            >
              Correct! Next <ArrowRight className="w-6 h-6" />
            </motion.button>
          ) : (
            <motion.button
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              onClick={resetAttempt}
              className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-bold text-xl shadow-lg flex items-center justify-center gap-2"
            >
              Try Again <RotateCcw className="w-6 h-6" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---

type ViewState = 'menu' | 'vocab' | 'grammar' | 'translate' | 'success';

export default function App() {
  const [view, setView] = useState<ViewState>('menu');
  const [lastScore, setLastScore] = useState<number | undefined>();
  const [lastTotal, setLastTotal] = useState<number | undefined>();

  const handleComplete = (score?: number, total?: number) => {
    setLastScore(score);
    setLastTotal(total);
    setView('success');
  };

  return (
    <div className="min-h-screen bg-cyan-50 font-sans text-slate-900 selection:bg-teal-200 flex flex-col relative overflow-hidden">
      {/* Decorative Bubbles (CSS added at bottom) */}
      <div className="bubbles" aria-hidden="true">
        {[...Array(10)].map((_, i) => <div className="bubble" key={i}></div>)}
      </div>

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm px-6 py-4 flex items-center justify-between sticky top-0 z-10 border-b border-cyan-100">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('menu')}>
          <div className="bg-teal-500 p-2 rounded-xl">
            <Anchor className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-800">
            Spanish<span className="text-teal-500">Reef</span>
          </h1>
        </div>
        {view !== 'menu' && view !== 'success' && (
          <button 
            onClick={() => setView('menu')}
            className="text-cyan-700 hover:text-cyan-900 font-bold flex items-center gap-2 bg-cyan-100 px-4 py-2 rounded-lg transition-colors"
          >
            <Home className="w-5 h-5" />
            <span className="hidden sm:inline">Menu</span>
          </button>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-8 relative z-10">
        <AnimatePresence mode="wait">
          {view === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="md:col-span-3 text-center mb-6">
                <h2 className="text-4xl sm:text-5xl font-black text-slate-800 mb-4">Ready to dive in?</h2>
                <p className="text-xl text-slate-500 font-medium">Choose a mini-game to master your Spanish chores and grammar.</p>
              </div>

              <motion.button
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('vocab')}
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-b-8 border-cyan-500 flex flex-col items-center text-center group transition-all"
              >
                <div className="bg-cyan-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <Fish className="w-12 h-12 text-cyan-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Vocab Flashcards</h3>
                <p className="text-slate-500 font-medium">Master household chores and frequency words.</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('grammar')}
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-b-8 border-teal-500 flex flex-col items-center text-center group transition-all"
              >
                <div className="bg-teal-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <Waves className="w-12 h-12 text-teal-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Grammar Quiz</h3>
                <p className="text-slate-500 font-medium">Practice Ser vs Estar and Hacer vs Poner.</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setView('translate')}
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-b-8 border-blue-500 flex flex-col items-center text-center group transition-all"
              >
                <div className="bg-blue-100 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
                  <Droplets className="w-12 h-12 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-2">Sentence Builder</h3>
                <p className="text-slate-500 font-medium">Translate sentences by connecting words.</p>
              </motion.button>
            </motion.div>
          )}

          {view === 'vocab' && (
            <motion.div key="vocab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex justify-center">
              <Flashcards onComplete={() => handleComplete()} />
            </motion.div>
          )}

          {view === 'grammar' && (
            <motion.div key="grammar" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex justify-center">
              <GrammarQuiz onComplete={(score) => handleComplete(score, GRAMMAR_DATA.length)} />
            </motion.div>
          )}

          {view === 'translate' && (
            <motion.div key="translate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full flex justify-center">
              <SentenceBuilder onComplete={() => handleComplete()} />
            </motion.div>
          )}

          {view === 'success' && (
            <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex justify-center">
              <SuccessScreen onHome={() => setView('menu')} score={lastScore} total={lastTotal} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Global CSS for 3D transforms & Bubbles */}
      <style dangerouslySetInnerHTML={{__html: `
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }

        /* Animated Bubbles */
        .bubbles { position: absolute; width: 100%; height: 100%; z-index: 0; overflow: hidden; top: 0; left: 0; pointer-events: none; }
        .bubble { position: absolute; bottom: -20px; width: 20px; height: 20px; background: rgba(255,255,255,0.4); border-radius: 50%; opacity: 0; animation: float 10s infinite ease-in; }
        .bubble:nth-child(1) { left: 10%; animation-duration: 8s; animation-delay: 1s; width: 40px; height: 40px; }
        .bubble:nth-child(2) { left: 20%; animation-duration: 5s; animation-delay: 2s; width: 15px; height: 15px; }
        .bubble:nth-child(3) { left: 35%; animation-duration: 7s; animation-delay: 4s; width: 30px; height: 30px; }
        .bubble:nth-child(4) { left: 50%; animation-duration: 11s; animation-delay: 0s; width: 25px; height: 25px; background: rgba(20, 184, 166, 0.2); }
        .bubble:nth-child(5) { left: 65%; animation-duration: 6s; animation-delay: 3s; width: 10px; height: 10px; }
        .bubble:nth-child(6) { left: 75%; animation-duration: 9s; animation-delay: 1s; width: 35px; height: 35px; }
        .bubble:nth-child(7) { left: 85%; animation-duration: 12s; animation-delay: 5s; width: 20px; height: 20px; }
        .bubble:nth-child(8) { left: 90%; animation-duration: 8s; animation-delay: 2s; width: 45px; height: 45px; }
        .bubble:nth-child(9) { left: 55%; animation-duration: 10s; animation-delay: 6s; width: 18px; height: 18px; background: rgba(6, 182, 212, 0.2); }
        .bubble:nth-child(10) { left: 5%; animation-duration: 9s; animation-delay: 4s; width: 28px; height: 28px; }
        @keyframes float { 0% { opacity: 0; transform: translateY(0) scale(0.8); } 20% { opacity: 1; transform: translateY(-20vh) scale(1); } 100% { opacity: 0; transform: translateY(-100vh) scale(1.2); } }
      `}} />
    </div>
  );
}
