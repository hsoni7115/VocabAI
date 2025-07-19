// class VocabularyApp {
//             constructor() {
//                 this.apiBase = 'http://localhost:5000/api';
//                 this.recognition = null;
//                 this.synth = window.speechSynthesis;
//                 this.searchHistory = this.loadHistory();
                
//                 this.initializeElements();
//                 this.setupEventListeners();
//                 this.initializeSpeechRecognition();
//                 this.renderHistory();
//             }

//             initializeElements() {
//                 this.searchInput = document.getElementById('searchInput');
//                 this.searchBtn = document.getElementById('searchBtn');
//                 this.voiceBtn = document.getElementById('voiceBtn');
//                 this.contextInput = document.getElementById('contextInput');
//                 this.generateExamplesBtn = document.getElementById('generateExamplesBtn');
//                 this.speakBtn = document.getElementById('speakBtn');
//                 this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
                
//                 this.loading = document.getElementById('loading');
//                 this.error = document.getElementById('error');
//                 this.success = document.getElementById('success');
//                 this.resultsSection = document.getElementById('resultsSection');
                
//                 this.wordTitle = document.getElementById('wordTitle');
//                 this.pronunciation = document.getElementById('pronunciation');
//                 this.partOfSpeech = document.getElementById('partOfSpeech');
//                 this.definitionsList = document.getElementById('definitionsList');
//                 this.synonymsList = document.getElementById('synonymsList');
//                 this.antonymsList = document.getElementById('antonymsList');
//                 this.examplesList = document.getElementById('examplesList');
//                 this.historyList = document.getElementById('historyList');
//             }

//             setupEventListeners() {
//                 this.searchBtn.addEventListener('click', () => this.searchWord());
//                 this.generateExamplesBtn.addEventListener('click', () => this.generateExamples());
//                 this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecognition());
//                 this.speakBtn.addEventListener('click', () => this.speakWord());
//                 this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
                
//                 this.searchInput.addEventListener('keypress', (e) => {
//                     if (e.key === 'Enter') this.searchWord();
//                 });
                
//                 this.contextInput.addEventListener('keypress', (e) => {
//                     if (e.key === 'Enter') this.generateExamples();
//                 });
//             }

//             initializeSpeechRecognition() {
//                 if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
//                     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//                     this.recognition = new SpeechRecognition();
//                     this.recognition.continuous = false;
//                     this.recognition.interimResults = false;
//                     this.recognition.lang = 'en-US';
                    
//                     this.recognition.onstart = () => {
//                         this.voiceBtn.classList.add('recording');
//                         this.voiceBtn.textContent = '🎤';
//                         this.showMessage('Listening... Speak now!', 'success');
//                     };
                    
//                     this.recognition.onresult = (event) => {
//                         const transcript = event.results[0][0].transcript;
//                         this.searchInput.value = transcript;
//                         this.showMessage(`Heard: "${transcript}"`, 'success');
//                         setTimeout(() => this.searchWord(), 1000);
//                     };
                    
//                     this.recognition.onend = () => {
//                         this.voiceBtn.classList.remove('recording');
//                         this.voiceBtn.textContent = '🎙️';
//                     };
                    
//                     this.recognition.onerror = (event) => {
//                         this.voiceBtn.classList.remove('recording');
//                         this.voiceBtn.textContent = '🎙️';
//                         this.showMessage('Voice recognition error. Please try again.', 'error');
//                     };
//                 } else {
//                     this.voiceBtn.style.display = 'none';
//                 }
//             }

//             toggleVoiceRecognition() {
//                 if (!this.recognition) return;
                
//                 if (this.voiceBtn.classList.contains('recording')) {
//                     this.recognition.stop();
//                 } else {
//                     this.recognition.start();
//                 }
//             }

//             async searchWord() {
//                 const word = this.searchInput.value.trim();
//                 if (!word) {
//                     this.showMessage('Please enter a word to search.', 'error');
//                     return;
//                 }

//                 this.showLoading(true);
//                 this.hideMessages();

//                 try {
//                     const response = await fetch(`${this.apiBase}/word/${encodeURIComponent(word)}`);
//                     const data = await response.json();

