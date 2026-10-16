// Replace these with your Supabase project settings before deployment.
window.EXPERIMENT_CONFIG = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  // This first build implements High Process x High Outcome.
  condition: 'high_process_high_outcome',
  // 'mixed': 50/50 above or below per post for engagement and visibility.
  // 'below' and 'above' force a condition. Ad revenue always stays below average.
  outcomeValence: 'mixed'
};
