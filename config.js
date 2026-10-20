// Replace these with your Supabase project settings before deployment.
window.EXPERIMENT_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  // This first build implements High Process x High Outcome.
  condition: 'high_process_high_outcome',
  // Outcomes: under 80 words always below average; 80+ always above.
  // Ad revenue: $0 under 80 words; $5.20 with no sanction at 80+ words.
};