//                     if (data.found) {
//                         this.displayResults(data);
//                         this.addToHistory(word);
//                         this.showMessage('Word found successfully!', 'success');
//                     } else {
//                         this.showMessage(`Word "${word}" not found. Please check spelling and try again.`, 'error');
//                         this.resultsSection.style.display = 'none';
//                     }
//                 } catch (error) {
//                     console.error('Search error:', error);
//                     this.showMessage('Unable to search. Please check your connection and try again.', 'error');
//                 } finally {
//                     this.showLoading(false);
//                 }
//             }

//             async generateExamples() {
//                 const word = this.wordTitle.textContent || this.searchInput.value.trim();
//                 const context = this.contextInput.value.trim() || 'general';
                
//                 if (!word) {
//                     this.showMessage('Please search for a word first.', 'error');
//                     return;
//                 }

//                 this.generateExamplesBtn.textContent = '🤖 Generating...';
//                 this.generateExamplesBtn.disabled = true;

//                 try {
//                     const response = await fetch(`${this.apiBase}/examples`, {
//                         method: 'POST',
//                         headers: {
//                             'Content-Type': 'application/json',
//                         },
//                         body: JSON.stringify({
//                             word: word,
//                             context: context
//                         })
//                     });

//                     const data = await response.json();
//                     if (data.success && data.examples) {
//                         this.displayExamples(data.examples, data.fallback);
//                         const message = data.fallback ? 
//                             'Examples generated (using fallback mode)' : 
//                             'AI-powered examples generated successfully!';
//                         this.showMessage(message, 'success');
//                     } else {
//                         this.showMessage('Unable to generate examples. Please try again.', 'error');
//                     }
//                 } catch (error) {
//                     console.error('Examples generation error:', error);
//                     this.showMessage('Error generating examples. Please try again.', 'error');
//                 } finally {
//                     this.generateExamplesBtn.textContent = '🤖 Generate Examples';
//                     this.generateExamplesBtn.disabled = false;
//                 }
//             }

//             speakWord() {
//                 const word = this.wordTitle.textContent;
//                 if (!word) return;

//                 if (this.synth.speaking) {
//                     this.synth.cancel();
//                     return;
//                 }

//                 const utterance = new SpeechSynthesisUtterance(word);
//                 utterance.rate = 0.8;
//                 utterance.pitch = 1;
//                 utterance.volume = 1;

//                 utterance.onstart = () => {
//                     this.speakBtn.textContent = '🔊 Speaking...';
//                 };

//                 utterance.onend = () => {
//                     this.speakBtn.textContent = '🔊 Speak';
//                 };

//                 this.synth.speak(utterance);
//             }

//             displayResults(data) {
//                 this.wordTitle.textContent = data.word.charAt(0).toUpperCase() + data.word.slice(1);
//                 this.pronunciation.textContent = data.pronunciation || '';
//                 // this.partOfSpeech.textContent = data.part_of_speech || '';
//                 this.partOfSpeech.innerHTML = ''; // Clear previous content
//                 if (data.parts_of_speech && data.parts_of_speech.length > 0) {
//             // Option 1: Join all parts of speech with a comma
//                     this.partOfSpeech.textContent = data.parts_of_speech.join(', ');

//             // Option 2: (Uncomment this block if you prefer separate tags for each part of speech)
//             /*
//             data.parts_of_speech.forEach(pos => {
//                 const span = document.createElement('span');
//                 span.className = 'part-of-speech'; // Use your existing class for styling
//                 span.textContent = pos;
//                 this.partOfSpeech.appendChild(span);
//             });
//             */
//                 } else {
//                     this.partOfSpeech.textContent = 'N/A'; // Or leave empty
//                 }

//                 // Definitions
//                 this.definitionsList.innerHTML = '';
//                 if (data.definitions && data.definitions.length > 0) {
//                     data.definitions.forEach(def => {
//                         const li = document.createElement('li');
//                         li.textContent = def;
//                         this.definitionsList.appendChild(li);
//                     });
//                 } else {
//                     this.definitionsList.innerHTML = '<li>No definitions available.</li>';
//                 }

//                 // Synonyms
//                 this.displayWordList(this.synonymsList, data.synonyms || [], 'synonym');

