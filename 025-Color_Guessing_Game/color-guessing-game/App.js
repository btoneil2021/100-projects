import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';

export default function App() {
  const [targetColor, setTargetColor] = useState('');
  const [colorOptions, setColorOptions] = useState([]);
  const [difficultyLevel, setDifficultyLevel] = useState(10); // Start at a moderate level

  const generateVariantColor = (baseRgb, difficulty) => {
    // 1. Parse the base RGB color string
    const baseColorArr = baseRgb.match(/\d+/g).map(Number);
    
    // 2. Calculate the maximum offset based on difficulty
    // A higher difficulty results in a smaller offset, making colors more similar.
    // The range is approximately 235 (at diff 1) to 55 (at diff 100).
    const maxOffset = 255 - difficulty * 2;

    // 3. Generate new color components
    const newColorArr = baseColorArr.map(channel => {
      // Calculate a random offset, either positive or negative
      const offset = Math.floor(Math.random() * maxOffset * 2) - maxOffset;
      const newChannelValue = channel + offset;

      // 4. Clamp the value to be within the valid 0-255 range
      return Math.max(0, Math.min(255, newChannelValue));
    });

    return `rgb(${newColorArr[0]}, ${newColorArr[1]}, ${newColorArr[2]})`;
  };

  useEffect(() => {
    setupNewRound();
  }, []); // Note: setupNewRound will now read the latest difficultyLevel from state

  const setupNewRound = () => {
    const correctColor = generateRandomColor();
    setTargetColor(correctColor);

    const options = [correctColor];
    // Generate two incorrect options based on the target color and difficulty
    while (options.length < 3) {
      const variantColor = generateVariantColor(correctColor, difficultyLevel);
      if (!options.includes(variantColor)) {
        options.push(variantColor);
      }
    }

    // Shuffle the options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }

    setColorOptions(options);
  };
  
  const generateRandomColor = () => {
    const red = Math.floor(Math.random() * 256);
    const green = Math.floor(Math.random() * 256);
    const blue = Math.floor(Math.random() * 256);
    return `rgb(${red}, ${green}, ${blue})`;
  };

  const handleColorGuess = (selectedColor) => {
    if (selectedColor === targetColor) {
      // Correct guess: Increase difficulty
      setDifficultyLevel((prevLevel) => Math.min(100, prevLevel + 2));
      Alert.alert('Correct!', 'You guessed the right color!', [
        { text: 'Play Again', onPress: () => setupNewRound() },
      ]);
    } else {
      // Incorrect guess: Decrease difficulty
      setDifficultyLevel((prevLevel) => Math.max(1, prevLevel - 1));
      Alert.alert('Incorrect', 'Try again!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Guess the Color</Text>
      <Text style={styles.difficultyText}>Difficulty: {difficultyLevel}</Text>
      <Text style={styles.targetColorText}>{targetColor.toUpperCase()}</Text>

      <View style={styles.optionsContainer}>
        {colorOptions.map((color, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.colorButton, { backgroundColor: color }]}
            onPress={() => handleColorGuess(color)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  difficultyText: {
    fontSize: 18,
    color: '#555',
    marginBottom: 10,
  },
  targetColorText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
    letterSpacing: 2,
  },
  // ... other styles
});