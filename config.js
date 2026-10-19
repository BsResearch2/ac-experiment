// Replace these with your Supabase project settings before deployment.
window.EXPERIMENT_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  // This first build implements High Process x High Outcome.
  condition: 'high_process_high_outcome',
  // Under 80 words: always below. At 80+ words, 'mixed' gives 50/50 outcomes.
  // 'below'/'above' fix eligible outcomes; 'above' never bypasses the 80-word gate.
  // Ad revenue always stays below average.
  outcomeValence: 'mixed'
};