//                 // Antonyms
//                 this.displayWordList(this.antonymsList, data.antonyms || [], 'antonym');

//                 // Clear previous examples
//                 this.examplesList.innerHTML = '<p>Use the "Generate Examples" button above to create context-aware examples.</p>';

//                 this.resultsSection.style.display = 'block';
//                 this.resultsSection.scrollIntoView({ behavior: 'smooth' });
//             }

//             displayWordList(container, words, type) {
//                 container.innerHTML = '';
//                 if (words.length > 0) {
//                     words.forEach(word => {
//                         const span = document.createElement('span');
//                         span.className = 'word-tag';
//                         span.textContent = word;
//                         span.addEventListener('click', () => {
//                             this.searchInput.value = word;
//                             this.searchWord();
//                         });
//                         container.appendChild(span);
//                     });
//                 } else {
//                     container.innerHTML = `<span class="word-tag">No ${type}s found</span>`;
//                 }
//             }

//             displayExamples(examples, isFallback = false) {
//                 this.examplesList.innerHTML = '';
//                 if (examples && examples.length > 0) {
//                     examples.forEach((example, index) => {
//                         const div = document.createElement('div');
//                         div.className = 'example-item';
//                         div.innerHTML = `
//                             <strong>Example ${index + 1}:</strong> ${example}
//                             ${isFallback ? '<small style="color: #666; font-style: italic;"> (Fallback example)</small>' : ''}
//                         `;
//                         this.examplesList.appendChild(div);
//                     });
//                 } else {
//                     this.examplesList.innerHTML = '<p>No examples could be generated. Please try again.</p>';
//                 }
//             }

//             addToHistory(word) {
//                 const normalizedWord = word.toLowerCase();
                
//                 // Remove if already exists to avoid duplicates
//                 this.searchHistory = this.searchHistory.filter(item => item.word !== normalizedWord);
                
//                 // Add to beginning of array
//                 this.searchHistory.unshift({
//                     word: normalizedWord,
//                     timestamp: new Date().toLocaleDateString(),
//                     displayWord: word.charAt(0).toUpperCase() + word.slice(1)
//                 });

//                 // Keep only last 20 searches
//                 if (this.searchHistory.length > 20) {
//                     this.searchHistory = this.searchHistory.slice(0, 20);
//                 }

//                 this.saveHistory();
//                 this.renderHistory();
//             }

//             renderHistory() {
//                 if (this.searchHistory.length === 0) {
//                     this.historyList.innerHTML = '<div class="no-results">No recent searches yet. Start exploring words!</div>';
//                     this.clearHistoryBtn.style.display = 'none';
//                     return;
//                 }

//                 this.historyList.innerHTML = '';
//                 this.clearHistoryBtn.style.display = 'inline-block';

//                 this.searchHistory.forEach(item => {
//                     const div = document.createElement('div');
//                     div.className = 'history-item';
//                     div.innerHTML = `
//                         <span><strong>${item.displayWord}</strong></span>
//                         <span style="color: #666; font-size: 0.9em;">${item.timestamp}</span>
//                     `;
//                     div.addEventListener('click', () => {
//                         this.searchInput.value = item.word;
//                         this.searchWord();
//                     });
//                     this.historyList.appendChild(div);
//                 });
//             }

//             clearHistory() {
//                 if (confirm('Are you sure you want to clear your search history?')) {
//                     this.searchHistory = [];
//                     this.saveHistory();
//                     this.renderHistory();
//                     this.showMessage('Search history cleared successfully!', 'success');
//                 }
//             }

//             loadHistory() {
//                 try {
//                     const saved = localStorage.getItem('vocabularySearchHistory');
//                     return saved ? JSON.parse(saved) : [];
//                 } catch (error) {
//                     console.error('Error loading history:', error);
//                     return [];
//                 }
//             }

//             saveHistory() {
//                 try {
//                     localStorage.setItem('vocabularySearchHistory', JSON.stringify(this.searchHistory));
//                 } catch (error) {
//                     console.error('Error saving history:', error);
//                 }
//             }

//             showLoading(show) {
//                 this.loading.style.display = show ? 'block' : 'none';
//             }

