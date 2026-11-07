import { ImagePlus, Leaf, ScanLine, ScanText, Sparkles } from 'lucide-react';

export const PIPELINE_STEPS = [
  {
    title: 'Upload your label',
    short: 'Upload',
    icon: ImagePlus,
    description: 'Start with a clear photo of the ingredients label.',
    tool: 'Image input',
    example: 'INGREDIENTS: Oats, sugar, almonds, salt.',
  },
  {
    title: 'Locate the text',
    short: 'Detect',
    icon: ScanLine,
    description: 'YOLO finds the text on the package.',
    tool: 'YOLO',
    example: 'Label image \u2192 detected text areas',
  },
  {
    title: 'Read the label',
    short: 'Read',
    icon: ScanText,
    description: 'PaddleOCR turns the detected text into words.',
    tool: 'PaddleOCR',
    example: 'Ingredients: Oats, sugar, almonds, salt.',
  },
  {
    title: 'Identify ingredients',
    short: 'Analyze',
    icon: Sparkles,
    description: 'Groq identifies ingredients and cleans up OCR errors.',
    tool: 'Groq API',
    example: '{ "ingredients": ["Oats", "sugar", "almonds", "salt"] }',
  },
  {
    title: 'Explore your results',
    short: 'Ingredients',
    icon: Leaf,
    description: 'View ingredients, download results, or ask a custom question.',
    tool: 'Your results',
    example: ['Oats', 'Sugar', 'Almonds', 'Salt'],
  },
];
