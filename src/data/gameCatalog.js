export const gameCatalog = [
  { gameId: 'healthy-food-quiz', title: 'Healthy Food Quiz', description: 'Put your food knowledge to the test with quick-fire questions.', icon: 'Brain', category: 'Nutrition basics', estimatedTime: '5 min' },
  { gameId: 'healthy-vs-unhealthy', title: 'Healthy vs Unhealthy', description: 'Sort everyday food choices into healthy and less healthy categories.', icon: 'Scale', category: 'Healthy choices', estimatedTime: '5 min' },
  { gameId: 'balanced-plate', title: 'Build a Balanced Plate', description: 'Choose foods from each group to create a varied plate.', icon: 'CircleDot', category: 'Meal planning', estimatedTime: '6 min' },
  { gameId: 'nutrition-memory', title: 'Nutrition Memory Game', description: 'Match nutrition-themed pairs and practise remembering healthy foods.', icon: 'Waypoints', category: 'Food knowledge', estimatedTime: '6 min' },
  { gameId: 'food-group-challenge', title: 'Food Group Challenge', description: 'Identify the food group that each everyday food belongs to.', icon: 'Layers3', category: 'Food groups', estimatedTime: '5 min' },
  { gameId: 'healthy-snack-challenge', title: 'Healthy Snack Challenge', description: 'Choose the more balanced option for everyday snack time.', icon: 'Cookie', category: 'Healthy choices', estimatedTime: '5 min' },
]

export const healthyFoodQuestions = [
  { question: 'Which food is a healthy source of vitamins?', options: ['Fruits', 'Candy', 'Soft drink', 'Chips'], correctAnswer: 'Fruits' },
  { question: 'Which drink is the best choice for staying hydrated?', options: ['Water', 'Soda', 'Energy drink', 'Sweetened juice'], correctAnswer: 'Water' },
  { question: 'Which food is a good source of protein?', options: ['Lentils', 'Lollipops', 'Fizzy sweets', 'Ice cubes'], correctAnswer: 'Lentils' },
  { question: 'Which food group helps provide steady energy?', options: ['Whole grains', 'Candy bars', 'Soft drinks', 'Gum'], correctAnswer: 'Whole grains' },
  { question: 'Which plate shows the most variety?', options: ['Vegetables, grains and beans', 'Only crisps', 'Only sweets', 'Only one food'], correctAnswer: 'Vegetables, grains and beans' },
  { question: 'Why is it helpful to eat different coloured vegetables?', options: ['They provide different nutrients', 'They all taste exactly the same', 'They replace the need for water', 'They are always sweet'], correctAnswer: 'They provide different nutrients' },
  { question: 'Which is a balanced snack?', options: ['Apple with yogurt', 'Only candy', 'Only soda', 'A spoonful of sugar'], correctAnswer: 'Apple with yogurt' },
  { question: 'What helps keep bones strong?', options: ['Calcium-rich foods', 'Sugary drinks', 'Skipping meals', 'Eating only chips'], correctAnswer: 'Calcium-rich foods' },
  { question: 'How can fibre help your body?', options: ['It supports comfortable digestion', 'It replaces sleep', 'It makes water unnecessary', 'It removes the need for movement'], correctAnswer: 'It supports comfortable digestion' },
  { question: 'What is a good everyday approach to healthy eating?', options: ['Enjoy variety over time', 'Eat one food forever', 'Skip every meal', 'Choose only sugary foods'], correctAnswer: 'Enjoy variety over time' },
]

export const healthyVsUnhealthyItems = [
  ['Apple', 'Healthy'], ['Chips', 'Unhealthy'], ['Broccoli', 'Healthy'], ['Soft drink', 'Unhealthy'], ['Oats', 'Healthy'],
  ['Candy bar', 'Unhealthy'], ['Carrots', 'Healthy'], ['Sugary cereal', 'Unhealthy'], ['Beans', 'Healthy'], ['Fizzy sweets', 'Unhealthy'],
].map(([item, answer]) => ({ item, answer }))

export const foodGroupQuestions = [
  ['Apple', 'Fruit'], ['Rice', 'Grain'], ['Carrot', 'Vegetable'], ['Milk', 'Dairy'], ['Lentils', 'Protein'],
  ['Banana', 'Fruit'], ['Brown bread', 'Grain'], ['Spinach', 'Vegetable'], ['Yogurt', 'Dairy'], ['Egg', 'Protein'],
].map(([item, answer]) => ({ item, answer }))

export const snackQuestions = [
  ['Apple + nuts', 'Apple + nuts'], ['Fruit + yogurt', 'Fruit + yogurt'], ['Vegetable sandwich', 'Vegetable sandwich'], ['Hummus + carrots', 'Hummus + carrots'], ['Oatmeal + berries', 'Oatmeal + berries'],
  ['Candy + soda', 'Fruit + yogurt'], ['Chips + soda', 'Vegetable sandwich'], ['Chocolate bar + juice', 'Apple + nuts'], ['Cookies + soft drink', 'Hummus + carrots'], ['Frosted cereal bar', 'Oatmeal + berries'],
].map(([choice, answer]) => ({ prompt: 'Which is the healthier snack?', options: [choice, answer], answer }))

export const balancedPlateGroups = {
  Vegetables: ['Broccoli', 'Carrots', 'Spinach'],
  Fruits: ['Apple', 'Banana', 'Berries'],
  Grains: ['Brown rice', 'Oats', 'Wholegrain bread'],
  Protein: ['Beans', 'Egg', 'Lentils'],
  Dairy: ['Milk', 'Yogurt', 'Cheese'],
}

export const memoryPairs = ['Apple', 'Carrot', 'Broccoli', 'Milk', 'Whole grain']