//             showMessage(message, type) {
//                 this.hideMessages();
//                 const element = type === 'error' ? this.error : this.success;
//                 element.textContent = message;
//                 element.style.display = 'block';
                
//                 // Auto hide success messages after 3 seconds
//                 if (type === 'success') {
//                     setTimeout(() => {
//                         element.style.display = 'none';
//                     }, 3000);
//                 }
//             }

//             hideMessages() {
//                 this.error.style.display = 'none';
//                 this.success.style.display = 'none';
//             }
//         }

//         // Initialize app when DOM is loaded
//         document.addEventListener('DOMContentLoaded', () => {
//             new VocabularyApp();
//         });

//         // Service Worker for offline functionality (optional)
//         if ('serviceWorker' in navigator) {
//             window.addEventListener('load', () => {
//                 navigator.serviceWorker.register('/sw.js')
//                     .then(registration => {
//                         console.log('SW registered: ', registration);
//                     })
//                     .catch(registrationError => {
//                         console.log('SW registration failed: ', registrationError);
//                     });
//             });
//         }
class VocabularyApp {
    constructor() {
        this.apiBase = '/api';
        this.recognition = null;
        this.synth = window.speechSynthesis;
        this.searchHistory = this.loadHistory();

        this.initializeElements();
        this.setupEventListeners();
        this.initializeSpeechRecognition();
        this.renderHistory();
        this.applySavedTheme(); // Apply theme on load
    }

    initializeElements() {
        this.searchInput = document.getElementById('searchInput');
        this.searchBtn = document.getElementById('searchBtn');
        this.voiceBtn = document.getElementById('voiceBtn');
        this.contextInput = document.getElementById('contextInput');
        this.generateExamplesBtn = document.getElementById('generateExamplesBtn');
        this.speakBtn = document.getElementById('speakBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.themeToggleBtn = document.getElementById('themeToggleBtn'); // New

        this.loading = document.getElementById('loading');
        this.error = document.getElementById('error');
        this.success = document.getElementById('success');
        this.resultsSection = document.getElementById('resultsSection');

        this.wordTitle = document.getElementById('wordTitle');
        this.pronunciation = document.getElementById('pronunciation');
        this.partOfSpeech = document.getElementById('partOfSpeech');
        this.definitionsList = document.getElementById('definitionsList');
        this.synonymsList = document.getElementById('synonymsList');
        this.antonymsList = document.getElementById('antonymsList');
        this.examplesList = document.getElementById('examplesList');
        this.historyList = document.getElementById('historyList');
    }

    setupEventListeners() {
        this.searchBtn.addEventListener('click', () => this.searchWord());
        this.generateExamplesBtn.addEventListener('click', () => this.generateExamples());
        this.voiceBtn.addEventListener('click', () => this.toggleVoiceRecognition());
        this.speakBtn.addEventListener('click', () => this.speakWord());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.themeToggleBtn.addEventListener('click', () => this.toggleTheme()); // New

        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchWord();
        });

