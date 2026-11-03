// Public Supabase connection settings. Never put a secret/service-role key here.
window.EXPERIMENT_CONFIG = {
  supabaseUrl: 'https://oddfrhvgcrvnnukijxtk.supabase.co',
  supabaseAnonKey: 'sb_publishable_OEysR4c7d093_M98raHXiw_y1t27dZK',
  // Participant version and experimental condition.
  variant: 'lh',
  condition: 'low_process_high_outcome',
  // Outcomes: under 80 words always below average; 80+ always above.
  // Ad revenue: $1.12–$1.64 under 80 words; $10.00–$15.00 at 80+.
};
