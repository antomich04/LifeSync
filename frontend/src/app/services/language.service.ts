import { Injectable, computed, signal } from '@angular/core';

export type AppLanguage = 'en' | 'el';

export interface LanguageOption {
  code: AppLanguage;
  label: string;
  nativeLabel: string;
  locale: string;
}

const LANGUAGE_STORAGE_KEY = 'lifesync.language';

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  { code: 'en', label: 'English', nativeLabel: 'English', locale: 'en-US' },
  { code: 'el', label: 'Greek', nativeLabel: 'Ελληνικά', locale: 'el-GR' },
];

const TRANSLATIONS: Record<AppLanguage, Record<string, string>> = {
  en: {
    'app.toggleSidebar': 'Toggle Sidebar',
    'language.label': 'Language',
    'language.english': 'English',
    'language.greek': 'Greek',
    'sidebar.dashboard.title': 'Dashboard',
    'sidebar.dashboard.subtitle': 'Live air quality',
    'sidebar.forecast.title': 'Forecast',
    'sidebar.forecast.subtitle': '7-day ML predictions',
    'sidebar.advisors.title': 'Advisors',
    'sidebar.advisors.subtitle': 'Iris & Hermes agents',
    'sidebar.support.title': 'Support',
    'sidebar.support.subtitle': 'Lucy & FAQ',
    'sidebar.location': 'Thessaloniki',

    'home.hero.title': 'LifeSync: Your Smart Urban Assistant',
    'home.hero.description':
      'Breathe easier and live smarter in Thessaloniki. Real-time data, predictive analytics, and AI-driven advice all in one place.',
    'home.openDashboard': 'Open Dashboard',
    'home.learnMore': 'Learn More',
    'home.realtime.title': 'Real-Time Environment',
    'home.realtime.description':
      'Monitor exactly what you are breathing. Get live updates on NO2, SO2, CO, O3, and weather conditions for your specific municipality.',
    'home.realtime.link': 'View Live Data →',
    'home.sampleRegion': 'Ampelokipoi-Menemeni',
    'home.liveAirQuality': 'Live Air Quality',
    'home.status.good': 'Good',
    'home.forecast.title': 'Predictive Analytics',
    'home.forecast.description':
      'Plan your day with confidence. Our machine learning regression models predict future pollution levels based on historical trends so you can avoid the worst times to be outside.',
    'home.forecast.link': 'Check Forecast →',
    'home.advisors.title': 'Your Smart AI Advisors',
    'home.advisors.description':
      'Get personalized health alerts, targeted micro-learning videos when risks are high, and smart product recommendations to keep you safe.',
    'home.advisors.link': 'Meet Your Advisors →',
    'home.healthAlert': 'Health Alert',
    'home.healthAlertText': 'High NO2 detected. Wear a mask today.',
    'home.microLearning': 'Micro-Learning',
    'home.microLearningText': 'Protecting your lungs in the city.',
    'home.topPick': 'Top Pick',
    'home.airPurifier': 'Air Purifier HEPA',

    'dashboard.badge': 'Key insights',
    'dashboard.title': 'Environmental Analytics Overview',
    'dashboard.description':
      'Monitor the atmospheric health of your urban environment in real-time. Select a municipality below to generate localized quality indices and review historical concentration trends.',
    'empty.noMunicipality': 'No municipality selected',
    'dashboard.empty.description':
      'Search for a Thessaloniki municipality above to load live air quality readings and historical concentration trends.',

    'region.title': 'Select your region',
    'region.available': 'municipalities available',
    'region.placeholder': 'Search municipality...',
    'region.notFound': 'No municipality found.',
    'region.group': 'Thessaloniki Municipalities',

    'live.overviewFor': 'Overview for:',
    'live.provider': '* Live data provided by the OpenWeather Air Pollution API.',
    'live.fetching': 'Fetching live readings...',
    'live.failed': 'Data Retrieval Failed',
    'live.overall': 'Overall Air Quality',
    'live.safeLimit': 'Safe limit:',
    'live.status.good': 'Good',
    'live.status.fair': 'Fair',
    'live.status.moderate': 'Moderate',
    'live.status.unhealthy': 'Unhealthy',
    'live.status.veryUnhealthy': 'Very Unhealthy',

    'history.title': 'Historical Air Quality Trends',
    'history.waterTitle': 'Historical Water Quality Trends',
    'history.monthly': 'Monthly',
    'history.daily': 'Daily',
    'history.averagesFor': 'averages for',
    'history.previous': 'Previous',
    'history.next': 'Next',
    'history.noData': 'No data available',
    'history.noDataDescription': 'There is no recorded water quality data for this period.',
    'history.meanAqi': 'Mean AQI',
    'month.short.1': 'Jan',
    'month.short.2': 'Feb',
    'month.short.3': 'Mar',
    'month.short.4': 'Apr',
    'month.short.5': 'May',
    'month.short.6': 'Jun',
    'month.short.7': 'Jul',
    'month.short.8': 'Aug',
    'month.short.9': 'Sep',
    'month.short.10': 'Oct',
    'month.short.11': 'Nov',
    'month.short.12': 'Dec',
    'water.metric.wqi': 'WQI Score',
    'water.metric.ph': 'pH',
    'water.metric.chlorides': 'Chlorides (mg/l)',
    'water.metric.turbidity': 'Turbidity (NTU)',
    'water.metric.aluminum': 'Aluminum (μg/l)',
    'history.note':
      '* The Mean AQI calculation relies on gaseous pollutants (NO2, O3, CO, SO2) only. Data for particulate matter (PM10, PM2.5) was unavailable in the historical dataset, which may result in lower-than-actual overall AQI scores.',

    'forecast.badge': 'Regression Model',
    'forecast.title': 'Predictive Pollutant Forecasting',
    'forecast.description':
      'Leveraging advanced regression analysis to project daily concentrations of targeted gaseous pollutants over the upcoming seven-day period. Please specify a geographical region to initialize the forecasting system.',
    'forecast.cardTitle': 'Forecast',
    'forecast.overviewFor': 'Overview for:',
    'forecast.next7Days': 'Next 7 days',
    'forecast.loading': 'Running predictive model...',
    'forecast.chartTitle': 'Concentration over time',
    'forecast.historical': 'Historical',
    'forecast.predicted': 'Predicted',
    'forecast.note':
      '* Dashed line denotes model predictions. Predictions are based on historical regression and may deviate from actual readings.',
    'forecast.empty.description':
      'Select a Thessaloniki municipality above to run the regression model and generate a 7-day pollutant forecast.',
    'forecast.peak': '7-Day Predicted Peak',
    'forecast.safeLimitCompare': 'vs. safe limit',
    'forecast.expectedTrend': 'Expected Trend',
    'forecast.trendBaseline': 'Compared to the previous 7-day baseline.',
    'forecast.confidence': 'Model Confidence',
    'forecast.confidenceBasis': 'Based on historical variance and data coverage.',
    'forecast.peakStatus.wellWithinLimit': 'Well within limit',
    'forecast.peakStatus.approachingLimit': 'Approaching limit',
    'forecast.peakStatus.nearLimit': 'Near limit',
    'forecast.peakStatus.exceedsLimit': 'Exceeds limit',
    'trend.improving': 'Improving',
    'trend.worsening': 'Worsening',
    'trend.stable': 'Stable',

    'advisors.badge': 'AI Advisors',
    'advisors.title': 'Your Personal AI Advisors',
    'advisors.description':
      'Two specialized agents work continuously on your behalf - one to educate you on the air pollutants affecting your area, and one to recommend the right protection products from trusted Greek marketplaces.',
    'advisors.pollutantsFor': 'Actionable Pollutants for:',
    'advisors.pollutantsDescription':
      'Showing only pollutants that are worsening or approaching/exceeding safe limits.',
    'advisors.allClear': 'All clear',
    'advisors.poweredByIris': 'Powered by Iris',
    'advisors.sources': 'Sources:',
    'advisors.how.title': 'How the advisors work',
    'advisors.how.subtitle': 'A simple three-step process, every time you ask.',
    'advisors.disclaimer':
      "* Advisors retrieve live information from the internet and Greek marketplaces. Recommendations are contextual and based on current pollutant readings - always verify prices and availability on the retailer's website before purchasing.",
    'advisors.readyCleanAir': 'Ready · Clean Air',
    'advisors.cleanAirContent': 'Air quality levels are excellent. No elevated pollutants detected.',
    'advisors.readyResearch': 'Ready to research {count} pollutant(s)',
    'advisors.researchContent': 'Click "Ask Iris to Research" to generate a live, AI-curated micro-lesson.',
    'advisors.microLessonComplete': 'Micro-lesson · Complete',
    'advisors.microLessonPrefix': 'Micro-lesson',
    'advisors.microLessonContent': 'Your custom air quality report has been generated.',
    'advisors.noProductsNeeded': 'No protection products needed right now.',
    'advisors.readySearch': 'Ready to search for {count} pollutant(s)',
    'advisors.searchContent': 'Click "Ask Hermes to Shop" to scan Skroutz for live mitigation products.',
    'advisors.latestRecommendations': 'Latest Recommendations',
    'advisors.step1.title': 'Reads your air data',
    'advisors.step1.description':
      'The agent checks the current pollutant readings for your selected region to understand which thresholds are exceeded.',
    'advisors.step2.title': 'Searches the internet',
    'advisors.step2.description':
      'Iris searches for educational content; Hermes queries Skroutz - both targeted to the specific pollutants detected.',
    'advisors.step3.title': 'Delivers results',
    'advisors.step3.description':
      'You receive curated micro-lessons or ranked product recommendations, with sources and direct links included.',
    'advisors.toast.regionRequired.title': 'Region Required',
    'advisors.toast.regionRequired.description': 'Please go back to the Forecast page and select a municipality first.',
    'advisors.toast.airFine.title': 'Air Quality Looks Fine',
    'advisors.toast.airFine.description': 'No pollutants require attention right now.',
    'advisors.toast.hermesDone.title': 'Hermes finished shopping',
    'advisors.toast.hermesDone.description': 'Found {count} product recommendations for your area.',
    'advisors.error.irisTitle': 'Iris Request Failed',
    'advisors.error.irisDescription': 'Iris could not generate a report right now. Please try again.',
    'advisors.error.hermesTitle': 'Hermes Request Failed',
    'advisors.error.hermesDescription': 'Hermes could not fetch recommendations right now. Please try again.',
    'advisors.checkSite': 'Check site',

    'agent.iris.role': 'Education Agent',
    'agent.iris.description':
      'Searches the web and YouTube for micro-learning content on air pollutants and their effects on human health.',
    'agent.iris.capabilitiesTitle': 'How Iris helps you',
    'agent.iris.cap1.label': 'Multimedia Learning',
    'agent.iris.cap1.description':
      'Finds the best short-form articles and YouTube videos explaining the science behind detected pollutants.',
    'agent.iris.cap2.label': 'Health impact summaries',
    'agent.iris.cap2.description':
      'Explains the specific effects of out-of-bound pollutant levels on respiratory and cardiovascular health.',
    'agent.iris.cap3.label': 'Protective actions',
    'agent.iris.cap3.description':
      'Surfaces actionable steps you can take today when pollutant levels exceed safe thresholds.',
    'agent.iris.sampleTitle': 'Latest insight',
    'agent.iris.buttonText': 'Ask Iris to Research',
    'agent.iris.loadingText': 'Iris is researching...',
    'agent.hermes.role': 'Shopping Agent',
    'agent.hermes.description':
      'Finds relevant protection products on Skroutz based on current pollutant levels in your area.',
    'agent.hermes.capabilitiesTitle': 'How Hermes helps you',
    'agent.hermes.cap1.label': 'Context-aware search',
    'agent.hermes.cap1.description':
      'Queries Skroutz with product terms matched to the pollutants exceeding safe levels.',
    'agent.hermes.cap2.label': 'Best-value filtering',
    'agent.hermes.cap2.description':
      'Surfaces the top-rated, best-priced protection products from Greek marketplaces.',
    'agent.hermes.cap3.label': 'Deep-link delivery',
    'agent.hermes.cap3.description':
      'Provides direct links to product pages so you can review and purchase with a single click.',
    'agent.hermes.sampleTitle': 'Live Agent Status',
    'agent.hermes.buttonText': 'Ask Hermes to Shop',
    'agent.hermes.loadingText': 'Hermes is searching...',

    'support.badge': 'Support Center',
    'support.title': 'How can we help you?',
    'support.description':
      "Get instant answers from Lucy, our AI assistant - or reach out to our team directly. We're here to make your LifeSync experience seamless.",
    'support.meetLucy': 'Meet Lucy, your AI assistant',
    'support.lucyDescription':
      'Lucy knows everything about LifeSync - air quality data, pollutant levels, health recommendations, and more. Ask her anything and get an instant, accurate answer, 24/7.',
    'support.promptAqi': 'What do the AQI levels mean?',
    'support.promptPollutants': 'Which air pollutants are most harmful?',
    'support.promptUpdates': 'How does the data get updated?',
    'support.chatWithLucy': 'Chat with Lucy',
    'support.stillNeedHelp': 'Still need help?',
    'support.replyTime': 'Our team typically replies within 24 hours.',
    'support.contactDescription':
      "If Lucy couldn't resolve your issue, you can reach the LifeSync team directly by email. Please include a brief description of your issue and any relevant details.",
    'support.tipsTitle': 'Tips for faster support',
    'support.tipsSubtitle': 'Help us help you, quicker.',
    'support.tip1': 'Mention the municipality you were viewing.',
    'support.tip2': 'Include any error message you saw.',
    'support.tip3': 'Tell us which page or feature you were using.',
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Quick answers to the most common questions.',
    'faq.askMore': 'Ask Lucy for more details',
    'faq.aqi.question': 'What do the AQI levels mean?',
    'faq.aqi.answer':
      'The Air Quality Index (AQI) is a standardised scale from 0 to 500. Values up to 50 indicate Good air quality with little to no risk. 51-100 is Moderate. 101-150 is Unhealthy for Sensitive Groups. Above 150 is considered Unhealthy or worse, and outdoor activity should be limited.',
    'faq.wqi.question': 'What do the WQI levels mean?',
    'faq.wqi.answer':
      'The Water Quality Index (WQI) summarises water quality using key parameters like pH, dissolved oxygen, turbidity, and conductivity. Higher WQI values mean better water quality, while lower values signal more pollution or environmental stress.',
    'faq.updated.question': 'How often is the live data updated?',
    'faq.updated.answer':
      'Live pollutant readings are fetched from the OpenWeather Air Pollution API and refreshed every time you load or navigate to the Dashboard. Historical data reflects official municipal measurements aggregated on a daily or monthly basis.',
    'faq.municipalities.question': 'Which municipalities are supported?',
    'faq.municipalities.answer':
      'LifeSync currently covers municipalities in the wider Thessaloniki region, including Ampelokipoi-Menemeni, Kalamaria, Pavlos Melas, and more. Coverage is continuously expanding as new Open Data sources become available.',
    'faq.historical.question': 'Why does the historical AQI appear lower than expected?',
    'faq.historical.answer':
      'The historical Mean AQI is calculated using gaseous pollutants (NO2, O3, CO, SO2) only, as particulate matter (PM10, PM2.5) data was unavailable in the historical dataset. This may result in scores that are lower than the true overall air quality.',
    'chatbot.assistant': 'AI Assistant',
    'chatbot.placeholder': 'Ask Lucy anything...',
    'chatbot.initialMessage': 'Hi there! I am Lucy, your LifeSync assistant. How can I help you today?',
    'report.title': 'Report from',
    'report.description': 'Live analysis generated specifically for your area.',
    'report.close': 'Close Report',
    'notfound.title': 'Page not found',
    'notfound.description': "The page you were looking for doesn't exist or may have been moved. Try heading back to a known location.",
    'notfound.backHome': 'Back to Home Page',
    'notfound.goBack': 'Go Back',
  },
  el: {
    'app.toggleSidebar': 'Εναλλαγή πλευρικής μπάρας',
    'language.label': 'Γλώσσα',
    'language.english': 'Αγγλικά',
    'language.greek': 'Ελληνικά',
    'sidebar.dashboard.title': 'Dashboard',
    'sidebar.dashboard.subtitle': 'Ζωντανή ποιότητα αέρα',
    'sidebar.forecast.title': 'Forecast',
    'sidebar.forecast.subtitle': 'Προβλέψεις ML 7 ημερών',
    'sidebar.advisors.title': 'Advisors',
    'sidebar.advisors.subtitle': 'Πράκτορες Iris & Hermes',
    'sidebar.support.title': 'Support',
    'sidebar.support.subtitle': 'Lucy & FAQ',
    'sidebar.location': 'Θεσσαλονίκη',

    'home.hero.title': 'LifeSync: Ο έξυπνος αστικός βοηθός σου',
    'home.hero.description':
      'Ανάπνεε πιο άνετα και ζήσε πιο έξυπνα στη Θεσσαλονίκη. Δεδομένα σε πραγματικό χρόνο, προγνωστική ανάλυση και συμβουλές AI σε ένα σημείο.',
    'home.openDashboard': 'Άνοιγμα Dashboard',
    'home.learnMore': 'Μάθε περισσότερα',
    'home.realtime.title': 'Περιβάλλον σε πραγματικό χρόνο',
    'home.realtime.description':
      'Παρακολούθησε τι ακριβώς αναπνέεις. Λάβε ζωντανές ενημερώσεις για NO2, SO2, CO, O3 και καιρικές συνθήκες για τον δήμο σου.',
    'home.realtime.link': 'Προβολή ζωντανών δεδομένων →',
    'home.sampleRegion': 'Αμπελόκηποι-Μενεμένη',
    'home.liveAirQuality': 'Ζωντανή ποιότητα αέρα',
    'home.status.good': 'Καλή',
    'home.forecast.title': 'Προγνωστική ανάλυση',
    'home.forecast.description':
      'Οργάνωσε τη μέρα σου με σιγουριά. Τα μοντέλα παλινδρόμησης προβλέπουν μελλοντικά επίπεδα ρύπανσης με βάση ιστορικές τάσεις, ώστε να αποφεύγεις τις χειρότερες ώρες έξω.',
    'home.forecast.link': 'Έλεγχος πρόβλεψης →',
    'home.advisors.title': 'Οι έξυπνοι AI σύμβουλοί σου',
    'home.advisors.description':
      'Λάβε εξατομικευμένες ειδοποιήσεις υγείας, σύντομα εκπαιδευτικά βίντεο όταν ο κίνδυνος αυξάνεται και έξυπνες προτάσεις προϊόντων προστασίας.',
    'home.advisors.link': 'Γνώρισε τους συμβούλους →',
    'home.healthAlert': 'Ειδοποίηση υγείας',
    'home.healthAlertText': 'Εντοπίστηκε υψηλό NO2. Φόρεσε μάσκα σήμερα.',
    'home.microLearning': 'Μικρομάθηση',
    'home.microLearningText': 'Προστασία των πνευμόνων σου στην πόλη.',
    'home.topPick': 'Κορυφαία επιλογή',
    'home.airPurifier': 'Καθαριστής αέρα HEPA',

    'dashboard.badge': 'Κύριες πληροφορίες',
    'dashboard.title': 'Επισκόπηση περιβαλλοντικής ανάλυσης',
    'dashboard.description':
      'Παρακολούθησε την ατμοσφαιρική υγεία του αστικού περιβάλλοντος σε πραγματικό χρόνο. Επίλεξε δήμο για τοπικούς δείκτες ποιότητας και ιστορικές τάσεις συγκεντρώσεων.',
    'empty.noMunicipality': 'Δεν έχει επιλεγεί δήμος',
    'dashboard.empty.description':
      'Αναζήτησε έναν δήμο της Θεσσαλονίκης για να φορτώσεις ζωντανές μετρήσεις ποιότητας αέρα και ιστορικές τάσεις.',

    'region.title': 'Επίλεξε περιοχή',
    'region.available': 'διαθέσιμοι δήμοι',
    'region.placeholder': 'Αναζήτηση δήμου...',
    'region.notFound': 'Δεν βρέθηκε δήμος.',
    'region.group': 'Δήμοι Θεσσαλονίκης',

    'live.overviewFor': 'Επισκόπηση για:',
    'live.provider': '* Τα ζωντανά δεδομένα παρέχονται από το OpenWeather Air Pollution API.',
    'live.fetching': 'Ανάκτηση ζωντανών μετρήσεων...',
    'live.failed': 'Αποτυχία ανάκτησης δεδομένων',
    'live.overall': 'Συνολική ποιότητα αέρα',
    'live.safeLimit': 'Ασφαλές όριο:',
    'live.status.good': 'Καλή',
    'live.status.fair': 'Μέτρια',
    'live.status.moderate': 'Μέτρια',
    'live.status.unhealthy': 'Ανθυγιεινή',
    'live.status.veryUnhealthy': 'Πολύ ανθυγιεινή',

    'history.title': 'Ιστορικές Τάσεις Ποιότητας Αέρα',
    'history.waterTitle': 'Ιστορικές Τάσεις Ποιότητας Νερού',
    'history.monthly': 'Μηνιαίοι',
    'history.daily': 'Ημερήσιοι',
    'history.averagesFor': 'μέσοι όροι για το',
    'history.previous': 'Προηγούμενο',
    'history.next': 'Επόμενο',
    'history.noData': 'Δεν υπάρχουν διαθέσιμα δεδομένα',
    'history.noDataDescription': 'Δεν έχουν καταγραφεί δεδομένα ποιότητας νερού για τη συγκεκριμένη περίοδο.',
    'history.meanAqi': 'Μέσο AQI',
    'month.short.1': 'Ιαν',
    'month.short.2': 'Φεβ',
    'month.short.3': 'Μαρ',
    'month.short.4': 'Απρ',
    'month.short.5': 'Μαϊ',
    'month.short.6': 'Ιουν',
    'month.short.7': 'Ιουλ',
    'month.short.8': 'Αυγ',
    'month.short.9': 'Σεπ',
    'month.short.10': 'Οκτ',
    'month.short.11': 'Νοε',
    'month.short.12': 'Δεκ',
    'water.metric.wqi': 'Δείκτης WQI',
    'water.metric.ph': 'pH',
    'water.metric.chlorides': 'Χλωριούχα (mg/l)',
    'water.metric.turbidity': 'Θολότητα (NTU)',
    'water.metric.aluminum': 'Αλουμίνιο (μg/l)',
    'history.note':
      '* Ο μέσος AQI υπολογίζεται μόνο από αέριους ρύπους (NO2, O3, CO, SO2). Τα δεδομένα για σωματίδια (PM10, PM2.5) δεν ήταν διαθέσιμα στο ιστορικό σύνολο, κάτι που μπορεί να οδηγεί σε χαμηλότερες τιμές από την πραγματική συνολική ποιότητα αέρα.',

    'forecast.badge': 'Μοντέλο παλινδρόμησης',
    'forecast.title': 'Πρόβλεψη ρύπων',
    'forecast.description':
      'Χρήση προηγμένης ανάλυσης παλινδρόμησης για προβολή ημερήσιων συγκεντρώσεων στοχευμένων αέριων ρύπων για τις επόμενες επτά ημέρες. Επίλεξε περιοχή για εκκίνηση.',
    'forecast.cardTitle': 'Πρόβλεψη',
    'forecast.overviewFor': 'Επισκόπηση για:',
    'forecast.next7Days': 'Επόμενες 7 ημέρες',
    'forecast.loading': 'Εκτέλεση προγνωστικού μοντέλου...',
    'forecast.chartTitle': 'Συγκέντρωση στον χρόνο',
    'forecast.historical': 'Ιστορικό',
    'forecast.predicted': 'Προβλεπόμενο',
    'forecast.note':
      '* Η διακεκομμένη γραμμή δείχνει προβλέψεις μοντέλου. Οι προβλέψεις βασίζονται σε ιστορική παλινδρόμηση και μπορεί να αποκλίνουν από τις πραγματικές μετρήσεις.',
    'forecast.empty.description':
      'Επίλεξε έναν δήμο της Θεσσαλονίκης για να εκτελεστεί το μοντέλο παλινδρόμησης και να δημιουργηθεί πρόβλεψη ρύπων 7 ημερών.',
    'forecast.peak': 'Προβλεπόμενη κορύφωση 7 ημερών',
    'forecast.safeLimitCompare': 'σε σχέση με το ασφαλές όριο',
    'forecast.expectedTrend': 'Αναμενόμενη τάση',
    'forecast.trendBaseline': 'Σε σύγκριση με τη γραμμή βάσης των προηγούμενων 7 ημερών.',
    'forecast.confidence': 'Βεβαιότητα μοντέλου',
    'forecast.confidenceBasis': 'Με βάση την ιστορική διακύμανση και την κάλυψη δεδομένων.',
    'forecast.peakStatus.wellWithinLimit': 'Πολύ κάτω από το όριο',
    'forecast.peakStatus.approachingLimit': 'Πλησιάζει το όριο',
    'forecast.peakStatus.nearLimit': 'Κοντά στο όριο',
    'forecast.peakStatus.exceedsLimit': 'Ξεπερνά το όριο',
    'trend.improving': 'Βελτίωση',
    'trend.worsening': 'Επιδείνωση',
    'trend.stable': 'Σταθερή',

    'advisors.badge': 'AI σύμβουλοι',
    'advisors.title': 'Οι προσωπικοί σου AI σύμβουλοι',
    'advisors.description':
      'Δύο εξειδικευμένοι πράκτορες δουλεύουν για εσένα - ο ένας σε εκπαιδεύει για τους ρύπους της περιοχής σου και ο άλλος προτείνει προϊόντα προστασίας από αξιόπιστες ελληνικές αγορές.',
    'advisors.pollutantsFor': 'Ρύποι που χρειάζονται προσοχή για:',
    'advisors.pollutantsDescription':
      'Εμφανίζονται μόνο ρύποι που επιδεινώνονται ή πλησιάζουν/ξεπερνούν ασφαλή όρια.',
    'advisors.allClear': 'Όλα καθαρά',
    'advisors.poweredByIris': 'Με την υποστήριξη της Iris',
    'advisors.sources': 'Πηγές:',
    'advisors.how.title': 'Πώς λειτουργούν οι σύμβουλοι',
    'advisors.how.subtitle': 'Μια απλή διαδικασία τριών βημάτων, κάθε φορά που ρωτάς.',
    'advisors.disclaimer':
      '* Οι σύμβουλοι αντλούν ζωντανές πληροφορίες από το διαδίκτυο και ελληνικές αγορές. Οι προτάσεις είναι συγκειμενικές και βασίζονται στις τρέχουσες μετρήσεις ρύπων - έλεγχε πάντα τιμές και διαθεσιμότητα στον ιστότοπο του καταστήματος πριν αγοράσεις.',
    'advisors.readyCleanAir': 'Έτοιμο · Καθαρός αέρας',
    'advisors.cleanAirContent': 'Τα επίπεδα ποιότητας αέρα είναι εξαιρετικά. Δεν εντοπίστηκαν αυξημένοι ρύποι.',
    'advisors.readyResearch': 'Έτοιμη έρευνα για {count} ρύπο/ρύπους',
    'advisors.researchContent': 'Πάτησε "Ρώτα την Iris" για να δημιουργηθεί ζωντανό, επιμελημένο μάθημα AI.',
    'advisors.microLessonComplete': 'Μικρομάθημα · Ολοκληρώθηκε',
    'advisors.microLessonPrefix': 'Μικρομάθημα',
    'advisors.microLessonContent': 'Η εξατομικευμένη αναφορά ποιότητας αέρα δημιουργήθηκε.',
    'advisors.noProductsNeeded': 'Δεν χρειάζονται προϊόντα προστασίας αυτή τη στιγμή.',
    'advisors.readySearch': 'Έτοιμη αναζήτηση για {count} ρύπο/ρύπους',
    'advisors.searchContent': 'Πάτησε "Ρώτα τον Hermes" για να σαρώσει το Skroutz για προϊόντα μετριασμού.',
    'advisors.latestRecommendations': 'Τελευταίες προτάσεις',
    'advisors.step1.title': 'Διαβάζει τα δεδομένα αέρα',
    'advisors.step1.description':
      'Ο πράκτορας ελέγχει τις τρέχουσες μετρήσεις ρύπων για την επιλεγμένη περιοχή ώστε να καταλάβει ποια όρια ξεπερνιούνται.',
    'advisors.step2.title': 'Αναζητά στο διαδίκτυο',
    'advisors.step2.description':
      'Η Iris ψάχνει εκπαιδευτικό περιεχόμενο και ο Hermes αναζητά στο Skroutz, στοχευμένα στους ρύπους που εντοπίστηκαν.',
    'advisors.step3.title': 'Παραδίδει αποτελέσματα',
    'advisors.step3.description':
      'Λαμβάνεις επιμελημένα μικρομαθήματα ή ταξινομημένες προτάσεις προϊόντων, με πηγές και άμεσους συνδέσμους.',
    'advisors.toast.regionRequired.title': 'Απαιτείται περιοχή',
    'advisors.toast.regionRequired.description': 'Πήγαινε πρώτα στη σελίδα Πρόβλεψης και επίλεξε έναν δήμο.',
    'advisors.toast.airFine.title': 'Η ποιότητα αέρα φαίνεται καλή',
    'advisors.toast.airFine.description': 'Δεν υπάρχουν ρύποι που χρειάζονται προσοχή αυτή τη στιγμή.',
    'advisors.toast.hermesDone.title': 'Ο Hermes ολοκλήρωσε την αναζήτηση',
    'advisors.toast.hermesDone.description': 'Βρέθηκαν {count} προτάσεις προϊόντων για την περιοχή σου.',
    'advisors.error.irisTitle': 'Αποτυχία αιτήματος Iris',
    'advisors.error.irisDescription': 'Η Iris δεν μπόρεσε να δημιουργήσει αναφορά αυτή τη στιγμή. Δοκίμασε ξανά.',
    'advisors.error.hermesTitle': 'Αποτυχία αιτήματος Hermes',
    'advisors.error.hermesDescription': 'Ο Hermes δεν μπόρεσε να φέρει προτάσεις αυτή τη στιγμή. Δοκίμασε ξανά.',
    'advisors.checkSite': 'Έλεγξε την ιστοσελίδα',

    'agent.iris.role': 'Πράκτορας εκπαίδευσης',
    'agent.iris.description':
      'Αναζητά στο web και στο YouTube σύντομο εκπαιδευτικό περιεχόμενο για αέριους ρύπους και τις επιπτώσεις τους στην υγεία.',
    'agent.iris.capabilitiesTitle': 'Πώς βοηθά η Iris',
    'agent.iris.cap1.label': 'Πολυμεσική μάθηση',
    'agent.iris.cap1.description':
      'Βρίσκει τα καλύτερα σύντομα άρθρα και βίντεο στο YouTube που εξηγούν την επιστήμη πίσω από τους ρύπους.',
    'agent.iris.cap2.label': 'Σύνοψη επιπτώσεων υγείας',
    'agent.iris.cap2.description':
      'Εξηγεί τις επιπτώσεις αυξημένων επιπέδων ρύπων στην αναπνευστική και καρδιαγγειακή υγεία.',
    'agent.iris.cap3.label': 'Προστατευτικές ενέργειες',
    'agent.iris.cap3.description':
      'Προτείνει πρακτικά βήματα που μπορείς να κάνεις σήμερα όταν οι ρύποι ξεπερνούν ασφαλή όρια.',
    'agent.iris.sampleTitle': 'Τελευταίο εύρημα',
    'agent.iris.buttonText': 'Ρώτα την Iris',
    'agent.iris.loadingText': 'Η Iris ερευνά...',
    'agent.hermes.role': 'Πράκτορας αγορών',
    'agent.hermes.description':
      'Βρίσκει σχετικά προϊόντα προστασίας στο Skroutz με βάση τα τρέχοντα επίπεδα ρύπων στην περιοχή σου.',
    'agent.hermes.capabilitiesTitle': 'Πώς βοηθά ο Hermes',
    'agent.hermes.cap1.label': 'Αναζήτηση με βάση το πλαίσιο',
    'agent.hermes.cap1.description':
      'Αναζητά στο Skroutz όρους προϊόντων που ταιριάζουν στους ρύπους που ξεπερνούν ασφαλή επίπεδα.',
    'agent.hermes.cap2.label': 'Φιλτράρισμα αξίας',
    'agent.hermes.cap2.description':
      'Αναδεικνύει κορυφαία και συμφέροντα προϊόντα προστασίας από ελληνικές αγορές.',
    'agent.hermes.cap3.label': 'Άμεσοι σύνδεσμοι',
    'agent.hermes.cap3.description':
      'Παρέχει άμεσους συνδέσμους προϊόντων ώστε να τα ελέγχεις και να αγοράζεις με ένα κλικ.',
    'agent.hermes.sampleTitle': 'Ζωντανή κατάσταση πράκτορα',
    'agent.hermes.buttonText': 'Ρώτα τον Hermes',
    'agent.hermes.loadingText': 'Ο Hermes αναζητά...',

    'support.badge': 'Κέντρο υποστήριξης',
    'support.title': 'Πώς μπορούμε να βοηθήσουμε;',
    'support.description':
      'Πάρε άμεσες απαντήσεις από τη Lucy, την AI βοηθό μας, ή επικοινώνησε απευθείας με την ομάδα μας. Είμαστε εδώ για μια ομαλή εμπειρία LifeSync.',
    'support.meetLucy': 'Γνώρισε τη Lucy, την AI βοηθό σου',
    'support.lucyDescription':
      'Η Lucy γνωρίζει τα πάντα για το LifeSync: δεδομένα ποιότητας αέρα, επίπεδα ρύπων, συστάσεις υγείας και άλλα. Ρώτησέ την οτιδήποτε και πάρε άμεση, ακριβή απάντηση 24/7.',
    'support.promptAqi': 'Τι σημαίνουν τα επίπεδα AQI;',
    'support.promptPollutants': 'Ποιοι αέρινοι ρύποι είναι πιο επιβλαβείς;',
    'support.promptUpdates': 'Πώς ενημερώνονται τα δεδομένα;',
    'support.chatWithLucy': 'Συνομιλία με τη Lucy',
    'support.stillNeedHelp': 'Χρειάζεσαι ακόμα βοήθεια;',
    'support.replyTime': 'Η ομάδα μας συνήθως απαντά μέσα σε 24 ώρες.',
    'support.contactDescription':
      'Αν η Lucy δεν έλυσε το θέμα σου, μπορείς να επικοινωνήσεις απευθείας με την ομάδα LifeSync μέσω email. Συμπερίλαβε σύντομη περιγραφή του προβλήματος και σχετικές λεπτομέρειες.',
    'support.tipsTitle': 'Συμβουλές για γρηγορότερη υποστήριξη',
    'support.tipsSubtitle': 'Βοήθησέ μας να σε βοηθήσουμε πιο γρήγορα.',
    'support.tip1': 'Ανάφερε τον δήμο που έβλεπες.',
    'support.tip2': 'Συμπερίλαβε οποιοδήποτε μήνυμα σφάλματος είδες.',
    'support.tip3': 'Πες μας ποια σελίδα ή λειτουργία χρησιμοποιούσες.',
    'faq.title': 'Συχνές ερωτήσεις',
    'faq.subtitle': 'Γρήγορες απαντήσεις στις πιο συνηθισμένες ερωτήσεις.',
    'faq.askMore': 'Ρώτα τη Lucy για περισσότερες λεπτομέρειες',
    'faq.aqi.question': 'Τι σημαίνουν τα επίπεδα AQI;',
    'faq.aqi.answer':
      'Ο Δείκτης Ποιότητας Αέρα (AQI) είναι τυποποιημένη κλίμακα από 0 έως 500. Τιμές έως 50 δείχνουν καλή ποιότητα αέρα με μικρό ή καθόλου κίνδυνο. 51-100 είναι μέτρια. 101-150 είναι ανθυγιεινή για ευαίσθητες ομάδες. Πάνω από 150 θεωρείται ανθυγιεινή ή χειρότερη και η εξωτερική δραστηριότητα πρέπει να περιορίζεται.',
    'faq.wqi.question': 'Τι σημαίνουν τα επίπεδα WQI;',
    'faq.wqi.answer':
      'Ο Δείκτης Ποιότητας Νερού (WQI) συνοψίζει την ποιότητα του νερού με βασικές παραμέτρους όπως pH, διαλυμένο οξυγόνο, θολότητα και αγωγιμότητα. Υψηλότερες τιμές WQI σημαίνουν καλύτερη ποιότητα νερού, ενώ χαμηλότερες τιμές δείχνουν μεγαλύτερη ρύπανση ή περιβαλλοντική πίεση.',
    'faq.updated.question': 'Πόσο συχνά ενημερώνονται τα ζωντανά δεδομένα;',
    'faq.updated.answer':
      'Οι ζωντανές μετρήσεις ρύπων αντλούνται από το OpenWeather Air Pollution API και ανανεώνονται κάθε φορά που φορτώνεις ή πλοηγείσαι στο Dashboard. Τα ιστορικά δεδομένα αντικατοπτρίζουν επίσημες δημοτικές μετρήσεις συγκεντρωμένες ημερήσια ή μηνιαία.',
    'faq.municipalities.question': 'Ποιοι δήμοι υποστηρίζονται;',
    'faq.municipalities.answer':
      'Το LifeSync καλύπτει δήμους της ευρύτερης περιοχής Θεσσαλονίκης, όπως Αμπελόκηποι-Μενεμένη, Καλαμαριά, Παύλος Μελάς και άλλους. Η κάλυψη επεκτείνεται καθώς διατίθενται νέες πηγές Open Data.',
    'faq.historical.question': 'Γιατί ο ιστορικός AQI φαίνεται χαμηλότερος από το αναμενόμενο;',
    'faq.historical.answer':
      'Ο ιστορικός μέσος AQI υπολογίζεται μόνο με αέριους ρύπους (NO2, O3, CO, SO2), επειδή δεν υπήρχαν δεδομένα σωματιδίων (PM10, PM2.5) στο ιστορικό σύνολο. Αυτό μπορεί να οδηγήσει σε χαμηλότερες τιμές από την πραγματική συνολική ποιότητα αέρα.',
    'chatbot.assistant': 'AI βοηθός',
    'chatbot.placeholder': 'Ρώτα τη Lucy οτιδήποτε...',
    'chatbot.initialMessage': 'Γεια σας! Είμαι η Lucy, η AI βοηθός σας για το LifeSync. Πώς μπορώ να σας βοηθήσω σήμερα;',
    'report.title': 'Αναφορά από',
    'report.description': 'Ζωντανή ανάλυση ειδικά για την περιοχή σου.',
    'report.close': 'Κλείσιμο αναφοράς',
    'notfound.title': 'Η σελίδα δεν βρέθηκε',
    'notfound.description': 'Η σελίδα που αναζητούσες δεν υπάρχει ή μπορεί να έχει μετακινηθεί. Δοκίμασε να επιστρέψεις σε γνωστό σημείο.',
    'notfound.backHome': 'Πίσω στην Αρχική Σελίδα',
    'notfound.goBack': 'Επιστροφή',
  },
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly language = signal<AppLanguage>(this.getInitialLanguage());

  readonly currentLanguage = this.language.asReadonly();
  readonly currentOption = computed(
    () => LANGUAGE_OPTIONS.find(option => option.code === this.language()) ?? LANGUAGE_OPTIONS[0],
  );

  constructor() {
    document.documentElement.lang = this.language();
  }

  setLanguage(language: AppLanguage): void {
    this.language.set(language);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
  }

  translate(key: string, params?: Record<string, string | number>): string {
    const text = TRANSLATIONS[this.language()][key] ?? TRANSLATIONS.en[key] ?? key;

    if (!params) return text;

    return Object.entries(params).reduce(
      (value, [paramKey, paramValue]) => value.replaceAll(`{${paramKey}}`, String(paramValue)),
      text,
    );
  }

  private getInitialLanguage(): AppLanguage {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const browserLanguage = navigator.language.toLowerCase();

    if (stored === 'el' || stored === 'en') return stored;
    if (browserLanguage.startsWith('el')) return 'el';

    return 'en';
  }
}
