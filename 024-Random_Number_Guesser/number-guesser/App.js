import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  SafeAreaView,
} from 'react-native';

// Function to generate a random number
const generateRandomNumber = () => {
  return Math.floor(Math.random() * 100) + 1;
};

export default function App() {
  const [secretNumber, setSecretNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [feedback, setFeedback] = useState('Guess a number between 1 and 100');
  const [attempts, setAttempts] = useState(0);
  const [closestLowGuess, setClosestLowGuess] = useState(1);
  const [closestHighGuess, setClosestHighGuess] = useState(100);

  // This effect runs once when the component mounts to set the initial secret number
  useEffect(() => {
    setSecretNumber(generateRandomNumber());
  }, []);

  const handleGuess = () => {
    const userGuess = parseInt(guess, 10);

    // Input validation
    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
      Alert.alert('Invalid Input', 'Please enter a number between 1 and 100.');
      return;
    }

    setAttempts(currentAttempts => currentAttempts + 1);
    
    const feedbackMessage = `You guessed: ${userGuess}. `;
    if (userGuess < secretNumber) {
      if (userGuess > (closestLowGuess || 0) && userGuess < secretNumber) {
        setClosestLowGuess(userGuess);
        setFeedback(`Actual number between ${userGuess} and ${closestHighGuess}`);
      } else {
        setFeedback(`Actual number between ${closestLowGuess} and ${closestHighGuess}`);
      }
    } else if (userGuess > secretNumber) {
      if (userGuess < (closestHighGuess || 100) && userGuess > secretNumber) {
        setClosestHighGuess(userGuess);
        setFeedback(`Actual number between ${closestLowGuess} and ${userGuess}`);
      } else {
        setFeedback(`Actual number between ${closestLowGuess} and ${closestHighGuess}`);
      }
    } else {
      setFeedback(`Correct! You guessed the number in ${attempts + 1} attempts!`);
      Alert.alert(
        'Congratulations!',
        `You guessed the number ${secretNumber} in ${attempts + 1} attempts.`,
        [{ text: 'Play Again', onPress: resetGame }]
      );
    }
    setGuess(''); // Clear the input field after each guess
  };

  const resetGame = () => {
    setSecretNumber(generateRandomNumber());
    setFeedback('Guess a number between 1 and 100');
    setAttempts(0);
    setGuess('');
    setClosestHighGuess(100);
    setClosestLowGuess(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Number Guesser</Text>
        <Text style={styles.feedbackText}>{feedback}</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your guess"
          keyboardType="number-pad"
          value={guess}
          onChangeText={setGuess}
          maxLength={3}
        />
        <View style={styles.buttonContainer}>
          <Button title="Submit Guess" onPress={handleGuess} />
        </View>
        <Text style={styles.attemptsText}>Attempts: {attempts}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f7f7',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  feedbackText: {
    fontSize: 20,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    width: '80%',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    width: '60%',
    marginBottom: 20,
  },
  attemptsText: {
    fontSize: 18,
    color: '#333',
  },
});