        this.contextInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.generateExamples();
        });
    }

    // New theme methods
    toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        this.updateThemeToggleButton(isDarkMode);
    }

    applySavedTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            this.updateThemeToggleButton(true);
        } else {
            this.updateThemeToggleButton(false);
        }
    }

    updateThemeToggleButton(isDarkMode) {
        if (isDarkMode) {
            this.themeToggleBtn.innerHTML = '<i class="fas fa-sun"></i>'; // Sun icon for dark mode
            this.themeToggleBtn.title = 'Toggle Light Mode';
        } else {
            this.themeToggleBtn.innerHTML = '<i class="fas fa-moon"></i>'; // Moon icon for light mode
            this.themeToggleBtn.title = 'Toggle Dark Mode';
        }
    }

    initializeSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'en-US';

            this.recognition.onstart = () => {
                this.voiceBtn.classList.add('recording');
                this.voiceBtn.textContent =  '<i class="fas fa-microphone-alt"></i>';
                this.showMessage('Listening... Speak now!', 'success');
            };

            this.recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                this.searchInput.value = transcript;
                this.showMessage(`Heard: "${transcript}"`, 'success');
                setTimeout(() => this.searchWord(), 1000);
            };

            this.recognition.onend = () => {
                this.voiceBtn.classList.remove('recording');
                // Revert to Font Awesome icon after recording ends
                this.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            };

            this.recognition.onerror = (event) => {
                this.voiceBtn.classList.remove('recording');
                // Revert to Font Awesome icon on error
                this.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
                this.showMessage('Voice recognition error. Please try again.', 'error');
            };
        } else {
            this.voiceBtn.style.display = 'none';
        }
    }

    toggleVoiceRecognition() {
        if (!this.recognition) return;

        if (this.voiceBtn.classList.contains('recording')) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    async searchWord() {
        const word = this.searchInput.value.trim();
        if (!word) {
            this.showMessage('Please enter a word to search.', 'error');
            return;
        }

        this.showLoading(true);
        this.hideMessages();

        try {
            const response = await fetch(`${this.apiBase}/word/${encodeURIComponent(word)}`);
            const data = await response.json();

            if (data.found) {
                this.displayResults(data);
                this.addToHistory(word);
                this.showMessage('Word found successfully!', 'success');
            } else {
                this.showMessage(`Word "${word}" not found. Please check spelling and try again.`, 'error');
                this.resultsSection.style.display = 'none';
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showMessage('Unable to search. Please check your connection and try again.', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async generateExamples() {
        const word = this.wordTitle.textContent || this.searchInput.value.trim();
        const context = this.contextInput.value.trim() || 'general';

        if (!word) {
            this.showMessage('Please search for a word first.', 'error');
            return;
        }

        this.generateExamplesBtn.innerHTML = '<i class="fas fa-robot fa-spin"></i> Generating...'; // Spinner
        this.generateExamplesBtn.disabled = true;

        try {
            const response = await fetch(`${this.apiBase}/examples`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    word: word,
                    context: context
                })
            });

            const data = await response.json();
            if (data.success && data.examples) {
                this.displayExamples(data.examples, data.fallback);
                const message = data.fallback ?
                    'Examples generated (using fallback mode)' :
                    'AI-powered examples generated successfully!';
                this.showMessage(message, 'success');
            } else {
                this.showMessage('Unable to generate examples. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Examples generation error:', error);
            this.showMessage('Error generating examples. Please try again.', 'error');
        } finally {
            this.generateExamplesBtn.innerHTML = '<i class="fas fa-robot"></i> Generate Examples';
            this.generateExamplesBtn.disabled = false;
        }
    }

    speakWord() {
        const word = this.wordTitle.textContent;
        if (!word) return;

        if (this.synth.speaking) {
            this.synth.cancel();
            return;
        }

        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 1;

        utterance.onstart = () => {
            this.speakBtn.innerHTML = '<i class="fas fa-volume-up fa-fade"></i> Speaking...';
        };

        utterance.onend = () => {
            this.speakBtn.innerHTML = '<i class="fas fa-volume-up"></i> Speak';
        };

        this.synth.speak(utterance);
    }

    displayResults(data) {
        this.wordTitle.textContent = data.word.charAt(0).toUpperCase() + data.word.slice(1);
        this.pronunciation.textContent = data.pronunciation || '';

        // --- Start Debugging ---
        console.log("Full data object received:", data);
        console.log("Parts of Speech received:", data.parts_of_speech);
        // --- End Debugging ---

        // Handle multiple parts of speech
        this.partOfSpeech.innerHTML = ''; // Clear previous content
        if (data.part_of_speech && data.part_of_speech.length > 0) {
            // Option 2: Display each part of speech as a separate styled tag
            // This is generally better for applying your .part-of-speech styling
            data.part_of_speech.forEach(pos => {
                const span = document.createElement('span');
                span.className = 'part-of-speech'; // Use your existing class for styling
                span.textContent = pos;
                this.partOfSpeech.appendChild(span);
            });
        } else {
            // Ensure this N/A is only displayed if truly no parts of speech are found
            this.partOfSpeech.textContent = 'N/A';
            console.warn("No parts of speech found for word:", data.word);
        }

        // Definitions
        this.definitionsList.innerHTML = '';
        if (data.definitions && data.definitions.length > 0) {
            data.definitions.forEach(def => {
                const li = document.createElement('li');
                li.textContent = def;
                this.definitionsList.appendChild(li);
            });
        } else {
            this.definitionsList.innerHTML = '<li>No definitions available.</li>';
        }

        // Synonyms
        this.displayWordList(this.synonymsList, data.synonyms || [], 'synonym');

        // Antonyms
        this.displayWordList(this.antonymsList, data.antonyms || [], 'antonym');

        // Clear previous examples
        this.examplesList.innerHTML = '<p>Use the "Generate Examples" button above to create context-aware examples.</p>';

        this.resultsSection.style.display = 'block';
        this.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }

    displayWordList(container, words, type) {
        container.innerHTML = '';
        if (words.length > 0) {
            words.forEach(word => {
                const span = document.createElement('span');
                span.className = 'word-tag';
                span.textContent = word;
                span.addEventListener('click', () => {
                    this.searchInput.value = word;
                    this.searchWord();
                });
                container.appendChild(span);
            });
        } else {
            container.innerHTML = `<span class="word-tag">No ${type}s found</span>`;
        }
    }

    displayExamples(examples, isFallback = false) {
        this.examplesList.innerHTML = '';
        if (examples && examples.length > 0) {
            examples.forEach((example, index) => {
                const div = document.createElement('div');
                div.className = 'example-item';
                div.innerHTML = `
                            <strong>Example ${index + 1}:</strong> ${example}
                            ${isFallback ? '<small style="opacity: 0.7; font-style: italic;"> (Fallback example)</small>' : ''}
                        `;
                this.examplesList.appendChild(div);
            });
        } else {
            this.examplesList.innerHTML = '<p>No examples could be generated. Please try again.</p>';
        }
    }

    addToHistory(word) {
        const normalizedWord = word.toLowerCase();

        // Remove if already exists to avoid duplicates
        this.searchHistory = this.searchHistory.filter(item => item.word !== normalizedWord);

        // Add to beginning of array
        this.searchHistory.unshift({
            word: normalizedWord,
            timestamp: new Date().toLocaleDateString(),
            displayWord: word.charAt(0).toUpperCase() + word.slice(1)
        });

        // Keep only last 20 searches
        if (this.searchHistory.length > 20) {
            this.searchHistory = this.searchHistory.slice(0, 20);
        }

        this.saveHistory();
        this.renderHistory();
    }

    renderHistory() {
        if (this.searchHistory.length === 0) {
            this.historyList.innerHTML = '<div class="no-results">No recent searches yet. Start exploring words!</div>';
            this.clearHistoryBtn.style.display = 'none';
            return;
        }

        this.historyList.innerHTML = '';
        this.clearHistoryBtn.style.display = 'inline-block';

        this.searchHistory.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `
                        <span><strong>${item.displayWord}</strong></span>
                        <span>${item.timestamp}</span>
                    `;
            div.addEventListener('click', () => {
                this.searchInput.value = item.word;
                this.searchWord();
            });
            this.historyList.appendChild(div);
        });
    }

    clearHistory() {
        if (confirm('Are you sure you want to clear your search history?')) {
            this.searchHistory = [];
            this.saveHistory();
            this.renderHistory();
            this.showMessage('Search history cleared successfully!', 'success');
        }
    }

    loadHistory() {
        try {
            const saved = localStorage.getItem('vocabularySearchHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem('vocabularySearchHistory', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.error('Error saving history:', error);
        }
    }

    showLoading(show) {
        this.loading.style.display = show ? 'block' : 'none';
    }

    showMessage(message, type) {
        this.hideMessages();
        const element = type === 'error' ? this.error : this.success;
        element.textContent = message;
        element.style.display = 'block';

        // Auto hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                element.style.display = 'none';
            }, 3000);
        }
    }

    hideMessages() {
        this.error.style.display = 'none';
        this.success.style.display = 'none';
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new VocabularyApp();
});

// Service Worker for offline functionality (optional)
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('/sw.js')
//             .then(registration => {
//                 console.log('SW registered: ', registration);
//             })
//             .catch(registrationError => {
//                 console.log('SW registration failed: ', registrationError);
//             });
//     });
// }