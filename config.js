// Replace these with your Supabase project settings before deployment.
window.EXPERIMENT_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  // This first build implements High Process x High Outcome.
  condition: 'high_process_high_outcome',
  // Outcomes: under 80 words always below average; 80+ always above.
  // Ad revenue remains below average, with a milder reduction at 80+ words.
};
