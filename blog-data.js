const blogPosts = [
    {
        id: 1,
        category: 'ai',
        categoryLabel: { tr: 'AI & Teknoloji', en: 'AI & Technology' },
        title: {
            tr: 'AI ile İngilizce Nasıl Öğrenilir?',
            en: 'How to Learn English with AI?'
        },
        excerpt: {
            tr: 'Yapay zekanın gücünü kullanarak İngilizce öğrenmeyi nasıl hızlandırabilirsiniz?',
            en: 'How can you accelerate English learning using the power of AI?'
        },
        date: { tr: '13 Ocak 2026', en: 'January 13, 2026' },
        readTime: 5,
        gradient: 'from-blue-500 via-purple-500 to-pink-500',
        content: {
            tr: `
                <h2>AI Neden İngilizce Öğrenme İçin Devrim Yaratıyor?</h2>
                <p>Yapay zeka, dil öğrenme deneyimini kökten değiştirdi. Artık 24/7 size özel bir İngilizce öğretmeniniz var!</p>
                
                <h3>ChatGPT ile Konuşma Pratiği</h3>
                <p>ChatGPT'yi bir konuşma partneri gibi kullanabilirsiniz. <strong>Gerçek zamanlı düzeltmeler</strong> alarak hatalarınızı anında görebilirsiniz.</p>
                
                <h3>Claude ile Yazma Geliştirme</h3>
                <p>Claude, kompozisyonlarınızı detaylı şekilde analiz edebilir ve size <strong>profesyonel geri bildirim</strong> verebilir.</p>
                
                <h2>Pratik İpuçları</h2>
                <ul>
                    <li>Her gün 15 dakika AI ile konuşun</li>
                    <li>Hatalarınızı not alın ve tekrar edin</li>
                    <li>Farklı senaryolar deneyin (restoran, iş görüşmesi vb.)</li>
                </ul>
            `,
            en: `
                <h2>Why is AI Revolutionizing English Learning?</h2>
                <p>Artificial intelligence has fundamentally changed the language learning experience. Now you have a personalized English teacher available 24/7!</p>
                
                <h3>Speaking Practice with ChatGPT</h3>
                <p>You can use ChatGPT as a conversation partner. Get <strong>real-time corrections</strong> and see your mistakes instantly.</p>
                
                <h3>Writing Development with Claude</h3>
                <p>Claude can analyze your compositions in detail and provide <strong>professional feedback</strong>.</p>
                
                <h2>Practical Tips</h2>
                <ul>
                    <li>Talk to AI for 15 minutes every day</li>
                    <li>Note your mistakes and repeat</li>
                    <li>Try different scenarios (restaurant, job interview, etc.)</li>
                </ul>
            `
        }
    },
    {
        id: 2,
        category: 'vocabulary',
        categoryLabel: { tr: 'Kelime Öğrenme', en: 'Vocabulary' },
        title: {
            tr: '10 Dakikada Kelime Öğrenme Teknikleri',
            en: 'Word Learning Techniques in 10 Minutes'
        },
        excerpt: {
            tr: 'Günde sadece 10 dakika ayırarak kelime dağarcığınızı nasıl genişletebilirsiniz?',
            en: 'How can you expand your vocabulary by dedicating just 10 minutes a day?'
        },
        date: { tr: '10 Ocak 2026', en: 'January 10, 2026' },
        readTime: 4,
        gradient: 'from-green-500 via-teal-500 to-cyan-500',
        content: {
            tr: `
                <h2>Spaced Repetition Tekniği</h2>
                <p>Bilimsel araştırmalar, kelimeleri <strong>belirli aralıklarla tekrar</strong> etmenin en etkili yöntem olduğunu gösteriyor.</p>
                
                <h3>Quizlet Nasıl Kullanılır?</h3>
                <p>Quizlet, spaced repetition sistemini otomatik olarak uygular. Her gün 10 dakika çalışmanız yeterli!</p>
                
                <h2>Etkili Kelime Kartı Oluşturma</h2>
                <ul>
                    <li>Örnek cümle ekleyin</li>
                    <li>Görseller kullanın</li>
                    <li>Telaffuz notları ekleyin</li>
                </ul>
            `,
            en: `
                <h2>Spaced Repetition Technique</h2>
                <p>Scientific research shows that <strong>repeating words at specific intervals</strong> is the most effective method.</p>
                
                <h3>How to Use Quizlet?</h3>
                <p>Quizlet automatically applies the spaced repetition system. Just 10 minutes of study per day is enough!</p>
                
                <h2>Creating Effective Flashcards</h2>
                <ul>
                    <li>Add example sentences</li>
                    <li>Use images</li>
                    <li>Add pronunciation notes</li>
                </ul>
            `
        }
    },
    {
        id: 3,
        category: 'speaking',
        categoryLabel: { tr: 'Konuşma', en: 'Speaking' },
        title: {
            tr: 'Speaking Pratiği için 5 Altın İpucu',
            en: '5 Golden Tips for Speaking Practice'
        },
        excerpt: {
            tr: 'Konuşma becerinizi geliştirmek için mutlaka denemeniz gereken 5 yöntem.',
            en: '5 methods you must try to improve your speaking skills.'
        },
        date: { tr: '5 Ocak 2026', en: 'January 5, 2026' },
        readTime: 6,
        gradient: 'from-orange-500 via-red-500 to-pink-500',
        content: {
            tr: `
                <h2>1. Shadowing Tekniği</h2>
                <p>Native speaker'ı taklit ederek konuşun. Bu, <strong>doğal aksan</strong> kazanmanın en hızlı yoludur.</p>
                
                <h2>2. AI Conversation Partners</h2>
                <p>ChatGPT veya Claude ile günlük konuşma yapın. Farklı rol oyunları deneyin!</p>
                
                <h2>3. Kendini Kaydet</h2>
                <p>Konuşmanızı kaydedin ve dinleyin. Gelişiminizi görmek çok motive edici!</p>
                
                <h2>4. Tongue Twisters</h2>
                <p>Dil sürçmeleri, telaffuzunuzu geliştirmek için harika!</p>
                
                <h2>5. Daily Speaking Practice</h2>
                <ul>
                    <li>Sabah rutininizi İngilizce anlatın</li>
                    <li>Düşüncelerinizi İngilizce düşünün</li>
                    <li>Aynaya karşı pratik yapın</li>
                </ul>
            `,
            en: `
                <h2>1. Shadowing Technique</h2>
                <p>Speak by imitating native speakers. This is the fastest way to acquire a <strong>natural accent</strong>.</p>
                
                <h2>2. AI Conversation Partners</h2>
                <p>Have daily conversations with ChatGPT or Claude. Try different role-plays!</p>
                
                <h2>3. Record Yourself</h2>
                <p>Record and listen to your speech. Seeing your progress is very motivating!</p>
                
                <h2>4. Tongue Twisters</h2>
                <p>Tongue twisters are great for improving pronunciation!</p>
                
                <h2>5. Daily Speaking Practice</h2>
                <ul>
                    <li>Describe your morning routine in English</li>
                    <li>Think your thoughts in English</li>
                    <li>Practice in front of a mirror</li>
                </ul>
            `
        }
    }
];
