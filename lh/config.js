// Public Supabase connection settings. Never put a secret/service-role key here.
window.EXPERIMENT_CONFIG = {
  supabaseUrl: 'https://oddfrhvgcrvnnukijxtk.supabase.co',
  supabaseAnonKey: 'sb_publishable_OEysR4c7d093_M98raHXiw_y1t27dZK',
  // Participant version and experimental condition.
  variant: 'lh',
  condition: 'low_process_high_outcome',
  // Valence comes only from Qualtrics: ?valence=positive or ?valence=negative.
  // Numeric values vary within the assigned ranges, independently of post content.
  // Ad revenue average: $10.00; negative $1.00–$3.00; positive $7.00–$9.00.
};
