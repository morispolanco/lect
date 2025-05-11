import React, { useState, useEffect } from 'react';

// Main App Component
export default function App() {
  const [user, setUser] = useState(null);
  const [readingText, setReadingText] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [progress, setProgress] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);

  // Mock user registration
  const handleRegister = (name) => {
    const newUser = {
      id: Date.now(),
      name,
      progress: [],
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Generate reading text and questions using OpenRouter API
  const generateContent = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions ', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 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'
        },
      });

      const data = await response.json();
      
      // Mock generated content for demo purposes since we can't make real API calls in static file
      setReadingText("La inteligencia artificial está transformando rápidamente nuestro mundo. Desde asistentes virtuales hasta sistemas de diagnóstico médico, la IA se está integrando en casi todos los aspectos de nuestra vida diaria. A medida que esta tecnología avanza, surgen importantes preguntas éticas sobre su uso y regulación.");
      
      setQuestions([
        {
          question: "¿Cuál es el tema principal del texto?",
          options: ["El impacto del cambio climático", "La evolución de la inteligencia artificial", "Historia de Internet", "Economía global"],
          correct: 1,
          explanation: "El texto trata principalmente sobre la inteligencia artificial y su impacto en la sociedad."
        },
        {
          question: "Según el texto, ¿qué está sucediendo con la inteligencia artificial?",
          options: ["Está disminuyendo su importancia", "Se está integrando en muchos aspectos de la vida diaria", "Solo se usa en investigación espacial", "Está prohibida en la mayoría de países"],
          correct: 1,
          explanation: "El texto menciona explícitamente que la IA 'se está integrando en casi todos los aspectos de nuestra vida diaria'."
        },
        {
          question: "¿Qué tipo de preguntas surgen con el avance de la IA según el texto?",
          options: ["Preguntas matemáticas", "Preguntas filosóficas sobre el alma", "Preguntas éticas", "Preguntas sobre deportes"],
          correct: 2,
          explanation: "El texto menciona que 'surgen importantes preguntas éticas sobre su uso y regulación'."
        },
        {
          question: "¿Cómo se describe mejor el tono del texto?",
          options: ["Totalmente negativo", "Entusiasta y positivo", "Neutral e informativo", "Humorístico"],
          correct: 2,
          explanation: "El texto presenta información sobre la IA sin mostrar un sesgo claramente positivo o negativo, manteniendo un tono informativo."
        },
        {
          question: "¿Qué implica la frase 'A medida que esta tecnología avanza'?",
          options: ["La IA ya no está cambiando", "La IA está retrocediendo", "La IA está desarrollándose continuamente", "La IA ha alcanzado su máximo potencial"],
          correct: 2,
          explanation: "La frase indica que la inteligencia artificial es una tecnología en constante evolución y desarrollo."
        }
      ]);
      
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setFeedback('');
    } catch (error) {
      console.error('Error fetching content:', error);
      alert('No se pudo cargar el contenido. Por favor, intenta de nuevo.');
    }
    setLoading(false);
  };

  // Handle answer selection
  const handleAnswerSelect = (index) => {
    setSelectedAnswer(index);
    
    if (index === questions[currentQuestionIndex].correct) {
      setScore(prev => prev + 1);
      setFeedback('¡Correcto!');
    } else {
      setFeedback(`Incorrecto. ${questions[currentQuestionIndex].explanation}`);
    }
  };

  // Move to next question or finish
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setFeedback('');
    } else {
      // Quiz finished
      const newProgress = {
        id: Date.now(),
        date: new Date().toISOString(),
        score: score + 1, // Add current correct answer
        difficulty
      };
      
      const updatedProgress = [...progress, newProgress];
      setProgress(updatedProgress);
      
      // Adjust difficulty based on performance
      const accuracy = (score + 1) / questions.length;
      if (accuracy > 0.8 && difficulty !== 'hard') {
        setDifficulty('hard');
      } else if (accuracy < 0.5 && difficulty !== 'easy') {
        setDifficulty('easy');
      }
      
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setFeedback('');
      setScore(0);
      
      // Save progress to mock database
      if (user) {
        const updatedUser = {
          ...user,
          progress: updatedProgress
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-indigo-700">Mejora tu Comprensión Lectora</h1>
          {!user ? (
            <RegisterForm onRegister={handleRegister} />
          ) : (
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {user.name}</span>
              <button 
                onClick={() => setUser(null)}
                className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {!user ? (
          <WelcomeScreen />
        ) : (
          <div className="space-y-8">
            {/* Reading Section */}
            <section className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-indigo-800">Texto de Lectura</h2>
              <div className="prose max-w-none mb-6 p-4 bg-gray-50 rounded-md border-l-4 border-indigo-200">
                {readingText || "Presiona el botón para generar un nuevo texto."}
              </div>
              
              {readingText && !questions.length && (
                <div className="flex justify-center mt-4">
                  <button 
                    onClick={generateContent}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                  >
                    {loading ? 'Cargando...' : 'Generar Preguntas'}
                  </button>
                </div>
              )}
            </section>

            {/* Questions Section */}
            {questions.length > 0 && (
              <section className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-indigo-800">
                    Pregunta {currentQuestionIndex + 1} de {questions.length}
                  </h2>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                    Dificultad: {difficulty}
                  </span>
                </div>
                
                <p className="mb-4 text-gray-700">{questions[currentQuestionIndex].question}</p>
                
                <div className="space-y-2 mb-4">
                  {questions[currentQuestionIndex].options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={selectedAnswer !== null}
                      className={`w-full text-left p-3 rounded-md border transition-colors ${
                        selectedAnswer === index
                          ? index === questions[currentQuestionIndex].correct
                            ? 'bg-green-100 border-green-300'
                            : 'bg-red-100 border-red-300'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
                
                {feedback && (
                  <div className={`p-3 rounded-md mb-4 ${
                    feedback.startsWith('¡Correcto!') 
                      ? 'bg-green-50 text-green-800' 
                      : 'bg-red-50 text-red-800'
                  }`}>
                    {feedback}
                  </div>
                )}
                
                <button
                  onClick={handleNextQuestion}
                  disabled={selectedAnswer === null}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finalizar Actividad' : 'Siguiente Pregunta'}
                </button>
              </section>
            )}

            {/* Progress Section */}
            {user.progress.length > 0 && (
              <section className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-indigo-800">Tu Progreso</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntaje</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dificultad</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {user.progress.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(item.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.score}/{questions.length}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {item.difficulty}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <button
                onClick={generateContent}
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
              >
                {loading ? 'Cargando...' : 'Nuevo Texto'}
              </button>
              
              <button
                onClick={() => {
                  setReadingText('');
                  setQuestions([]);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer(null);
                  setFeedback('');
                  setScore(0);
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Reiniciar Actividad
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-600">
          <p>© 2025 Mejora tu Comprensión Lectora - Aplicación educativa para estudiantes de bachillerato</p>
        </div>
      </footer>
    </div>
  );
}

// Welcome Screen Component
function WelcomeScreen() {
  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-3xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-indigo-800 mb-4">Bienvenido a la Plataforma de Comprensión Lectora</h2>
      <p className="text-gray-700 mb-6">
        Mejora tus habilidades de comprensión lectora con textos dinámicos y preguntas interactivas sobre diversos temas como cultura general, actualidad, ciencia, tecnología, historia y filosofía.
      </p>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <FeatureCard 
          icon={<BookIcon />} 
          title="Textos Dinámicos" 
          description="Accede a textos generados automáticamente sobre diversos temas interesantes." 
        />
        <FeatureCard 
          icon={<TestIcon />} 
          title="Preguntas Interactivas" 
          description="Responde preguntas de opción múltiple que evalúan vocabulario, inferencia y pensamiento crítico." 
        />
        <FeatureCard 
          icon={<ProgressIcon />} 
          title="Seguimiento de Progreso" 
          description="Monitorea tu avance y mejora con retroalimentación inmediata." 
        />
      </div>
      <p className="text-gray-600 italic">
        Regístrate para comenzar a mejorar tus habilidades de comprensión lectora hoy mismo.
      </p>
    </div>
  );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-indigo-50 p-5 rounded-lg border border-indigo-100">
      <div className="text-indigo-600 mb-3 flex justify-center">{icon}</div>
      <h3 className="text-lg font-semibold text-indigo-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

// Register Form Component
function RegisterForm({ onRegister }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      onRegister(name);
      setIsSubmitting(false);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center space-x-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:bg-indigo-300"
      >
        {isSubmitting ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  );
}

// Icon Components
function BookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
    </svg>
  );
}

function TestIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
    </svg>
  );
}
