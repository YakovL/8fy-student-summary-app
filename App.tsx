/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  Button,
  useColorScheme,
  View,
  FlatList,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

// TODO: generalize (cut off query, support different formats etc), use TS
const getYtIdFromUrl = (url: string) => {
  const parts = url.split('/');
  return parts[parts.length - 1] || null;
};

const apiBaseUrl = 'https://yakovlitvin.pro/8fy';
const requestSummary = async (videoId: string) => {
  try {
    const response = await fetch(`${apiBaseUrl}/summary/${videoId}`);
    return await response.text();
  } catch (error) {
    if (error instanceof Object && 'message' in error) {
      return 'Something went wrong: ' + error.message;
    } else {
      return 'Something went wrong';
    }
  }
};

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  const [urlInput, setUrlInput] = useState('');
  const [summaryText, setSummaryText] = useState('');

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={backgroundStyle.backgroundColor}
      />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <View style={styles.sectionContainer}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: isDarkMode ? Colors.white : Colors.black,
                },
              ]}>
              8fy lecture summary
            </Text>
            <TextInput
              style={styles.input}
              value={urlInput}
              onChangeText={setUrlInput}
              placeholder="Insert video URL"
            />
            <Button
              title="Get summary"
              onPress={() => {
                setSummaryText('loading..');
                const videoId = getYtIdFromUrl(urlInput);
                if (videoId) {
                  requestSummary(videoId)
                    .then(setSummaryText)
                    .catch(() => setSummaryText('problem loading summary'));
                } else {
                  // TODO: indicate that the format is unknown
                }
              }}
            />
            <FlatList
              data={summaryText.split('\n')}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => <Text style={styles.result}>{item}</Text>}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  highlight: {
    fontWeight: '700',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    paddingHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  result: {
    marginTop: 12,
    fontSize: 18,
  },
});

export default App;
