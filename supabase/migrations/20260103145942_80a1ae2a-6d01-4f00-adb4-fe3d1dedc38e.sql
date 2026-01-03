-- Create enum for game languages
CREATE TYPE public.game_language AS ENUM ('html', 'css', 'javascript', 'typescript', 'python', 'rust');

-- Create enum for difficulty levels
CREATE TYPE public.difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced', 'expert', 'master');

-- Create games table
CREATE TABLE public.games (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  language game_language NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'beginner',
  image_url TEXT,
  instructions TEXT,
  code_template TEXT,
  expected_output TEXT,
  hints TEXT[],
  xp_reward INTEGER NOT NULL DEFAULT 10,
  time_limit_seconds INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create game_scores table for tracking user progress
CREATE TABLE public.game_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  time_taken_seconds INTEGER,
  attempts INTEGER NOT NULL DEFAULT 1,
  completed BOOLEAN NOT NULL DEFAULT false,
  code_submitted TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, game_id)
);

-- Create user_game_stats table for overall stats
CREATE TABLE public.user_game_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  games_completed INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  html_level INTEGER NOT NULL DEFAULT 1,
  css_level INTEGER NOT NULL DEFAULT 1,
  javascript_level INTEGER NOT NULL DEFAULT 1,
  typescript_level INTEGER NOT NULL DEFAULT 1,
  python_level INTEGER NOT NULL DEFAULT 1,
  rust_level INTEGER NOT NULL DEFAULT 1,
  last_played_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.game_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements junction table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.game_achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on all tables
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_game_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Games are readable by everyone
CREATE POLICY "Games are publicly readable" ON public.games FOR SELECT USING (true);

-- Only admins can manage games
CREATE POLICY "Admins can manage games" ON public.games FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Users can read their own scores
CREATE POLICY "Users can view their own scores" ON public.game_scores FOR SELECT 
USING (auth.uid() = user_id);

-- Users can insert/update their own scores
CREATE POLICY "Users can manage their own scores" ON public.game_scores FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores" ON public.game_scores FOR UPDATE 
USING (auth.uid() = user_id);

-- Leaderboard - everyone can see all scores for leaderboard
CREATE POLICY "Anyone can view scores for leaderboard" ON public.game_scores FOR SELECT 
USING (true);

-- User game stats policies
CREATE POLICY "Users can view their own stats" ON public.user_game_stats FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stats" ON public.user_game_stats FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON public.user_game_stats FOR UPDATE 
USING (auth.uid() = user_id);

-- Everyone can see stats for leaderboard
CREATE POLICY "Anyone can view stats for leaderboard" ON public.user_game_stats FOR SELECT 
USING (true);

-- Achievements are publicly readable
CREATE POLICY "Achievements are publicly readable" ON public.game_achievements FOR SELECT 
USING (true);

-- Only admins can manage achievements
CREATE POLICY "Admins can manage achievements" ON public.game_achievements FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Users can view their own achievements
CREATE POLICY "Users can view their achievements" ON public.user_achievements FOR SELECT 
USING (auth.uid() = user_id);

-- Users can unlock achievements
CREATE POLICY "Users can unlock achievements" ON public.user_achievements FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON public.games
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_game_scores_updated_at BEFORE UPDATE ON public.game_scores
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_game_stats_updated_at BEFORE UPDATE ON public.user_game_stats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default achievements
INSERT INTO public.game_achievements (name, description, icon, xp_reward, requirement_type, requirement_value) VALUES
('First Steps', 'Complete your first game', '🎮', 50, 'games_completed', 1),
('Coding Apprentice', 'Complete 10 games', '🎓', 100, 'games_completed', 10),
('Coding Master', 'Complete 50 games', '👑', 500, 'games_completed', 50),
('Speed Demon', 'Complete a game in under 30 seconds', '⚡', 75, 'speed_run', 30),
('Streak Starter', 'Get a 3-day streak', '🔥', 100, 'streak', 3),
('Streak Master', 'Get a 7-day streak', '💎', 250, 'streak', 7),
('XP Hunter', 'Earn 1000 XP', '✨', 150, 'total_xp', 1000),
('HTML Hero', 'Reach level 5 in HTML', '🌐', 200, 'html_level', 5),
('CSS Wizard', 'Reach level 5 in CSS', '🎨', 200, 'css_level', 5),
('JavaScript Ninja', 'Reach level 5 in JavaScript', '⚡', 200, 'javascript_level', 5);

-- Insert sample games for each language
INSERT INTO public.games (title, description, language, difficulty, instructions, code_template, expected_output, hints, xp_reward, time_limit_seconds, order_index) VALUES
-- HTML Games
('Hello World Page', 'Create your first HTML page with a heading', 'html', 'beginner', 'Create an h1 element with the text "Hello World"', '<html>\n<body>\n  <!-- Add your code here -->\n</body>\n</html>', '<h1>Hello World</h1>', ARRAY['Use the h1 tag', 'Text goes between opening and closing tags'], 10, 120, 1),
('Link Builder', 'Create a link to Google', 'html', 'beginner', 'Create an anchor tag linking to https://google.com with text "Visit Google"', '<html>\n<body>\n  <!-- Create a link here -->\n</body>\n</html>', '<a href="https://google.com">Visit Google</a>', ARRAY['Use the <a> tag', 'href attribute holds the URL'], 15, 120, 2),
('Image Gallery', 'Add an image with alt text', 'html', 'intermediate', 'Create an img tag with src="photo.jpg" and alt="Beautiful sunset"', '<html>\n<body>\n  <!-- Add image here -->\n</body>\n</html>', '<img src="photo.jpg" alt="Beautiful sunset"', ARRAY['Use the <img> tag', 'Images are self-closing'], 20, 150, 3),

-- CSS Games
('Color Magic', 'Change the background color', 'css', 'beginner', 'Set the body background color to blue', 'body {\n  /* Add your style */\n}', 'background-color: blue;', ARRAY['Use background-color property', 'Color names work!'], 10, 90, 1),
('Text Styling', 'Style a heading with red color and 24px font', 'css', 'beginner', 'Make h1 red with font-size 24px', 'h1 {\n  /* Style the heading */\n}', 'color: red;\nfont-size: 24px;', ARRAY['color sets text color', 'font-size sets the size'], 15, 120, 2),
('Flexbox Center', 'Center a div using flexbox', 'css', 'intermediate', 'Use flexbox to center items both horizontally and vertically', '.container {\n  display: flex;\n  /* Add centering */\n}', 'justify-content: center;\nalign-items: center;', ARRAY['justify-content for horizontal', 'align-items for vertical'], 25, 180, 3),
('Grid Layout', 'Create a 3-column grid', 'css', 'advanced', 'Create a grid with 3 equal columns', '.grid {\n  display: grid;\n  /* Define columns */\n}', 'grid-template-columns: 1fr 1fr 1fr;', ARRAY['Use grid-template-columns', '1fr means 1 fraction'], 35, 200, 4),

-- JavaScript Games  
('Variable Basics', 'Create a variable with your name', 'javascript', 'beginner', 'Create a const variable called name with value "Coder"', '// Create your variable here', 'const name = "Coder";', ARRAY['Use const for constants', 'Strings need quotes'], 10, 90, 1),
('Array Fun', 'Create an array of 3 fruits', 'javascript', 'beginner', 'Create an array called fruits with apple, banana, orange', '// Create fruits array', 'const fruits = ["apple", "banana", "orange"];', ARRAY['Arrays use square brackets', 'Items separated by commas'], 15, 120, 2),
('Function Creator', 'Write a function that doubles a number', 'javascript', 'intermediate', 'Create a function double(n) that returns n * 2', '// Write your function', 'function double(n) {\n  return n * 2;\n}', ARRAY['Use function keyword', 'return the result'], 25, 180, 3),
('Arrow Master', 'Convert to arrow function', 'javascript', 'intermediate', 'Rewrite as an arrow function: const add = (a, b) => ?', 'const add = (a, b) => {\n  // Return the sum\n}', 'const add = (a, b) => a + b;', ARRAY['Arrow functions use =>', 'Implicit return for single expressions'], 30, 150, 4),

-- TypeScript Games
('Type Basics', 'Add type annotations', 'typescript', 'beginner', 'Add string type to the name variable', 'let name = "TypeScript";', 'let name: string = "TypeScript";', ARRAY['Use : type after variable name', 'string is lowercase'], 15, 120, 1),
('Interface Builder', 'Create a User interface', 'typescript', 'intermediate', 'Create interface User with name: string and age: number', '// Define User interface', 'interface User {\n  name: string;\n  age: number;\n}', ARRAY['Use interface keyword', 'Properties separated by semicolons'], 25, 180, 2),
('Generic Function', 'Create a generic identity function', 'typescript', 'advanced', 'Create function identity<T>(arg: T): T', '// Create generic function', 'function identity<T>(arg: T): T {\n  return arg;\n}', ARRAY['<T> declares the type parameter', 'Use T as both input and output type'], 40, 240, 3),

-- Python Games
('Print Hello', 'Print Hello World in Python', 'python', 'beginner', 'Use print() to display "Hello World"', '# Your code here', 'print("Hello World")', ARRAY['Use print() function', 'Strings need quotes'], 10, 60, 1),
('List Creation', 'Create a list of numbers 1-5', 'python', 'beginner', 'Create a list called numbers with 1, 2, 3, 4, 5', '# Create your list', 'numbers = [1, 2, 3, 4, 5]', ARRAY['Lists use square brackets', 'No need for let/const'], 15, 90, 2),
('Dictionary Magic', 'Create a person dictionary', 'python', 'intermediate', 'Create dict person with name: "Alice" and age: 25', '# Create dictionary', 'person = {"name": "Alice", "age": 25}', ARRAY['Dicts use curly braces', 'key: value pairs'], 25, 150, 3),
('List Comprehension', 'Square numbers using list comprehension', 'python', 'advanced', 'Create squares of 1-5 using list comprehension', '# Use list comprehension', 'squares = [x**2 for x in range(1, 6)]', ARRAY['[expression for item in iterable]', '** is power operator'], 35, 180, 4),

-- Rust Games
('Hello Rust', 'Print Hello in Rust', 'rust', 'beginner', 'Use println! macro to print "Hello Rust"', 'fn main() {\n    // Print here\n}', 'println!("Hello Rust");', ARRAY['println! is a macro', 'Macros end with !'], 15, 120, 1),
('Variable Binding', 'Create an immutable variable', 'rust', 'beginner', 'Create let x = 5;', 'fn main() {\n    // Create variable\n}', 'let x = 5;', ARRAY['Use let for variables', 'Variables are immutable by default'], 20, 120, 2),
('Mutable Variable', 'Create a mutable variable and change it', 'rust', 'intermediate', 'Create mut variable x = 5, then set x = 10', 'fn main() {\n    // Create and modify\n}', 'let mut x = 5;\nx = 10;', ARRAY['Use mut for mutable', 'Reassign without let'], 30, 180, 3);